// Real Canvas regression check; same optional runtime as check-ground-raster.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { WorldGround } from '../app/world-ground.mjs';
import { shoreDepth } from '../app/shore-geography.mjs';
const require = createRequire(process.env.VORO_CANVAS_RUNTIME || import.meta.url);
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const image = await loadImage('public/backgrounds/shore-variants.webp');
const ground = new WorldGround(() => createCanvas(1, 1));
const screen = createCanvas(480, 850), c = screen.getContext('2d');
let samples = 0;
for (const [x, y] of [[700,970],[1550,970],[2400,970],[-8000,5600],[14000,-9000]]) {
  ground.draw(c, image, 'land', {x,y}, .65, 850);
  const coast = ground.views.get('land').coast;
  const pixels = coast.waterLayer.getContext('2d').getImageData(0,0,864,1234).data;
  for (let py=192;py<1042;py+=29) for (let px=192;px<672;px+=31) {
    const depth = shoreDepth(x+(px-432)/.65,y+(py-600)/.65);
    if (Math.abs(depth)<12) continue;
    const alpha = pixels[(py*864+px)*4+3];
    assert.ok(depth<0 ? alpha<5 : alpha>250, `Water mask differs from habitat at ${x},${y}:${px},${py}`);
    samples++;
  }
}
const start = ground.redraws;
for (let i=0;i<480;i++) ground.draw(c,image,'land',{x:700+i*1.5,y:970+i*2},.65+i*.00005,850);
assert.ok(ground.redraws-start<15, 'Growing/moving should reuse the cached ground');
console.log(`Shore: ${samples} habitat/pixel checks; bounded redraws during 480 moving/growing frames.`);
