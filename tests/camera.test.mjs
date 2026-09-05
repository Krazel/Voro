import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEngine } from './engine-fixture.mjs';
import { gameplayZoom, followGameplayZoom } from '../app/camera.mjs';
test('Newborn framing is unchanged; growth opens smoothly without hiding body growth', () => {
  assert.equal(gameplayZoom(11), 1);
  assert.equal(gameplayZoom(24), 1);
  assert.equal(gameplayZoom(42), 1);
  let previous = 1,
    screenRadius = 0;
  for (const radius of [24, 42, 60, 96, 150, 240, 320]) {
    const z = gameplayZoom(radius);
    assert.ok(z >= 0.5 && z <= previous);
    assert.ok(radius * z > screenRadius);
    previous = z;
    screenRadius = radius * z;
  }
  let a = 1,
    b = 1;
  for (let i = 0; i < 60; i++) a = followGameplayZoom(a, 150, 1 / 30);
  for (let i = 0; i < 120; i++) b = followGameplayZoom(b, 150, 1 / 60);
  assert.ok(Math.abs(a - b) < 1e-10);
  assert.ok(a > gameplayZoom(150) && a < 1);
  assert.ok(followGameplayZoom(a, 24, 1 / 60) > a);
});
test('Engine eases camera after growth, damage and the end of cinematics', () => {
  const { game } = makeEngine();
  game.saved = true;
  assert.equal(game.zoom, 1);
  assert.equal(game.scale, 390 / 480);
  game.life.radius = 200;
  game.zoom = 1;
  game.update(1 / 60);
  assert.ok(game.zoom < 1 && game.zoom > 0.98);
  game.transition = 0.01;
  game.transitionAdvanced = true;
  game.zoom = 0.7;
  game.update(1 / 60);
  assert.equal(game.transition, 0);
  assert.ok(Math.abs(game.zoom - 0.7) < 0.01);
  game.destroy();
});
