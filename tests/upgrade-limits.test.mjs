import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UPGRADES,
  upgradeStats,
  offerUpgrades,
  validChoice,
  journeyAdaptation,
  MAX_UPGRADE_CHOICES,
} from '../app/mutations.mjs';
import {
  newJourney,
  journeyLife,
  saveJourney,
  loadJourney,
  chooseUpgrade,
} from '../app/journey-progress.mjs';
import { JourneyWorld } from '../app/journey-world.mjs';

test('Individual caps govern effects, offers and choices, including rerolls', () => {
  assert.deepEqual(
    [...new Set(UPGRADES.map((u) => u.max))].sort((a, b) => a - b),
    [4, 6, 8],
  );
  for (const u of UPGRADES) {
    const chosen = Array(u.max).fill(u.id);
    if (u.requires) chosen.push(u.requires);
    assert.deepEqual(
      upgradeStats([...chosen, u.id], true),
      upgradeStats(chosen, true),
      u.id,
    );
    assert.equal(validChoice(chosen, u.id, [u.id]), false, u.id);
    for (let seed = 0; seed < 20; seed++)
      for (const excluded of [[], ['speed', 'slots', 'yield']])
        assert.ok(
          !offerUpgrades(chosen, seed, chosen.length, excluded).includes(u.id),
          u.id,
        );
  }
  const all = UPGRADES.flatMap((u) => Array(u.max).fill(u.id));
  assert.equal(all.length, MAX_UPGRADE_CHOICES);
  assert.deepEqual(offerUpgrades(all, 1, all.length), []);
});
test('Previously capped saves keep their progress and can acquire more of the same upgrades', () => {
  const p = newJourney(40);
  p.stage = 3;
  p.mutations = ['shield', 'shield', 'dash', 'dash'];
  p.level = 4;
  p.xp = journeyAdaptation(4) + 10;
  p.shieldTimers = [36, 0];
  p.shieldRecharge = 0;
  p.rerollUsed = true;
  const l = journeyLife(p);
  l.biomass = 45;
  const w = new JourneyWorld(40, [], 3),
    loaded = loadJourney(saveJourney(p, l, w, true));
  assert.ok(loaded);
  assert.equal(loaded.life.biomass, 45);
  assert.equal(loaded.progress.stage, 3);
  assert.equal(loaded.progress.xp, p.xp);
  assert.equal(loaded.progress.level, 4);
  assert.equal(loaded.progress.rerollUsed, true);
  assert.deepEqual(loaded.progress.mutations, p.mutations);
  assert.deepEqual(loaded.progress.shieldTimers, [36, 0]);
  assert.ok(validChoice(loaded.progress.mutations, 'dash', ['dash']));
  loaded.progress.offer = ['dash'];
  assert.ok(chooseUpgrade(loaded.progress, 'dash'));
  const again = loadJourney(saveJourney(loaded.progress, loaded.life, w, true));
  assert.equal(again.progress.level, 5);
  assert.deepEqual(again.progress.mutations, loaded.progress.mutations);
  for (const u of UPGRADES) {
    const invalid = JSON.parse(saveJourney(p, l, w, true));
    invalid.progress.mutations = Array(u.max + 1).fill(u.id);
    invalid.progress.level = u.max + 1;
    assert.equal(loadJourney(JSON.stringify(invalid)), null, u.id);
  }
});
