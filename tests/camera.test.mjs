import test from 'node:test';
import assert from 'node:assert/strict';
import { growthZoom } from '../app/camera.mjs';
import { makeEngine } from './engine-fixture.mjs';

test('Camera pulls back before the old threshold, while the protagonist still visibly grows', () => {
  let previousZoom = Infinity,
    previousSize = 0;
  for (const radius of [15, 24, 32, 48, 72, 96, 150, 240, 360, 600]) {
    const zoom = growthZoom(radius),
      size = radius * zoom;
    assert.ok(zoom <= previousZoom);
    assert.ok(size >= previousSize - 1e-9 && size <= 80 + 1e-9);
    previousZoom = zoom;
    previousSize = size;
  }
  assert.ok(growthZoom(32) < growthZoom(24));
  assert.ok(growthZoom(48) < growthZoom(32));
});

test('Actual camera eases toward its growth framing without modifying biomass', () => {
  const { game } = makeEngine();
  game.started = true;
  game.world.stream = () => {};
  game.world.move = () => {};
  game.world.replenish = () => {};
  game.world.entities = [];
  game.life.biomass = 8;
  game.life.radius = 48;
  const mass = game.life.biomass,
    initial = game.zoom;
  game.update(1 / 60);
  assert.ok(game.zoom < initial && game.zoom > growthZoom(48));
  assert.equal(game.life.biomass, mass);
});
