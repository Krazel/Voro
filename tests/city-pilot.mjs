// Test pilot navigation only. The shipped game has no automatic player steering.
// The old pilot aimed straight through walls indefinitely; use visible corners
// to walk around the new fences without teleportation or collision exemptions.
import {nearbyCityBarriers} from '../app/city-barriers.mjs';
const routes=new WeakMap();
function crosses(a,b,r){
 let lo=0,hi=1;
 for(const [axis,min,max] of [['x',r.x,r.x+r.w],['y',r.y,r.y+r.h]]){
  const d=b[axis]-a[axis];
  if(Math.abs(d)<1e-9){if(a[axis]<=min||a[axis]>=max)return false;continue;}
  let t0=(min-a[axis])/d,t1=(max-a[axis])/d;if(t0>t1)[t0,t1]=[t1,t0];
  lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>=hi)return false;
 }return hi>0&&lo<1;
}
export function cityWaypoint(p,target,seed){
 const old=routes.get(p);
 if(old?.target===target&&old.seed===seed&&Math.hypot(p.x-old.x,p.y-old.y)<20&&Math.hypot(p.x-old.next.x,p.y-old.next.y)>24)return old.next;
 const pad=Math.min(60,Math.max(8,p.radius*.45))+8;
 const range=Math.min(4,Math.ceil(Math.hypot(target.x-p.x,target.y-p.y)/600)+1);
 const rects=nearbyCityBarriers(p.x,p.y,seed,range).map(b=>({x:b.x-pad,y:b.y-pad,w:b.w+pad*2,h:b.h+pad*2}));
 for(const r of rects)if(p.x>r.x&&p.x<r.x+r.w&&p.y>r.y&&p.y<r.y+r.h){
  return [{x:r.x-2,y:p.y},{x:r.x+r.w+2,y:p.y},{x:p.x,y:r.y-2},{x:p.x,y:r.y+r.h+2}].sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
 }
 const clear=(a,b)=>!rects.some(r=>crosses(a,b,r));
 if(clear(p,target))return target;
 const corners=rects.flatMap(r=>[{x:r.x-1,y:r.y-1},{x:r.x+r.w+1,y:r.y-1},{x:r.x-1,y:r.y+r.h+1},{x:r.x+r.w+1,y:r.y+r.h+1}]);
 const nodes=[p,target,...corners.filter(c=>!rects.some(r=>c.x>r.x&&c.x<r.x+r.w&&c.y>r.y&&c.y<r.y+r.h))];
 const dist=nodes.map(()=>Infinity),prev=[],done=new Set();dist[0]=0;
 for(let k=0;k<nodes.length;k++){
  let at=-1;for(let i=0;i<nodes.length;i++)if(!done.has(i)&&(at<0||dist[i]<dist[at]))at=i;
  if(at<0||!Number.isFinite(dist[at]))break;if(at===1)break;done.add(at);
  for(let j=1;j<nodes.length;j++)if(!done.has(j)&&clear(nodes[at],nodes[j])){
   const d=dist[at]+Math.hypot(nodes[j].x-nodes[at].x,nodes[j].y-nodes[at].y);
   if(d<dist[j]){dist[j]=d;prev[j]=at;}
  }
 }
 if(!Number.isFinite(dist[1]))return target;
 let n=1;while(prev[n]!==0&&prev[n]!==undefined)n=prev[n];
 routes.set(p,{target,seed,x:p.x,y:p.y,next:nodes[n]});return nodes[n];
}
