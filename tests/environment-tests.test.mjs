import { gameplayZoom } from '../app/camera.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEngine } from './engine-fixture.mjs';
import { STAGES, stageStartMass } from '../app/journey-data.mjs';
import {
  JOURNEY_SAVE,
  journeyLife,
  newJourney,
} from '../app/journey-progress.mjs';
import { radiusForMass } from '../app/simulation.mjs';

test('Every environment and size can be tested without altering or overwriting the saved campaign', () => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (k) => storage.get(k) || null,
    setItem: (k, v) => storage.set(k, v),
  };
  const { game } = makeEngine();
  game.action('start');
  game.progress.mutations = ['tentacles', 'dash'];
  game.progress.level = 2;
  game.progress.xp = 40;
  game.life.biomass = 19;
  game.life.elapsed = 50;
  const originalLife = game.life,
    originalWorld = game.world,
    originalProgress = game.progress;
  game.save();
  const saved = storage.get(JOURNEY_SAVE);
  for (let stage = 0; stage < STAGES.length; stage++) {
    for (const mass of [
      stageStartMass(stage),
      STAGES[stage].goal / 2,
      STAGES[stage].goal * 1.5,
    ]) {
      assert.ok(game.startTest(stage, mass));
      assert.equal(game.progress.stage, stage);
      assert.equal(game.life.radius, radiusForMass(mass));
      assert.equal(game.zoom, gameplayZoom(game.life.radius));
      assert.deepEqual(game.progress.mutations, ['tentacles', 'dash']);
      game.update(1 / 60);
      game.save();
      assert.equal(game.transition, 0);
      assert.equal(game.progress.offer.length, 0);
      assert.equal(storage.get(JOURNEY_SAVE), saved);
    }
  }
  assert.ok(game.exitTest());
  assert.equal(game.life, originalLife);
  assert.equal(game.world, originalWorld);
  assert.equal(game.progress, originalProgress);
  assert.equal(game.life.biomass, 19);
  assert.equal(game.life.elapsed, 50);
  assert.equal(game.testMode, false);
  assert.equal(game.zoom, gameplayZoom(game.life.radius));
  game.destroy();
  delete globalThis.localStorage;
});

test('Test controls reject invalid inputs, can disable upgrades and damage, and never trigger evolution', () => {
  const { game } = makeEngine();
  assert.equal(game.startTest(-1, 3), false);
  assert.equal(game.startTest(0, NaN), false);
  assert.equal(game.testMode, false);
  game.progress = newJourney(5);
  game.life = journeyLife(game.progress);
  game.progress.mutations = ['shield'];
  assert.ok(game.startTest(4, 20, false, true));
  assert.deepEqual(game.progress.mutations, []);
  const hit = { x: game.life.x + 30, y: game.life.y };
  assert.equal(game.receiveHit(hit, 0.25, 0), 0);
  assert.ok(game.startTest(4, 20, false, false));
  assert.equal(game.receiveHit(hit, 0.25, 0), 5);
  game.beginEvolution();
  assert.equal(game.transition, 0);
  game.life.invulnerable = 0;
  game.receiveHit(hit, 1, 0);
  assert.ok(game.life.dead);
  assert.ok(game.startTest(1, 5));
  assert.equal(game.life.dead, false);
  assert.ok(game.exitTest());
  assert.equal(game.exitTest(), false);
  game.destroy();
});
