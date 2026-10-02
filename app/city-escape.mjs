// City pedestrians and ground vehicles react to the visible edge of Voro.
export const cityEscapeSpecies = s => s.id.startsWith('city-') &&
  (s.motion === 'walker' || s.motion === 'vehicle');

export function cityEscapeSpeed(e, s, p, dt) {
  const fleeing = e.aiEngaged && !e.aiReturning &&
    (s.kind === 'flee' || e.aiAfraid);
  const gap = Math.max(0, Math.hypot(e.x-p.x, e.y-p.y) - (p.radius || 0) - e.r);
  const urgency = Math.max(0, Math.min(1, (340-gap)/260));
  const extra = s.motion === 'walker' ? .9 : .65;
  const target = fleeing ? 1 + extra * (.5 + .5 * urgency) : 1;
  const previous = e.citySpeedFactor ?? 1;
  // Accelerate promptly, settle more slowly, independent of frame rate.
  const response = target > previous ? .35 : 1;
  e.citySpeedFactor = target + (previous-target) * Math.exp(-dt/response);
  return e.citySpeedFactor;
}

export function advanceCityGait(e, s, distance, dt, time) {
  // Integrate distance, not absolute time times a changing speed (phase jumps).
  e.cityAnimationTime = (e.cityAnimationTime ?? Math.max(0,time-dt)) +
    Math.min(dt*2.2, distance/Math.max(1,s.speed));
}
