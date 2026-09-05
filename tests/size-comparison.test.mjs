import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGE_SPECIES } from '../app/journey-data.mjs';
import { sizeRange, comparisonScale } from '../app/entity-sizes.mjs';
import { journeyEntity } from '../app/journey-world.mjs';
import { newJourney, journeyLife } from '../app/journey-progress.mjs';
import { integrate, impulse } from '../app/simulation.mjs';

test('Every gallery size range matches generated inhabitants and a single common scale preserves proportions', () => {
  for (const list of STAGE_SPECIES) {
    const scale = comparisonScale(list);
    for (const s of list) {
      const bounds = sizeRange(s);
      assert.ok(bounds.min > 0 && bounds.max >= bounds.min);
      assert.ok(bounds.max * scale <= 145.001);
      for (let i = 0; i < 100; i++) {
        const entity = journeyEntity(s, 0, 0, i / 17, 'size-check');
        assert.ok(entity.r >= bounds.min && entity.r <= bounds.max);
      }
      assert.ok(
        Math.abs(
          (bounds.max * scale) / (sizeRange(list[0]).max * scale) -
            bounds.max / sizeRange(list[0]).max,
        ) < 1e-9,
      );
      if (s.kind === 'final') assert.equal(bounds.min, bounds.max);
    }
  }
});

test('Starting dash travels slightly less than the original, more than the weak version, and recharges in seven seconds', () => {
  function travel(strength) {
    const p = journeyLife(newJourney(1));
    p.boostStrength = strength;
    for (let i = 0; i < 120; i++) integrate(p, 1 / 60, { x: 1, y: 0 });
    const start = p.x;
    impulse(p);
    assert.equal(p.cooldown, 7);
    for (let i = 0; i < 120; i++) integrate(p, 1 / 60, { x: 1, y: 0 });
    return p.x - start;
  }
  const baseline = travel(1),
    old = travel(2.8),
    weak = travel(1.45),
    current = travel(journeyLife(newJourney(1)).boostStrength);
  assert.ok(current < old && current > weak);
  assert.ok((current - baseline) / (old - baseline) > 0.8);
  assert.ok((current - baseline) / (old - baseline) < 0.9);
});
