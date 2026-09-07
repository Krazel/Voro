import test from 'node:test';
import assert from 'node:assert/strict';
import { TiltInput } from '../app/tilt-input.mjs';
import { STAGES, STAGE_SPECIES, SPECIES_BY_ID, physicalDiameter } from '../app/journey-data.mjs';
import { sizeRange } from '../app/entity-sizes.mjs';
import { JourneyWorld } from '../app/journey-world.mjs';
import { journeyLife, newJourney, saveJourney, loadJourney } from '../app/journey-progress.mjs';

test('Tilt uses a comfortable neutral position, dead zone, bounded speed and fresh samples', () => {
  const t = new TiltInput();
  assert.equal(t.sample(null, 0, 0, 100), false);
  t.sample(45, 10, 0, 100);
  t.sample(47, 11, 0, 110);
  assert.deepEqual(t.read(110), { x: 0, y: 0 });
  for (let i = 1; i < 100; i++) { t.sample(65, 30, 0, 110 + i * 16); t.read(110 + i * 16); }
  assert.ok(Math.hypot(t.output.x, t.output.y) <= 1);
  assert.ok(t.output.x > 0.6 && t.output.y > 0.6);
  assert.deepEqual(t.read(3000), { x: 0, y: 0 });
  t.sample(80, 40, 0, 3010);
  assert.deepEqual(t.read(3010), { x: 0, y: 0 }, 'stale input recalibrates');
});
test('Tilt follows screen rotation and resets calibration when rotating the device', () => {
  const t = new TiltInput();
  t.sample(40, 5, 90, 100); t.sample(60, 5, 90, 110);
  assert.ok(t.target.x > 0.99 && Math.abs(t.target.y) < 1e-9);
  t.sample(60, 5, 0, 120);
  assert.deepEqual(t.read(120), { x: 0, y: 0 });
});
test('Earth is unique, initially inedible, and stays consumed across reload and journal pruning', () => {
  const p = newJourney(22); p.stage = STAGES.findIndex(s => s.id === 'planets');
  const l = journeyLife(p), w = new JourneyWorld(p.seed, [], p.stage);
  w.stream(l.x, l.y, 0);
  const earth = w.entities.filter(e => e.kind === 'earth');
  assert.equal(earth.length, 1);
  assert.ok(earth[0].requiredMass > l.biomass);
  assert.ok(earth[0].requiredMass < STAGES[p.stage].goal);
  assert.ok(Math.hypot(earth[0].x-l.x, earth[0].y-l.y) < 350);
  w.eat(earth[0], 0);
  for (let i = 0; i < 2100; i++) w.eat({ id: `other:${i}` }, i);
  l.elapsed = 2200;
  const loaded = loadJourney(saveJourney(p,l,w,true));
  assert.ok(loaded);
  const restored = new JourneyWorld(p.seed, loaded.journal, p.stage);
  restored.stream(700,970,2200);
  assert.equal(restored.entities.filter(e => e.kind === 'earth').length, 0);
});
test('Planet populations vary much more than humans; sea sizes and cosmic scales stay ordered', () => {
  const ratio = id => sizeRange(SPECIES_BY_ID[id]).max / sizeRange(SPECIES_BY_ID[id]).min;
  assert.ok(ratio('planets-0') > 3);
  assert.ok(ratio('water-14') < 1.15);
  assert.ok(sizeRange(SPECIES_BY_ID['water-10']).max < sizeRange(SPECIES_BY_ID['water-14']).min);
  const diameter = (s, r) => physicalDiameter(s.stage, 8*(r/48)**2);
  const planets = STAGE_SPECIES[6].filter(s => s.motion === 'planet');
  const galaxies = STAGE_SPECIES[8].filter(s => /^galaxies-[0-5]$/.test(s.id));
  assert.ok(Math.min(...galaxies.map(s=>diameter(s,sizeRange(s).min))) > Math.max(...planets.map(s=>diameter(s,sizeRange(s).max))) * 1e9);
  assert.ok(diameter(SPECIES_BY_ID['orbit-2'], sizeRange(SPECIES_BY_ID['orbit-2']).max) < 30);
});
