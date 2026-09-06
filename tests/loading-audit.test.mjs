import test from 'node:test';
import assert from 'node:assert/strict';
import { StageAssets, stageResources } from '../app/stage-assets.mjs';
import { FrameMonitor } from '../app/frame-monitor.mjs';
import { makeEngine } from './engine-fixture.mjs';
import { MicroWorld } from '../app/micro-world.mjs';
import { JourneyWorld } from '../app/journey-world.mjs';

test('Stage loading is limited to two decodes, waits for decode and includes both swimmers', async () => {
  const created = [];
  const loader = new StageAssets({}, {}, () => {}, () => {
    const image = { complete: false, naturalWidth: 100, decode: () => new Promise(resolve => { image.resolve = resolve; }) };
    created.push(image);
    return image;
  });
  loader.setStages([0]);
  assert.equal(created.filter(i => i.src).length, 2);
  assert.equal(loader.ready(0), false);
  created[0].onload();
  assert.equal(loader.ready(0), false);
  created[0].resolve();
  await Promise.resolve();
  assert.equal(created.filter(i => i.src).length, 3);
  created[1].onload(); created[2].onload();
  created[1].resolve(); created[2].resolve();
  await Promise.resolve();
  assert.equal(loader.ready(0), true);
  assert.equal(loader.stats().images, 3);
  const seaKeys = stageResources(3).map(r => r.key);
  assert.ok(seaKeys.includes('swimmer') && seaKeys.includes('femaleSwimmer'));
  loader.destroy();
});

test('Stage changes discard stale arrivals, retain shared images and surface decode failures', async () => {
  const atlases = {}, grounds = {}, created = [];
  let notifications = 0;
  const loader = new StageAssets(atlases, grounds, () => notifications++, () => {
    const i = { complete: false, naturalWidth: 100, decode: () => Promise.reject(new Error('bad image')) };
    created.push(i); return i;
  });
  loader.setStages([0]);
  const shared = atlases.naturalMatter;
  loader.setStages([2]);
  assert.equal(atlases.naturalMatter, shared);
  assert.equal(atlases.micro, undefined);
  created[0].onload(); // micro is no longer wanted
  await Promise.resolve(); await Promise.resolve();
  assert.equal(notifications, 0);
  shared.onload();
  await Promise.resolve(); await Promise.resolve();
  assert.equal(loader.failed(2), true);
  assert.equal(loader.ready(2), false);
  loader.destroy();
  const before = notifications;
  for (const i of created) i.onerror?.();
  assert.equal(notifications, before);
});

test('Engine loads only microscope art initially and no gameplay asset uses a remote origin', () => {
  const { game } = makeEngine();
  assert.equal(game.assets.stats().images, 3);
  assert.deepEqual(Object.keys(game.atlasImages).sort(), ['micro', 'naturalMatter']);
  for (let i = 0; i < 10; i++)
    for (const r of stageResources(i)) assert.ok(r.url.startsWith('./'));
  game.startTest(3, 2);
  assert.ok(game.atlasImages.femaleSwimmer);
  assert.equal(game.atlasImages.micro, undefined);
  assert.equal(game.assetsReady, true);
  game.destroy();
});

test('Regrowth does not rebuild intact chunks but depleted slots still return after expiry', () => {
  const world = new MicroWorld(834);
  world.stream(0, 0, 0);
  const original = world.generate.bind(world);
  let calls = 0;
  world.generate = (...args) => { calls++; return original(...args); };
  world.replenish(0, 0, 8);
  assert.equal(calls, 0);
  const food = world.entities.find(e => Math.hypot(e.x, e.y) > 400);
  world.eat(food, 0);
  world.replenish(0, 0, 8);
  assert.ok(calls > 0);
  assert.ok(!world.entities.some(e => e.id === food.id));
  world.replenish(0, 0, 160);
  assert.ok(world.entities.some(e => e.id === food.id && !e.eaten));
});

test('Frame diagnostics use a bounded rolling window and separate CPU from frame cadence', () => {
  const m = new FrameMonitor();
  for (let i = 0; i < 180; i++) m.add(1000 / 60, 4);
  assert.deepEqual(m.report(), { fps: 60, cpu: 4, peak: 17 });
  m.add(100, 7);
  assert.equal(m.report().peak, 100);
  assert.equal(m.count, 120);
  m.reset();
  assert.deepEqual(m.report(), { fps: 0, cpu: 0, peak: 0 });
});

test('Consumed slots still regrow after leaving and reloading a chunk in every biome', () => {
  for (let stage = 0; stage < 10; stage++) {
    const world = new JourneyWorld(834, [], stage);
    world.stream(0, 0, 0);
    const food = world.entities.find(e => Math.hypot(e.x, e.y) > 400);
    world.eat(food, 0);
    world.stream(100000, 100000, 4);
    world.stream(0, 0, 8);
    assert.ok(!world.entities.some(e => e.id === food.id));
    world.replenish(0, 0, 160);
    assert.ok(world.entities.some(e => e.id === food.id && !e.eaten), 'stage ' + stage);
  }
});
