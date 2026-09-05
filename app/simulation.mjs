export const WORLD = { width: 1400, height: 1700 };
export const GOAL = 18;
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export function random(seed = 701) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
/** @typedef {{dx:number,dy:number,progress:number,done:boolean}} Digestion */
export function createLife() { return { x:700, y:970, vx:0, vy:0, eaten:0, elapsed:0, cooldown:0, boost:0, digestion:/** @type {Digestion[]} */ ([]), evolved:false, evolution:0, complete:false, free:false, radius:48, invulnerable:0 }; }
export function integrate(life, dt, input) {
  dt = clamp(dt,0,.04); life.elapsed += dt;
  life.cooldown = Math.max(0,life.cooldown-dt); life.boost = Math.max(0,life.boost-dt); life.invulnerable=Math.max(0,life.invulnerable-dt);
  const length = Math.hypot(input.x,input.y); const speed=(life.evolved?145:125)*(life.boost>0?2.8:1);
  const blend=1-Math.exp(-dt*4.4);
  life.vx += ((length>0? input.x/Math.max(1,length)*speed:0)-life.vx)*blend;
  life.vy += ((length>0? input.y/Math.max(1,length)*speed:0)-life.vy)*blend;
  life.x=clamp(life.x+life.vx*dt,110,WORLD.width-110);life.y=clamp(life.y+life.vy*dt,140,WORLD.height-130);
  life.radius += (48+Math.min(life.eaten,GOAL)*1.25+(life.evolved?8:0)-life.radius)*(1-Math.exp(-dt*2));
  if(life.evolved)life.evolution=Math.min(1,life.evolution+dt*.5);
}
export function impulse(life) { if(life.cooldown>0 || life.complete)return false;life.boost=.42;life.cooldown=3.5;return true; }
export function digest(life,dt) {
  let count=0;
  for(const f of life.digestion){f.progress+=dt/.95;if(f.progress>=1&&!f.done){f.done=true;life.eaten++;count++;}}
  life.digestion=life.digestion.filter(f=>!f.done);
  if(life.eaten>=GOAL&&!life.evolved){life.evolved=true;life.evolution=0;}
  if(life.evolved&&life.evolution>=1&&!life.free)life.complete=true;
  return count;
}
export function beginAbsorb(life,food) {
  if(food.eaten || Math.hypot(food.x-life.x,food.y-life.y)>life.radius*1.28)return false;
  food.eaten=true;life.digestion.push({dx:food.x-life.x,dy:food.y-life.y,progress:0,done:false});return true;
}
