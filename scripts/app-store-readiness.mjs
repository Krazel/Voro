import crypto from 'node:crypto';
import fs from 'node:fs';
const appId = '6809193565';
const enc = x => Buffer.from(JSON.stringify(x)).toString('base64url');
const now = Math.floor(Date.now()/1000);
const unsigned = `${enc({alg:'ES256',kid:process.env.ASC_KEY_ID,typ:'JWT'})}.${enc({iss:process.env.ASC_ISSUER_ID,aud:'appstoreconnect-v1',iat:now,exp:now+1200})}`;
const token = `${unsigned}.${crypto.sign('sha256',Buffer.from(unsigned),{key:fs.readFileSync(process.env.ASC_PRIVATE_KEY_PATH),dsaEncoding:'ieee-p1363'}).toString('base64url')}`;
async function api(path) {
 const r = await fetch(`https://api.appstoreconnect.apple.com${path}`,{headers:{Authorization:`Bearer ${token}`}});
 const j = await r.json();
 if(!r.ok) return {status:r.status,errors:j.errors?.map(e=>({code:e.code,detail:e.detail}))};
 return j;
}
const review = r => r.data ? {id:r.data.id,attributes:{...Object.fromEntries(Object.entries(r.data.attributes??{}).filter(([k])=>!/^contact|demoAccount(Name|Password)/.test(k))),contactComplete:['contactFirstName','contactLastName','contactPhone','contactEmail'].every(k=>!!r.data.attributes?.[k]),demoCredentialsPresent:!!r.data.attributes?.demoAccountName}} : r;
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
report.availability = await api(`/v1/apps/${appId}/appAvailabilityV2`);
if(report.availability.data) report.territories = await api(`/v2/appAvailabilities/${report.availability.data.id}/territoryAvailabilities?limit=200`);
report.purchases = await api(`/v1/apps/${appId}/inAppPurchasesV2?limit=10`);
report.subscriptions = await api(`/v1/apps/${appId}/subscriptionGroups?limit=10`);
fs.mkdirSync('artifact/store-readiness',{recursive:true});
fs.writeFileSync('artifact/store-readiness/audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({appId,versions:report.versions.data?.map(v=>({id:v.id,...v.attributes,buildId:v.build.data?.id,review:v.review})),builds:report.builds.data?.map(b=>({id:b.id,...b.attributes})),auditSaved:true},null,2));
