import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGN_PACING, ADAPTATION_FOOD_GAIN, adaptationYield } from '../app/campaign-pacing.mjs';

test('Food XP matches the pre-20-percent-reduction version in every stage, independently of duration calibration', () => {
  // Historical 2993110 inputs; deliberately separate from current biomass yields.
  const historical = {micro:.13,pond:.16,land:.16,water:.136,city:.104,orbit:.32,planets:.2,stars:.23,galaxies:.3,universe:.3};
  for (const [id, reference] of Object.entries(historical)) {
    const expected = .85 * Math.sqrt(reference);
    assert.equal(ADAPTATION_FOOD_GAIN * adaptationYield(id), expected, id);
    const previous = CAMPAIGN_PACING[id].biomass;
    try {
      CAMPAIGN_PACING[id].biomass = .01;
      assert.equal(ADAPTATION_FOOD_GAIN * adaptationYield(id), expected, 'Biomass rebalancing must not alter XP: ' + id);
    } finally {
      CAMPAIGN_PACING[id].biomass = previous;
    }
  }
});
