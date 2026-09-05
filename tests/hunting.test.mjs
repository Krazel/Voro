import test from 'node:test';
import assert from 'node:assert/strict';
import { HuntingTentacles } from '../app/hunting-tentacles.mjs';
import {
  journeyLife,
  newJourney,
  loadJourney,
  saveJourney,
} from '../app/journey-progress.mjs';
import { JourneyWorld } from '../app/journey-world.mjs';
import {
  upgradeStats,
  journeyAdaptation,
  previousJourneyAdaptation,
} from '../app/mutations.mjs';
import { impulse, integrate, beginAbsorb } from '../app/simulation.mjs';
import { makeEngine } from './engine-fixture.mjs';

test('Tentacles extend before grabbing, haul edible prey and retract when it is eaten', () => {
  const p = journeyLife(newJourney(1)),
    arms = new HuntingTentacles();
  const food = { x: p.x + 68, y: p.y, r: 8, requiredMass: 0, eaten: false };
  const large = {
    x: p.x + 55,
    y: p.y + 10,
    r: 100,
    requiredMass: 90,
    eaten: false,
  };
  arms.update(1 / 60, p, [food, large], 3);
  assert.equal(food.x, p.x + 68, 'No pull before contact');
  assert.equal(arms.arms.filter((a) => a.target).length, 1);
  assert.equal(arms.arms[0].grip, 0);
  let touched = false;
  for (let i = 0; i < 150 && !food.eaten; i++) {
    arms.update(1 / 60, p, [food, large], 3);
    touched ||= arms.arms[0].grip > 0;
    beginAbsorb(p, food);
  }
  assert.ok(touched);
  assert.ok(food.eaten);
  assert.equal(p.digestion.length, 1);
  arms.update(1 / 60, p, [food, large], 3);
  assert.equal(arms.arms[0].target, null);
  assert.equal(large.x, p.x + 55);
  p.dead = true;
  arms.update(1 / 60, p, [large], 3);
  assert.equal(arms.arms.length, 0);
});
test('All three arms choose distinct targets; shrinking releases prey that is now too large', () => {
  const p = journeyLife(newJourney(2)),
    arms = new HuntingTentacles();
  const foods = Array.from({ length: 4 }, (_, i) => ({
    x: p.x + 50,
    y: p.y + i * 6,
    r: 10,
    requiredMass: 1.5,
    eaten: false,
  }));
  arms.update(1 / 60, p, foods, 3);
  assert.equal(new Set(arms.arms.map((a) => a.target)).size, 3);
  p.biomass = 1;
  arms.update(1 / 60, p, foods, 3);
  assert.ok(arms.arms.every((a) => a.target === null));
});
test('Starting impulse is mild and infrequent; every rank increases travel and reduces cooldown', () => {
  let previous = 0,
    previousCooldown = 10;
  for (let rank = 0; rank <= 3; rank++) {
    const progress = newJourney(1);
    progress.mutations = Array(rank).fill('dash');
    const p = journeyLife(progress);
    const start = p.x;
    assert.ok(impulse(p));
    assert.ok(!impulse(p));
    assert.ok(p.cooldown < previousCooldown);
    previousCooldown = p.cooldown;
    if (rank === 0) {
      assert.equal(p.boostStrength, 1.45);
      assert.equal(p.cooldown, 9);
      assert.equal(p.boost, 0.28);
    }
    for (let i = 0; i < 60; i++) integrate(p, 1 / 60, { x: 1, y: 0 });
    assert.ok(p.x - start > previous);
    previous = p.x - start;
  }
  assert.equal(upgradeStats(['dash', 'dash', 'dash']).cooldownFactor * 9, 3);
});
test('Current saved cadence migrates once preserving fraction and existing pending reroll', () => {
  const p = newJourney(7);
  p.mutations = ['reach'];
  p.level = 1;
  p.adaptationVersion = 2;
  p.xp = (previousJourneyAdaptation(0) + previousJourneyAdaptation(1)) / 2;
  const l = journeyLife(p),
    w = new JourneyWorld(7);
  const loaded = loadJourney(saveJourney(p, l, w, true));
  assert.equal(
    loaded.progress.xp,
    (journeyAdaptation(0) + journeyAdaptation(1)) / 2,
  );
  assert.equal(loaded.progress.adaptationVersion, 3);
  assert.deepEqual(loaded.progress.mutations, ['reach']);
  const again = loadJourney(saveJourney(loaded.progress, loaded.life, w, true));
  assert.equal(again.progress.xp, loaded.progress.xp);
});
test('Actual engine renders tentacle geometry without invalid values and clears arms on reset', () => {
  const { game: g } = makeEngine();
  g.action('start');
  g.progress.mutations = ['tentacles'];
  g.progress.level = 1;
  g.stats = upgradeStats(g.progress.mutations);
  const food = {
    x: g.life.x + 60,
    y: g.life.y,
    r: 8,
    requiredMass: 0,
    eaten: false,
  };
  for (let i = 0; i < 25; i++)
    g.huntingTentacles.update(1 / 60, g.life, [food], 1);
  g.render();
  assert.equal(g.huntingTentacles.arms.length, 1);
  g.action('restart');
  assert.equal(g.huntingTentacles.arms.length, 0);
  g.destroy();
});
