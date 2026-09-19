import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewEligible, reviewQuiet } from '../app/review-policy.mjs';
const state = { started: true, stage: 2, assetsReady: true, offer: [] };
test('third environment milestone excludes previews and earlier environments', () => {
  assert.equal(reviewEligible({ ...state, stage: 1 }), false);
  assert.equal(reviewEligible({ ...state, testMode: true }), false);
  assert.equal(reviewEligible({ ...state, started: false }), false);
  assert.equal(reviewEligible(state), true);
  assert.equal(reviewEligible({ ...state, stage: 4 }), true);
});
test('review waits for safe gameplay and all overlays/transitions to finish', () => {
  assert.equal(reviewQuiet(state), true);
  for (const patch of [{ paused: true }, { dead: true }, { complete: true },
    { ending: 1 }, { transition: 1 }, { offer: ['shield'] }, { assetsReady: false },
    { assetError: true }, { hurt: 1 }, { hint: 'Evolution' }]) {
    assert.equal(reviewQuiet({ ...state, ...patch }), false, JSON.stringify(patch));
  }
  assert.equal(reviewQuiet(state, true), false);
  assert.equal(reviewQuiet(state, false, false), false);
});
