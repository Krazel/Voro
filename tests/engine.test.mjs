import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEngine } from './engine-fixture.mjs';
import { makeEntity, SPECIES_BY_ID } from '../app/micro-world.mjs';
import {
  newJourney as newMicro,
  journeyLife as microLife,
  refreshOffer,
} from '../app/journey-progress.mjs';
import { JourneyWorld } from '../app/journey-world.mjs';

function fresh(seed = 123) {
  const f = makeEngine(),
    g = f.game;
  g.progress = newMicro(seed);
  g.life = microLife(g.progress);
  g.world = new JourneyWorld(seed);
  g.seed();
  g.action('start');
  return f;
}
function step(g, n = 1, render = false) {
  for (let i = 0; i < n; i++) {
    g.time += 1 / 60;
    g.update(1 / 60);
    if (render) g.render();
  }
}
function isolate(g, entities = []) {
  g.world.entities = entities;
  g.world.move = () => {};
  g.world.stream = () => {};
  g.world.replenish = () => {};
}
test('Bitmap organisms digest, membrane animates, and damage lowers HUD mass and body area', () => {
  const f = fresh(),
    g = f.game;
  isolate(g, [
    makeEntity(SPECIES_BY_ID.bacillus, g.life.x + 20, g.life.y, 1, 'meal'),
  ]);
  step(g, 120, true);
  g.publish();
  assert.equal(f.snapshot.eaten, 1);
  assert.equal(f.snapshot.biomass, 8.495);
  assert.ok(f.draws > 1000);
  const before = g.life.radius;
  g.world.entities = [
    makeEntity(SPECIES_BY_ID.giant, g.life.x + 30, g.life.y, 2, 'enemy'),
  ];
  step(g);
  g.publish();
  assert.ok(f.snapshot.biomass < 8.495);
  assert.ok(f.snapshot.hurt > 0);
  assert.ok(f.snapshot.protected);
  isolate(g);
  step(g, 60, true);
  assert.ok(g.life.radius < before);
  assert.ok(g.membrane.every(Number.isFinite));
  g.destroy();
});
test('A shield blocks one hit, then damage and recycling apply during recharge', () => {
  const { game: g } = fresh();
  g.progress.mutations = ['shield', 'recycle', 'spikes'];
  g.progress.level = 3;
  isolate(g, [
    makeEntity(SPECIES_BY_ID.giant, g.life.x + 30, g.life.y, 2, 'enemy'),
  ]);
  step(g);
  assert.equal(g.life.biomass, 8);
  assert.equal(g.progress.shieldRecharge, 24);
  assert.ok(g.world.entities[0].escape > 0);
  g.life.invulnerable = 0;
  step(g);
  assert.equal(g.life.biomass, 6);
  assert.equal(g.fragments.length, 3);
  assert.ok(g.progress.shieldRecharge < 24);
  assert.ok(
    Math.abs(g.fragments.reduce((s, e) => s + e.value, 0) - 0.4) < 1e-8,
  );
  isolate(g);
  step(g, 1441);
  assert.equal(g.progress.shieldRecharge, 0);
  g.destroy();
});
test('Adaptation choices, pause and settings stop world time; retry retains choices, reset clears them', () => {
  const { game: g } = fresh();
  g.progress.xp = 7;
  refreshOffer(g.progress);
  const start = g.life.elapsed;
  g.frame(100);
  g.frame(200);
  assert.equal(g.life.elapsed, start);
  const selected = g.progress.offer[0];
  g.choose(selected);
  assert.equal(g.progress.level, 1);
  g.choose('nonsense');
  assert.equal(g.progress.level, 1);
  g.action('pause');
  g.frame(300);
  assert.equal(g.life.elapsed, start);
  g.action('pause');
  g.settingsOpen = true;
  g.frame(400);
  assert.equal(g.life.elapsed, start);
  g.settingsOpen = false;
  g.life.dead = true;
  g.life.biomass = 0;
  g.action('retry');
  assert.deepEqual(g.progress.mutations, [selected]);
  assert.equal(g.life.biomass, 8);
  g.action('restart');
  assert.equal(g.progress.level, 0);
  g.destroy();
});
test('Movement crosses old boundaries in both directions; touch movement has no effect after releasing', () => {
  const { game: g } = fresh();
  isolate(g);
  g.life.x = -9000;
  g.life.y = 9500;
  g.pointer = { id: 1, x: 100, y: 100, sx: 40, sy: 100, touch: true };
  step(g, 600);
  assert.ok(g.life.x > -9000);
  assert.ok(g.life.y > 1700);
  g.pointer = null;
  step(g, 120);
  assert.ok(Math.abs(g.life.vx) < 1);
  g.destroy();
});
test('Unassisted world population supports growth to cellular maturity without changing biomes', () => {
  const results = [];
  for (const seed of [41, 127, 930]) {
    const { game: g } = fresh(seed);
    let target = null;
    for (
      let frame = 0;
      frame < 60 * 600 && !g.life.dead && !g.progress.maturitySeen;
      frame++
    ) {
      if (g.progress.offer.length)
        g.choose(
          g.progress.offer.find((id) =>
            ['reach', 'speed', 'yield', 'digest', 'shield'].includes(id),
          ) || g.progress.offer[0],
        );
      if (!target || target.eaten || frame % 60 === 0) {
        target = g.world.entities
          .filter((e) => !e.eaten && e.requiredMass <= g.life.biomass)
          .sort(
            (a, b) =>
              Math.hypot(a.x - g.life.x, a.y - g.life.y) -
              Math.hypot(b.x - g.life.x, b.y - g.life.y),
          )[0];
      }
      if (target) {
        const dx = target.x - g.life.x,
          dy = target.y - g.life.y,
          len = Math.max(1, Math.hypot(dx, dy));
        let x = dx / len,
          y = dy / len;
        for (const enemy of g.world.entities) {
          if (
            enemy.eaten ||
            enemy.requiredMass <= g.life.biomass ||
            !['hunter', 'spiny', 'giant'].includes(enemy.kind)
          )
            continue;
          const ex = g.life.x - enemy.x,
            ey = g.life.y - enemy.y,
            d = Math.max(1, Math.hypot(ex, ey)),
            safe = g.life.radius + enemy.r + 120;
          if (d < safe) {
            const avoid = 3 * (1 - d / safe);
            x += (ex / d) * avoid;
            y += (ey / d) * avoid;
            if (d < safe - 65) g.action('dash');
          }
        }
        g.padInput = { x, y };
      }
      step(g);
    }
    assert.equal(g.life.dead, false, 'survival seed ' + seed);
    assert.ok(g.progress.maturitySeen, 'maturity seed ' + seed);
    assert.ok(g.progress.level >= 5);
    assert.equal(g.life.complete, false);
    assert.ok(g.world.chunks.size <= 49);
    results.push({
      seed,
      seconds: Math.round(g.life.elapsed),
      upgrades: g.progress.level,
    });
    g.destroy();
  }
  console.log('Micro-stage progression:', JSON.stringify(results));
});
