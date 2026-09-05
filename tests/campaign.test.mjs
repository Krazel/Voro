import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STAGES,
  newCampaign,
  stageLife,
  advanceCampaign,
  encodeSave,
  decodeSave,
  physicalSize,
} from '../app/campaign.mjs';
import {
  beginAbsorb,
  digest,
  integrate,
  takeDamage,
} from '../app/simulation.mjs';

test('Each of the six stages requires feeding; mutations persist through every transition', () => {
  const campaign = newCampaign();
  for (let stage = 0; stage < 6; stage++) {
    const life = stageLife(campaign);
    assert.equal(advanceCampaign(campaign, life, 'flow'), false);
    while (life.biomass < life.goalMass) {
      assert.ok(beginAbsorb(life, { x: life.x, y: life.y, eaten: false }));
      digest(life, 2);
      integrate(life, 0.04, { x: 0, y: 0 });
    }
    for (let i = 0; i < 60; i++) {
      integrate(life, 0.04, { x: 0, y: 0 });
      digest(life, 0.04);
    }
    if (stage === 5) {
      assert.equal(
        life.complete,
        false,
        'Final stage waits for Gaia even at full mass',
      );
      assert.ok(
        beginAbsorb(life, {
          x: life.x,
          y: life.y,
          eaten: false,
          final: true,
          value: 12,
          requiredMass: 56,
          kind: 'gaia',
          r: 104,
        }),
      );
      digest(life, 2);
      assert.ok(life.complete && life.finalEaten);
      assert.equal(advanceCampaign(campaign, life, 'flow'), false);
    } else {
      assert.ok(life.complete);
      assert.ok(
        advanceCampaign(campaign, life, ['flow', 'shell', 'hunger'][stage % 3]),
      );
      assert.equal(campaign.mutations.length, stage + 1);
    }
  }
  assert.equal(campaign.stage, 5);
  assert.ok(stageLife(campaign).speedFactor > 1);
  assert.ok(stageLife(campaign).damageFactor < 1);
  assert.ok(stageLife(campaign).digestFactor > 1);
});

test('Food too large cannot be eaten; a large meal contributes its value only after digestion', () => {
  const life = stageLife({ ...newCampaign(), stage: 3 });
  const tower = {
    x: life.x,
    y: life.y,
    eaten: false,
    kind: 'tower',
    requiredMass: 22,
    value: 5,
    r: 39,
  };
  assert.equal(beginAbsorb(life, tower), false);
  life.biomass = 23;
  assert.ok(beginAbsorb(life, tower));
  assert.equal(life.digestion[0].kind, 'tower');
  digest(life, 0.5);
  assert.equal(life.biomass, 23);
  digest(life, 2);
  assert.equal(life.biomass, 28);
  digest(life, 2);
  assert.equal(life.biomass, 28);
});

test('Saved wounded and completed campaigns resume with correct size, stage and mutations; malformed data is rejected', () => {
  const campaign = {
    ...newCampaign(),
    stage: 2,
    mutations: ['shell', 'hunger'],
    totalEaten: 40,
    totalTime: 180,
  };
  const life = stageLife(campaign);
  life.biomass = 24;
  life.x = 360;
  life.y = 810;
  const before = physicalSize(2, life.biomass);
  takeDamage(life, { x: 0, y: 0 });
  const saved = decodeSave(encodeSave(campaign, life, false));
  assert.deepEqual(saved.campaign, campaign);
  assert.equal(saved.life.biomass, life.biomass);
  assert.equal(saved.life.x, 360);
  assert.equal(saved.sound, false);
  assert.ok(saved.life.invulnerable > 0);
  assert.ok(physicalSize(2, saved.life.biomass) < before);
  assert.ok(
    Math.abs(
      (physicalSize(2, life.biomass) / before) ** 2 - life.biomass / 24,
    ) < 0.01,
  );
  for (const bad of [
    'broken',
    'null',
    '{}',
    JSON.stringify({ version: 1, campaign: { ...campaign, stage: 99 }, life }),
    JSON.stringify({
      version: 1,
      campaign: { ...campaign, mutations: [] },
      life,
    }),
  ])
    assert.equal(decodeSave(bad), null);
  const final = {
    ...newCampaign(),
    stage: 5,
    mutations: ['flow', 'shell', 'hunger', 'flow', 'shell'],
    won: true,
  };
  const last = stageLife(final);
  last.biomass = 62;
  last.complete = true;
  last.finalEaten = true;
  assert.equal(decodeSave(encodeSave(final, last, true)).campaign.won, true);
});
