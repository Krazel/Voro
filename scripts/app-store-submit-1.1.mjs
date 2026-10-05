import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
if(process.env.REVIEW_AUTHORIZATION!=='VORO-1.1-build2-review')throw Error('Explicit release authorization required');
const appId='6809193565',versionId='86951539-3189-4abd-b333-c400588c1e9d',buildId='5577fdc1-a3c3-476b-84fb-2942912dad4e';
const previousBuildId='29c99cb9-ef4f-4a41-997c-3c88fb3e49e9';
const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url'),now=Math.floor(Date.now()/1000);
const unsigned=`${enc({alg:'ES256',kid:process.env.ASC_KEY_ID,typ:'JWT'})}.${enc({iss:process.env.ASC_ISSUER_ID,aud:'appstoreconnect-v1',iat:now,exp:now+1200})}`;
const token=`${unsigned}.${crypto.sign('sha256',Buffer.from(unsigned),{key:fs.readFileSync(process.env.ASC_PRIVATE_KEY_PATH),dsaEncoding:'ieee-p1363'}).toString('base64url')}`;
async function api(path,method='GET',body){
 if(method!=='GET'){
  const selection=method==='PATCH'&&path===`/v1/appStoreVersions/${versionId}`;
  const submission=/^\/v1\/reviewSubmission(?:s|Items)(?:\/[^/]+)?$/.test(path);
  if(!selection&&!submission)throw Error('Only exact version/build selection and submission mutations permitted');
  if(selection)assert.deepEqual(body,{data:{type:'appStoreVersions',id:versionId,attributes:{versionString:'1.1'},relationships:{build:{data:{type:'builds',id:buildId}}}}});
 }
 const r=await fetch('https://api.appstoreconnect.apple.com'+path,{method,signal:AbortSignal.timeout(30000),headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 const j=await r.json().catch(()=>({}));if(!r.ok)throw Error(`${method} ${path}: ${r.status} ${JSON.stringify(j.errors?.map(e=>({code:e.code,detail:e.detail,source:e.source})))}`);return j;
}
const rel=(type,id)=>({data:{type,id}});
const manifest=JSON.parse(fs.readFileSync('store/native-screenshots.json','utf8'));
assert.equal(manifest.restoreOriginal,true);assert.equal(manifest.groups.reduce((n,g)=>n+g.files.length,0),8);
async function snapshot(allowPrevious=false){
 const version=(await api(`/v1/appStoreVersions/${versionId}`)).data;
 assert((allowPrevious?['1.0','1.1']:['1.1']).includes(version.attributes.versionString));assert.equal(version.attributes.platform,'IOS');assert.equal(version.attributes.releaseType,'MANUAL');
 const build=(await api(`/v1/appStoreVersions/${versionId}/build`)).data;
 assert((allowPrevious?[previousBuildId,buildId]:[buildId]).includes(build.id));assert.equal(build.attributes.version,build.id===previousBuildId?'1':'2');assert.equal(build.attributes.processingState,'VALID');assert.equal(build.attributes.expired,false);
 const locs=(await api(`/v1/appStoreVersions/${versionId}/appStoreVersionLocalizations`)).data;
 const media=[];
 for(const loc of locs){
  const sets=(await api(`/v1/appStoreVersionLocalizations/${loc.id}/appScreenshotSets?include=appScreenshots`));
  for(const set of sets.data){
   const g=manifest.groups.find(g=>g.locale===loc.attributes.locale&&g.displayType===set.attributes.screenshotDisplayType);assert(g,'Unexpected screenshot set');
   const shots=(await api(`/v1/appScreenshotSets/${set.id}/appScreenshots`)).data;
   assert.equal(shots.length,g.files.length);
   const order=(await api(`/v1/appScreenshotSets/${set.id}/relationships/appScreenshots`)).data;
   const ordered=order.map(x=>shots.find(s=>s.id===x.id));
   for(let i=0;i<ordered.length;i++){const s=ordered[i],f=g.files[i];assert.equal(s.attributes.fileName,f.name);assert.equal(s.attributes.sourceFileChecksum,crypto.createHash('md5').update(fs.readFileSync(f.path)).digest('hex'));assert.equal(s.attributes.assetDeliveryState.state,'COMPLETE');}
   media.push({locale:loc.attributes.locale,displayType:set.attributes.screenshotDisplayType,files:ordered.map(s=>({id:s.id,name:s.attributes.fileName,checksum:s.attributes.sourceFileChecksum}))});
  }
  const previews=await api(`/v1/appStoreVersionLocalizations/${loc.id}/appPreviewSets?include=appPreviews`);
  media.push({locale:loc.attributes.locale,previews:(previews.included??[]).filter(x=>x.type==='appPreviews').map(s=>({id:s.id,attributes:s.attributes}))});
 }
 assert.equal(media.filter(m=>m.files).length,2);
 const schedule=(await api(`/v1/apps/${appId}/appPriceSchedule?include=baseTerritory`)).data;assert.equal(schedule.relationships.baseTerritory.data.id,'ESP');
 const prices=await api(`/v1/appPriceSchedules/${schedule.id}/manualPrices?include=appPricePoint,territory&limit=200`);
 assert(prices.data.some(p=>p.relationships.territory.data.id==='ESP'&&prices.included?.some(x=>x.type==='appPricePoints'&&x.id===p.relationships.appPricePoint.data.id&&x.attributes.customerPrice==='5.99')));
 const review=(await api(`/v1/appStoreVersions/${versionId}/appStoreReviewDetail`)).data;
 assert(['contactFirstName','contactLastName','contactPhone','contactEmail'].every(k=>!!review.attributes[k]));assert.equal(review.attributes.demoAccountRequired,false);
 const availability=(await api(`/v1/apps/${appId}/appAvailabilityV2`)).data;
 const territories=await api(`/v2/appAvailabilities/${availability.id}/territoryAvailabilities?limit=200`);
 assert(!territories.links.next,'Read all availability pages before submitting');
 const territoryState=territories.data.map(t=>({territory:JSON.parse(Buffer.from(t.id,'base64url').toString()).t,available:t.attributes.available,releaseDate:t.attributes.releaseDate,preOrderEnabled:t.attributes.preOrderEnabled})).sort((a,b)=>a.territory.localeCompare(b.territory));
 const catalog=await api('/v1/territories?limit=200');assert(!catalog.links.next);
 assert.equal(territoryState.length,catalog.data.length);
 assert.deepEqual(territoryState.filter(t=>!t.available).map(t=>t.territory),['CHN','VNM']);
 assert(territoryState.every(t=>!t.preOrderEnabled&&!t.releaseDate));
 return {state:version.attributes.appStoreState,version:version.attributes,buildId:build.id,localizations:locs.map(l=>({id:l.id,attributes:l.attributes})),media,prices:prices.data,pricePoints:prices.included?.filter(x=>x.type==='appPricePoints'),reviewNotes:review.attributes.notes,territoryState};
}
const candidate=await api(`/v1/builds/${buildId}?include=preReleaseVersion,app`);
assert.equal(candidate.data.attributes.version,'2');assert.equal(candidate.data.attributes.processingState,'VALID');assert.equal(candidate.data.attributes.expired,false);assert.equal(candidate.data.attributes.buildAudienceType,'APP_STORE_ELIGIBLE');
assert.equal(candidate.data.relationships.app.data.id,appId);assert.equal(candidate.included.find(i=>i.type==='preReleaseVersions').attributes.version,'1.1');
const verification=JSON.parse(fs.readFileSync('design/release-1.1-2026-10-05/testflight-player-verification.json'));
assert(verification.verified);assert.equal(verification.developmentTools,false);assert.equal(verification.version,'1.1');assert.equal(verification.build,'2');assert.equal(verification.commit,'56bed5b8d2a8c1bf66aa3ad45f1a5176082bfe42');
const before=await snapshot(true);
assert(['DEVELOPER_REJECTED','PREPARE_FOR_SUBMISSION','READY_FOR_REVIEW','WAITING_FOR_REVIEW','IN_REVIEW'].includes(before.state),'Unexpected version state');
fs.mkdirSync('artifact/store-submission-1.1',{recursive:true});
fs.writeFileSync('artifact/store-submission-1.1/before.json',JSON.stringify(before,null,2));
if(before.version.versionString!=='1.1'||before.buildId!==buildId){
 assert(['DEVELOPER_REJECTED','PREPARE_FOR_SUBMISSION','READY_FOR_REVIEW'].includes(before.state));
 await api(`/v1/appStoreVersions/${versionId}`,'PATCH',{data:{type:'appStoreVersions',id:versionId,attributes:{versionString:'1.1'},relationships:{build:rel('builds',buildId)}}});
}
const prepared=await snapshot();
for(const key of ['localizations','media','prices','reviewNotes','territoryState'])assert.deepEqual(prepared[key],before[key],`Preserved ${key} changed`);
const submissions=(await api(`/v1/apps/${appId}/reviewSubmissions?limit=200`)).data;
const active=submissions.filter(s=>!['COMPLETE','CANCELED'].includes(s.attributes.state));
if(active.length>1)throw Error('Multiple active submissions: reconcile without altering');
let submission=active[0];
if(!submission)submission=(await api('/v1/reviewSubmissions','POST',{data:{type:'reviewSubmissions',relationships:{app:rel('apps',appId)}}})).data;
let items=(await api(`/v1/reviewSubmissions/${submission.id}/items?include=appStoreVersion&fields[reviewSubmissionItems]=state,appStoreVersion`)).data;
if(items.some(i=>i.relationships.appStoreVersion?.data?.id!==versionId))throw Error('Submission contains another item: preserve and stop');
assert(items.length<=1);
if(!items.length){assert(['READY_FOR_REVIEW','UNRESOLVED_ISSUES'].includes(submission.attributes.state));await api('/v1/reviewSubmissionItems','POST',{data:{type:'reviewSubmissionItems',relationships:{reviewSubmission:rel('reviewSubmissions',submission.id),appStoreVersion:rel('appStoreVersions',versionId)}}});}
items=(await api(`/v1/reviewSubmissions/${submission.id}/items?include=appStoreVersion&fields[reviewSubmissionItems]=state,appStoreVersion`)).data;assert.equal(items.length,1);assert.equal(items[0].relationships.appStoreVersion.data.id,versionId);
submission=(await api(`/v1/reviewSubmissions/${submission.id}`)).data;
if(submission.attributes.state==='READY_FOR_REVIEW')await api(`/v1/reviewSubmissions/${submission.id}`,'PATCH',{data:{type:'reviewSubmissions',id:submission.id,attributes:{submitted:true}}});
submission=(await api(`/v1/reviewSubmissions/${submission.id}`)).data;
const after=await snapshot();
assert(['WAITING_FOR_REVIEW','IN_REVIEW','COMPLETE'].includes(submission.attributes.state),'Review has not been submitted');
assert.deepEqual(after.localizations,before.localizations,'Approved text changed');assert.deepEqual(after.media,before.media,'Approved media changed');assert.deepEqual(after.prices,before.prices,'Price changed');assert.equal(after.reviewNotes,before.reviewNotes);
assert.deepEqual(after.territoryState,before.territoryState);
const receipt={verified:true,checkedAt:new Date().toISOString(),appId,version:'1.1',build:'2',buildId,versionId,submissionId:submission.id,submissionState:submission.attributes.state,appStoreState:after.state,releaseType:'MANUAL',approvedMediaUnchanged:true,approvedTextUnchanged:true,priceUnchanged:true,priceSpain:'5.99 EUR',availableTerritories:after.territoryState.filter(t=>t.available).length,excludedTerritories:['CHN','VNM'],published:false,items:items.map(i=>({id:i.id,versionId:i.relationships.appStoreVersion.data.id}))};
fs.writeFileSync('artifact/store-submission-1.1/receipt.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt,null,2));
