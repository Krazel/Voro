import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sharp=createRequire(process.env.VORO_CANVAS_RUNTIME)('sharp');
const root='design/orbit-recovery-2026-09-28/art',records=[];
// Distribution encoding only. The native photographic source is 8000²;
// no invented detail or enlargement. Its circular clip is rendered by Canvas.
for(const [name,source,size]of [
 ['earth-npp-detail-v1',`${root}/nasa-npp-earth-source.jpg`,4096],
 ['pulsar-detail-v1',`${root}/pulsar-master.png`,1254],
]){
 const meta=await sharp(source).metadata(),output=`public/inhabitants/${name}.webp`;
 const data=await sharp(source).resize(size,size,{fit:'inside',withoutEnlargement:true}).webp({quality:96,alphaQuality:100,effort:4}).toBuffer();
 writeFileSync(output,data);records.push({name,source,output,native:[meta.width,meta.height],shipped:size,alpha:meta.hasAlpha,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});
}
writeFileSync(`${root}/manifest.json`,JSON.stringify({earthSource:'https://svs.gsfc.nasa.gov/30002/',earthCredit:'NASA/NOAA/GSFC/Suomi NPP/VIIRS/Norman Kuring',assets:records},null,2));
console.log(JSON.stringify(records));
