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
    [2, 3, 4],
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
test('Old capped repetitions become available choices without resetting size, XP or stage', () => {
  const p = newJourney(40);
  delete p.upgradeLimitsVersion;
  p.stage = 3;
  p.mutations = ['shield', 'shield', 'shield', 'dash', 'dash', 'dash'];
  p.level = 6;
  p.xp = journeyAdaptation(5) + 10;
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
  assert.equal(loaded.progress.rerollUsed, false);
  for (let i = 0; i < 2; i++)
    assert.ok(chooseUpgrade(loaded.progress, loaded.progress.offer[0]));
  assert.equal(loaded.progress.level, 6);
  assert.equal(loaded.progress.offer.length, 0);
  const again = loadJourney(saveJourney(loaded.progress, loaded.life, w, true));
  assert.deepEqual(again.progress.mutations, loaded.progress.mutations);
  assert.equal(again.progress.xp, p.xp);
  const invalid = JSON.parse(saveJourney(p, l, w, true));
  invalid.progress.upgradeLimitsVersion = 1;
  assert.equal(loadJourney(JSON.stringify(invalid)), null);
});
