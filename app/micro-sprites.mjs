import { SPECIES_BY_ID } from './micro-world.mjs';
// The art is a bitmap. Its strips bend continuously, preserving the illustration during motion and digestion.
export function drawMicroSprite(
  c,
  image,
  id,
  r,
  seed,
  time,
  motion = 1,
  hurt = 0,
) {
  const s = SPECIES_BY_ID[id] || SPECIES_BY_ID.nutrient;
  if (!image?.complete || !image.naturalWidth) return;
  const [sx, sy, sw, sh] = s.crop,
    w = r * 2,
    h = (w * sh) / sw;
  const cell = ['amoeba', 'giant', 'cocci'].includes(id),
    worm = ['spiral', 'chain', 'flagellate', 'bacillus'].includes(id),
    rigid = ['spiny', 'diatom', 'nutrient'].includes(id);
  c.save();
  if (hurt > 0) c.globalAlpha *= 0.65 + 0.35 * Math.cos(hurt * 12);
  const pulse = cell ? Math.sin(time * 2.1 + seed) * 0.035 : 0;
  c.scale(1 + pulse, 1 - pulse * 0.7);
  const strips = rigid ? 1 : 18;
  for (let i = 0; i < strips; i++) {
    const u = i / strips;
    const wave = rigid
      ? 0
      : Math.sin(time * (worm ? 4.5 : 3) + seed + u * (worm ? 6 : 4)) *
        r *
        (worm ? 0.045 : 0.02) *
        motion *
        (1 - u * 0.6);
    c.drawImage(
      image,
      sx + sw * u,
      sy,
      sw / strips,
      sh,
      -w / 2 + w * u,
      -h / 2 + wave,
      w / strips + 0.45,
      h,
    );
  }
  c.restore();
}
