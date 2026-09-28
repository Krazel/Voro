// A short, visible displacement of the attacker, independent of its damage/value.
// Keep the historical `spikes` choice ID so existing saves retain their choices.
export function repelAttacker(e, species, player, radiusFactor) {
  if (!(radiusFactor > 0) || !(species?.speed > 0) || e.eaten) return false;
  const dx = e.x - player.x, dy = e.y - player.y, d = Math.hypot(dx, dy);
  const angle = d > 0.001 ? Math.atan2(dy, dx) : (e.seed || 0);
  const overlap = Math.max(0, player.radius * .85 + e.r * .76 - d);
  const distance = overlap + player.radius * radiusFactor;
  e.repulsion = { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, elapsed: 0 };
  e.escape = Math.max(e.escape || 0, .6);
  e.flash = 1;
  return true;
}

export function advanceRepulsion(e, dt, constrain) {
  const push = e.repulsion;
  if (!push) return false;
  const old = push.elapsed / .4;
  push.elapsed = Math.min(.4, push.elapsed + Math.max(0, dt));
  const now = push.elapsed / .4;
  const fraction = (1 - old) ** 2 - (1 - now) ** 2;
  const x = e.x, y = e.y;
  e.x += push.x * fraction;
  e.y += push.y * fraction;
  if (constrain) constrain(e);
  // Move the local roaming anchor too, avoiding a snap back at the home leash.
  e.homeX += e.x - x;
  e.homeY += e.y - y;
  e.escape = Math.max(0, (e.escape || 0) - dt);
  e.flash = Math.max(0, (e.flash || 0) - dt * 2);
  if (push.elapsed >= .4) e.repulsion = null;
  return true;
}
