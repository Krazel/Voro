import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEngine } from './engine-fixture.mjs';
import { gameplayZoom } from '../app/camera.mjs';

test('Camera reveals more world with growth, keeps the newborn small, and fits the mature body', () => {
  const { game } = makeEngine();
  game.saved = true;
  assert.equal(game.zoom, 0.85);
  assert.equal(game.scale, 390 / 480);
  let previousZoom = 1,
    previousScreenSize = 0;
  for (const radius of [11, 24, 48, 96, 150, 240]) {
    game.life.radius = radius;
    const before = game.zoom;
    game.update(1 / 60);
    assert.ok(
      Math.abs(game.zoom - before) < 0.02,
      'Camera eases instead of jumping',
    );
    for (let i = 0; i < 600; i++) game.update(1 / 60);
    assert.ok(Math.abs(game.zoom - gameplayZoom(radius)) < 1e-6);
    assert.ok(game.zoom <= previousZoom);
    assert.ok(radius * game.zoom <= 78.001);
    assert.ok(radius * game.zoom >= previousScreenSize - 0.001);
    previousZoom = game.zoom;
    previousScreenSize = radius * game.zoom;
  }
  game.destroy();
});
