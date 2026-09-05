import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGES, STAGE_SPECIES, SPECIES_BY_ID } from '../app/journey-data.mjs';
import { JourneyWorld, journeyEntity } from '../app/journey-world.mjs';
import { MicroWorld } from '../app/micro-world.mjs';
import {
  newJourney,
  journeyLife,
  saveJourney,
  loadJourney,
} from '../app/journey-progress.mjs';
import { beginAbsorb, digest } from '../app/simulation.mjs';
import { ANIMATIONS } from '../app/animation-catalog.mjs';
import { poseMesh } from '../app/inhabitant-animation.mjs';

test('Every stage naturally spawns its new matter without increasing population limits', () => {
  for (let stage = 0; stage < STAGES.length; stage++) {
    const world = new JourneyWorld(56, [], stage),
      found = new Set();
    for (let x = 4; x < 24; x++)
      for (let y = 4; y < 12; y++) {
        const chunk = world.generate(x, y, 0);
        assert.deepEqual(chunk, world.generate(x, y, 0));
        if (stage === 0)
          assert.equal(
            chunk.entities.length,
            new MicroWorld(56).generate(x, y, 0).entities.length,
          );
        else
          assert.ok(
            chunk.entities.length <= ([1, 3].includes(stage) ? 12 : 22),
          );
        for (const e of chunk.entities)
          if (SPECIES_BY_ID[e.kind].edibleMatter) found.add(e.kind);
      }
    for (const s of STAGE_SPECIES[stage].filter((s) => s.edibleMatter))
      assert.ok(found.has(s.id), s.id);
  }
});
test('All new food respects body size, restores an unfinished meal and rewards digestion exactly once', () => {
  for (const s of STAGE_SPECIES.flat().filter((s) => s.edibleMatter)) {
    const progress = newJourney(2);
    progress.stage = s.stage;
    const life = journeyLife(progress),
      world = new JourneyWorld(2, [], s.stage);
    const e = journeyEntity(s, life.x, life.y, 1, 'matter-meal');
    life.biomass = e.requiredMass * 0.99;
    assert.equal(beginAbsorb(life, e), false, s.id);
    life.biomass = e.requiredMass + 1;
    assert.ok(beginAbsorb(life, e), s.id);
    world.eat(e, 0);
    const restored = loadJourney(saveJourney(progress, life, world, true));
    assert.equal(restored.life.digestion[0].kind, s.id);
    const before = restored.life.biomass,
      xp = restored.life.adaptationGained;
    assert.equal(digest(restored.life, 10), 1);
    assert.ok(restored.life.biomass > before, s.id);
    assert.equal(restored.life.adaptationGained - xp, e.value);
    assert.equal(digest(restored.life, 10), 0);
    assert.equal(restored.life.adaptationGained - xp, e.value);
  }
});
test('Scenery stays anchored while floating matter drifts without chasing the player', () => {
  for (const s of STAGE_SPECIES.flat().filter((s) => s.edibleMatter)) {
    const e = journeyEntity(s, 700, 970, 1, s.id),
      other = structuredClone(e);
    const world = new JourneyWorld(1, [], s.stage),
      life = journeyLife(newJourney(1));
    world.entities = [e];
    world.move(1, 2, life, {}, []);
    world.entities = [other];
    life.x = 100;
    life.y = 100;
    world.move(1, 2, life, {}, []);
    assert.deepEqual(e, other, s.id);
    if (!s.speed) assert.deepEqual([e.x, e.y, e.heading], [700, 970, 1], s.id);
    else assert.ok(Math.hypot(e.x - 700, e.y - 970) > 0, s.id);
  }
});
test('Plants bend from fixed bases; shells and urban objects never stretch', () => {
  for (const s of STAGE_SPECIES.flat().filter((s) => s.edibleMatter)) {
    const profile = ANIMATIONS[s.id],
      a = poseMesh(profile, 0),
      b = poseMesh(profile, 1.4);
    if (profile.rigid) assert.deepEqual(a, b, s.id);
    if (s.matterMotion === 'plant') {
      assert.deepEqual(a.verts.slice(-21), b.verts.slice(-21), s.id);
      assert.ok(Math.abs(a.verts[10].x - b.verts[10].x) > 0.01, s.id);
    }
  }
});

test('Consumed matter remains absent when its chunk is restored from the journal', () => {
  for (let stage = 0; stage < STAGES.length; stage++) {
    const world = new JourneyWorld(56, [], stage);
    const original = world.generate(4, 4, 0);
    const meal = original.entities.find(
      (e) => SPECIES_BY_ID[e.kind].edibleMatter,
    );
    assert.ok(meal, STAGES[stage].id);
    world.eat(meal, 1);
    const restored = new JourneyWorld(56, [...world.journal], stage);
    assert.ok(
      !restored.generate(4, 4, 2).entities.some((e) => e.id === meal.id),
    );
    const regrown = restored
      .generate(4, 4, 152)
      .entities.find((e) => e.id === meal.id);
    assert.equal(regrown.kind, meal.kind);
    assert.equal(regrown.r, meal.r);
  }
});
