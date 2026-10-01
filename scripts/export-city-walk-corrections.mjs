// Pack corrected painted poses; preserve the previously approved front/back pixels.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const {createCanvas,loadImage}=createRequire(process.env.VORO_CANVAS_RUNTIME)('@napi-rs/canvas');
const out='design/city-walk-corrections-2026-10-01';
const config=JSON.parse(readFileSync(`${out}/sources.json`,'utf8'));
const live=JSON.parse(readFileSync('app/city-perspective-art.json','utf8'));
const previousAudit=JSON.parse(readFileSync('design/city-walk-2026-10-01/painted-frame-audit.json','utf8'));
const audit=[];
mkdirSync(out,{recursive:true});
function bounds(data,width,x0,y0,x1,y1,threshold=230){
 let l=x1,t=y1,r=x0,b=y0;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(data[(y*width+x)*4+3]>threshold){l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}
 if(r<=l||b<=t)throw Error('Empty pose');return[l,t,r-l,b-t];
}
for(const entry of config.records.filter(a=>a.id==='city-civilian-5')){
 const {id}=entry,art=live.find(a=>a.id===id);
 const source=await loadImage(entry.source),old=await loadImage(`public/inhabitants/city-perspective/${id}-walk-v3.webp`);
 const master=createCanvas(source.width,source.height),m=master.getContext('2d');m.drawImage(source,0,0);
 const pixels=m.getImageData(0,0,source.width,source.height),poses=[];
 for(let i=0;i<4;i++){
  const x0=Math.round(i%2*source.width/2),y0=Math.round(Math.floor(i/2)*source.height/2),x1=Math.round((i%2+1)*source.width/2),y1=Math.round((Math.floor(i/2)+1)*source.height/2);
  const crop=bounds(pixels.data,source.width,x0,y0,x1,y1),[x,y,w,h]=crop;
  // Crown only: a tall backpack must never become part of the head anchor.
  const head=bounds(pixels.data,source.width,x,y,x+w,y+Math.round(h*.08));
  const legs=bounds(pixels.data,source.width,x,y+Math.round(h*.64),x+w,y+h);
  poses.push({crop,headX:head[0]+head[2]/2,legSpan:legs[2]/h});
 }
 for(let i=3;i<pixels.data.length;i+=4){const a=Math.max(0,Math.min(1,(pixels.data[i]-230)/20));pixels.data[i]=Math.round(255*a*a*(3-2*a));}m.putImageData(pixels,0,0);
 const sheet=createCanvas(1024,512),c=sheet.getContext('2d'),hashes=[];
 for(let i=0;i<4;i++){
  const f=poses[i],[x,y,w,h]=f.crop,u=208/h;
  c.drawImage(master,x,y,w,h,i*256+128-(f.headX-x)*u,232-h*u,w*u,h*u);
  hashes.push(createHash('sha256').update(c.getImageData(i*256,0,256,256).data).digest('hex'));
  f.registration={crownX:128,groundY:232,height:208};
 }
 // Lossless PNG avoids recompressing preserved front/back views a second time.
 c.drawImage(old,0,256,1024,256,0,256,1024,256);
 const file=`${id}-walk-v4.png`;
 writeFileSync(`public/inhabitants/city-perspective/${file}`,sheet.toBuffer('image/png'));
 const updated={...art,file,walkRevision:7};
 live[live.findIndex(a=>a.id===id)]=updated;
 writeFileSync(`design/city-walk-2026-10-01/${id}.json`,JSON.stringify(updated,null,2)+'\n');
 const row={id,source:entry.source,sourceSize:[source.width,source.height],poses,frameHashes:hashes,uniqueFrames:new Set(hashes).size,preservedViews:[1,3],leftView:'mirrored right sequence',correction:entry.correction};
 audit.push(row);previousAudit[previousAudit.findIndex(a=>a.id===id)]=row;
 console.log(id);
}
writeFileSync('app/city-perspective-art.json',JSON.stringify(live,null,2)+'\n');
writeFileSync('design/city-walk-2026-10-01/painted-frame-audit.json',JSON.stringify(previousAudit,null,2)+'\n');
writeFileSync(`${out}/audit.json`,JSON.stringify(audit,null,2)+'\n');
