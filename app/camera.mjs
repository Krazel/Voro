// Keep the newborn small, then reveal more world as its body grows.
export function gameplayZoom(radius) {
  return Math.min(
    0.85 / Math.sqrt(Math.max(1, radius / 32)),
    78 / Math.max(1, radius),
  );
}
