export const FINALE_SECONDS = 12;
const smooth = (a,b,x) => { const t = Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
export function finaleState(remaining) {
  const u = Math.max(0,Math.min(1,1-remaining/FINALE_SECONDS));
  return { u, growth: 1+11*smooth(0,.55,u), darkness: smooth(.55,.8,u),
    black: u>=.8, survivor: smooth(.84,1,u), caption: u<.3 ? 'Ya no hay nada más grande que tú.' : u<.55 ? 'Todo el universo vuelve a ti.' : u<.7 ? 'La última luz.' : '' };
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
  c.globalAlpha=(.48+.035*pulse)*reveal;
  drawProtagonist(1+.012*pulse,true);
  c.restore();
}
// One captured scene and a bounded set of paths. No blur, new textures or
// per-frame canvas allocations, including on older iPhones.
export class UniverseFinale {
  /** @param {HTMLCanvasElement|null} frame */
  constructor(frame = null) { this.frame=frame; }
  destroy() { if(this.frame) this.frame.width=this.frame.height=1; this.frame=null; }
  draw(c, width, height, remaining, reduced, drawProtagonist, time = 0) {
    const s=finaleState(remaining), {u}=s, x=width/2, y=height*.48;
    c.fillStyle='#000'; c.fillRect(0,0,width,height);
    if(s.black) { drawVoidSurvivor(c,width,height,time,reduced,drawProtagonist,s.survivor); return; }
    if(this.frame) {
      const collapse=smooth(.06,.68,u), z=Math.max(.001,1-collapse);
      c.save(); c.globalAlpha=1-smooth(.65,.7,u);
      c.translate(x,y); c.rotate(reduced?0:collapse*.22);
      c.drawImage(this.frame,-x*z,-y*z,width*z,height*z); c.restore();
    }
    c.save(); c.globalAlpha=1-smooth(.54,.77,u);
    drawProtagonist(reduced ? 1+2*smooth(0,.55,u) : s.growth);
    c.restore();
    const collapse=smooth(.12,.72,u), span=Math.hypot(width,height)*.7;
    c.save();
    for(let i=0;i<(reduced?24:88);i++) {
      const a=i*2.399963 + (reduced?0:collapse*(.6+(i%5)*.19));
      const r=(.2+((i*37)%97)/97)*span*(1-collapse);
      const tail=reduced?2:3+48*Math.sin(collapse*Math.PI);
      c.strokeStyle=i%4===0?'#eacb95':'#a8d2e5';
      c.globalAlpha=(.22+(i%4)*.12)*Math.sin(Math.min(1,u/.1)*Math.PI/2)*(1-smooth(.58,.76,u));
      c.lineWidth=i%5===0?1.5:.7; c.beginPath();
      c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);
      c.quadraticCurveTo(x+Math.cos(a+.04)*(r+tail*.5),y+Math.sin(a+.04)*(r+tail*.5),
        x+Math.cos(a+.09)*(r+tail),y+Math.sin(a+.09)*(r+tail)); c.stroke();
    }
    c.restore();
    c.fillStyle=`rgba(0,0,0,${s.darkness})`; c.fillRect(0,0,width,height);
    // The last light contracts and disappears before the silent black hold.
    if(u>.48 && u<.8) {
      const r=(reduced?10:24)*(1-smooth(.58,.8,u));
      const glow=c.createRadialGradient(x,y,0,x,y,Math.max(.01,r*3));
      glow.addColorStop(0,'#fff5d8');glow.addColorStop(.18,'#e2c080');glow.addColorStop(1,'transparent');
      c.fillStyle=glow;c.fillRect(x-r*3,y-r*3,r*6,r*6);
    }
  }
}
