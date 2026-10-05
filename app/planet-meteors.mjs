import {random} from './simulation.mjs';
export class PlanetMeteors {
  constructor(seed){this.rng=random(seed^0x4d37e0);this.clock=5;}
  update(dt,p,view,shots){
    this.clock-=dt;if(this.clock>0)return;
    const rng=this.rng;this.clock=4.5+rng()*3;
    if(shots.filter(s=>s.meteor&&s.life>0).length>=4)return;
    const cx=(view.left+view.right)/2,cy=(view.top+view.bottom)/2;
    const hw=(view.right-view.left)/2,hh=(view.bottom-view.top)/2;
    const a=rng()*Math.PI*2,dx=Math.cos(a),dy=Math.sin(a);
    const edge=Math.min(hw/Math.max(.001,Math.abs(dx)),hh/Math.max(.001,Math.abs(dy)));
    const r=12+rng()*26,x=cx+dx*(edge+r+90),y=cy+dy*(edge+r+90);
    const aimed=rng()<.55;
    // Aim once, before the warning. No homing or readjustment after launch.
    const tx=aimed?p.x+p.vx*.35:cx+(rng()-.5)*hw*1.4;
    const ty=aimed?p.y+p.vy*.35:cy+(rng()-.5)*hh*1.4;
    const length=Math.max(1,Math.hypot(tx-x,ty-y));
    const speed=Math.min(850,Math.max(360,Math.min(hw,hh)*1.35))*(.85+rng()*.3);
    shots.push({meteor:true,x,y,r,vx:(tx-x)/length*speed,vy:(ty-y)/length*speed,
      entryX:cx+dx*(edge-25),entryY:cy+dy*(edge-25),warning:1.1,
      life:Math.min(18,2*Math.hypot(hw,hh)/speed+4),damage:.08/.60,edibleAt:Infinity,seed:rng()*6.28,plasma:false});
  }
}
export function sweptShotHit(shot,x,y,p) {
  const dx=shot.x-x,dy=shot.y-y,l=dx*dx+dy*dy;
  const t=l?Math.max(0,Math.min(1,((p.x-x)*dx+(p.y-y)*dy)/l)):0;
  return Math.hypot(p.x-x-dx*t,p.y-y-dy*t)<p.radius*.88+shot.r;
}
export function drawMeteor(c,b,time,drawRock) {
  c.save();
  if(b.warning>0){
    c.translate(b.entryX,b.entryY);c.rotate(Math.atan2(b.vy,b.vx));
    c.strokeStyle='#ffb878';c.lineWidth=3;c.globalAlpha=.65+.3*Math.sin(time*9);
    c.beginPath();c.moveTo(-12,-12);c.lineTo(3,0);c.lineTo(-12,12);c.stroke();
    c.restore();return;
  }
  c.translate(b.x,b.y);c.rotate(Math.atan2(b.vy,b.vx));
  const tail=Math.max(65,b.r*4);
  const g=c.createLinearGradient(-tail,0,b.r,0);g.addColorStop(0,'#ef511000');g.addColorStop(.65,'#ef541980');g.addColorStop(1,'#ffcf8b');
  c.fillStyle=g;c.beginPath();c.moveTo(-tail,0);c.quadraticCurveTo(-b.r,b.r*-.35,0,-b.r*1.15);c.quadraticCurveTo(b.r*1.8,0,0,b.r*1.15);c.quadraticCurveTo(-b.r,b.r*.35,-tail,0);c.fill();
  const glow=c.createRadialGradient(0,0,b.r*.65,0,0,b.r*1.45);glow.addColorStop(0,'#ffc27dcc');glow.addColorStop(.65,'#f36d3355');glow.addColorStop(1,'#f36d3300');
  c.fillStyle=glow;c.beginPath();c.arc(0,0,b.r*1.45,0,Math.PI*2);c.fill();
  drawRock(c,b);c.restore();
}
