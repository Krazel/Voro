import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STAGES,
  STAGE_SPECIES,
  stageStartMass,
  physicalDiameter,
  formatSize,
} from '../app/journey-data.mjs';
import {
  newJourney,
  journeyLife,
  advanceJourney,
  saveJourney,
  loadJourney,
} from '../app/journey-progress.mjs';
import { JourneyWorld } from '../app/journey-world.mjs';

test('Pond, shore and sea transitions never decrease physical size, even after overshooting the growth target', () => {
  assert.deepEqual(
    STAGES.map((s) => s.id),
    [
      'micro',
      'pond',
      'land',
      'water',
      'city',
      'orbit',
      'planets',
      'stars',
      'galaxies',
      'universe',
    ],
  );
  const p = newJourney(12);
  let l = journeyLife(p);
  for (let i = 0; i < STAGES.length - 1; i++) {
    l.biomass = STAGES[i].goal * 1.5;
    const diameter = physicalDiameter(i, l.biomass);
    l = advanceJourney(p, l);
    assert.ok(physicalDiameter(p.stage, l.biomass) >= diameter * (1 - 1e-9));
    assert.ok(l.biomass >= stageStartMass(p.stage));
  }
  assert.ok(formatSize(1, 0.45).endsWith('mm'));
  assert.ok(formatSize(2, 0.45) !== '0 m');
  assert.ok(STAGE_SPECIES[1].every((s) => !/tiburón|nadador/i.test(s.name)));
});

test('Old stage saves remap once, including the completed universe, without resetting mass or adaptations', () => {
  const mapping = [0, 3, 2, 4, 5, 6, 7, 8, 9];
  for (let old = 0; old < mapping.length; old++) {
    const p = newJourney(7);
    p.stage = old;
    delete p.journeyVersion;
    p.mutations = ['speed'];
    p.level = 1;
    p.xp = 14;
    p.completed = old === 8;
    p.finalReady = old === 8;
    const l = journeyLife(p);
    l.biomass = 30;
    const w = new JourneyWorld(7, [], old);
    const loaded = loadJourney(saveJourney(p, l, w, true));
    assert.equal(loaded.progress.stage, mapping[old]);
    assert.equal(loaded.life.biomass, 30);
    assert.deepEqual(loaded.progress.mutations, ['speed']);
    assert.equal(loaded.progress.completed, old === 8);
    const again = loadJourney(
      saveJourney(loaded.progress, loaded.life, w, true),
    );
    assert.equal(again.progress.stage, mapping[old]);
  }
});
