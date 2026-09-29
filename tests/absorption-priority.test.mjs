import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEngine } from './engine-fixture.mjs';
import { SPECIES_BY_ID, STAGES } from '../app/journey-data.mjs';
import { journeyEntity } from '../app/journey-world.mjs';
import { beginAbsorb } from '../app/simulation.mjs';

function setup(t) {
  const { game: g } = makeEngine();
  t.after(() => g.destroy());
  g.startTest(STAGES.findIndex(s => s.id === 'city'), 2, false, false, false);
  g.sound = false;
  g.world.entities = [];
  g.world.stream = g.world.move = g.world.replenish = () => {};
  const food = (r, extra = {}) => Object.assign(
    journeyEntity(SPECIES_BY_ID['city-0'], g.life.x, g.life.y, 0, 'size-' + r),
    { r, requiredMass: 0, value: 1 }, extra,
  );
  return { g, food };
}

test('Simultaneous meals fill three slots largest first, independent of world order and reward', t => {
  for (const radii of [[2, 5, 3, 11, 7], [11, 3, 7, 2, 5]]) {
    const { g, food } = setup(t);
    const entities = radii.map(r => food(r, { value: 100 / r }));
    g.world.entities = entities;
    g.update(.01);
    assert.deepEqual(g.life.digestion.map(d => d.r), [11, 7, 5]);
    assert.deepEqual(entities.filter(f => !f.eaten).map(f => f.r).sort(), [2, 3]);
    assert.deepEqual(g.world.entities.map(f => f.r), radii, 'Do not reorder the streamed world');
    assert.equal(g.absorptionCandidates.length, 0);
  }
});

test('Already digesting meals stay; only remaining slots take the largest reachable meals', t => {
  const { g, food } = setup(t);
  assert.equal(beginAbsorb(g.life, food(1)), true);
  const existing = g.life.digestion[0];
  g.world.entities = [food(2), food(8), food(6), food(4)];
  g.update(.01);
  assert.equal(g.life.digestion[0], existing);
  assert.deepEqual(g.life.digestion.map(d => d.r), [1, 8, 6]);
  const larger = food(20);
  g.world.entities.push(larger);
  g.update(.01);
  assert.equal(larger.eaten, false, 'Full digestion never replaces an ongoing meal');
  assert.deepEqual(g.life.digestion.map(d => d.r), [1, 8, 6]);
});

test('Inedible, distant, delayed and consumed large objects do not reserve slots', t => {
  const { g, food } = setup(t);
  const blocked = [
    food(30, { requiredMass: g.life.biomass * 100 }),
    food(40, { x: g.life.x + 10000 }),
    food(50, { collectDelay: 10 }),
    food(60, { eaten: true }),
  ];
  g.world.entities = [...blocked, food(2), food(4), food(3)];
  g.update(.01);
  assert.deepEqual(g.life.digestion.map(d => d.r), [4, 3, 2]);
  assert.ok(blocked.slice(0, 3).every(f => !f.eaten));
});

test('Recovered biomass competes by actual size with other reachable food', t => {
  const { g, food } = setup(t);
  g.world.entities = [food(2), food(8), food(6)];
  g.fragments = [food(7, { id: undefined, recycled: true, vx: 0, vy: 0, life: 20 })];
  g.update(.01);
  assert.deepEqual(g.life.digestion.map(d => d.r), [8, 7, 6]);
  assert.equal(g.life.digestion[1].recycled, true);
});
