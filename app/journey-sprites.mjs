import { SPECIES_BY_ID } from './journey-data.mjs';
import { drawMicroSprite } from './micro-sprites.mjs';
export function drawJourneySprite(
  c,
  images,
  id,
  r,
  seed,
  time,
  motion = 1,
  hurt = 0,
) {
  const s = SPECIES_BY_ID[id];
  if (!s) return;
  const image = images[s.atlas];
  if (!image?.complete || !image.naturalWidth) return;
  if (s.atlas === 'micro') {
    drawMicroSprite(c, image, id, r, seed, time, motion, hurt);
    return;
  }
  const iw = image.naturalWidth,
    ih = image.naturalHeight || image.height;
  const crop = s.crop || [
    ((s.index % s.cols) * iw) / s.cols + 3,
    (Math.floor(s.index / s.cols) * ih) / s.rows + 3,
    iw / s.cols - 6,
    ih / s.rows - 6,
  ];
  const [sx, sy, sw, sh] = crop,
    w = 2 * r,
    h = (w * sh) / sw,
    m = s.motion,
    t = time + seed;
  c.save();
  if (hurt > 0) c.globalAlpha *= 0.65 + 0.35 * Math.cos(hurt * 12);
  if (m === 'puffer') {
    const k = 1 + 0.07 * Math.sin(t * 2);
    c.scale(k, k);
  }
  if (['star', 'plasma', 'cosmic'].includes(m)) {
    const k = 1 + 0.025 * Math.sin(t * 2);
    c.scale(k, 1 + 0.018 * Math.cos(t * 2));
  }
  if (m === 'planet') c.rotate(Math.sin(t * 0.1) * 0.045);
  if (m === 'hop') {
    const k = Math.max(0, Math.sin(t * 8));
    c.translate(0, -r * 0.09 * k);
    c.scale(1 + 0.05 * k, 1 - 0.06 * k);
  }
  if (m === 'wing') c.scale(1, 0.7 + 0.3 * Math.abs(Math.sin(t * 5)));
  if (m === 'vehicle') c.translate(Math.sin(t * 9) * r * 0.006, 0);
  const deform = [
    'fish',
    'worm',
    'squid',
    'octopus',
    'jelly',
    'swimmer',
    'walker',
    'insect',
  ].includes(m);
  const rows = ['walker', 'insect', 'swimmer', 'jelly', 'octopus'].includes(m)
      ? 8
      : 1,
    cols = deform ? 16 : 1;
  for (let yy = 0; yy < rows; yy++)
    for (let xx = 0; xx < cols; xx++) {
      const u = xx / cols,
        v = yy / rows;
      let dx = 0,
        dy = 0;
      if (deform) {
        if (m === 'jelly') {
          dx = Math.sin(t * 3 + v * 5) * r * 0.035 * v;
          dy = Math.sin(t * 3) * r * 0.018;
        } else if (['walker', 'insect', 'swimmer'].includes(m)) {
          dx =
            Math.sin(t * (m === 'insect' ? 16 : 8) + v * 6 + u * 4) *
            r *
            0.025 *
            Math.abs(v - 0.5) *
            2;
          dy = Math.sin(t * 8 + u * 6) * r * 0.012;
        } else {
          dy =
            Math.sin(t * (m === 'fish' ? 6 : 4) + u * 6) *
            r *
            0.055 *
            (1 - u * 0.8);
          dx = m === 'octopus' ? Math.sin(t * 3 + v * 8) * r * 0.025 * v : 0;
        }
      }
      c.drawImage(
        image,
        sx + sw * u,
        sy + sh * v,
        sw / cols,
        sh / rows,
        -w / 2 + w * u + dx * motion,
        -h / 2 + h * v + dy * motion,
        w / cols + 0.35,
        h / rows + 0.35,
      );
    }
  if (m === 'rotor') {
    c.strokeStyle = 'rgba(185,208,205,.25)';
    c.lineWidth = r * 0.045;
    for (let i = 0; i < 4; i++) {
      const a = t * 30 + (i * Math.PI) / 2;
      c.beginPath();
      c.arc(-r * 0.08, 0, r * 0.52, a, a + 0.65);
      c.stroke();
    }
  }
  c.restore();
}
