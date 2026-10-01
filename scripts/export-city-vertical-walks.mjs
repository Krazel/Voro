// Whole painted poses. Approved directions are copied as decoded pixels, untouched.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const {createCanvas,loadImage}=createRequire(process.env.VORO_CANVAS_RUNTIME)('@napi-rs/canvas');
const dir='design/city-vertical-2026-10-01',dest='public/inhabitants/city-perspective/';
const before=JSON.parse(readFileSync(dir+'/before-art.json','utf8'));
const live=JSON.parse(readFileSync('app/city-perspective-art.json','utf8'));
// Select two genuinely opposite contacts; discarded near-duplicate poses do not
// enter the game. This retains the approved two-contact playback cadence.
const selections=[
 ['city-0',3,'city-0-3',0,2],
 ['city-1',1,'city-1-1-fix',0,2],
 ['city-2',1,'city-2-1',0,2],
 ['city-2',3,'city-2-3',1,3],
 ['city-3',1,'city-3-1',0,1,2],
 ['city-3',3,'city-3-3-pair',0,1,2],
 ['city-civilian-0',1,'city-civilian-0-1-fix',0,2],
 ['city-civilian-0',3,'city-civilian-0-3',1,3],
 ['city-civilian-3',3,'city-civilian-3-3',0,2],
 ['city-civilian-4',1,'city-civilian-4-1-fix',0,2],
 ['city-civilian-4',3,'city-civilian-4-3',0,1,2],
];
function bounds(data,w,x0,y0,x1,y1){
 let l=x1,r=x0,t=y1,b=y0;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(data[(y*w+x)*4+3]>230){l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}
 if(r<=l||b<=t)throw Error('Empty frame');return {l,r,t,b};
}
async function pose(file,index,count){
 const im=await loadImage(dir+'/'+file+'.png'),c=createCanvas(im.width,im.height),ctx=c.getContext('2d');ctx.drawImage(im,0,0);
 const pixels=ctx.getImageData(0,0,c.width,c.height),cols=count===1?1:2,rows=count===4?2:1;
 const x0=Math.floor(index%cols*c.width/cols),x1=Math.floor((index%cols+1)*c.width/cols),y0=Math.floor(Math.floor(index/cols)*c.height/rows),y1=Math.floor((Math.floor(index/cols)+1)*c.height/rows);
 const b=bounds(pixels.data,c.width,x0,y0,x1,y1);
 // Same alpha coverage cleanup as the approved painted lateral export.
 for(let i=3;i<pixels.data.length;i+=4){const a=Math.max(0,Math.min(1,(pixels.data[i]-230)/20));pixels.data[i]=Math.round(255*a*a*(3-2*a));}
 ctx.putImageData(pixels,0,0);
 const crown=bounds(pixels.data,c.width,b.l,b.t,b.r,b.t+Math.max(1,Math.round((b.b-b.t)*.08)));
 const head=(crown.l+crown.r)/2,u=208/(b.b-b.t),frame=createCanvas(256,256),f=frame.getContext('2d');
 f.drawImage(c,b.l,b.t,b.r-b.l,b.b-b.t,128-(head-b.l)*u,24,(b.r-b.l)*u,208);
 const px=f.getImageData(0,0,256,256),fb=bounds(px.data,256,0,0,256,256),fc=bounds(px.data,256,fb.l,fb.t,fb.r,fb.t+Math.max(1,Math.round((fb.b-fb.t)*.08)));
 const crownX=(fc.l+fc.r)/2,scale=208/(fb.b-fb.t);
 return {pixels:px,anchor:[crownX,(fb.t+fb.b)/2],registration:{scale,crownX,top:fb.t,ground:fb.b},source:{file,index,count,bounds:b}};
}
const audit=[];
for(const id of new Set(selections.map(s=>s[0]))){
 const a=structuredClone(before.find(a=>a.id===id)),im=await loadImage(dest+a.file),c=createCanvas(...a.size),ctx=c.getContext('2d');ctx.drawImage(im,0,0);
 for(const [,direction,file,first,second,count=4] of selections.filter(s=>s[0]===id)){
  const poses=[await pose(file,first,count),typeof second==='string'?await pose(second,0,1):await pose(file,second,count)];
  for(let p=0;p<2;p++){
   const f=a.frames.find(f=>f.direction===direction&&f.pose===p),data=poses[p];
   ctx.putImageData(data.pixels,f.crop[0],f.crop[1]);f.anchor=data.anchor;f.registration=data.registration;
   audit.push({id,direction,pose:p,source:data.source,registration:data.registration,hash:createHash('sha256').update(data.pixels.data).digest('hex')});
  }
 }
 a.file=id+'-vertical-v1.png';a.verticalRevision=1;
 writeFileSync(dest+a.file,c.toBuffer('image/png'));live[live.findIndex(row=>row.id===id)]=a;
}
writeFileSync('app/city-perspective-art.json',JSON.stringify(live,null,2)+'\n');
writeFileSync(dir+'/export-audit.json',JSON.stringify(audit,null,2)+'\n');
console.log('Exported',audit.length,'painted poses; retained all approved directions and atlas dimensions.');
