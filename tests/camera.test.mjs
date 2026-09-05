import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEngine } from './engine-fixture.mjs';

test('Original prototype framing remains 480 world units wide at every body size', () => {
  const { game } = makeEngine();
  game.started = true;
  game.world.stream = () => {};
  game.world.move = () => {};
  game.world.replenish = () => {};
  game.world.entities = [];
  assert.equal(game.zoom, 1);
  assert.equal(game.scale, 390 / 480);
  for (const radius of [15, 24, 48, 96, 150, 240]) {
    game.life.biomass = 8 * (radius / 48) ** 2;
    game.life.radius = radius;
    const mass = game.life.biomass;
    game.update(1 / 60);
    assert.equal(game.zoom, 1);
    assert.equal(game.life.biomass, mass);
  }
});
