// Preserve entry framing. Growth remains visible, but approaches a readable
// screen radius instead of reaching a zoom floor and covering the viewport.
export function gameplayZoom(radius = 0, entryRadius = 24) {
  const reference = Number.isFinite(entryRadius) && entryRadius > 0 ? entryRadius : 24;
  const scale = 24 / reference;
  const normalizedRadius = radius * scale;
  if (!Number.isFinite(normalizedRadius) || normalizedRadius <= 34) return 1.12 * scale;
  const screenRadius = 38.08 + (105 - 38.08) * (1 - Math.exp(-(normalizedRadius - 34) / 90));
  return screenRadius / normalizedRadius * scale;
}
// Keep automatic entry framing from changing perceived travel speed.
// Manual zoom remains a visual preference and does not alter gameplay speed.
export function visualSpeedFactor(entryRadius = 24) {
  const zoom = gameplayZoom(entryRadius, entryRadius);
  return Number.isFinite(zoom) && zoom > 0 ? 1.12 / zoom : 1;
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
