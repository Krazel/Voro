// Preserve the original 480-unit framing while small; open up gently as the
// membrane grows. Mild compensation keeps growth clearly visible on screen.
export function gameplayZoom(radius = 0, entryRadius = 24) {
  const reference = Number.isFinite(entryRadius) && entryRadius > 0 ? entryRadius : 24;
  const scale = 24 / reference;
  const normalizedRadius = radius * scale;
  if (!Number.isFinite(normalizedRadius) || normalizedRadius <= 42) return 1.12 * scale;
  return Math.max(0.78, 1.12 * (42 / normalizedRadius) ** 0.22) * scale;
}
export function zoomPreference(value) {
  return Number.isFinite(value) ? Math.max(.75, Math.min(1.75, value)) : 1;
}
export function followGameplayZoom(current, radius, dt, factor = 1, entryRadius = 24) {
  const target = gameplayZoom(radius, entryRadius) * zoomPreference(factor);
  const speed = target < current ? 0.8 : 0.4;
  return (
    current + (target - current) * (1 - Math.exp(-Math.max(0, dt) * speed))
  );
}
