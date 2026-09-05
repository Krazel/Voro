import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UPGRADES,
  upgradeStats,
  journeyAdaptation,
} from '../app/mutations.mjs';
import {
  newJourney,
  chooseUpgrade,
  saveJourney,
  loadJourney,
} from '../app/journey-progress.mjs';
import { syncShields, consumeShield } from '../app/shields.mjs';
import { makeEngine } from './engine-fixture.mjs';

test('Every repeated choice adds the same concrete bonus', () => {
  const effect = {
    reach: ['reachFactor', 0.075],
    slots: ['absorptionSlots', 1],
    digest: ['digestFactor', 0.125],
    yield: ['yieldFactor', 0.06],
    speed: ['speedFactor', 0.075],
    turn: ['steeringFactor', 0.15],
    dash: ['boostStrength', 0.18],
    pull: ['attraction', 14],
    shield: ['shieldCapacity', 1],
    recycle: ['recycleFraction', 0.125],
    spikes: ['spikeFraction', 0.06],
    tentacleReach: ['tentacleReach', 0.15],
    tentacles: ['tentacles', 1],
    combo: ['digestFactor', 0.1],
  };
  for (const u of UPGRADES)
    for (let i = 1; i <= u.max; i++) {
      const [key, delta] = effect[u.id],
        before = upgradeStats(Array(i - 1).fill(u.id), true),
        after = upgradeStats(Array(i).fill(u.id), true);
      assert.ok(Math.abs(after[key] - before[key] - delta) < 1e-9, u.id);
      assert.ok(!/nivel|\d\s*\/\s*\d/.test(u.detail), u.id);
    }
});

test('Real damage removes the same fraction of unspent adaptation progress and persists it', () => {
  const { game: g } = makeEngine();
  g.progress.mutations = ['speed', 'reach'];
  g.progress.level = 2;
  const floor = journeyAdaptation(1);
  g.progress.xp = floor + 20;
  g.life.biomass = 100;
  g.life.invulnerable = 0;
  const hit = { x: g.life.x + 20, y: g.life.y };
  assert.equal(g.receiveHit(hit, 0.25, 0), 25);
  assert.equal(g.progress.xp, floor + 15);
  assert.equal(g.progress.level, 2);
  assert.equal(g.receiveHit(hit, 0.25, 0), 0);
  assert.equal(g.progress.xp, floor + 15);
  const restored = loadJourney(saveJourney(g.progress, g.life, g.world, true));
  assert.equal(restored.progress.xp, floor + 15);
  g.life.invulnerable = 0;
  g.receiveHit(hit, 1, 0);
  assert.equal(g.progress.xp, floor);
  assert.deepEqual(g.progress.mutations, ['speed', 'reach']);
  g.destroy();
});

test('Each shield selection grants one equal charge; timers and old saves survive reload', () => {
  const p = newJourney(12);
  for (let i = 0; i < 2; i++) {
    p.offer = ['shield'];
    assert.ok(chooseUpgrade(p, 'shield'));
    const stats = upgradeStats(p.mutations);
    assert.equal(stats.shieldCooldown, 40);
    assert.equal(p.shieldTimers.length, i + 1);
  }
  const stats = upgradeStats(p.mutations);
  assert.ok(consumeShield(p, stats));
  syncShields(p, stats, 5);
  assert.ok(consumeShield(p, stats));
  assert.deepEqual(p.shieldTimers, [35, 40]);
  assert.equal(consumeShield(p, stats), false);
  syncShields(p, stats, 35);
  assert.ok(consumeShield(p, stats));
  const { game: g } = makeEngine();
  g.progress = p;
  const raw = saveJourney(p, g.life, g.world, true),
    restored = loadJourney(raw);
  assert.deepEqual(restored.progress.shieldTimers, p.shieldTimers);
  const legacy = JSON.parse(raw);
  delete legacy.progress.shieldTimers;
  legacy.progress.shieldRecharge = 13;
  assert.deepEqual(
    loadJourney(JSON.stringify(legacy)).progress.shieldTimers,
    [13, 13],
  );
  g.destroy();
});

test('Shielded hits cost no biomass or adaptation progress', () => {
  const { game: g } = makeEngine();
  g.progress.mutations = ['shield'];
  g.progress.level = 1;
  g.stats = upgradeStats(g.progress.mutations);
  g.progress.xp = journeyAdaptation(0) + 10;
  const xp = g.progress.xp,
    mass = g.life.biomass;
  assert.equal(g.receiveHit({ x: g.life.x + 20, y: g.life.y }, 0.25, 0), 0);
  assert.equal(g.progress.xp, xp);
  assert.equal(g.life.biomass, mass);
  g.destroy();
});
