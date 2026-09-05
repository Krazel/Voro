import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEngine } from './engine-fixture.mjs';
import { gameplayZoom } from '../app/camera.mjs';

test('Original prototype zoom is exactly one at startup, for every body size, and after cinematics', () => {
  const { game } = makeEngine();
  game.saved = true;
  assert.equal(game.zoom, 1);
  assert.equal(game.scale, 390 / 480);
  for (const radius of [11, 24, 48, 96, 150, 240, 320]) {
    game.life.radius = radius;
    assert.equal(gameplayZoom(radius), 1);
    game.zoom = 0.4;
    game.update(1 / 60);
    assert.equal(game.zoom, 1);
    assert.equal(480 / game.zoom, 480);
  }
  game.transition = 0.01;
  game.transitionAdvanced = true;
  game.zoom = 0.7;
  game.update(1 / 60);
  assert.equal(game.transition, 0);
  assert.equal(game.zoom, 1);
  game.destroy();
});
