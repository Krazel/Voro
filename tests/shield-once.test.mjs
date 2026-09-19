import test from 'node:test';
import assert from 'node:assert/strict';
import { newJourney, journeyLife, refreshOffer, chooseUpgrade, saveJourney, loadJourney } from '../app/journey-progress.mjs';
import { UPGRADES, offerUpgrades, journeyAdaptation, upgradeStats } from '../app/mutations.mjs';
import { JourneyWorld } from '../app/journey-world.mjs';
import { consumeShield } from '../app/shields.mjs';

test('Acquired shield is excluded across seeds, later levels, consumption and reload', () => {
  const p = newJourney(6);
  p.xp = journeyAdaptation(0);
  refreshOffer(p);
  assert.ok(p.offer.includes('shield'));
  assert.ok(chooseUpgrade(p, 'shield'));
  assert.ok(consumeShield(p, upgradeStats(p.mutations)));
  const restored = loadJourney(saveJourney(p, journeyLife(p), new JourneyWorld(6), false));
  assert.deepEqual(restored.progress.mutations, ['shield']);
  for (let seed = 0; seed < 100; seed++) for (let level = 1; level < 8; level++) {
    const offer = offerUpgrades(restored.progress.mutations, seed, level);
    assert.equal(offer.length, 3);
    assert.equal(new Set(offer).size, 3);
    assert.ok(!offer.includes('shield'));
  }
  restored.progress.offer = ['shield'];
  assert.equal(chooseUpgrade(restored.progress, 'shield'), false);
});

test('Legacy four shields migrate once, preserving other choices, body, XP and earliest recharge', () => {
  const p = newJourney(72);
  delete p.shieldChoiceVersion;
  p.mutations = ['speed', 'shield', 'shield', 'reach', 'shield', 'shield'];
  p.level = 6; p.xp = journeyAdaptation(5) + 7;
  p.shieldTimers = [33, 12, 39, 27];
  const life = journeyLife(p), world = new JourneyWorld(72);
  life.biomass = 40;
  const r = loadJourney(saveJourney(p, life, world, false));
  assert.deepEqual(r.progress.mutations, ['speed', 'shield', 'reach']);
  assert.equal(r.progress.level, 3);
  assert.equal(r.progress.xp, p.xp);
  assert.equal(r.life.biomass, 40);
  assert.deepEqual(r.progress.shieldTimers, [12]);
  assert.equal(r.progress.shieldChoiceVersion, 1);
  assert.ok(!r.progress.offer.includes('shield'));
  const again = loadJourney(saveJourney(r.progress, r.life, world, false));
  assert.deepEqual(again.progress, r.progress);
  for (let i = 0; i < 3; i++) assert.ok(chooseUpgrade(again.progress, again.progress.offer[0]));
  assert.equal(again.progress.level, 6);
});

test('Fully upgraded historical saves remain loadable after the shield cap changes', () => {
  const p = newJourney(3); delete p.shieldChoiceVersion;
  p.mutations = UPGRADES.flatMap(u => Array(u.id === 'shield' ? 4 : u.max).fill(u.id));
  p.level = p.mutations.length; p.xp = journeyAdaptation(p.level - 1);
  const r = loadJourney(saveJourney(p, journeyLife(p), new JourneyWorld(3), false));
  assert.ok(r);
  assert.equal(r.progress.mutations.filter(id => id === 'shield').length, 1);
  assert.deepEqual(r.progress.offer, []);
});
