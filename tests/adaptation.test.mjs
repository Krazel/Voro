import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newJourney,
  journeyLife,
  refreshOffer,
  canReroll,
  rerollAdaptation,
  chooseUpgrade,
  saveJourney,
  loadJourney,
} from '../app/journey-progress.mjs';
import { JourneyWorld, journeyEntity } from '../app/journey-world.mjs';
import { STAGE_SPECIES, stageStartMass } from '../app/journey-data.mjs';
import {
  journeyAdaptation,
  nextAdaptation,
  UPGRADES,
} from '../app/mutations.mjs';
import { beginAbsorb, radiusForMass } from '../app/simulation.mjs';
import { makeEngine } from './engine-fixture.mjs';
test('Every new stage starts half-size, only the smallest species are edible, and starter food is nearby', () => {
  for (let stage = 0; stage < 9; stage++) {
    const p = newJourney(51);
    p.stage = stage;
    const l = journeyLife(p);
    assert.equal(l.biomass, stageStartMass(stage));
    assert.equal(l.radius, radiusForMass(stageStartMass(stage)));
    let edible = 0,
      locked = 0;
    for (const s of STAGE_SPECIES[stage]) {
      l.digestion = [];
      const e = journeyEntity(s, l.x, l.y, 1, s.id);
      const result = beginAbsorb(l, e);
      if (result) {
        edible++;
        assert.ok(s.r <= 21, `${s.name} is too large for a newborn`);
      } else locked++;
    }
    assert.ok(edible >= 1 && edible <= 3);
    assert.ok(locked > edible);
    const w = new JourneyWorld(p.seed, [], stage);
    w.stream(l.x, l.y, 0);
    assert.ok(
      w.entities.filter(
        (e) =>
          e.requiredMass <= stageStartMass(stage) &&
          Math.hypot(e.x - l.x, e.y - l.y) < 240,
      ).length >= 3,
    );
  }
});
test('One free reroll gives different choices, persists across reload and renews at the next adaptation', () => {
  const p = newJourney(6),
    l = journeyLife(p),
    w = new JourneyWorld(6);
  p.xp = journeyAdaptation(0);
  refreshOffer(p);
  const original = [...p.offer];
  assert.ok(canReroll(p));
  assert.equal(rerollAdaptation(p), true);
  assert.equal(p.offer.length, 3);
  assert.equal(new Set(p.offer).size, 3);
  assert.ok(p.offer.every((id) => !original.includes(id)));
  const rerolled = [...p.offer];
  assert.equal(rerollAdaptation(p), false);
  assert.deepEqual(p.offer, rerolled);
  const restored = loadJourney(saveJourney(p, l, w, true));
  assert.deepEqual(restored.progress.offer, rerolled);
  assert.equal(canReroll(restored.progress), false);
  assert.equal(chooseUpgrade(restored.progress, original[0]), false);
  assert.equal(chooseUpgrade(restored.progress, rerolled[0]), true);
  restored.progress.xp = journeyAdaptation(1);
  refreshOffer(restored.progress);
  assert.equal(canReroll(restored.progress), true);
});
test('Reroll remains well-defined when fewer than six upgrade types remain', () => {
  const p = newJourney(8);
  p.mutations = UPGRADES.flatMap((u, i) =>
    Array(u.max - (i < 4 ? 1 : 0)).fill(u.id),
  );
  p.level = p.mutations.length;
  p.xp = journeyAdaptation(p.level);
  refreshOffer(p);
  const old = [...p.offer];
  assert.ok(canReroll(p));
  rerollAdaptation(p);
  assert.equal(p.offer.length, 3);
  assert.equal(new Set(p.offer).size, 3);
  assert.ok(p.offer.some((id) => !old.includes(id)));
  chooseUpgrade(p, p.offer[0]);
  p.xp = journeyAdaptation(p.level);
  refreshOffer(p);
  assert.equal(canReroll(p), false);
});
test('Adaptations require more feeding; old saves retain their upgrades, body and fractional progress', () => {
  for (let level = 0; level < 43; level++)
    assert.ok(journeyAdaptation(level) > nextAdaptation(level) * 2);
  const p = newJourney(14);
  p.mutations = ['speed'];
  p.level = 1;
  p.xp = (nextAdaptation(0) + nextAdaptation(1)) / 2;
  delete p.adaptationVersion;
  const l = journeyLife(p);
  l.biomass = 58;
  l.radius = radiusForMass(58);
  const w = new JourneyWorld(14);
  const r = loadJourney(saveJourney(p, l, w, true));
  assert.equal(
    r.progress.xp,
    (journeyAdaptation(0) + journeyAdaptation(1)) / 2,
  );
  assert.deepEqual(r.progress.mutations, ['speed']);
  assert.equal(r.life.biomass, 58);
  assert.equal(r.progress.offer.length, 0);
  const again = loadJourney(saveJourney(r.progress, r.life, w, true));
  assert.equal(again.progress.xp, r.progress.xp);
});
test('Reroll leaves world time frozen and a newborn survives a first contact hit', () => {
  const { game: g } = makeEngine();
  g.progress = newJourney(27);
  g.life = journeyLife(g.progress);
  g.world = new JourneyWorld(27);
  g.seed();
  g.action('start');
  g.progress.xp = 24;
  refreshOffer(g.progress);
  const elapsed = g.life.elapsed;
  g.reroll();
  g.frame(100);
  g.frame(200);
  assert.equal(g.life.elapsed, elapsed);
  assert.ok(g.progress.rerollUsed);
  g.choose(g.progress.offer[0]);
  g.receiveHit({ x: g.life.x + 40, y: g.life.y }, 0.22);
  assert.ok(g.life.biomass > 0 && g.life.biomass < 2);
  g.destroy();
});
