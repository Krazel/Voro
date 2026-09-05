// Each selected shield contributes one identical, independently recharging hit.
export function syncShields(p, stats, dt = 0) {
  const capacity = stats.shieldCapacity || 0;
  if (!Array.isArray(p.shieldTimers)) p.shieldTimers = [];
  while (p.shieldTimers.length < capacity)
    p.shieldTimers.push(p.shieldRecharge || 0);
  p.shieldTimers = p.shieldTimers
    .slice(0, capacity)
    .map((t) => Math.max(0, t - dt));
  p.shieldRecharge = capacity ? Math.min(...p.shieldTimers) : 0;
}
export function consumeShield(p, stats) {
  syncShields(p, stats);
  const i = p.shieldTimers.findIndex((t) => t === 0);
  if (i < 0) return false;
  p.shieldTimers[i] = stats.shieldCooldown;
  p.shieldRecharge = Math.min(...p.shieldTimers);
  return true;
}
export function restoreShieldTimers(p, capacity) {
  return Array.from({ length: capacity }, (_, i) => {
    const saved = Array.isArray(p.shieldTimers) ? p.shieldTimers[i] : undefined;
    const t = Number.isFinite(saved) ? saved : p.shieldRecharge;
    return Number.isFinite(t) ? Math.max(0, Math.min(20, t)) : 0;
  });
}
