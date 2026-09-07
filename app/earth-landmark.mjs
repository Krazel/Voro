// The distant Earth is scenery below orbital objects (different depth).
// One local image, no giant offscreen texture, mesh bake or shadow.
export function drawOrbitalEarth(c, image, camera, height) {
  if (!image?.naturalWidth) return;
  const x = 240 - (camera.x - 700) * 0.08;
  const y = height * 0.6 + 460 - (camera.y - 970) * 0.08;
  const r = 620;
  if (x + r < 0 || x - r > 480 || y + r < 0 || y - r > height) return;
  c.save();
  c.drawImage(image, x - r, y - r, r * 2, r * 2);
  c.fillStyle = '#e0eef4';
  c.textAlign = 'center';
  c.font = '11px Arial';
  c.fillText('LA TIERRA · TODAVÍA NO PUEDES ABSORBERLA', 240, Math.max(100, Math.min(height - 120, y - r + 28)));
  c.restore();
}
