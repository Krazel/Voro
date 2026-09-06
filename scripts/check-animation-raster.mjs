// Compare a previous painter (path argument) with the current painter using
// actual image pixels, not mocks. Requires the same runtime as check-ground-raster.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { writeFileSync, statSync } from 'node:fs';
import { drawPose } from '../app/inhabitant-animation.mjs';
import { ATLAS_URLS, SPECIES_BY_ID } from '../app/journey-data.mjs';
import { stageResources } from '../app/stage-assets.mjs';
const require = createRequire(process.env.VORO_CANVAS_RUNTIME || import.meta.url);
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { drawPose: previous } = await import(pathToFileURL(resolve(process.argv[2])).href);
const images = {};
for (const [key, url] of Object.entries(ATLAS_URLS)) images[key] = await loadImage('public/' + url.slice(2));
const before = createCanvas(160, 160), after = createCanvas(160, 160);
let checks = 0;
for (const s of Object.values(SPECIES_BY_ID)) {
  for (const activity of [0.35, 1, 1.5]) {
    for (const [canvas, painter] of [[before, previous], [after, drawPose]]) {
      const c = canvas.getContext('2d');
      c.resetTransform(); c.clearRect(0, 0, 160, 160); c.translate(80, 80);
      painter(c, images[s.imageAtlas || s.atlas], s, 40, 1.91, { activity });
    }
    assert.deepEqual(after.getContext('2d').getImageData(0,0,160,160).data,
      before.getContext('2d').getImageData(0,0,160,160).data, s.id + ':' + activity);
    checks++;
  }
}
const oldUrls = [...Object.values(ATLAS_URLS), './abyssal-background.png', './shore-v2.png', './sea-v2.png', './inhabitants/environments.png'];
const newUrls = stageResources(0).map(r => r.url);
async function footprint(urls) {
  let bytes = 0, decoded = 0;
  for (const url of urls) {
    const path = 'public/' + url.slice(2), image = await loadImage(path);
    bytes += statSync(path).size;
    decoded += image.width * image.height * 4;
  }
  return { files: urls.length, bytes, rgbaBytes: decoded };
}
const result = { rasterChecks: checks, identical: true, startupBefore: await footprint(oldUrls), startupAfter: await footprint(newUrls) };
writeFileSync('design/loading-raster-audit.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
