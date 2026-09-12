// Compare the optimized terrain against the delivered renderer, with real
// textures and rasterization. This is image equivalence, not device FPS.
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {WorldGround, GROUND_PROFILES} from '../../app/world-ground.mjs';
import {stageResources} from '../../app/stage-assets.mjs';
import {STAGES} from '../../app/journey-data.mjs';
const require = createRequire('C:/Users/dmkra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const {createCanvas, loadImage} = require('@napi-rs/canvas');
const baseline = execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\','/')}`, 'show',
  'e7eb5c2897814151a2133c98f6046b8d0af2a120:app/world-ground.mjs'], {encoding:'utf8'});
const absolute = baseline.replace(/from '(\.\/[^']+)'/g,
  (_, path) => `from '${new URL('../../app/' + path.slice(2), import.meta.url).href}'`);
const {WorldGround: DeliveredGround} = await import('data:text/javascript;base64,' + Buffer.from(absolute).toString('base64'));
const cases = [];
for (const stage of Object.keys(GROUND_PROFILES)) {
  if (stage === 'land') continue; // Separate coast renderer is unchanged.
  const resource = stageResources(STAGES.findIndex(s => s.id === stage)).find(r => r.kind === 'ground' && r.key === stage);
  const image = await loadImage('public/' + resource.url.split('?')[0].replace(/^\.\//,''));
  Object.defineProperty(image, 'naturalWidth', {value:image.width});
  for (const zoom of [.585, 1.12, 1.96]) {
    const results = [];
    for (const Ground of [DeliveredGround, WorldGround]) {
      let submissions = 0;
      const backing = [];
      const ground = new Ground(() => {
        const canvas = createCanvas(1,1), ctx = canvas.getContext('2d');
        const drawImage = ctx.drawImage.bind(ctx);
        ctx.drawImage = (...args) => { submissions++; return drawImage(...args); };
        backing.push(canvas); return canvas;
      });
      const canvas = createCanvas(480, 1044), ctx = canvas.getContext('2d'), hashes = [];
      for (const camera of [{x:700,y:970}, {x:-1100,y:-570}, {x:2200,y:1480}]) {
        ctx.clearRect(0,0,480,1044);
        ground.draw(ctx,image,stage,camera,zoom,1044,1834);
        hashes.push(createHash('sha256').update(ctx.getImageData(0,0,480,1044).data).digest('hex'));
      }
      results.push({submissions, hashes});
      for (const surface of backing) surface.width = surface.height = 1;
    }
    const equal = results[0].hashes.every((hash,i) => hash === results[1].hashes[i]);
    cases.push({stage, zoom, equal, before:results[0].submissions, after:results[1].submissions});
    if (!equal) throw new Error(`Terrain pixels changed: ${stage} at ${zoom}`);
  }
}
const output = {kind:'Skia raster equivalence; not WebKit or device FPS', cases,
  frames:cases.length*3, identical:cases.every(c=>c.equal),
  before:cases.reduce((n,c)=>n+c.before,0), after:cases.reduce((n,c)=>n+c.after,0)};
writeFileSync(new URL('./ground-equivalence.json', import.meta.url),JSON.stringify(output,null,2));
console.log(JSON.stringify({frames:output.frames,identical:output.identical,before:output.before,after:output.after}));
