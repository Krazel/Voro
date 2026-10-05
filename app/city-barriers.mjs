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
export function drawCityBarriers(c,view,seed,image,layer='all',player=null) {
  for(let cy=Math.floor((view.top-180)/600);cy<=Math.floor((view.bottom+180)/600);cy++)
    for(let cx=Math.floor((view.left-100)/600);cx<=Math.floor((view.right+100)/600);cx++)
      for(const b of cityBarriers(cx,cy,seed)) {
        const x=b.x+(b.vertical?b.w/2:0),y=b.y+(b.vertical?0:b.h/2);
        const dx=b.vertical?0:730,dy=b.vertical?730:0;
        const foreground=player&&(b.vertical?player.x<x:player.y<y);
        if(layer==='behind'&&foreground||layer==='front'&&!foreground)continue;
        c.save();
        if(layer==='shadow'||layer==='all'){
          c.fillStyle='#07101240';c.beginPath();c.moveTo(x-6,y);c.lineTo(x+dx+6,y+dy);
          c.lineTo(x+dx+40,y+dy+48);c.lineTo(x+34,y+48);c.closePath();c.fill();
          c.fillStyle='#11191b60';c.fillRect(b.x-2,b.y-2,b.w+4,b.h+4);
        }
        if(layer!=='shadow'&&image?.complete&&image.naturalWidth>0&&image.naturalHeight>0){
          const w=image.naturalWidth,h=image.naturalHeight,ux=-22,uy=-112;
          // Height always projects toward the back of the world. Rotating a
          // flat sprite 90 degrees would put its posts sideways on the road.
          for(let i=0;i<4;i++){
            const bx=x+dx*i/4,by=y+dy*i/4;
            c.save();c.transform(dx/4/w,dy/4/w,-ux/h,-uy/h,bx+ux,by+uy);
            c.drawImage(image,0,0,w,h);c.restore();
          }
          // Thin concrete cap and footing share the same projected elevation.
          c.strokeStyle='#89928c';c.lineWidth=2;c.beginPath();c.moveTo(x-22,y-99);c.lineTo(x+dx-22,y+dy-99);c.stroke();
        }
        c.restore();
      }
}
