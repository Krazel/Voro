import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEngine } from './engine-fixture.mjs';
import {
  newJourney,
  journeyLife,
  saveJourney,
  loadJourney,
  migrateMicro,
} from '../app/journey-progress.mjs';
import { JourneyWorld, journeyEntity } from '../app/journey-world.mjs';
import {
  STAGES,
  STAGE_SPECIES,
  SPECIES_BY_ID,
  isDanger,
} from '../app/journey-data.mjs';
import { saveMicro, newMicro, microLife } from '../app/micro-progress.mjs';
import { MicroWorld } from '../app/micro-world.mjs';
import { drawJourneySprite } from '../app/journey-sprites.mjs';
function fresh(stage = 0, seed = 41) {
  const f = makeEngine(),
    g = f.game;
  g.progress = newJourney(seed);
  g.progress.stage = stage;
  g.life = journeyLife(g.progress);
  g.world = new JourneyWorld(seed, [], stage);
  g.seed();
  g.action('start');
  return f;
}
function step(g, n = 1, render = false) {
  for (let i = 0; i < n; i++) {
    g.time += 1 / 30;
    g.update(1 / 30);
    if (render) g.render();
  }
}
function isolate(g) {
  g.world.entities = [];
  g.world.stream = () => {};
  g.world.move = () => {};
  g.world.replenish = () => {};
}
test('Every stage generates stable inhabitants, recoverable food, bounded chunks and valid bitmap crops', () => {
  const dimensions = {
    swimmer: [425, 160],
    micro: [1448, 1086],
    water: [1536, 1024],
    land: [1448, 1086],
    city: [1448, 1086],
    cosmos: [1536, 1024],
    universe: [1536, 1024],
  };
  const images = Object.fromEntries(
    Object.entries(dimensions).map(([id, [w, h]]) => [
      id,
      {
        complete: true,
        naturalWidth: w,
        naturalHeight: h,
        width: w,
        height: h,
      },
    ]),
  );
  let draws = 0;
  const c = {
    globalAlpha: 1,
    save() {},
    restore() {},
    scale() {},
    rotate() {},
    translate() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    clip() {},
    transform() {},
    arc() {},
    stroke() {},
    drawImage(image, x, y, w, h, ...rest) {
      assert.ok(
        x >= 0 &&
          y >= 0 &&
          w > 0 &&
          h > 0 &&
          x + w <= image.naturalWidth + 0.001 &&
          y + h <= image.naturalHeight + 0.001,
      );
      assert.ok(rest.every(Number.isFinite));
      draws++;
    },
  };
  for (let stage = 0; stage < 9; stage++) {
    const w = new JourneyWorld(24, [], stage);
    w.stream(-1400, 2300, 0);
    const original = w.entities.map((e) => [e.id, e.x, e.y]);
    const meal = w.entities[0];
    w.eat(meal, 1);
    w.stream(100000, 200000, 2);
    w.stream(-1400, 2300, 3);
    for (const e of w.entities)
      assert.deepEqual(
        [e.id, e.x, e.y],
        original.find((row) => row[0] === e.id),
      );
    assert.ok(w.entities.some((e) => e.requiredMass === 0));
    assert.equal(w.chunks.size, 25);
    assert.ok(w.entities.length <= 557);
    for (const s of STAGE_SPECIES[stage])
      for (const time of [0, 0.5])
        drawJourneySprite(c, images, s.id, s.r, 0, time, 1, 0.2);
  }
  assert.ok(draws > 1000);
});
test('Ranged attackers fire; small bodies take damage and large ones absorb bullets for tiny growth without XP', () => {
  const { game: g } = fresh(3);
  isolate(g);
  const p = g.life;
  const shot = () => ({
    x: p.x + 2,
    y: p.y,
    vx: 0,
    vy: 0,
    life: 3,
    damage: 0.08,
    edibleAt: 26,
    r: 3,
    plasma: false,
  });
  g.world.projectiles = [shot()];
  step(g);
  assert.ok(p.biomass < 2);
  assert.equal(g.world.projectiles.length, 0);
  p.biomass = 40;
  p.invulnerable = 0;
  const xp = g.progress.xp;
  g.world.projectiles = [shot()];
  step(g);
  assert.equal(p.biomass, 40.025);
  assert.equal(g.progress.xp, xp);
  const w = new JourneyWorld(1, [], 3);
  w.entities = [
    journeyEntity(SPECIES_BY_ID['city-1'], p.x + 300, p.y, 0, 'soldier'),
  ];
  for (let i = 0; i < 100; i++) w.move(1 / 30, i / 30, p, g.stats, []);
  assert.ok(w.projectiles.length > 0);
  g.destroy();
});
test('Evolution advances once at the midpoint, preserves adaptations and survives reload', () => {
  const { game: g } = fresh();
  g.progress.mutations = ['armor'];
  g.progress.level = 1;
  g.life.biomass = 150;
  step(g);
  assert.equal(g.progress.stage, 0);
  assert.ok(g.transition > 7);
  const saved = loadJourney(saveJourney(g.progress, g.life, g.world, true));
  assert.equal(saved.progress.pendingEvolution, true);
  step(g, 110, true);
  assert.equal(g.progress.stage, 1);
  assert.deepEqual(g.progress.mutations, ['armor']);
  assert.equal(g.progress.pendingEvolution, false);
  assert.ok(g.life.biomass < 10);
  step(g, 110, true);
  assert.equal(g.progress.stage, 1);
  assert.equal(g.transition, 0);
  g.destroy();
});
test('Existing microscopic saves migrate, and each later stage preserves wounded mass, cooldown and digestion', () => {
  const p = newMicro(123),
    l = microLife(p),
    w = new MicroWorld(123);
  l.x = -6000;
  l.biomass = 22;
  p.xp = 30;
  const migrated = migrateMicro(saveMicro(p, l, w, false));
  assert.equal(migrated.life.x, -6000);
  assert.equal(migrated.progress.stage, 0);
  assert.equal(migrated.progress.xp, 90);
  for (let stage = 0; stage < 9; stage++) {
    const p = newJourney(22);
    p.stage = stage;
    p.shieldRecharge = 13;
    const l = journeyLife(p);
    l.biomass = 4;
    l.cooldown = 6;
    l.x = -1234;
    l.y = 9000;
    const w = new JourneyWorld(p.seed, [], stage);
    const s = STAGE_SPECIES[stage][0];
    l.digestion = [
      {
        dx: 3,
        dy: 4,
        progress: 0.5,
        rotation: 1,
        value: s.value,
        r: s.r,
        kind: s.id,
        done: false,
        final: false,
      },
    ];
    const loaded = loadJourney(saveJourney(p, l, w, true));
    assert.equal(loaded.progress.stage, stage);
    assert.equal(loaded.life.biomass, 4);
    assert.equal(loaded.life.cooldown, 6);
    assert.equal(loaded.progress.shieldRecharge, 13);
    assert.equal(loaded.life.digestion[0].kind, s.id);
  }
});
test('Final universe remains findable after streaming and can be retried after interrupted digestion', () => {
  const w = new JourneyWorld(14, [], 8),
    p = journeyLife({ ...newJourney(14), stage: 8 });
  w.stream(p.x, p.y, 0);
  w.spawnFinal(p);
  const final = w.finalEntity;
  w.stream(100000, 200000, 1);
  assert.ok(w.entities.includes(final));
  final.eaten = true;
  p.digestion = [];
  w.spawnFinal(p);
  assert.notEqual(w.finalEntity, final);
  assert.equal(w.finalEntity.eaten, false);
});
test('A complete run eats planets, stars, galaxies and the universe in order, with no teleporting or forced growth', () => {
  const { game: g } = fresh(0, 41);
  let target = null,
    previous = -1;
  const timings = [];
  let deaths = 0;
  for (let frame = 0; frame < 30 * 7200 && !g.progress.completed; frame++) {
    if (g.life.dead) {
      deaths++;
      console.log(
        'Death in ' +
          STAGES[g.progress.stage].id +
          ' at ' +
          Math.round(g.life.elapsed) +
          ' s',
      );
      assert.ok(deaths < 3, 'too many deaths');
      g.action('retry');
      target = null;
    }
    if (g.progress.stage !== previous) {
      previous = g.progress.stage;
      target = null;
      timings.push({
        stage: STAGES[previous].id,
        at: Math.round(g.progress.totalTime),
      });
      console.log(
        'Entered ' +
          STAGES[previous].id +
          ' at ' +
          Math.round(g.progress.totalTime) +
          ' s',
      );
    }
    if (g.progress.offer.length) {
      const order = [
        'yield',
        'speed',
        'digest',
        'slots',
        'shield',
        'pull',
        'armor',
        'tentacles',
        'combo',
        'reach',
        'dash',
        'turn',
        'recycle',
        'spikes',
        'trail',
      ];
      g.choose(
        order.find((id) => g.progress.offer.includes(id)) ||
          g.progress.offer[0],
      );
    }
    const p = g.life;
    if (!target || target.eaten || frame % 30 === 0) {
      const enemies = g.world.entities.filter(
        (e) =>
          !e.eaten &&
          e.requiredMass > p.biomass &&
          isDanger(SPECIES_BY_ID[e.kind]),
      );
      const score = (e) => {
        let score = Math.hypot(e.x - p.x, e.y - p.y);
        for (const other of enemies) {
          const d = Math.hypot(e.x - other.x, e.y - other.y),
            danger = p.radius + other.r + 90;
          if (d < danger) score += (danger - d) * 5;
        }
        return score;
      };
      const eligible = g.world.entities.filter(
        (e) => !e.eaten && e.requiredMass <= p.biomass,
      );
      target =
        eligible.find((e) => e.final) ||
        eligible.sort((a, b) => score(a) - score(b))[0];
    }
    if (target && !g.transition) {
      const dx = target.x - p.x,
        dy = target.y - p.y,
        len = Math.max(1, Math.hypot(dx, dy));
      let x = dx / len,
        y = dy / len;
      for (const enemy of g.world.entities) {
        if (
          enemy.eaten ||
          enemy.requiredMass <= p.biomass ||
          !isDanger(SPECIES_BY_ID[enemy.kind])
        )
          continue;
        const ex = p.x - enemy.x,
          ey = p.y - enemy.y,
          d = Math.max(1, Math.hypot(ex, ey)),
          safe = p.radius + enemy.r + 120;
        if (d < safe) {
          const avoid = 3 * (1 - d / safe);
          x += (ex / d) * avoid;
          y += (ey / d) * avoid;
          if (d < safe - 65) g.action('dash');
        }
      }
      if (Math.hypot(x, y) < 0.4) {
        const a = Math.atan2(dy, dx) + Math.PI / 2;
        x = Math.cos(a);
        y = Math.sin(a);
      }
      for (const b of g.world.projectiles) {
        const bx = p.x - b.x,
          by = p.y - b.y,
          bd = Math.max(1, Math.hypot(bx, by));
        if (bd < p.radius + 70 && p.biomass < b.edibleAt) {
          x += (-b.vy / Math.max(1, Math.hypot(b.vx, b.vy))) * 1.2;
          y += (b.vx / Math.max(1, Math.hypot(b.vx, b.vy))) * 1.2;
        }
      }
      g.padInput = { x, y };
    } else g.padInput = { x: 0, y: 0 };
    step(g);
    if (frame % 600 === 0) g.render();
  }
  assert.equal(g.progress.completed, true, 'full campaign finished');
  assert.equal(g.progress.stage, 8);
  assert.equal(g.life.finalEaten, true);
  assert.deepEqual(
    timings.map((t) => t.stage),
    STAGES.map((s) => s.id),
  );
  step(g, 361, true);
  g.publish();
  assert.equal(g.ending, 0);
  assert.equal(g.progress.offer.length, 0);
  const position = g.life.x;
  g.action('dash');
  step(g, 10);
  assert.equal(g.life.x, position);
  console.log(
    'Journey result',
    JSON.stringify({
      timings,
      seconds: Math.round(g.progress.totalTime + g.life.elapsed),
      deaths,
      upgrades: g.progress.level,
    }),
  );
  g.destroy();
});
