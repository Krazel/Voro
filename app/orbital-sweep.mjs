import { ORBITAL_EARTH } from './earth-landmark.mjs';
import { SPECIES_BY_ID } from './journey-data.mjs';

// Freeze the finite, reachable orbital arena, not an endlessly generated world.
// Existing residents take precedence so moving objects never jump at capture.
export function captureOrbit(world, fragments, time = 0) {
  const items = new Map();
  const seen = new Set();
  const add = e => {
    if (seen.has(e.id)) return;
    seen.add(e.id);
    if (!e.eaten) items.set(e.id, {
      id:e.id, kind:e.kind, x:e.x, y:e.y, r:e.r, seed:e.seed,
      heading:e.heading ?? e.seed, recycled:!!e.recycled,
    });
  };
  [...world.entities,...fragments].forEach(add);
  const earth=ORBITAL_EARTH, reach=earth.limit+280;
  for(let x=Math.floor((earth.x-reach)/600);x<=Math.floor((earth.x+reach)/600);x++)
    for(let y=Math.floor((earth.y-reach)/600);y<=Math.floor((earth.y+reach)/600);y++)
      for(const e of world.generate(x,y,time).entities)
        if(Math.hypot(e.x-earth.x,e.y-earth.y)<=reach) add(e);
  return {items:[...items.values()],shots:world.projectiles.map(b=>({x:b.x,y:b.y,r:b.r,vx:b.vx,vy:b.vy,plasma:!!b.plasma}))};
}
export function sweepPosition(item, life, t) {
  const u=Math.max(0,Math.min(1,t)), ease=u*u*(3-2*u);
  return {...item,x:item.x+(life.x-item.x)*ease,y:item.y+(life.y-item.y)*ease,
    r:item.r*(1-ease)};
}
export function restoreOrbitSweep(value) {
  if(!value || !Array.isArray(value.items) || value.items.length>1500 ||
    !Array.isArray(value.shots) || value.shots.length>72) return null;
  const valid=e=>e && [e.x,e.y,e.r].every(Number.isFinite) &&
    Math.abs(e.x)<1e5 && Math.abs(e.y)<1e5 && e.r>0 && e.r<2000;
  if(!value.items.every(e=>valid(e)&&typeof e.id==='string'&&e.id.length<100&&
    SPECIES_BY_ID[e.kind]&&Number.isFinite(e.seed)&&Number.isFinite(e.heading)) ||
    !value.shots.every(e=>valid(e)&&[e.vx,e.vy].every(Number.isFinite))) return null;
  return {items:value.items.map(e=>({id:e.id,kind:e.kind,x:e.x,y:e.y,r:e.r,
    seed:e.seed,heading:e.heading,recycled:e.recycled===true})),
    shots:value.shots.map(e=>({x:e.x,y:e.y,r:e.r,vx:e.vx,vy:e.vy,plasma:!!e.plasma}))};
}
