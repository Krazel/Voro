import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sharp=createRequire(process.env.VORO_CANVAS_RUNTIME)('sharp');
const records=JSON.parse(readFileSync(process.argv[2],'utf8'));
const out='design/quality-pacing-2026-09-28/art';mkdirSync(out,{recursive:true});
const manifest=[];
for(const r of records){
 const master=`${out}/${r.name}.png`;copyFileSync(r.source,master);
 const meta=await sharp(master).metadata();
 const ground=r.name==='planets-dust-v2';
 if(!ground&&(!meta.hasAlpha||meta.width<1254||meta.height<1254))throw Error(`Insufficient native pixels/alpha: ${r.name}`);
 const output=`public/${ground?'backgrounds':'inhabitants'}/${r.name}.webp`;
 const data=await sharp(master).resize(ground?1536:1254,ground?1024:1254,{fit:'fill',withoutEnlargement:true}).webp({quality:96,alphaQuality:100,effort:6}).toBuffer();
 writeFileSync(output,data);manifest.push({name:r.name,master,output,width:meta.width,height:meta.height,alpha:meta.hasAlpha,sha256:createHash('sha256').update(data).digest('hex'),bytes:data.length});
}
writeFileSync(`${out}/manifest.json`,JSON.stringify({mode:'built-in imagegen; reference-preserving detailed variants, native pixels then WebP conversion',assets:manifest},null,2));
console.log(JSON.stringify(manifest.map(({name,width,height,bytes})=>({name,width,height,bytes}))));
