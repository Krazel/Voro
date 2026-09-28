import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';
const sharp=createRequire(process.env.VORO_CANVAS_RUNTIME)('sharp');
const records=JSON.parse(readFileSync('design/pond-camera-audio-2026-09-23/universe-art.json')).assets;
records.push({name:'cosmic-tide',source:'design/universe-options-2026-09-23/3-marea-cosmica.png'});
const result=[];
for(const r of records){
 const master=`design/quality-pacing-2026-09-28/art/${r.name}-approved.png`;
 copyFileSync(r.source,master);const m=await sharp(master).metadata();
 if(m.width!==1254||m.height!==1254||!m.hasAlpha)throw Error('Unexpected approved master');
 const output=`public/inhabitants/${r.name}-detail-v2.webp`;
 await sharp(master).webp({quality:96,alphaQuality:100,effort:4}).toFile(output);
 result.push({name:r.name,master,output,width:1254,height:1254,previousPixels:512,unchangedApprovedArtwork:true});
}
writeFileSync('design/quality-pacing-2026-09-28/art/restored-masters.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
