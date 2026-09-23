export const FINALE_SECONDS = 31;
export const FINALE_BLACK_AT = 13;
export const FINALE_MUSIC_FADE_AT = 10;
export const FINALE_REVEAL_AT = 18;
const smooth = (a,b,x) => { const t = Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
export function finaleState(remaining) {
  const elapsed = Math.max(0, FINALE_SECONDS - remaining);
  const u = Math.max(0,Math.min(1,elapsed/FINALE_BLACK_AT));
  return { elapsed, u, growth: 1+.22*smooth(0,9,elapsed),
    contraction: 1-.985*smooth(.5,10.8,elapsed),
    sceneLight: 1-smooth(7,10.8,elapsed), darkness: smooth(.4,11,elapsed),
    bodyLight: 1-smooth(10,12.1,elapsed),
    black: elapsed>=FINALE_BLACK_AT, survivor: smooth(FINALE_REVEAL_AT,30.5,elapsed),
    caption: elapsed<4 ? 'Ya no hay nada más grande que tú.' : elapsed<8.5 ? 'El universo entra en ti.' : elapsed<12.2 ? 'La última luz.' : '' };
}
// Deterministic, bounded paths for the universe being swallowed.
export function fallingLight(index, elapsed, width, height, reduced = false) {
  const end = 5.5+(index%9)*.57;
  const start = .4+(index%7)*.24;
  const progress=smooth(start,end,elapsed),distance=1-progress;
  const angle=index*2.3999632297;
  const turn=reduced ? 0 : .38*progress;
  const reach=.26+((index*37)%71)/100;
  return {x:width/2+Math.cos(angle+turn)*width*.62*reach*distance,
    y:height*.48+Math.sin(angle+turn)*height*.59*reach*distance,
    light:smooth(0,2,elapsed)*(1-smooth(end-.7,end,elapsed)),
    radius:1.1+(index%3)*.6,done:elapsed>=end};
}
export function dyingCore(elapsed) {
  const collapse=1-smooth(11.9,FINALE_BLACK_AT,elapsed);
  return {radius:6*collapse, light:smooth(10.4,11.8,elapsed)*(1-smooth(12.3,FINALE_BLACK_AT,elapsed))};
}
export function drawVoidSurvivor(c, width, height, time, reduced, drawProtagonist, reveal = 1) {
  if (reveal <= 0) return;
  const pulse = reduced ? 0 : Math.sin(time * .8);
  const x=width/2,y=height*.48,r=Math.min(width*.2,height*.16);
  c.save();
  const glow=c.createRadialGradient(x,y,0,x,y,r);
  glow.addColorStop(0,`rgba(112,189,200,${(.035+.006*pulse)*reveal})`);
  glow.addColorStop(1,'transparent');
  c.fillStyle=glow;c.fillRect(x-r,y-r,r*2,r*2);
  c.globalAlpha=(.72+.035*pulse)*smooth(0,.3,reveal);
  const nucleus=drawProtagonist(1+.012*pulse,true);
  if(reveal<1) {
    // The world is already pure black: a bounded black feather gives every
    // layer (membrane, glow, flagella and nucleus) the same outward reveal.
    // No offscreen texture, full-screen filter or per-frame image allocation.
    const body=Math.min(66,height*.1),span=Math.max(r,body*3.6);
    const front=body*(.13+3.4*Math.pow(reveal,4));
    const feather=body*(.16+.24*reveal);
    const nx=nucleus?.x??x,ny=nucleus?.y??y;
    const mask=c.createRadialGradient(nx,ny,Math.max(0,front-feather),nx,ny,front);
    mask.addColorStop(0,'rgba(0,0,0,0)');mask.addColorStop(1,'#000');
    c.globalAlpha=1;c.fillStyle=mask;c.fillRect(x-span,y-span,span*2,span*2);
  }
  c.restore();
}
// One captured scene and a bounded set of paths. No blur, new textures or
// per-frame canvas allocations, including on older iPhones.
export class UniverseFinale {
  /** @param {HTMLCanvasElement|null} frame */
  constructor(frame = null) { this.frame=frame; }
  destroy() { if(this.frame) this.frame.width=this.frame.height=1; this.frame=null; }
  draw(c, width, height, remaining, reduced, drawProtagonist, time = 0) {
    const s=finaleState(remaining), x=width/2, y=height*.48;
    c.fillStyle='#000'; c.fillRect(0,0,width,height);
    if(s.black) { drawVoidSurvivor(c,width,height,time,reduced,drawProtagonist,s.survivor); return; }
    if(this.frame) {
      c.save();c.translate(x,y);
      if(!reduced)c.rotate(-.035*smooth(1,10,s.elapsed));
      c.scale(s.contraction,s.contraction);c.globalAlpha=s.sceneLight;
      c.drawImage(this.frame,-x,-y,width,height);c.restore();
    }
    // A feathered boundary removes the rectangle of the captured scene as it
    // contracts. Its contents visibly converge under the living membrane.
    const rx=width*.5*s.contraction,ry=height*.52*s.contraction;
    const edge=1.55-.6*smooth(0,3,s.elapsed);
    c.save();c.translate(x,y);c.scale(rx,ry);
    const shadow=c.createRadialGradient(0,0,Math.max(0,edge-.4),0,0,edge);
    shadow.addColorStop(0,'rgba(0,0,0,0)');shadow.addColorStop(1,'#000');
    c.fillStyle=shadow;c.fillRect(-x/rx,-y/ry,width/rx,height/ry);c.restore();
    const count=reduced?16:48;
    c.save();
    for(let i=0;i<count;i++){
      const p=fallingLight(i,s.elapsed,width,height,reduced);
      if(p.done||p.light<=0)continue;
      const tail=fallingLight(i,Math.max(0,s.elapsed-.35),width,height,reduced);
      c.globalAlpha=p.light*.46;c.strokeStyle=i%3?'#acdce8':'#e8cfa1';c.lineWidth=.8;
      c.beginPath();c.moveTo(tail.x,tail.y);c.lineTo(p.x,p.y);c.stroke();
      c.globalAlpha=p.light*.85;c.fillStyle=i%3?'#c8e8f1':'#ffe9b5';
      c.beginPath();c.arc(p.x,p.y,p.radius,0,Math.PI*2);c.fill();
    }
    c.globalAlpha=s.bodyLight;const nucleus=drawProtagonist(s.growth,false);
    // The cell's own nucleus is the last light. It stays in place and contracts
    // to nothing after the membrane fades; no separate star enters the scene.
    const core=dyingCore(s.elapsed),nx=nucleus?.x??x,ny=nucleus?.y??y;
    if(core.light>0&&core.radius>0){
      c.globalAlpha=core.light;
      const glow=c.createRadialGradient(nx,ny,0,nx,ny,core.radius*6);
      glow.addColorStop(0,'#fff4cf');glow.addColorStop(.14,'#ffd68b');glow.addColorStop(1,'#e39a3700');
      c.fillStyle=glow;c.fillRect(nx-core.radius*6,ny-core.radius*6,core.radius*12,core.radius*12);
      c.fillStyle='#fff7df';c.beginPath();c.arc(nx,ny,core.radius,0,Math.PI*2);c.fill();
    }
    c.restore();
  }
}
