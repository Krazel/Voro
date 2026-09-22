import crypto from 'node:crypto';
import fs from 'node:fs';
const appId = '6809193565';
const enc = x => Buffer.from(JSON.stringify(x)).toString('base64url');
const now = Math.floor(Date.now()/1000);
const unsigned = `${enc({alg:'ES256',kid:process.env.ASC_KEY_ID,typ:'JWT'})}.${enc({iss:process.env.ASC_ISSUER_ID,aud:'appstoreconnect-v1',iat:now,exp:now+1200})}`;
const token = `${unsigned}.${crypto.sign('sha256',Buffer.from(unsigned),{key:fs.readFileSync(process.env.ASC_PRIVATE_KEY_PATH),dsaEncoding:'ieee-p1363'}).toString('base64url')}`;
async function api(path,method='GET',body) {
 if(method!=='GET' && /reviewSubmissions|appStoreVersionSubmissions/.test(path))throw new Error('Submission forbidden');
 const r = await fetch(`https://api.appstoreconnect.apple.com${path}`,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
 const j = await r.json().catch(()=>({}));
 if(!r.ok) return {status:r.status,errors:j.errors?.map(e=>({code:e.code,detail:e.detail}))};
 return j;
}
const review = r => r.data ? {id:r.data.id,attributes:{...Object.fromEntries(Object.entries(r.data.attributes??{}).filter(([k])=>!/^contact|demoAccount(Name|Password)/.test(k))),contactComplete:['contactFirstName','contactLastName','contactPhone','contactEmail'].every(k=>!!r.data.attributes?.[k]),demoCredentialsPresent:!!r.data.attributes?.demoAccountName}} : r;
if(process.env.PREPARE_STORE==='true') await prepare();
if(process.env.UPLOAD_SCREENSHOTS==='true') await uploadScreenshots();
const report = {checkedAt:new Date().toISOString(),app:await api(`/v1/apps/${appId}`)};
report.infos = await api(`/v1/apps/${appId}/appInfos?include=primaryCategory,primarySubcategoryOne,primarySubcategoryTwo,secondaryCategory`);
for(const i of report.infos.data??[]) {
 i.localizations = await api(`/v1/appInfos/${i.id}/appInfoLocalizations`);
 i.ageRating = await api(`/v1/appInfos/${i.id}/ageRatingDeclaration`);
}
report.versions = await api(`/v1/apps/${appId}/appStoreVersions?filter[platform]=IOS&limit=20`);
for(const v of report.versions.data??[]) {
 v.build = await api(`/v1/appStoreVersions/${v.id}/build`);
 v.review = review(await api(`/v1/appStoreVersions/${v.id}/appStoreReviewDetail`));
 v.localizations = await api(`/v1/appStoreVersions/${v.id}/appStoreVersionLocalizations`);
 for(const l of v.localizations.data??[]) {
  l.screenshots = await api(`/v1/appStoreVersionLocalizations/${l.id}/appScreenshotSets?include=appScreenshots&limit=50`);
  l.previews = await api(`/v1/appStoreVersionLocalizations/${l.id}/appPreviewSets?include=appPreviews&limit=50`);
 }
}
report.builds = await api(`/v1/builds?filter[app]=${appId}&sort=-uploadedDate&limit=5&include=preReleaseVersion,buildBetaDetail`);
report.betaReview = review(await api(`/v1/apps/${appId}/betaAppReviewDetail`));
report.priceSchedule = await api(`/v1/apps/${appId}/appPriceSchedule?include=baseTerritory`);
report.prices = await api(`/v1/appPriceSchedules/${appId}/manualPrices?include=appPricePoint,territory&limit=50`);
report.availability = await api(`/v1/apps/${appId}/appAvailabilityV2`);
if(report.availability.data) report.territories = await api(`/v2/appAvailabilities/${report.availability.data.id}/territoryAvailabilities?limit=200`);
report.purchases = await api(`/v1/apps/${appId}/inAppPurchasesV2?limit=10`);
report.subscriptions = await api(`/v1/apps/${appId}/subscriptionGroups?limit=10`);
report.eligibleBuilds = await api('/v1/builds?filter[app]=6809193565&filter[appStoreVersion]=86951539-3189-4abd-b333-c400588c1e9d&limit=10&include=preReleaseVersion');
report.categories = await api('/v1/appCategories?limit=200');
fs.mkdirSync('artifact/store-readiness',{recursive:true});
fs.writeFileSync('artifact/store-readiness/audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({appId,versions:report.versions.data?.map(v=>({id:v.id,...v.attributes,buildId:v.build.data?.id,review:v.review})),builds:report.builds.data?.map(b=>({id:b.id,...b.attributes})),auditSaved:true},null,2));

async function prepare(){
 const appInfoId='edb0e880-2be4-4952-9e3a-97962c60cde6', versionId='86951539-3189-4abd-b333-c400588c1e9d';
 const version=(await api(`/v1/appStoreVersions/${versionId}`)).data;
 if(version?.attributes.appStoreState!=='PREPARE_FOR_SUBMISSION')throw new Error('Version is not editable');
 async function change(path,method,body){
  const r=await api(path,method,body);
  if(r.errors){console.log(JSON.stringify({path,status:r.status,errors:r.errors}));throw new Error('Store update rejected');}
 }
 const relation=(type,id)=>({data:{type,id}});
 await change(`/v1/apps/${appId}`,'PATCH',{data:{type:'apps',id:appId,attributes:{contentRightsDeclaration:'USES_THIRD_PARTY_CONTENT'}}});
 const categories=(await api('/v1/appCategories?limit=200')).data;
 for(const id of ['GAMES','GAMES_ACTION','GAMES_ADVENTURE'])if(!categories.some(c=>c.id===id))throw new Error('Category not found: '+id);
 await change(`/v1/appInfos/${appInfoId}`,'PATCH',{data:{type:'appInfos',id:appInfoId,relationships:{primaryCategory:relation('appCategories','GAMES'),primarySubcategoryOne:relation('appCategories','GAMES_ACTION'),primarySubcategoryTwo:relation('appCategories','GAMES_ADVENTURE')}}});
 const age={advertising:false,alcoholTobaccoOrDrugUseOrReferences:'NONE',contests:'NONE',gambling:false,gamblingSimulated:'NONE',gunsOrOtherWeapons:'NONE',healthOrWellnessTopics:false,lootBox:false,medicalOrTreatmentInformation:'NONE',messagingAndChat:false,parentalControls:false,profanityOrCrudeHumor:'NONE',ageAssurance:false,sexualContentGraphicAndNudity:'NONE',sexualContentOrNudity:'NONE',socialMedia:false,socialMediaAgeRestricted:false,horrorOrFearThemes:'INFREQUENT_OR_MILD',matureOrSuggestiveThemes:'NONE',unrestrictedWebAccess:false,userGeneratedContent:false,violenceCartoonOrFantasy:'FREQUENT_OR_INTENSE',violenceRealisticProlongedGraphicOrSadistic:'NONE',violenceRealistic:'NONE',ageRatingOverrideV2:'NONE',koreaAgeRatingOverride:'NONE'};
 await change(`/v1/ageRatingDeclarations/${appInfoId}`,'PATCH',{data:{type:'ageRatingDeclarations',id:appInfoId,attributes:age}});
 await change(`/v1/appStoreVersions/${versionId}`,'PATCH',{data:{type:'appStoreVersions',id:versionId,attributes:{copyright:'2026 Krazel Games',releaseType:'MANUAL'}}});
 const manifest=JSON.parse(fs.readFileSync('store/app-store-connect-metadata.json','utf8'));
 const infoLocs=(await api(`/v1/appInfos/${appInfoId}/appInfoLocalizations`)).data;
 const locs=(await api(`/v1/appStoreVersions/${versionId}/appStoreVersionLocalizations`)).data;
 for(const [locale,c] of Object.entries(manifest.ios.locales)){
  const info=infoLocs.find(l=>l.attributes.locale===locale),loc=locs.find(l=>l.attributes.locale===locale);
  await change(`/v1/appInfoLocalizations/${info.id}`,'PATCH',{data:{type:'appInfoLocalizations',id:info.id,attributes:{name:c.name,subtitle:c.subtitle,privacyPolicyUrl:c.privacyPolicyUrl}}});
  await change(`/v1/appStoreVersionLocalizations/${loc.id}`,'PATCH',{data:{type:'appStoreVersionLocalizations',id:loc.id,attributes:{description:c.description,promotionalText:c.promotionalText,keywords:c.keywords,supportUrl:c.supportUrl}}});
 }
 const sourceVersions=(await api('/v1/apps/6772278149/appStoreVersions?filter[platform]=IOS&limit=30')).data;
 const source=sourceVersions.find(v=>v.attributes.versionString==='1.0.8');
 if(!source)throw new Error('Authorized contact source version not found');
 const sourceContact=(await api(`/v1/appStoreVersions/${source.id}/appStoreReviewDetail`)).data?.attributes;
 if(!sourceContact || !/guillermo/i.test(sourceContact.contactFirstName??'') || !/dura|durá/i.test(sourceContact.contactLastName??''))throw new Error('Contact identity mismatch');
 const contact=Object.fromEntries(['contactFirstName','contactLastName','contactEmail','contactPhone'].map(k=>[k,sourceContact[k]]));
 if(Object.values(contact).some(v=>!v))throw new Error('Contact source incomplete');
 const attributes={...contact,demoAccountRequired:false,notes:'VORO: Abyssal is an offline single-player action/adventure game. No account or login is required. Tap Awaken on the opening screen, then drag on the play area to move. Absorb smaller organisms and matter, avoid larger threats, and choose adaptations when prompted. Settings offers touch or tilt controls, left-handed layout, sound, English/Spanish language, progress and credits. Progress and preferences stay on the device. No ads, in-app purchases, subscriptions, tracking, or remote analytics are included. Any optional performance report is generated locally and is only shared through the system share sheet at the player\'s explicit request. Music is licensed under CC BY 4.0; individual credits and source links are available in Settings > Credits > View licenses.'};
 const existing=(await api(`/v1/appStoreVersions/${versionId}/appStoreReviewDetail`)).data;
 if(existing)await change(`/v1/appStoreReviewDetails/${existing.id}`,'PATCH',{data:{type:'appStoreReviewDetails',id:existing.id,attributes}});
 else await change('/v1/appStoreReviewDetails','POST',{data:{type:'appStoreReviewDetails',attributes,relationships:{appStoreVersion:relation('appStoreVersions',versionId)}}});
 console.log('Review contact copied privately and metadata prepared; no submission created.');
 const selection=await api(`/v1/appStoreVersions/${versionId}`,'PATCH',{data:{type:'appStoreVersions',id:versionId,relationships:{build:relation('builds','118537c4-7428-4664-a1da-1b96cb35e240')}}});
 console.log(JSON.stringify({buildSelection:selection.errors??'selected'}));
 const availability=await api(`/v1/apps/${appId}/appAvailabilityV2`);
 if(availability.status===404){
  const territories=(await api('/v1/territories?limit=200')).data;
  if(!territories?.some(t=>t.id==='ESP'))throw new Error('Territory list unavailable');
  const included=territories.map((t,index)=>({type:'territoryAvailabilities',id:`\u0024{territory-${index}}`,attributes:{available:!['CHN','VNM'].includes(t.id),preOrderEnabled:false},relationships:{territory:relation('territories',t.id)}}));
  await change('/v2/appAvailabilities','POST',{data:{type:'appAvailabilities',attributes:{availableInNewTerritories:false},relationships:{app:relation('apps',appId),territoryAvailabilities:{data:included.map(({type,id})=>({type,id}))}}},included});
  console.log('Distribution configured; China mainland and Vietnam excluded pending local game licenses.');
 }
}

async function uploadScreenshots(){
 const manifest=JSON.parse(fs.readFileSync('store/native-screenshots.json','utf8'));
 if(manifest.sourceCommit!=='aa0695334e428c03820aa2c5b442235b94189694')throw new Error('Wrong native source');
 const versionId='86951539-3189-4abd-b333-c400588c1e9d';
 const version=(await api(`/v1/appStoreVersions/${versionId}`)).data;
 if(version.attributes.appStoreState!=='PREPARE_FOR_SUBMISSION')throw new Error('Version is not editable');
 const locs=(await api(`/v1/appStoreVersions/${versionId}/appStoreVersionLocalizations`)).data;
 for(const group of manifest.groups){
  const loc=locs.find(l=>l.attributes.locale===group.locale);
  if(!loc)throw new Error('Localization missing');
  const sets=(await api(`/v1/appStoreVersionLocalizations/${loc.id}/appScreenshotSets`)).data;
  let set=sets.find(s=>s.attributes.screenshotDisplayType===group.displayType);
  if(!set){
   const result=await api('/v1/appScreenshotSets','POST',{data:{type:'appScreenshotSets',attributes:{screenshotDisplayType:group.displayType},relationships:{appStoreVersionLocalization:{data:{type:'appStoreVersionLocalizations',id:loc.id}}}}});
   if(result.errors)throw new Error(JSON.stringify(result.errors));
   set=result.data;
  }
  const existing=(await api(`/v1/appScreenshotSets/${set.id}/appScreenshots`)).data;
  for(const file of group.files){
   if(!file.path.startsWith('store/screenshots/'))throw new Error('Invalid screenshot path');
   const bytes=fs.readFileSync(file.path);
   if(crypto.createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw new Error('Screenshot checksum changed');
   let screenshot=existing.find(s=>s.attributes.fileName===file.name);
   if(screenshot?.attributes.assetDeliveryState?.state==='COMPLETE'){console.log(`Already complete: ${group.locale} ${file.name}`);continue;}
   if(!screenshot){
    const result=await api('/v1/appScreenshots','POST',{data:{type:'appScreenshots',attributes:{fileName:file.name,fileSize:bytes.length},relationships:{appScreenshotSet:{data:{type:'appScreenshotSets',id:set.id}}}}});
    if(result.errors)throw new Error(JSON.stringify(result.errors));
    screenshot=result.data;
   }
   for(const operation of screenshot.attributes.uploadOperations??[]){
    const headers=Object.fromEntries(operation.requestHeaders.map(h=>[h.name,h.value]));
    const r=await fetch(operation.url,{method:operation.method,headers,body:bytes.subarray(operation.offset,operation.offset+operation.length)});
    if(!r.ok)throw new Error(`Screenshot binary upload failed: ${r.status}`);
   }
   const committed=await api(`/v1/appScreenshots/${screenshot.id}`,'PATCH',{data:{type:'appScreenshots',id:screenshot.id,attributes:{uploaded:true,sourceFileChecksum:crypto.createHash('md5').update(bytes).digest('hex')}}});
   if(committed.errors)throw new Error(JSON.stringify(committed.errors));
   let complete=false;
   for(let attempt=0;attempt<30;attempt++){
    const fresh=(await api(`/v1/appScreenshots/${screenshot.id}`)).data;
    const state=fresh.attributes.assetDeliveryState?.state;
    if(state==='COMPLETE'){complete=true;break;}
    if(state==='FAILED')throw new Error(`Screenshot processing failed: ${JSON.stringify(fresh.attributes.assetDeliveryState)}`);
    await new Promise(r=>setTimeout(r,2000));
   }
   if(!complete)throw new Error('Screenshot processing timed out');
   console.log(`Verified screenshot: ${group.locale} ${file.name}`);
  }
  // Replace only the explicitly listed superseded assets after new uploads complete.
  for(const name of group.replaceFileNames??[]){
   if(group.files.some(f=>f.name===name))throw new Error('Cannot remove a selected screenshot');
   const stale=existing.find(s=>s.attributes.fileName===name);
   if(stale){
    const removed=await api(`/v1/appScreenshots/${stale.id}`,'DELETE');
    if(removed.errors)throw new Error(JSON.stringify(removed.errors));
    console.log('Replaced screenshot: '+name);
   }
  }
  const uploaded=(await api(`/v1/appScreenshotSets/${set.id}/appScreenshots`)).data;
  const desired=group.files.map(file=>uploaded.find(s=>s.attributes.fileName===file.name));
  if(desired.some(s=>!s || s.attributes.assetDeliveryState?.state!=='COMPLETE'))throw new Error('Incomplete screenshot set');
  const ordered=[...desired,...uploaded.filter(s=>!desired.some(d=>d.id===s.id))].map(s=>({type:'appScreenshots',id:s.id}));
  const reorder=await api(`/v1/appScreenshotSets/${set.id}/relationships/appScreenshots`,'PATCH',{data:ordered});
  if(reorder.errors)throw new Error(JSON.stringify(reorder.errors));
  const confirmed=(await api(`/v1/appScreenshotSets/${set.id}/relationships/appScreenshots`)).data;
  if(JSON.stringify(confirmed.map(s=>s.id))!==JSON.stringify(ordered.map(s=>s.id)))throw new Error('Screenshot order verification failed');
 }
}
