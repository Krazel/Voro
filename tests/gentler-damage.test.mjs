import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEngine } from './engine-fixture.mjs';
import { STAGES, stageStartMass } from '../app/journey-data.mjs';
import { adaptationYield } from '../app/campaign-pacing.mjs';

test('All environments turn a 25% hit into 15%, with equally reduced minimum damage and unspent XP loss', () => {
  const { game } = makeEngine();
  try {
    for (let stage = 0; stage < STAGES.length; stage++) {
      for (const mass of [2, 100]) {
        game.startTest(stage, mass, false, false, true);
        game.progress.xp = 20;
        const before = game.life.biomass;
        const oldLoss = Math.max(0.6, before * 0.25);
        const lost = game.receiveHit({ x: game.life.x + 40, y: game.life.y }, 0.25);
        assert.ok(Math.abs(lost - oldLoss * 0.60) < 1e-9, STAGES[stage].id);
        assert.ok(Math.abs(game.progress.xp - 20 * (1 - lost / before)) < 1e-9);
        assert.equal(game.receiveHit({ x: 0, y: 0 }, 0.25), 0);
        assert.equal(game.progress.mutations.length, 0);
      }
    }
  } finally { game.destroy(); }
});

test('Ordinary food earns 10% more adaptation progress in every environment without changing biomass rewards', () => {
  const { game } = makeEngine();
  try {
    for (let stage = 0; stage < STAGES.length; stage++) {
      game.startTest(stage, stageStartMass(stage), false, true, true);
      game.world.entities = [];
      game.world.stream = () => {};
      game.life.digestion = [{ progress: .99, value: 1, r: 1, dx: 0, dy: 0, rotation: 0, kind: 'nutrient' }];
      const mass = game.life.biomass, xp = game.progress.xp, growth = game.life.growthFactor;
      game.update(.1);
      assert.ok(Math.abs(game.progress.xp - xp - 0.68 * 1.1 * adaptationYield(STAGES[stage].id)) < 1e-9, STAGES[stage].id);
      assert.ok(Math.abs(game.life.biomass - mass - growth) < 1e-9);
    }
  } finally { game.destroy(); }
});
