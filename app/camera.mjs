// Preserve the original 480-unit framing while small; open up gently as the
// membrane grows. Even a mature body keeps at least half the original zoom.
export function gameplayZoom(radius = 0) {
  if (!Number.isFinite(radius) || radius <= 42) return 1;
  return Math.max(0.5, (42 / radius) ** 0.45);
}
export function followGameplayZoom(current, radius, dt) {
  const target = gameplayZoom(radius);
  const speed = target < current ? 0.8 : 0.4;
  return (
    current + (target - current) * (1 - Math.exp(-Math.max(0, dt) * speed))
  );
}
