// Preserve the original 480-unit framing while small; open up gently as the
// membrane grows. Mild compensation keeps growth clearly visible on screen.
export function gameplayZoom(radius = 0) {
  if (!Number.isFinite(radius) || radius <= 42) return 1.12;
  return Math.max(0.78, 1.12 * (42 / radius) ** 0.22);
}
export function zoomPreference(value) {
  return Number.isFinite(value) ? Math.max(.75, Math.min(1.75, value)) : 1;
}
export function followGameplayZoom(current, radius, dt, factor = 1) {
  const target = gameplayZoom(radius) * zoomPreference(factor);
  const speed = target < current ? 0.8 : 0.4;
  return (
    current + (target - current) * (1 - Math.exp(-Math.max(0, dt) * speed))
  );
}
