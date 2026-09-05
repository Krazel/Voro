import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MicroWorld,
  makeEntity,
  SPECIES,
  SPECIES_BY_ID,
} from '../app/micro-world.mjs';
import {
  newMicro,
  microLife,
  saveMicro,
  loadMicro,
  refreshOffer,
  chooseUpgrade,
} from '../app/micro-progress.mjs';
import {
  UPGRADES,
  MAX_UPGRADE_CHOICES,
  offerUpgrades,
  upgradeStats,
} from '../app/mutations.mjs';
import { beginAbsorb, digest } from '../app/simulation.mjs';
import { drawMicroSprite } from '../app/micro-sprites.mjs';
test('Chunks regenerate deterministically at negative coordinates and retain consumed slots', () => {
  const w = new MicroWorld(23);
  w.stream(-3500, 2800, 0);
  const original = w.entities.map((e) => [e.id, e.x, e.y]);
  const meal = w.entities[0];
  w.eat(meal, 1);
  w.stream(500000, -500000, 2);
  w.stream(-3500, 2800, 3);
  assert.ok(!w.entities.some((e) => e.id === meal.id));
  const copy = new MicroWorld(23);
  copy.stream(-3500, 2800, 0);
  assert.deepEqual(
    copy.entities.map((e) => [e.id, e.x, e.y]),
    original,
  );
  for (let i = 0; i < 250; i++) {
    w.stream(i * 4000, -i * 6000, i + 4);
    assert.equal(w.chunks.size, 25);
    assert.ok(w.entities.length <= 507);
    assert.equal(w.motes.length, 625);
  }
  w.stream(-3500, 2800, 300);
  assert.ok(w.entities.some((e) => e.id === meal.id));
  for (let i = 0; i < 3000; i++) w.eat({ id: 'stress' + i }, 301);
  assert.equal(w.journal.size, 2048);
});
test('Saved negative position, pending meals, cooldown and adaptation survive reload', () => {
  const p = newMicro(100),
    l = microLife(p),
    w = new MicroWorld(p.seed);
  p.xp = 9;
  refreshOffer(p);
  chooseUpgrade(p, p.offer[0]);
  p.shieldRecharge = 12;
  l.x = -9000;
  l.y = 12000;
  l.elapsed = 20;
  w.stream(l.x, l.y, l.elapsed);
  const f = makeEntity(SPECIES_BY_ID.bacillus, l.x, l.y, 0, 'meal');
  beginAbsorb(l, f);
  w.eat(f, l.elapsed);
  const restored = loadMicro(saveMicro(p, l, w, false));
  assert.ok(restored);
  assert.equal(restored.life.x, -9000);
  assert.equal(restored.life.digestion.length, 1);
  assert.equal(restored.progress.shieldRecharge, 12);
  assert.deepEqual(restored.progress.mutations, p.mutations);
  assert.equal(restored.sound, false);
  assert.equal(restored.journal[0][0], 'meal');
  assert.equal(loadMicro('{oops'), null);
  assert.equal(loadMicro(JSON.stringify({ version: 2 })), null);
  const bad = JSON.parse(saveMicro(p, l, w, true));
  bad.progress.mutations = ['photophagy'];
  assert.equal(loadMicro(JSON.stringify(bad)), null);
});
test('14 upgrades have bounded stats; choices never repeat within a hand or exceed safe selection limits', () => {
  assert.equal(UPGRADES.length, 14);
  const chosen = [];
  for (let level = 0; level < MAX_UPGRADE_CHOICES; level++) {
    const offer = offerUpgrades(chosen, 17, level);
    assert.ok(offer.length > 0);
    assert.equal(new Set(offer).size, offer.length);
    assert.deepEqual(offer, offerUpgrades(chosen, 17, level));
    chosen.push(offer[0]);
  }
  assert.deepEqual(offerUpgrades(chosen, 17, MAX_UPGRADE_CHOICES), []);
  const s = upgradeStats(chosen, true);
  assert.ok(s.speedFactor <= 2.051);
  assert.ok(s.damageFactor >= 0.64);
  assert.ok(s.digestFactor <= 2.401);
  assert.equal(s.absorptionSlots, 6);
  assert.equal(s.shieldCooldown, 20);
  assert.ok(s.recycleFraction <= 0.751);
});
test('Recycled mass grants no XP; tiny nutrients allow recovery below initial mass', () => {
  const l = microLife(newMicro());
  l.biomass = 0.1;
  const f = makeEntity(SPECIES_BY_ID.nutrient, l.x, l.y, 0, 'tiny');
  assert.equal(beginAbsorb(l, f), true);
  for (let i = 0; i < 120; i++) digest(l, 1 / 60);
  assert.ok(l.biomass > 0.1);
  const xp = l.adaptationGained;
  const recycled = {
    ...makeEntity(SPECIES_BY_ID.nutrient, l.x, l.y, 0, 'recycled'),
    recycled: true,
  };
  beginAbsorb(l, recycled);
  for (let i = 0; i < 120; i++) digest(l, 1 / 60);
  assert.equal(l.adaptationGained, xp);
});
test('Illustrated sprite crops stay inside the atlas, and soft bodies deform with time', () => {
  const calls = [];
  const c = {
    globalAlpha: 1,
    save() {},
    restore() {},
    scale() {},
    drawImage(...a) {
      calls.push(a);
    },
  };
  const image = { complete: true, naturalWidth: 1448 };
  for (const s of SPECIES) {
    const [x, y, w, h] = s.crop;
    assert.ok(x >= 0 && y >= 0 && x + w <= 1448 && y + h <= 1086);
    drawMicroSprite(c, image, s.id, s.r, 1, 0);
  }
  const before = calls.length;
  drawMicroSprite(c, image, 'spiral', 24, 1, 0);
  const a = calls.slice(before);
  calls.length = 0;
  drawMicroSprite(c, image, 'spiral', 24, 1, 1);
  assert.notDeepEqual(calls, a);
});
