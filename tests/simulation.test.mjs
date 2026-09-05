import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createLife,
  integrate,
  beginAbsorb,
  digest,
  impulse,
  takeDamage,
  radiusForMass,
  sizeForMass,
  springNode,
  WORLD,
  EVOLUTION_MASS,
  DIGEST_SECONDS,
  MAX_MASS,
} from '../app/simulation.mjs';
const meal = (p) => {
  assert.equal(beginAbsorb(p, { x: p.x + 10, y: p.y, eaten: false }), true);
  digest(p, DIGEST_SECONDS + 0.01);
};
const seconds = (p, time = 2, input = { x: 0, y: 0 }) => {
  for (let i = 0; i < Math.ceil(time * 60); i++) {
    integrate(p, 1 / 60, input);
    digest(p, 1 / 60);
  }
};
test('Swimming stays consistent at 30 and 60 fps and inside the world', () => {
  const a = createLife(),
    b = createLife();
  for (let i = 0; i < 120; i++) integrate(a, 1 / 30, { x: 1, y: -1 });
  for (let i = 0; i < 240; i++) integrate(b, 1 / 60, { x: 1, y: -1 });
  assert.ok(Math.abs(a.x - b.x) < 2);
  assert.ok(Math.abs(a.y - b.y) < 2);
  for (let i = 0; i < 3000; i++) integrate(a, 1 / 30, { x: 1, y: -1 });
  assert.ok(a.x <= WORLD.width - 100 && a.y >= 130);
});
test('Food remains whole during engulfing, contributes once after digestion', () => {
  const p = createLife(),
    food = { x: p.x + 20, y: p.y, eaten: false, rod: true, seed: 0.7 };
  assert.equal(beginAbsorb(p, { x: 100, y: 100, eaten: false }), false);
  assert.equal(beginAbsorb(p, food), true);
  assert.equal(beginAbsorb(p, food), false);
  assert.equal(p.digestion[0].rod, true);
  assert.equal(p.digestion[0].rotation, 0.7);
  digest(p, 0.65);
  assert.equal(p.eaten, 0);
  assert.equal(p.biomass, 8);
  digest(p, 1.1);
  assert.equal(p.eaten, 1);
  assert.equal(p.biomass, 9);
  digest(p, 2);
  assert.equal(p.biomass, 9);
});
test('18 undamaged meals reach the first evolution; subsequent recoveries do not repeat its modal', () => {
  const p = createLife();
  for (let i = 0; i < 18; i++) meal(p);
  assert.equal(p.biomass, EVOLUTION_MASS);
  assert.equal(p.evolved, true);
  assert.equal(p.complete, false);
  seconds(p, 2);
  assert.equal(p.complete, true);
  assert.ok(p.radius > 75);
  p.free = true;
  p.complete = false;
  takeDamage(p, { x: p.x + 100, y: p.y });
  seconds(p, 2.1);
  assert.equal(p.evolved, false);
  assert.ok(p.evolution < 0.01);
  for (let i = 0; i < 8; i++) meal(p);
  seconds(p, 2);
  assert.equal(p.evolved, true);
  assert.equal(p.complete, false);
});
test('Damage removes 25% mass; area and displayed size share the same proportional rule', () => {
  const p = createLife();
  p.biomass = 24;
  seconds(p, 3);
  const before = radiusForMass(p.biomass),
    size = sizeForMass(p.biomass);
  const lost = takeDamage(p, { x: p.x + 100, y: p.y });
  assert.equal(lost, 6);
  assert.equal(p.biomass, 18);
  assert.ok(p.knockX < 0);
  const after = radiusForMass(p.biomass);
  assert.ok(Math.abs((after / before) ** 2 - 0.75) < 1e-10);
  assert.ok(Math.abs(sizeForMass(p.biomass) / size - after / before) < 1e-10);
  seconds(p, 3);
  assert.ok(Math.abs(p.radius - after) < 0.1);
});
test('Damage also shrinks the starting cell, interrupts pending meals and has a two-second grace window', () => {
  const p = createLife();
  beginAbsorb(p, { x: p.x, y: p.y, eaten: false });
  digest(p, 0.8);
  assert.equal(takeDamage(p, { x: p.x, y: p.y + 100 }), 2);
  assert.equal(p.biomass, 6);
  assert.equal(p.digestion.length, 0);
  assert.equal(takeDamage(p, { x: p.x, y: p.y + 100 }), 0);
  seconds(p, 1.8);
  assert.equal(p.biomass, 6);
  assert.ok(p.radius < 48);
  assert.equal(takeDamage(p, { x: p.x, y: p.y + 100 }), 0);
  seconds(p, 0.3);
  assert.ok(takeDamage(p, { x: p.x, y: p.y + 100 }) > 0);
});
test('Food restores damage using the same growth curve', () => {
  const p = createLife();
  takeDamage(p, { x: p.x + 100, y: p.y });
  seconds(p, 2.1);
  meal(p);
  meal(p);
  seconds(p, 3);
  assert.equal(p.biomass, 8);
  assert.ok(Math.abs(p.radius - 48) < 0.1);
});
test('Zero mass ends life, blocks actions and resets cleanly', () => {
  const p = createLife();
  for (let i = 0; i < 4; i++) {
    takeDamage(p, { x: p.x + 100, y: p.y });
    seconds(p, 2.1);
  }
  assert.equal(p.biomass, 0);
  assert.equal(p.dead, true);
  assert.equal(p.eaten, 0);
  assert.equal(impulse(p), false);
  assert.equal(beginAbsorb(p, { x: p.x, y: p.y, eaten: false }), false);
  const x = p.x;
  seconds(p, 1, { x: 1, y: 0 });
  assert.equal(p.x, x);
  assert.equal(p.digestion.length, 0);
  const fresh = createLife();
  assert.equal(fresh.biomass, 8);
  assert.equal(fresh.dead, false);
  assert.equal(fresh.invulnerable, 0);
});
test('Impulse respects cooldown and continuous feeding respects the current stage capacity', () => {
  const p = createLife();
  assert.equal(impulse(p), true);
  assert.equal(impulse(p), false);
  seconds(p, 3.7);
  assert.equal(impulse(p), true);
  p.free = true;
  for (let i = 0; i < 100; i++) meal(p);
  assert.equal(p.biomass, MAX_MASS);
  assert.equal(p.eaten, 100);
});
test('Soft membrane settles without NaNs at 30, 60 and 120 fps', () => {
  for (const fps of [30, 60, 120]) {
    let value = 1,
      velocity = 0;
    for (let i = 0; i < fps * 4; i++) {
      const n = springNode(value, velocity, i < fps ? 1.5 : 1, 1 / fps);
      value = n.value;
      velocity = n.velocity;
      assert.ok(Number.isFinite(value));
      assert.ok(value > 0.28 && value < 1.95);
    }
    assert.ok(Math.abs(value - 1) < 0.001);
  }
});
