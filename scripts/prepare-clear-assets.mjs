import {createRequire} from 'node:module';
import {readFileSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {SPECIES_BY_ID,ATLAS_URLS} from '../app/journey-data.mjs';
import {animationCrop,ANIMATIONS} from '../app/animation-catalog.mjs';
const sharp=createRequire(process.env.VORO_CANVAS_RUNTIME)('sharp');
const out='design/asset-improvements-2026-09-28';mkdirSync(out+'/references',{recursive:true});
if(existsSync(out+'/art-plan.json')){console.log('Original references already frozen; keeping them.');process.exit(0);}
const audit=JSON.parse(readFileSync('design/asset-audit-2026-09-28/review.json'));
const artNumbers=[41,45,68,69,100,102,103,110,111,113,124,126,127,128,129,143,144,145,159,160,161,164];
const rows=[];
for(const number of artNumbers){
 const a=audit.assets.find(a=>a.number===number),s=SPECIES_BY_ID[a.id],url=ATLAS_URLS[s.imageAtlas||s.atlas];
 const meta=await sharp('public/'+url.slice(2)).metadata(),crop=animationCrop(s,{naturalWidth:meta.width,naturalHeight:meta.height});
 const file=`${out}/references/${number}.png`;
 await sharp('public/'+url.slice(2)).extract({left:Math.round(crop[0]),top:Math.round(crop[1]),width:Math.round(crop[2]),height:Math.round(crop[3])}).png().toFile(file);
 rows.push({number,id:a.id,name:a.name,source:url,crop,file,profile:ANIMATIONS[s.id],aliases:number===143?['universe-5']:number===144?['universe-6']:[]});
}
writeFileSync(out+'/art-plan.json',JSON.stringify(rows,null,2));
const tiles=await Promise.all(rows.map(async(a,i)=>({input:await sharp(a.file).resize(210,180,{fit:'contain',background:'#071d29'}).extend({bottom:30,background:'#071d29'}).composite([{input:Buffer.from(`<svg width="210" height="30"><text x="8" y="22" fill="white" font-size="15">${a.number} ${a.name}</text></svg>`),top:180,left:0}]).png().toBuffer(),top:Math.floor(i/4)*210,left:i%4*210})));
await sharp({create:{width:840,height:Math.ceil(rows.length/4)*210,channels:4,background:'#071d29'}}).composite(tiles).png().toFile(out+'/references.png');
console.log(rows.map(a=>[a.number,a.name]));
