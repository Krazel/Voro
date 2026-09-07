// Build-time export of the approved procedural rigs; never runs on the phone.
// VORO_CANVAS_RUNTIME points to a package.json with @napi-rs/canvas and sharp.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { drawPose, simpleAnimation } from '../app/inhabitant-animation.mjs';
import { ANIMATIONS, animationCrop } from '../app/animation-catalog.mjs';
import { SPECIES_BY_ID, ATLAS_URLS } from '../app/journey-data.mjs';
const req = createRequire(process.env.VORO_CANVAS_RUNTIME || import.meta.url);
const { createCanvas, loadImage } = req('@napi-rs/canvas');
const sharp = req('sharp');
const size = 192, fps = 30;
const sourceHash = createHash('sha256').update(readFileSync('app/inhabitant-animation.mjs')).digest('hex');
const images = {}, manifest = {};
mkdirSync('public/animation-sheets', { recursive: true });
for (const [key, url] of Object.entries(ATLAS_URLS)) images[key] = await loadImage('public/' + url.slice(2));
let exported = 0, bytes = 0;
for (const s of Object.values(SPECIES_BY_ID)) {
  const profile = ANIMATIONS[s.id];
  if (simpleAnimation(profile)) continue;
  const image = images[s.imageAtlas || s.atlas];
  const crop = animationCrop(s, image), extent = 3 * Math.max(1, crop[3] / crop[2]);
  // A 20-second cosmic cycle has only a few pixels of internal flow. Hundreds
  // of almost identical textures waste memory; rigid motion stays continuous.
  const count = Math.max(24, Math.min(64, Math.ceil(profile.period * fps)));
  manifest[s.id] = {};
  for (const energy of [1, 1.5]) {
    const frames = [], canvas = createCanvas(size, size), c = canvas.getContext('2d');
    let x0 = size, y0 = size, x1 = 0, y1 = 0;
    for (let f = 0; f < count; f++) {
      c.resetTransform(); c.clearRect(0, 0, size, size); c.translate(size / 2, size / 2);
      drawPose(c, image, s, size / extent, f / count * Math.PI * 2, { activity: energy, transform: false });
      const pixels = c.getImageData(0, 0, size, size);
      frames.push(pixels);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        if (!pixels.data[(y * size + x) * 4 + 3]) continue;
        x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      }
    }
    x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2);
    x1 = Math.min(size - 1, x1 + 2); y1 = Math.min(size - 1, y1 + 2);
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    const cols = Math.ceil(Math.sqrt(count * h / w)), rows = Math.ceil(count / cols);
    const sheet = createCanvas(cols * w, rows * h), ctx = sheet.getContext('2d');
    for (let f = 0; f < count; f++) {
      c.resetTransform(); c.putImageData(frames[f], 0, 0);
      ctx.drawImage(canvas, x0, y0, w, h, f % cols * w, Math.floor(f / cols) * h, w, h);
    }
    const buffer = await sharp(sheet.toBuffer('image/png')).webp({ quality: 94, alphaQuality: 100, effort: 4 }).toBuffer();
    const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 16);
    const url = `./animation-sheets/${hash}.webp`;
    writeFileSync('public/' + url.slice(2), buffer);
    manifest[s.id][energy] = { url, frames: count, cols, w, h, x: x0, y: y0, size, extent,
      bytes: cols * w * rows * h * 4, encodedBytes: buffer.length };
    bytes += buffer.length;
  }
  exported++;
  if (exported % 10 === 0) console.log(JSON.stringify({ exported, mb: +(bytes / 1048576).toFixed(1) }));
}
writeFileSync('app/animation-sheets.json', JSON.stringify(manifest) + '\n');
const unique = new Map(Object.values(manifest).flatMap(x => Object.values(x)).map(x => [x.url, x]));
writeFileSync('design/animation-sheet-export.json', JSON.stringify({ species: exported, targetFps: fps, maxFrames: 64, size,
  uniqueFiles: unique.size, encodedBytes: [...unique.values()].reduce((n, x) => n + x.encodedBytes, 0),
  sourceHash,
  format: 'WebP quality 94, alpha 100, same rigs; 24–64 poses per cycle, up to 30 poses/s; rigid transforms continuous; tight common crop' }, null, 2) + '\n');
console.log(JSON.stringify({ exported, bytes }));
