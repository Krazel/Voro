// Enter and leave at different distances; eating eligibility itself is unchanged.
export function animalTarget(e, species, player, time, range, leash, roam) {
  const dx = player.x - e.x, dy = player.y - e.y, d = Math.hypot(dx, dy);
  const homeDistance = Math.hypot(e.x - e.homeX, e.y - e.homeY);
  if (e.aiReturning && homeDistance < roam && time >= e.aiReturnUntil)
    e.aiReturning = false;
  const reacts = ['hunter', 'flee', 'ranged'].includes(species.kind);
  if (!reacts) e.aiEngaged = false;
  else if (!e.aiEngaged && d < range) e.aiEngaged = true;
  else if (e.aiEngaged && d > range + 80) e.aiEngaged = false;

  if (player.biomass >= e.requiredMass || e.escape > 0) {
    e.aiAfraid = true;
    e.aiFearUntil = time + 0.8;
  } else if (player.biomass < e.requiredMass * 0.9 && time >= (e.aiFearUntil || 0)) {
    e.aiAfraid = false;
  }
  let tx = e.homeX + Math.sin(time * 0.21 + e.seed) * roam;
  let ty = e.homeY + Math.cos(time * 0.17 + e.seed) * roam;
  if (e.aiEngaged && !e.aiReturning) {
    let sign = e.aiAfraid || species.kind === 'flee' ? -1 : 1;
    if (species.kind === 'ranged' && sign > 0) {
      // Hold a stable firing band instead of reversing at its exact edges.
      let mode = e.aiRangeSign || 0;
      if (d < 230) mode = -1;
      else if (d > 300) mode = 1;
      else if ((mode < 0 && d >= 265) || (mode > 0 && d <= 275)) mode = 0;
      e.aiRangeSign = mode;
      sign = mode;
    }
    // Coincident centers still have a deterministic escape direction.
    tx = e.x + (d > 0.01 ? dx : Math.cos(e.seed)) * sign;
    ty = e.y + (d > 0.01 ? dy : Math.sin(e.seed)) * sign;
    if ((Math.abs(e.x - e.homeX) >= leash - 18 && (tx - e.x) * (e.x - e.homeX) > 0) ||
        (Math.abs(e.y - e.homeY) >= leash - 18 && (ty - e.y) * (e.y - e.homeY) > 0)) {
      e.aiReturning = true;
      e.aiReturnUntil = time + 0.8;
    }
  }
  if (e.aiReturning) { tx = e.homeX; ty = e.homeY; }
  return { x: tx, y: ty };
}
