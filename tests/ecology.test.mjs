import test from 'node:test';
import assert from 'node:assert/strict';
import { JourneyWorld } from '../app/journey-world.mjs';
import { STAGES, SPECIES_BY_ID } from '../app/journey-data.mjs';
import {
  shoreFraction,
  shoreHabitat,
  POPULATION_PLANS,
} from '../app/population.mjs';
import { populationReport } from '../app/population-report.mjs';
import {
  transitionScene,
  TRANSITION_ROUTES,
} from '../app/journey-transitions.mjs';
import { newJourney, journeyLife } from '../app/journey-progress.mjs';

test('Shore creatures stay on dry sand, even while fleeing; coast coordinates mirror at negative tiles', () => {
  for (const x of [-4800, -1700, -10, 0, 250, 900, 1500]) {
    assert.ok(shoreFraction(x) >= 0 && shoreFraction(x) <= 1);
    assert.ok(Math.abs(shoreFraction(x) - shoreFraction(x + 2400)) < 1e-9);
  }
  const w = new JourneyWorld(91, [], 2),
    life = journeyLife(newJourney(1));
  life.biomass = 100;
  w.stream(700, 970, 0);
  for (let step = 0; step < 40; step++) {
    life.x = 1000;
    life.y = 970;
    w.move(0.1, step * 0.1, life, {}, []);
    for (const e of w.entities) {
      const s = SPECIES_BY_ID[e.kind];
      if (shoreHabitat(s) === 'dry')
        assert.ok(shoreFraction(e.x) + e.r / 1200 <= 0.531, e.kind);
    }
  }
});
test('Every biome uses bounded populations with rare rabbits, swimmers and human crowds', () => {
  for (let stage = 1; stage < STAGES.length; stage++) {
    const w = new JourneyWorld(33, [], stage),
      max = POPULATION_PLANS[STAGES[stage].id].slots.reduce((a, b) => a + b, 0);
    for (let x = 5; x < 25; x++)
      assert.ok(w.generate(x, 10, 0).entities.length <= max);
  }
  const shore = populationReport(2),
    sea = populationReport(3),
    city = populationReport(4);
  assert.ok(shore.rows.find((s) => s.name === 'Conejo').per100 < 1);
  assert.ok(
    sea.rows
      .filter((s) => s.id === 'water-14' || s.id === 'water-16')
      .reduce((n, s) => n + s.per100, 0) < 1,
  );
  assert.ok(
    city.rows
      .filter((s) => ['city-0', 'city-1', 'city-2', 'city-3'].includes(s.id))
      .reduce((n, s) => n + s.per100, 0) < 7,
  );
  assert.ok(shore.average < 12);
  assert.ok(sea.average <= 12 && sea.average > 8);
  assert.ok(city.average <= 14 && city.average > 10);
});
test('Transitions connect every successive environment; coastal journeys crossfade without a scale jump', () => {
  for (const stage of STAGES.slice(0, -1)) {
    assert.ok(TRANSITION_ROUTES[stage.id]);
    const start = transitionScene(stage.id, 0),
      end = transitionScene(stage.id, 1);
    assert.equal(start.incoming, 0);
    assert.equal(start.outgoing, 1);
    assert.equal(end.incoming, 1);
    assert.equal(end.outgoing, 0);
    for (let i = 0; i <= 100; i++) {
      const pose = transitionScene(stage.id, i / 100);
      assert.ok(
        Object.values(pose).every(
          (x) => typeof x === 'boolean' || Number.isFinite(x),
        ),
      );
      if (pose.coastal) assert.ok(pose.scale >= 0.88);
      const still = transitionScene(stage.id, i / 100, true);
      assert.equal(still.scale, 1);
      assert.equal(still.panX, 0);
      assert.equal(still.panY, 0);
    }
  }
});

test('Placed food keeps breathing room and consumption never moves neighbouring slots', () => {
  for (let stage = 1; stage < STAGES.length; stage++) {
    const w = new JourneyWorld(51, [], stage);
    for (let x = 6; x < 12; x++) {
      const before = w.generate(x, 10, 0).entities;
      for (let a = 0; a < before.length; a++)
        for (let b = a + 1; b < before.length; b++)
          assert.ok(
            Math.hypot(before[a].x - before[b].x, before[a].y - before[b].y) >=
              0.86 * (before[a].r + before[b].r),
            STAGES[stage].id,
          );
      if (!before.length) continue;
      w.eat(before[0], 0);
      const after = w.generate(x, 10, 1).entities;
      for (const e of after) {
        const original = before.find((a) => a.id === e.id);
        assert.equal(e.x, original.x);
        assert.equal(e.y, original.y);
      }
    }
  }
});
