// Fixed, open-ended roadworks. Recomputed from block coordinates, never stored
// as an ever-growing world list. They occupy streets, not building parcels.
export function cityBarriers(cx,cy,seed) {
  const h=(Math.imul(cx,73856093)^Math.imul(cy,19349663)^seed)>>>0;
  if((cx+2*cy+seed)%3!==0 || (cx===1&&cy===1))return [];
  const vertical=!!(h&8);
  // Cross both perimeter avenues as well as the inner street. A fence only
  // inside a block would leave every main avenue as an endless straight path.
  return [{x:cx*600+(vertical?291:-65),y:cy*600+(vertical?-65:291),
    w:vertical?18:730,h:vertical?730:18,vertical}];
}
export function nearbyCityBarriers(x,y,seed,range=1) {
  const out=[],cx=Math.floor(x/600),cy=Math.floor(y/600);
  for(let j=cy-range;j<=cy+range;j++)for(let i=cx-range;i<=cx+range;i++)out.push(...cityBarriers(i,j,seed));
  return out;
}
export function constrainCityBarriers(p,previous,seed) {
  // The soft perimeter can overlap the fence visually, but the body cannot
  // cross it. Capping the core avoids trapping a fully grown creature in roads.
  const r=Math.min(60,Math.max(8,(p.radius??p.r)*.45));
  for(const b of nearbyCityBarriers(p.x,p.y,seed)) {
    const lo=b.vertical?b.x-r:b.y-r,hi=lo+(b.vertical?b.w:b.h)+2*r;
    const along=b.vertical?p.y:p.x;
    if(along<(b.vertical?b.y:b.x)-r||along>(b.vertical?b.y+b.h:b.x+b.w)+r)continue;
    const before=b.vertical?previous.x:previous.y,now=b.vertical?p.x:p.y;
    // Swept crossing also catches a boost that traverses the entire fence.
    if((now>lo&&now<hi)||(before<=lo&&now>=hi)||(before>=hi&&now<=lo)) {
      const side=before<=lo?lo:before>=hi?hi:now<(lo+hi)/2?lo:hi;
      if(b.vertical){p.x=side;p.vx=0;p.knockX=0;}else{p.y=side;p.vy=0;p.knockY=0;}
    }
  }
}
export function drawCityBarriers(c,view,seed) {
  for(let cy=Math.floor((view.top-65)/600);cy<=Math.floor((view.bottom+65)/600);cy++)
    for(let cx=Math.floor((view.left-65)/600);cx<=Math.floor((view.right+65)/600);cx++)
      for(const b of cityBarriers(cx,cy,seed)) {
        c.save();c.translate(b.x+b.w/2,b.y+b.h/2);if(b.vertical)c.rotate(Math.PI/2);
        c.fillStyle='#0008';c.fillRect(-369,3,738,17);
        c.fillStyle='#5e6462';c.fillRect(-365,-9,730,18);
        c.strokeStyle='#a7aba1';c.lineWidth=2;c.strokeRect(-365,-9,730,18);
        // Concrete base, warning stripes and wire loops: recognizable from
        // above, no opaque image rectangle or animated bitmap allocation.
        for(let x=-358;x<350;x+=26){
          c.fillStyle='#d4a955';c.fillRect(x,-7,12,14);
          c.strokeStyle='#bac6c2';c.lineWidth=1;c.beginPath();c.ellipse(x+6,-9,11,6,0,0,Math.PI*2);c.stroke();
          c.beginPath();c.moveTo(x+3,-17);c.lineTo(x+9,-9);c.moveTo(x+9,-17);c.lineTo(x+3,-9);c.stroke();
        }
        c.restore();
      }
}
