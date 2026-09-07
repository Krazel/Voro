import test from 'node:test';
import assert from 'node:assert/strict';
import { coastX, coastHabitat } from '../app/coast-preview.mjs';

test('Experimental coast stays continuous across positive and negative material and region boundaries', () => {
  for (let y = -15000; y <= 15000; y += 1) {
    assert.ok(Number.isFinite(coastX(y)));
    assert.ok(Math.abs(coastX(y + .01) - coastX(y - .01)) < .04);
    assert.equal(coastHabitat(coastX(y) - 100, y), 'Arena seca');
    assert.equal(coastHabitat(coastX(y) - 30, y), 'Arena húmeda');
    assert.equal(coastHabitat(coastX(y) + 100, y), 'Agua');
  }
  assert.notEqual(coastX(0), coastX(2400), 'The old repeated coastline period is gone');
});
