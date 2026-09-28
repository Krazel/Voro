import {createRequire} from 'node:module';
import {readdirSync,writeFileSync} from 'node:fs';
const sharp=createRequire(process.env.VORO_CANVAS_RUNTIME)('sharp');
const root='design/asset-improvements-2026-09-28',rows=[];
for(const f of readdirSync(root+'/art')){
 const {data,info}=await sharp(root+'/art/'+f).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let edgeMax=0,edgeStrong=0,corners=0,empty=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
  const a=data[(y*info.width+x)*4+3];if(a===0)empty++;
  if(!x||!y||x===info.width-1||y===info.height-1){edgeMax=Math.max(edgeMax,a);if(a>24)edgeStrong++;}
  if((x<8||x>info.width-9)&&(y<8||y>info.height-9))corners=Math.max(corners,a);
 }
 rows.push({f,width:info.width,height:info.height,edgeMax,edgeStrong,corners,transparent:empty/(info.width*info.height)});
}
writeFileSync(root+'/alpha-check.json',JSON.stringify(rows,null,2));console.log(rows);
