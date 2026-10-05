import {random} from './simulation.mjs';
let plumeBrush=null;
function fireBrush(){
  if(plumeBrush)return plumeBrush;
  if(typeof document==='undefined'||!document.createElement)return null;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=32;
  const c=canvas.getContext('2d');if(!c)return null;
  const g=c.createRadialGradient(16,16,0,16,16,16);
  g.addColorStop(0,'#fff4ca');g.addColorStop(.2,'#ffd087');g.addColorStop(.55,'#fb802d66');g.addColorStop(1,'#e8451400');
  c.fillStyle=g;c.fillRect(0,0,32,32);plumeBrush=canvas;return canvas;
}
export class PlanetMeteors {
  constructor(seed){
    this.rng=random(seed^0x4d37e0);this.timing=random(seed^0x71ae23);
    this.clock=2+this.timing()*3;this.closeFollowup=false;
  }
  nextArrival(){
    // Irregular encounters: occasional close pairs, ordinary gaps and quiet spells.
    // Never chain close pairs into a sustained barrage or queue missed arrivals.
    if(!this.closeFollowup&&this.timing()<.35){
      this.closeFollowup=true;return .65+this.timing()*.85;
    }
    this.closeFollowup=false;
    return this.timing()<.25?8+this.timing()*6:2+this.timing()*3;
  }
  update(dt,p,view,shots){
    this.clock-=dt;if(this.clock>0)return;
    const rng=this.rng;this.clock=this.nextArrival();
    if(shots.filter(s=>s.meteor&&s.life>0).length>=6)return;
    const cx=(view.left+view.right)/2,cy=(view.top+view.bottom)/2;
    const hw=(view.right-view.left)/2,hh=(view.bottom-view.top)/2;
    const a=rng()*Math.PI*2,dx=Math.cos(a),dy=Math.sin(a);
    const edge=Math.min(hw/Math.max(.001,Math.abs(dx)),hh/Math.max(.001,Math.abs(dy)));
    // Size and speed vary independently: a large rock need not be a fast one.
    const size=rng(),r=size<.4?10+rng()*8:size<.8?20+rng()*10:34+rng()*14;
    const x=cx+dx*(edge+r+90),y=cy+dy*(edge+r+90);
    const aimed=rng()<.30;
    // Aim once, before the warning. No homing or readjustment after launch.
    // Passing rocks use an off-centre chord, rather than all crossing the player.
    const offset=aimed?0:(rng()<.5?-1:1)*Math.min(hw,hh)*(.45+rng()*.35);
    const tx=aimed?p.x:cx-dy*offset;
    const ty=aimed?p.y:cy+dx*offset;
    const length=Math.max(1,Math.hypot(tx-x,ty-y));
    // Slower, mixed speeds; preserve screen cadence across automatic camera zoom.
    const pace=rng(),crossing=pace<.3?6+rng()*1.5:pace<.8?4+rng()*1.5:2.8+rng()*.8;
    const speed=2*Math.hypot(hw,hh)/crossing;
    const shot={meteor:true,aimed,x,y,r,vx:(tx-x)/length*speed,vy:(ty-y)/length*speed,
      warning:1.1,life:crossing+5,damage:.08/.60,edibleAt:Infinity,seed:rng()*6.28,plasma:false};
    const entry=meteorEntry(shot,view);
    if(entry){
      // The rock is already moving while warned, arriving at the real entry point
      // after the lead time. It never waits invisibly after its arrow disappears.
      const lead=shot.warning+r/speed;
      shot.x=entry.x-shot.vx*lead;shot.y=entry.y-shot.vy*lead;
    }
    shots.push(shot);
  }
}
// Intersection of the actual trajectory with the CURRENT viewport. Recompute
// after camera motion; an old radial spawn marker need not lie on that path.
export function meteorEntry(b,view){
  if(!view)return null;
  if(b.x>=view.left&&b.x<=view.right&&b.y>=view.top&&b.y<=view.bottom)return null;
  let enter=0,exit=Infinity;
  for(const [position,velocity,min,max]of [[b.x,b.vx,view.left,view.right],[b.y,b.vy,view.top,view.bottom]]){
    if(Math.abs(velocity)<1e-9){if(position<min||position>max)return null;continue;}
    const a=(min-position)/velocity,z=(max-position)/velocity;
    enter=Math.max(enter,Math.min(a,z));exit=Math.min(exit,Math.max(a,z));
  }
  if(exit<enter||enter>b.life)return null;
  return{x:b.x+b.vx*enter,y:b.y+b.vy*enter,seconds:enter};
}
export function sweptShotHit(shot,x,y,p) {
  const dx=shot.x-x,dy=shot.y-y,l=dx*dx+dy*dy;
  const t=l?Math.max(0,Math.min(1,((p.x-x)*dx+(p.y-y)*dy)/l)):0;
  return Math.hypot(p.x-x-dx*t,p.y-y-dy*t)<p.radius*.88+shot.r;
}
export function drawMeteor(c,b,time,drawRock,view) {
  c.save();
  const entry=meteorEntry(b,view);
  if(entry){
    c.save();
    const pad=18/(view.zoom||1);
    c.translate(Math.max(view.left+pad,Math.min(view.right-pad,entry.x)),Math.max(view.top+pad,Math.min(view.bottom-pad,entry.y)));
    c.rotate(Math.atan2(b.vy,b.vx));c.scale(1/(view.zoom||1),1/(view.zoom||1));
    c.strokeStyle='#ffb878';c.lineWidth=3;c.globalAlpha=.65+.3*Math.sin(time*9);
    c.beginPath();c.moveTo(-12,-12);c.lineTo(3,0);c.lineTo(-12,12);c.stroke();
    c.restore();
  }
  c.translate(b.x,b.y);c.rotate(Math.atan2(b.vy,b.vx));
  const tail=Math.max(b.r*5,Math.hypot(b.vx,b.vy)*.19);
  const alpha=c.globalAlpha,brush=fireBrush();
  // A single cached 32px soft brush, reused along the flowing plume. No live
  // blur filters, sharp ribbon edges or new offscreen buffers per frame.
  if(brush)for(let i=13;i>=0;i--){
    const u=i/14,flow=time*18+b.seed+i*1.9,r=b.r*(.22+(1-u)*.65);
    const y=Math.sin(flow)*b.r*.12*(.3+u);
    c.globalAlpha=alpha*(1-u)**1.3*.68;
    c.drawImage(brush,-tail*u-r*2,y-r,r*4,r*2);
  }
  c.lineCap='round';c.strokeStyle='#ffc480';c.lineWidth=Math.max(1,b.r*.045);
  for(let i=0;i<7;i++){
    const u=(time*2.8+i/7+b.seed)%1,x=-tail*u,y=Math.sin(i*17+b.seed)*b.r*(.3+u*.6);
    c.globalAlpha=alpha*(1-u)**2*.7;c.beginPath();c.moveTo(x,y);c.lineTo(x-tail*.045,y);c.stroke();
  }c.globalAlpha=alpha;
  const glow=c.createRadialGradient(0,0,b.r*.65,0,0,b.r*1.45);glow.addColorStop(0,'#ffc27dcc');glow.addColorStop(.65,'#f36d3355');glow.addColorStop(1,'#f36d3300');
  c.fillStyle=glow;c.beginPath();c.arc(0,0,b.r*1.45,0,Math.PI*2);c.fill();
  c.save();c.rotate(time*.9+b.seed);drawRock(c,b);c.restore();c.restore();
}
