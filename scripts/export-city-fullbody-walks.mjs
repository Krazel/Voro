// Pack painted contact/passing poses. No mesh deformation runs on the phone.
import{createRequire}from'node:module';
import{readFileSync,writeFileSync}from'node:fs';
import{createHash}from'node:crypto';
const{createCanvas,loadImage}=createRequire(process.env.VORO_CANVAS_RUNTIME||import.meta.url)('@napi-rs/canvas');
const out='design/city-walk-fullbody-2026-10-01';
const original=JSON.parse(readFileSync(`${out}/before-art.json`,'utf8'));
const records=JSON.parse(readFileSync(`${out}/prompts.json`,'utf8')).records;
const live=JSON.parse(readFileSync('app/city-perspective-art.json','utf8')),audit=[];
function bounds(data,width,x0,y0,x1,y1,threshold=230){
 let l=x1,t=y1,r=x0,b=y0;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(data[(y*width+x)*4+3]>threshold){l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}
 if(r<=l||b<=t)throw Error('Empty pose');return[l,t,r-l,b-t];
}
for(const{id}of records){
 const art=original.find(a=>a.id===id),source=await loadImage(`${out}/${id}.png`),old=await loadImage(`public/inhabitants/city-perspective/${id}-walk-v3.webp`);
 const master=createCanvas(source.width,source.height),m=master.getContext('2d');m.drawImage(source,0,0);
 const pixels=m.getImageData(0,0,source.width,source.height),poses=[];
 for(let i=0;i<4;i++){
  // The worker's extended boot crosses the mathematical midpoint; split in
  // the actual empty gutter so it cannot leak into the adjacent pose.
  const split=source.width*(id==='city-civilian-1'?.56:.5);
  const x0=i%2?Math.round(split):0,y0=Math.round(Math.floor(i/2)*source.height/2),x1=i%2?source.width:Math.round(split),y1=Math.round((Math.floor(i/2)+1)*source.height/2);
  const crop=bounds(pixels.data,source.width,x0,y0,x1,y1),[x,y,w,h]=crop;
  const head=bounds(pixels.data,source.width,x,y,x+w,y+Math.round(h*.16));
  const legs=bounds(pixels.data,source.width,x,y+Math.round(h*.64),x+w,y+h);
  poses.push({crop,headX:head[0]+head[2]/2,legSpan:legs[2]/h});
 }
 // Coverage gate at export prevents semi-transparent generated haze outside
 // silhouettes from becoming rectangular panels; masters are kept unchanged.
 for(let i=3;i<pixels.data.length;i+=4){const a=Math.max(0,Math.min(1,(pixels.data[i]-230)/20));pixels.data[i]=Math.round(255*a*a*(3-2*a));}m.putImageData(pixels,0,0);
 const size=256,paintHeight=208,reference=Math.max(...poses.map(f=>f.crop[3]));
 const sheet=createCanvas(size*4,size*2),c=sheet.getContext('2d'),frames=[],hashes=[];
 for(let i=0;i<4;i++){
  const f=poses[i],[x,y,w,h]=f.crop,u=paintHeight/reference;
  c.drawImage(master,x,y,w,h,i*size+128-(f.headX-x)*u,24,w*u,h*u);
  frames.push({direction:0,pose:i,crop:[i*size,0,size,size],anchor:[128,128]});
  hashes.push(createHash('sha256').update(c.getImageData(i*size,0,size,size).data).digest('hex'));
 }
 frames.push(...frames.map(f=>({...f,direction:2,flipX:true})));
 c.drawImage(old,0,256,1024,256,0,256,1024,256);
 for(const f of art.frames.filter(f=>f.direction===1||f.direction===3)) frames.push({...f,crop:[f.crop[0],256,256,256]});
 const file=`${id}-walk-v7.png`;
 writeFileSync(`public/inhabitants/city-perspective/${file}`,sheet.toBuffer('image/png'));
 const updated={...art,file,size:[sheet.width,sheet.height],referenceHeight:paintHeight,referenceSpan:paintHeight,frames,
  walkRevision:10,walkMethod:'painted-full-body',walkPeriod:id==='city-civilian-2'?.7:id==='city-civilian-3'?1.4:id==='city-3'?1.1:.95};
 live[live.findIndex(a=>a.id===id)]=updated;
 writeFileSync(`${out}/${id}.json`,JSON.stringify(updated,null,2)+'\n');
 audit.push({id,sourceSize:[source.width,source.height],poses,frameHashes:hashes,uniqueFrames:new Set(hashes).size,preservedViews:[1,3],leftView:'mirrored right sequence'});
 console.log(id);
}
writeFileSync('app/city-perspective-art.json',JSON.stringify(live,null,2)+'\n');
writeFileSync(out+'/painted-frame-audit.json',JSON.stringify(audit,null,2)+'\n');
const auditPath='design/city-walk-2026-10-01/painted-frame-audit.json',previous=JSON.parse(fsRead(auditPath));
for(const row of audit) previous[previous.findIndex(a=>a.id===row.id)]=row;
writeFileSync(auditPath,JSON.stringify(previous,null,2)+'\n');
function fsRead(p){return readFileSync(p,'utf8');}
