// Measure existing painted pixels; store registration only, never repaint poses.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
const {createCanvas,loadImage}=createRequire(process.env.VORO_CANVAS_RUNTIME)('@napi-rs/canvas');
const path='app/city-perspective-art.json',art=JSON.parse(readFileSync(path,'utf8')),audit=[];
function bounds(data,w,h,y0=0,y1=h){
 let l=w,r=0,t=h,b=0;
 for(let y=y0;y<y1;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>230){l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}
 if(r<=l||b<=t)throw Error('Empty silhouette');return {l,r,t,b};
}
for(const a of art.filter(a=>a.kind==='human')){
 const im=await loadImage('public/inhabitants/city-perspective/'+a.file),rows=[];
 for(const f of a.frames){
  const [x,y,w,h]=f.crop,c=createCanvas(w,h),ctx=c.getContext('2d');ctx.drawImage(im,x,y,w,h,0,0,w,h);
  const data=ctx.getImageData(0,0,w,h).data,b=bounds(data,w,h);
  // Only the crown/helmet: bags, shields and shoulders must not move the root.
  const crown=bounds(data,w,h,b.t,b.t+Math.max(1,Math.round((b.b-b.t)*.08)));
  const crownX=(crown.l+crown.r)/2,scale=a.referenceHeight/(b.b-b.t);
  const anchor=[crownX,b.b-(a.referenceHeight/2)/scale];
  rows.push({direction:f.direction,pose:f.pose,flipX:!!f.flipX,sourceBounds:b,crownX,scale,
   before:f.registration?null:{headX:(crownX-f.anchor[0])*(f.flipX?-1:1),groundY:b.b-f.anchor[1]},
   after:{headX:0,groundY:a.referenceHeight/2,headY:-a.referenceHeight/2}});
  f.anchor=anchor;f.registration={scale,crownX,top:b.t,ground:b.b};
 }
 a.registrationRevision=1;
 audit.push({id:a.id,file:a.file,frames:rows});
}
writeFileSync(path,JSON.stringify(art,null,2)+'\n');
writeFileSync('design/city-walk-registration-2026-10-01/audit.json',JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify(audit.map(a=>({id:a.id,frames:a.frames.length,maxBeforeFloorDrift:Math.max(...a.frames.map(f=>f.before?.groundY??0))-Math.min(...a.frames.map(f=>f.before?.groundY??0)),scaleRange:[Math.min(...a.frames.map(f=>f.scale)),Math.max(...a.frames.map(f=>f.scale))]}))));
