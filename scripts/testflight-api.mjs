import crypto from 'node:crypto';
import fs from 'node:fs';

const [mode, version, buildNumber, groupId] = process.argv.slice(2);
const keyId = process.env.APP_STORE_CONNECT_API_KEY_ID;
const issuer = process.env.APP_STORE_CONNECT_ISSUER_ID;
const keyPath = process.env.APP_STORE_CONNECT_API_KEY_PATH;
const bundleId = process.env.BUNDLE_ID;
if (!['latest', 'preflight', 'finish'].includes(mode) || !version || !groupId || (mode !== 'latest' && !buildNumber))
  throw new Error('Usage: testflight-api.mjs latest|preflight|finish VERSION BUILD_OR_DASH GROUP_ID');
if (![keyId, issuer, keyPath, bundleId].every(Boolean)) throw new Error('Missing App Store Connect API configuration');
const b64 = value => Buffer.from(value).toString('base64url');
const token = () => {
  const now = Math.floor(Date.now() / 1000);
  const header = b64(JSON.stringify({alg:'ES256',kid:keyId,typ:'JWT'}));
  const payload = b64(JSON.stringify({iss:issuer,iat:now-5,exp:now+900,aud:'appstoreconnect-v1'}));
  const input = `${header}.${payload}`;
  const signature = crypto.sign('sha256', Buffer.from(input), {
    key: fs.readFileSync(keyPath), dsaEncoding: 'ieee-p1363',
  }).toString('base64url');
  return `${input}.${signature}`;
};
async function api(path, options={}) {
  const response = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    ...options,
    headers:{Authorization:`Bearer ${token()}`,'Content-Type':'application/json',...(options.headers||{})},
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${options.method||'GET'} ${path}: ${response.status} ${text.slice(0,1000)}`);
  return text ? JSON.parse(text) : null;
}
const apps = await api(`/v1/apps?filter[bundleId]=${encodeURIComponent(bundleId)}&limit=2`);
if (apps.data.length !== 1) throw new Error(`Expected one app for ${bundleId}; found ${apps.data.length}`);
const appId = apps.data[0].id;
const group = await api(`/v1/betaGroups/${groupId}?fields[betaGroups]=name,isInternalGroup,publicLinkEnabled`);
if (!group.data.attributes.isInternalGroup) throw new Error(`Refusing non-internal beta group ${groupId}`);
if (mode === 'latest') {
  const builds = await api(`/v1/builds?filter[app]=${appId}&filter[preReleaseVersion.version]=${encodeURIComponent(version)}&include=preReleaseVersion&sort=-uploadedDate&limit=200`);
  const numbers = builds.data.map(item=>Number(item.attributes.version)).filter(Number.isSafeInteger);
  const latest = numbers.length ? Math.max(...numbers) : 0;
  const recent = await api(`/v1/builds?filter[app]=${appId}&include=preReleaseVersion&sort=-uploadedDate&limit=5`);
  const recentBuilds = recent.data.map(item=>({id:item.id,build:item.attributes.version,state:item.attributes.processingState,
    version:recent.included?.find(v=>v.type==='preReleaseVersions'&&v.id===item.relationships.preReleaseVersion.data?.id)?.attributes.version,
    uploadedDate:item.attributes.uploadedDate}));
  const uploads = await api(`/v1/apps/${appId}/buildUploads?limit=20`);
  const buildUploads = uploads.data.map(item=>({id:item.id,
    version:item.attributes.cfBundleShortVersionString,build:item.attributes.cfBundleVersion,
    state:item.attributes.state,createdDate:item.attributes.createdDate,uploadedDate:item.attributes.uploadedDate}))
    .sort((a,b)=>String(b.createdDate).localeCompare(String(a.createdDate))).slice(0,5);
  console.log(JSON.stringify({appId,bundleId,version,existingBuilds:[...new Set(numbers)].sort((a,b)=>a-b),latestBuild:latest,nextBuild:latest+1,
    recentBuilds,buildUploads,
    group:{id:groupId,name:group.data.attributes.name,internal:true}}));
  process.exit(0);
}
const buildPath = `/v1/builds?filter[app]=${appId}&filter[version]=${encodeURIComponent(buildNumber)}&filter[preReleaseVersion.version]=${encodeURIComponent(version)}&include=preReleaseVersion,betaGroups,buildBetaDetail&limit=10`;
if (mode === 'preflight') {
  const existing = await api(buildPath);
  if (existing.data.length) throw new Error(`Version ${version} build ${buildNumber} already exists in App Store Connect`);
  console.log(JSON.stringify({appId,bundleId,version,build:buildNumber,group:{id:groupId,name:group.data.attributes.name,internal:true},unused:true}));
  process.exit(0);
}
let result;
for (let attempt=0; attempt<150; attempt++) {
  result = await api(buildPath);
  if (result.data.length === 1 && result.data[0].attributes.processingState !== 'PROCESSING') break;
  await new Promise(resolve=>setTimeout(resolve,20_000));
}
if (result?.data?.length !== 1) throw new Error(`Uploaded build ${version} (${buildNumber}) did not appear`);
const build = result.data[0];
if (build.attributes.processingState !== 'VALID') throw new Error(`Build processing state: ${build.attributes.processingState}`);
await api(`/v1/builds/${build.id}/relationships/betaGroups`,{
  method:'POST',body:JSON.stringify({data:[{type:'betaGroups',id:groupId}]})
});
let verified,groups;
// Group membership can lag the successful relationship write in Apple's reads.
for(let attempt=0;attempt<15;attempt++) {
  verified = await api(`/v1/builds/${build.id}?include=preReleaseVersion,betaGroups,buildBetaDetail`);
  groups = verified.included?.filter(item=>item.type==='betaGroups')||[];
  if(groups.some(item=>item.id===groupId)) break;
  await new Promise(resolve=>setTimeout(resolve,4000));
}
const detail = verified.included?.find(item=>item.type==='buildBetaDetails');
if (!groups.some(item=>item.id===groupId)) throw new Error('Internal beta group assignment was not visible after write');
console.log(JSON.stringify({appId,buildId:build.id,bundleId,version,build:buildNumber,
  processingState:verified.data.attributes.processingState,uploadedDate:verified.data.attributes.uploadedDate,
  group:{id:groupId,name:group.data.attributes.name,internal:true},internalBuildState:detail?.attributes?.internalBuildState}));
