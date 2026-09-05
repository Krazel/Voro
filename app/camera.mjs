// Pull back from the first growth steps while leaving visible screen growth.
// Radius is still the physical simulation radius, independent of the camera.
export function growthZoom(radius) {
  const r = Math.max(1, radius);
  return Math.min(0.9 / Math.sqrt(Math.max(1, r / 24)), 80 / r);
}
