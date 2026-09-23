export const FINALE_SECONDS = 24;
const smooth = (a,b,x) => { const t = Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
export function finaleState(remaining) {
  // Darkness closes from the outer universe to its centre, without shrinking it.
  const elapsed = Math.max(0, FINALE_SECONDS - remaining);
  const u = Math.max(0,Math.min(1,elapsed/12));
  return { u, growth: 1, darkness: smooth(.03,.8,u),
    black: elapsed>=9.6, survivor: smooth(10.5,23,elapsed), caption: u<.3 ? 'Ya no hay nada más grande que tú.' : u<.55 ? 'Todo se apaga.' : u<.7 ? 'La última luz.' : '' };
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
      c.drawImage(this.frame,0,0,width,height);
    }
    const span=Math.hypot(width/2,Math.max(y,height-y)), edge=span*(1-s.darkness);
    const feather=span*.23;
    const shadow=c.createRadialGradient(x,y,Math.max(0,edge-feather),x,y,Math.max(.01,edge));
    shadow.addColorStop(0,'rgba(0,0,0,0)');shadow.addColorStop(1,'#000');
    c.fillStyle=shadow;c.fillRect(0,0,width,height);
  }
}
