import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UPGRADES,
  upgradeStats,
  offerUpgrades,
  validChoice,
  journeyAdaptation,
  v3JourneyAdaptation,
} from '../app/mutations.mjs';
import {
  newJourney,
  journeyLife,
  saveJourney,
  loadJourney,
  chooseUpgrade,
} from '../app/journey-progress.mjs';
import { JourneyWorld, journeyEntity } from '../app/journey-world.mjs';
import { STAGE_SPECIES, SPECIES_BY_ID } from '../app/journey-data.mjs';
import { beginAbsorb, digest } from '../app/simulation.mjs';
import { HuntingTentacles } from '../app/hunting-tentacles.mjs';
import { shedBiomass, moveFragments } from '../app/biomass-fragments.mjs';
import { makeEngine } from './engine-fixture.mjs';

test('Retired adaptations are refunded without losing stage, body or fractional progress', () => {
  const p = newJourney(44);
  p.adaptationVersion = 3;
  p.stage = 1;
  p.mutations = ['armor', 'trail', 'speed'];
  p.level = 3;
  p.xp = (v3JourneyAdaptation(2) + v3JourneyAdaptation(3)) / 2;
  const l = journeyLife(p);
  l.biomass = 40;
  const w = new JourneyWorld(44, [], 1);
  const loaded = loadJourney(saveJourney(p, l, w, true));
  assert.deepEqual(loaded.progress.mutations, ['speed']);
  assert.equal(loaded.life.biomass, 40);
  assert.equal(loaded.progress.stage, 1);
  for (let i = 0; i < 2; i++) {
    assert.ok(loaded.progress.offer.length);
    assert.ok(
      loaded.progress.offer.every((id) => !['armor', 'trail'].includes(id)),
    );
    assert.ok(chooseUpgrade(loaded.progress, loaded.progress.offer[0]));
  }
  assert.equal(loaded.progress.level, 3);
  assert.equal(loaded.progress.offer.length, 0);
  assert.equal(
    loaded.progress.xp,
    (journeyAdaptation(2) + journeyAdaptation(3)) / 2,
  );
  assert.equal(
    loadJourney(saveJourney(loaded.progress, loaded.life, w, true)).progress.xp,
    loaded.progress.xp,
  );
  assert.ok(!UPGRADES.some((u) => ['armor', 'trail'].includes(u.id)));
});

test('Long reach is offered only after hunting tentacles, and each choice extends the same distance', () => {
  for (let seed = 0; seed < 150; seed++)
    assert.ok(!offerUpgrades([], seed, 0).includes('tentacleReach'));
  assert.equal(validChoice([], 'tentacleReach', ['tentacleReach']), false);
  assert.ok(
    Array.from({ length: 100 }, (_, seed) =>
      offerUpgrades(['tentacles'], seed, 1),
    ).some((a) => a.includes('tentacleReach')),
  );
  const p = journeyLife(newJourney(4)),
    h = new HuntingTentacles();
  const food = { x: p.x + 60, y: p.y, r: 5, requiredMass: 0, eaten: false };
  h.update(1 / 60, p, [food], 1);
  assert.equal(h.arms[0].target, null);
  h.update(
    1 / 60,
    p,
    [food],
    1,
    upgradeStats(['tentacles', ...Array(4).fill('tentacleReach')])
      .tentacleReach,
  );
  assert.equal(h.arms[0].target, food);
});

test('Individual sizes vary deterministically, preserve area-based food requirements, and stay within species ranges', () => {
  for (const s of STAGE_SPECIES.flat()) {
    const sizes = new Set();
    for (let i = 0; i < 30; i++) {
      const e = journeyEntity(s, 0, 0, i * 0.211, 'same');
      assert.deepEqual(e, journeyEntity(s, 0, 0, i * 0.211, 'same'));
      assert.ok(e.r >= s.r * 0.88 && e.r <= s.r * 1.12);
      assert.ok(Math.abs(e.value / s.value - (e.r / s.r) ** 2) < 1e-9);
      if (s.requiredMass !== undefined)
        assert.ok(
          Math.abs(e.requiredMass - s.requiredMass * e.sizeFactor ** 2) < 1e-8,
        );
      sizes.add(e.r);
    }
    assert.ok(s.kind === 'final' ? sizes.size === 1 : sizes.size > 20);
  }
  assert.ok(
    SPECIES_BY_ID['water-10'].r * 1.12 < SPECIES_BY_ID['water-14'].r * 0.88,
  );
  assert.ok(
    SPECIES_BY_ID['land-6'].r * 1.12 < SPECIES_BY_ID['land-10'].r * 0.88,
  );
  assert.ok(SPECIES_BY_ID['city-2'].r < SPECIES_BY_ID['city-0'].r * 1.2);
});

test('Water is less crowded and sharks occupy under five percent of slots with at most one per chunk', () => {
  const w = new JourneyWorld(1834, [], 3);
  let sharks = 0,
    total = 0;
  for (let x = 20; x < 220; x++) {
    const entities = w.generate(x, 20, 0).entities;
    const count = entities.filter((e) =>
      ['water-12', 'water-13'].includes(e.kind),
    ).length;
    assert.ok(entities.length <= 12);
    assert.ok(count <= 1);
    total += entities.length;
    sharks += count;
  }
  assert.ok(sharks > 0 && sharks / total < 0.05);
});

test('Biomass fragments scatter before collection, survive reload and restore exactly the lost recoverable mass without XP', () => {
  const p = newJourney(12),
    l = journeyLife(p),
    w = new JourneyWorld(12);
  l.biomass = 20;
  l.radius = 76;
  l.hitAngle = 0;
  const bits = shedBiomass(l, 3, 'nutrient');
  const starts = bits.map((f) => ({ x: f.x, y: f.y }));
  assert.equal(beginAbsorb(l, bits[0]), false);
  for (let i = 0; i < 60; i++) moveFragments(bits, 1 / 60);
  bits.forEach((f, i) =>
    assert.ok(Math.hypot(f.x - starts[i].x, f.y - starts[i].y) > 45),
  );
  const saved = loadJourney(saveJourney(p, l, w, true, bits));
  assert.equal(saved.fragments.length, 5);
  for (const f of saved.fragments) {
    l.x = f.x;
    l.y = f.y;
    assert.ok(beginAbsorb(l, f));
    digest(l, 2);
  }
  assert.ok(Math.abs(l.biomass - 23) < 1e-8);
  assert.equal(l.adaptationGained, 0);
  const { game } = makeEngine();
  game.fragments = bits;
  game.food = bits;
  game.render();
  game.destroy();
});
