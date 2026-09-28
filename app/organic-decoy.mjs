export const DECOY_SECONDS = 2;

// Only an accepted dash calls this. No timer separate from the dash cooldown.
export function releaseDecoy(p, entities, species, range) {
  p.decoy = {
    x:p.x, y:p.y, radius:p.radius, remaining:DECOY_SECONDS,
    targets:new Set(entities.filter(e => !e.eaten && !e.aiReturning && e.aiEngaged
      && !e.aiAfraid && !(e.escape>0) && p.biomass<e.requiredMass
      && species[e.kind]?.speed>0
      && ['hunter','ranged'].includes(species[e.kind]?.kind)
      && Math.hypot(e.x-p.x,e.y-p.y)<range+80).map(e=>e.id)),
  };
  return p.decoy;
}
export function decoyTarget(e, species, p) {
  const d=p.decoy;
  return d && d.remaining>0 && d.targets.has(e.id) && !e.aiReturning
    && !(e.escape>0) && p.biomass<e.requiredMass
    && species.speed>0
    && ['hunter','ranged'].includes(species.kind) ? d : null;
}
export function tickDecoy(p,dt) {
  if(!p.decoy)return;
  p.decoy.remaining=Math.max(0,p.decoy.remaining-dt);
  if(p.dead || !p.decoy.remaining)p.decoy=null;
}
// Keep the former small-body benefit; scale it up once the body grows.
export const aspirationReach = p => p.radius + 22 + Math.max(p.radius,14/.15) * p.attraction;
