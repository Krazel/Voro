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
import { STAGES, STAGE_SPECIES, stageStartMass } from '../app/journey-data.mjs';
import {
  journeyAdaptation,
  nextAdaptation,
  v3JourneyAdaptation,
  UPGRADES,
} from '../app/mutations.mjs';
import { beginAbsorb, radiusForMass } from '../app/simulation.mjs';
import { makeEngine } from './engine-fixture.mjs';
test('Every new stage starts half-size, only the smallest species are edible, and starter food is nearby', () => {
  for (let stage = 0; stage < STAGES.length; stage++) {
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
        assert.ok(e.r <= l.radius / 1.17 + 1e-9, `${s.name} is too large for a newborn`);
      } else locked++;
    }
    assert.ok(edible >= 1);
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
test('Three stable choices survive reload and cannot be rerolled', () => {
  const p = newJourney(6), l = journeyLife(p), w = new JourneyWorld(6);
  p.xp = journeyAdaptation(0);
  refreshOffer(p);
  const original = [...p.offer];
  assert.equal(original.length, 3);
  assert.equal(new Set(original).size, 3);
  assert.equal(canReroll(p), false);
  assert.equal(rerollAdaptation(p), false);
  assert.deepEqual(p.offer, original);
  const restored = loadJourney(saveJourney(p, l, w, true));
  assert.deepEqual(restored.progress.offer, original);
  assert.equal(chooseUpgrade(restored.progress, 'not-offered'), false);
  assert.equal(chooseUpgrade(restored.progress, original[0]), true);
  assert.equal(restored.progress.level, 1);
  assert.equal(chooseUpgrade(restored.progress, original[0]), false);
});
test('Final capped choices remain selectable without renewing the offer', () => {
  for (const remaining of [1, 2, 3]) {
    const p = newJourney(8);
    p.mutations = UPGRADES.flatMap((u, i) => Array(u.max - (i < remaining ? 1 : 0)).fill(u.id));
    p.level = p.mutations.length;
    p.xp = journeyAdaptation(p.level);
    refreshOffer(p);
    const old = [...p.offer];
    assert.equal(old.length, remaining);
    assert.equal(rerollAdaptation(p), false);
    assert.deepEqual(p.offer, old);
    assert.equal(chooseUpgrade(p, old[0]), true);
    assert.equal(chooseUpgrade(p, old[0]), false);
  }
});
test('Adaptations arrive one third sooner; old saves retain their upgrades, body and fractional progress', () => {
  for (let level = 0; level < 43; level++)
    assert.ok(
      Math.abs(journeyAdaptation(level) / v3JourneyAdaptation(level) - 2 / 3) <
        1e-9,
    );
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
test('Choosing freezes world time, consumes one adaptation and survives a first hit', () => {
  const { game: g } = makeEngine();
  g.progress = newJourney(27);
  g.life = journeyLife(g.progress);
  g.world = new JourneyWorld(27);
  g.seed();
  g.action('start');
  g.progress.xp = journeyAdaptation(0);
  refreshOffer(g.progress);
  const elapsed = g.life.elapsed;
  assert.equal(typeof g.reroll, 'undefined');
  g.frame(100);
  g.frame(200);
  assert.equal(g.life.elapsed, elapsed);
  assert.equal(g.progress.rerollUsed, false);
  g.choose(g.progress.offer.find((id) => id !== 'shield'));
  g.receiveHit({ x: g.life.x + 40, y: g.life.y }, 0.22);
  assert.ok(g.life.biomass > 0 && g.life.biomass < 2);
  g.destroy();
});
