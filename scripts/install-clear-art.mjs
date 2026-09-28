import {createRequire} from 'node:module';
import {readFileSync,existsSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sharp=createRequire(process.env.VORO_CANVAS_RUNTIME)('sharp');
const root='design/asset-improvements-2026-09-28';
const plan=JSON.parse(readFileSync(root+'/art-plan.json')),manifest=[],evidence=[];
const previous=existsSync(root+'/art-manifest.json')?JSON.parse(readFileSync(root+'/art-manifest.json')):[];
mkdirSync('public/inhabitants/clear-detail-v1',{recursive:true});
for(const a of plan){
 const file=`${root}/art/${a.number}.png`;if(!existsSync(file))continue;
 const meta=await sharp(file).metadata();
 if(!meta.hasAlpha||meta.width<1000)throw new Error(`Insufficient source: ${a.number}`);
 // Fit, never stretch, to the original sprite's aspect ratio. Physics, hitbox,
 // size ranges and relative width/height remain independent of art resolution.
 const width=1254,height=Math.round(width*a.crop[3]/a.crop[2]);
 const target=`public/inhabitants/clear-detail-v1/${a.number}.webp`;
 const hash=createHash('sha256').update(readFileSync(file)).digest('hex');
 if(!existsSync(target)||previous.find(p=>p.number===a.number)?.sha256!==hash)
  await sharp(file).resize(width,height,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}})
   .webp({quality:94,alphaQuality:100,effort:4}).toFile(target);
 const {surface,crop,id,rigId,revised,assetKey,...profile}=a.profile;
 if(a.number>=110){
  profile.rigid=true;
  profile.precession=profile.precession??.01;
  if(!['prop','planet'].includes(profile.family))profile.highDetailFlow={rx:surface?.rx??.33,ry:surface?.ry??.3,angle:surface?.angle??0};
  if(['star','giantStar','quasar','universe','filament'].includes(profile.family))profile.detailPulse=.008;
 }
 manifest.push({number:a.number,ids:[a.id,...a.aliases],url:`./inhabitants/clear-detail-v1/${a.number}.webp`,crop:[0,0,width,height],profile});
 evidence.push({number:a.number,ids:[a.id,...a.aliases],master:file,width:meta.width,height:meta.height,alpha:meta.hasAlpha,
  sha256:hash,shipped:[width,height],decodedBytes:width*height*4,encodedBytes:readFileSync(target).length});
}
writeFileSync('app/clear-art.json',JSON.stringify(manifest,null,2)+'\n');
writeFileSync(root+'/art-manifest.json',JSON.stringify(evidence,null,2)+'\n');
console.log({images:manifest.length,ids:manifest.flatMap(a=>a.ids).length,encodedMB:evidence.reduce((s,a)=>s+a.encodedBytes,0)/1048576});
