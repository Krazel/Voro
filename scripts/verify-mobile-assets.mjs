// Verify the actual mobile output, rather than only the shared source files.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { BACKGROUND_ASSETS } from '../app/background-assets.mjs';
import { ATLAS_URLS } from '../app/journey-data.mjs';
const root = path.resolve('mobile-dist');
for (const old of ['shore-v2.png', 'sea-v2.png', 'inhabitants/environments.png','backgrounds/city-variants.webp']) {
  assert.ok(!fs.existsSync(path.join(root, old)), `Obsolete background shipped: ${old}`);
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scriptPaths = fs.readdirSync(path.join(root, 'assets')).filter(p => p.endsWith('.js'));
assert.ok(scriptPaths.some(p => fs.readFileSync(path.join(root, 'assets', p), 'utf8').includes('tidal-shore-v1')), 'Mobile gameplay must contain the tidal shore renderer');
const styles = [...html.matchAll(/href="([^"]+\.css)"/g)].map(m => m[1]);
assert.ok(styles.length, 'Mobile index must load its stylesheet');
const css = styles.map(p => fs.readFileSync(path.resolve(root, p), 'utf8')).join('\n');
const oldRule = '.micro-upgrade-dialog .mutation-choices button{';
const newRule = '.cristal-choices.mutation-choices>button{';
assert.ok(css.lastIndexOf(newRule) > css.lastIndexOf(oldRule), 'Cristal must load after legacy global styles');
for (const url of [...Object.values(BACKGROUND_ASSETS), ...Object.values(ATLAS_URLS), './ui/cristal/membrane-frame.png']) {
  const relative = url.split('?')[0].replace(/^\.\//, '');
  const bundled = fs.readFileSync(path.join(root, relative));
  const source = fs.readFileSync(path.join('public', relative));
  assert.ok(bundled.equals(source), `Missing or stale mobile asset: ${relative}`);
}
console.log('Mobile output verified: Cristal precedence, 10 backgrounds and generated UI frame.');
