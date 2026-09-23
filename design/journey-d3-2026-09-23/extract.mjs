import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const source='design/journey-d3-2026-09-23/text-free.png',dest='public/ui/journey/d3';
const bands=[['micro',186,282],['pond',291,387],['shore',395,491],['sea',500,600],['city',608,709],['orbit',718,820],['planets',829,934],['stars',943,1044],['galaxies',1054,1155],['universe',1165,1269]];
const outputs=[];
for(const [name,top,bottom] of bands){
 const bytes=await sharp(source).extract({left:0,top,width:887,height:bottom-top}).webp({quality:92}).toBuffer();
 await writeFile(`${dest}/${name}.webp`,bytes);outputs.push({name,top,bottom,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
await sharp(source).extract({left:0,top:0,width:887,height:186}).webp({quality:85}).toFile(`${dest}/background.webp`);
await sharp(source).extract({left:156,top:1464,width:575,height:145}).webp({quality:95}).toFile(`${dest}/rebirth.webp`);
await writeFile('design/journey-d3-2026-09-23/assets.json',JSON.stringify(outputs,null,2));
