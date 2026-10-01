// Offline animation only: the game draws one pre-rendered frame per human.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const {createCanvas,loadImage}=createRequire(process.env.VORO_CANVAS_RUNTIME)('@napi-rs/canvas');
const out='design/city-walk-corrections-2026-10-01';
const config=JSON.parse(readFileSync(`${out}/rigs.json`,'utf8'));
const live=JSON.parse(readFileSync('app/city-perspective-art.json','utf8')),audit=[];
function bounds(data,width,x0,y0,x1,y1){
 let l=x1,t=y1,r=x0,b=y0;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(data[(y*width+x)*4+3]>230){l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}
 if(r<=l||b<=t)throw Error('Empty component');return[l,t,r-l,b-t];
}
function legPose(phase,hip,stride){
 phase=((phase%1)+1)%1;
 const stance=phase<.5,u=stance?phase*2:(phase-.5)*2;
 const ankle=[hip[0]+(stance?stride*(1-2*u):-stride*Math.cos(u*Math.PI)),216-(stance?0:Math.sin(u*Math.PI)*18)];
 const dx=ankle[0]-hip[0],dy=ankle[1]-hip[1],d=Math.hypot(dx,dy),L=41.6;
 const bend=Math.sqrt(Math.max(0,L*L-d*d/4));
 const knee=[(hip[0]+ankle[0])/2+dy/d*bend,(hip[1]+ankle[1])/2-dx/d*bend];
 return {hip,knee,ankle,stance};
}
for(const entry of config.records){
 const {id}=entry,art=live.find(a=>a.id===id),im=await loadImage(entry.source);
 const master=createCanvas(im.width,im.height),m=master.getContext('2d');m.drawImage(im,0,0);
 const px=m.getImageData(0,0,im.width,im.height);
 const cuts=[0,.45,.69,1];
 const parts=entry.parts||Array.from({length:3},(_,i)=>bounds(px.data,im.width,Math.round(im.width*cuts[i]),0,Math.round(im.width*cuts[i+1]),im.height));
 for(let i=3;i<px.data.length;i+=4){const a=Math.max(0,Math.min(1,(px.data[i]-230)/20));px.data[i]=Math.round(255*a*a*(3-2*a));}m.putImageData(px,0,0);
 const body=parts[0],thigh=parts[1],shin=parts[2],hip=[128,136];
 const head=bounds(px.data,im.width,body[0],body[1],body[0]+body[2],body[1]+Math.round(body[3]*.16));
 const bodyHip=entry.bodyHip||[head[0]+head[2]/2-body[3]*(entry.hipBack||.045),body[1]+body[3]*(entry.hipHeight||.87)];
 const jointTop=p=>{const b=bounds(px.data,im.width,p[0],p[1],p[0]+p[2],p[1]+Math.round(p[3]*.2));return[b[0]+b[2]/2,p[1]+p[3]*.1];};
 const jointBottom=p=>{const b=bounds(px.data,im.width,p[0],p[1]+Math.round(p[3]*.8),p[0]+p[2],p[1]+p[3]);return[b[0]+b[2]/2,p[1]+p[3]*.9];};
 const thighJoints=entry.thighJoints||[jointTop(thigh),jointBottom(thigh)];
 const top=jointTop(shin),shinJoints=entry.shinJoints||[top,[top[0],shin[1]+shin[3]*.79]];
 const bodyScale=112/(bodyHip[1]-body[1]);
 const sheet=createCanvas(1024,768),c=sheet.getContext('2d'),frames=[],poses=[],hashes=[];
 function segment(part,start,end,axisTop,axisBottom,widthScale=1){
  const len=Math.hypot(end[0]-start[0],end[1]-start[1]),scale=len/Math.hypot(axisBottom[0]-axisTop[0],axisBottom[1]-axisTop[1]);
  c.save();c.translate(...start);c.rotate(Math.atan2(end[1]-start[1],end[0]-start[0])-Math.atan2(axisBottom[1]-axisTop[1],axisBottom[0]-axisTop[0]));
  c.drawImage(master,...part,(part[0]-axisTop[0])*scale*widthScale,(part[1]-axisTop[1])*scale,part[2]*scale*widthScale,part[3]*scale);c.restore();
 }
 function drawLeg(p,far){
  c.save();
  // Source is authored opaque: far leg can safely use a baked darkness filter.
  if(far)c.filter='brightness(0.78)';
  segment(thigh,p.hip,p.knee,thighJoints[0],thighJoints[1],entry.legWidth||1);
  segment(shin,p.knee,p.ankle,shinJoints[0],shinJoints[1],entry.legWidth||1);
  c.restore();
 }
 for(let i=0;i<8;i++){
  const rise=Math.abs(Math.sin(i/8*Math.PI*2))*3,walkingHip=[hip[0],hip[1]-rise];
  const near=legPose(i/8,walkingHip,entry.stride||21),far=legPose(i/8+.5,[walkingHip[0]-4,walkingHip[1]],entry.stride||21);
  const x=i%4*256,y=Math.floor(i/4)*256;
  c.save();c.translate(x,y);
  drawLeg(far,true);drawLeg(near,false);
  const bx=(body[0]-bodyHip[0])*bodyScale+hip[0],by=(body[1]-bodyHip[1])*bodyScale+hip[1]-rise;
  if(entry.cane){
   const [cx,cy,cw,ch]=entry.cane,tx=(cx-bodyHip[0])*bodyScale+hip[0],ty=(cy-bodyHip[1])*bodyScale+hip[1]-rise;
   c.save();c.beginPath();c.rect(0,0,256,256);c.rect(tx,ty,cw*bodyScale,ch*bodyScale+1);c.clip('evenodd');
   c.drawImage(master,...body,bx,by,body[2]*bodyScale,body[3]*bodyScale);c.restore();
   c.drawImage(master,cx,cy,cw,ch,tx,ty,cw*bodyScale,231-ty);
  }else c.drawImage(master,...body,bx,by,body[2]*bodyScale,body[3]*bodyScale);
  c.restore();
  frames.push({direction:0,pose:i,crop:[x,y,256,256],anchor:[128,128]});
  hashes.push(createHash('sha256').update(c.getImageData(x,y,256,256).data).digest('hex'));
  poses.push({near,far});
 }
 frames.push(...frames.map(f=>({...f,direction:2,flipX:true})));
 const old=await loadImage(`public/inhabitants/city-perspective/${id}-walk-v3.webp`);
 c.drawImage(old,0,256,1024,256,0,512,1024,256);
 for(const f of art.frames.filter(f=>f.direction===1||f.direction===3))frames.push({...f,crop:[f.crop[0],512,256,256]});
 const file=`${id}-walk-v5.png`;
 writeFileSync(`public/inhabitants/city-perspective/${file}`,sheet.toBuffer('image/png'));
 const updated={...art,file,size:[1024,768],frames,walkRevision:8};
 live[live.findIndex(a=>a.id===id)]=updated;
 writeFileSync(`design/city-walk-2026-10-01/${id}.json`,JSON.stringify(updated,null,2)+'\n');
 audit.push({id,parts,bodyHip,thighJoints,shinJoints,poses,uniqueFrames:new Set(hashes).size,frameHashes:hashes,preservedViews:[1,3]});
 console.log(id);
}
writeFileSync('app/city-perspective-art.json',JSON.stringify(live,null,2)+'\n');
writeFileSync(`${out}/rig-audit.json`,JSON.stringify(audit,null,2)+'\n');
