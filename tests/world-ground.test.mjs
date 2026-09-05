import test from 'node:test';
import assert from 'node:assert/strict';
import { groundPatch, GROUND_PROFILES } from '../app/world-ground.mjs';
import { STAGES, SPECIES_BY_ID } from '../app/journey-data.mjs';
import { makeEngine } from './engine-fixture.mjs';

test('All non-microscopic backgrounds stream stable varied regions and retain the shore orientation', () => {
  assert.deepEqual(
    Object.keys(GROUND_PROFILES),
    STAGES.slice(1).map((s) => s.id),
  );
  for (const stage of Object.keys(GROUND_PROFILES)) {
    const seen = new Set();
    for (let x = -20; x < 20; x++) {
      const patch = groundPatch(stage, x, 8, 71);
      seen.add(patch.variant);
      assert.deepEqual(patch, groundPatch(stage, x, 8, 71));
      if (stage === 'land') {
        assert.equal(patch.flipX, false);
        assert.equal(patch.turn, 0);
      }
    }
    assert.equal(seen.size, 8);
  }
  assert.notDeepEqual(
    groundPatch('water', 40, -9, 71),
    groundPatch('water', 40, -9, 72),
  );
});

test('Background streaming remains bounded through every sandbox biome and leaves microscope untouched', () => {
  const { game } = makeEngine();
  game.drawBackground(0);
  assert.equal(game.worldGround.cache.size, 0);
  for (let stage = 1; stage < STAGES.length; stage++) {
    game.camera = { x: -1874.3, y: -2351.7 };
    game.zoom = 0.65;
    game.drawBackground(stage);
    assert.ok(game.worldGround.cache.size <= 3);
  }
  const entries = game.worldGround.cache.size;
  game.drawBackground(0);
  assert.equal(game.worldGround.cache.size, entries);
  game.destroy();
});

test('Loose plants and coral have sensible proportions next to marine fish', () => {
  const s = SPECIES_BY_ID;
  assert.ok(s['water-matter-kelp'].r / s['water-2'].r < 2.5);
  assert.ok(s['water-matter-coral'].r <= 2 * s['water-2'].r);
  assert.ok(s['water-1'].r < s['water-2'].r);
  assert.ok(s['water-2'].r < s['water-14'].r);
  assert.ok(s['water-14'].r < s['water-12'].r);
  assert.ok(s['land-matter-leaf'].r < s['land-10'].r);
});
