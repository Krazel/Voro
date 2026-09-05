// Run with @napi-rs/canvas installed, or VORO_CANVAS_RUNTIME pointing to a
// package.json beside the workspace's bundled @napi-rs/canvas installation.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WorldGround, GROUND_PROFILES } from '../app/world-ground.mjs';
const require = createRequire(
  process.env.VORO_CANVAS_RUNTIME || import.meta.url,
);
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const white = createCanvas(768, 512),
  wc = white.getContext('2d');
wc.fillStyle = '#fff';
wc.fillRect(0, 0, 768, 512);
const image = await loadImage(white.toBuffer('image/png'));
const ground = new WorldGround(() => createCanvas(1, 1));
for (const stage of Object.keys(GROUND_PROFILES))
  for (const zoom of [0.65, 1]) {
    const screen = createCanvas(480, 720),
      c = screen.getContext('2d');
    ground.draw(c, image, stage, { x: -1234.25, y: -1777.5 }, zoom, 720, 94);
    const pixels = c.getImageData(0, 0, 480, 720).data;
    for (let i = 0; i < pixels.length; i += 4)
      assert.ok(pixels[i] >= 250, stage + ' has a dark seam');
  }
const terrain = await loadImage(
  readFileSync(
    new URL('../public/backgrounds/sea-variants.webp', import.meta.url),
  ),
);
function frame(x) {
  const canvas = createCanvas(480, 720),
    c = canvas.getContext('2d');
  ground.draw(c, terrain, 'water', { x, y: -1777 }, 1, 720, 94);
  return c.getImageData(0, 0, 480, 720).data;
}
const a = frame(-1234),
  b = frame(-1194);
let difference = 0,
  count = 0;
for (let y = 0; y < 720; y++)
  for (let x = 0; x < 440; x++)
    for (let k = 0; k < 3; k++) {
      difference += Math.abs(
        a[(y * 480 + x + 40) * 4 + k] - b[(y * 480 + x) * 4 + k],
      );
      count++;
    }
assert.ok(
  difference / count < 1,
  'Terrain must remain fixed in world coordinates while the camera moves',
);
console.log(
  '18 raster coverage cases and real terrain camera movement passed.',
);
