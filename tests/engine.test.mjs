import test from 'node:test';
import assert from 'node:assert/strict';
import { VoroEngine } from '../app/engine.ts';
globalThis.matchMedia = () => ({ matches: false });
globalThis.devicePixelRatio = 1;
globalThis.Image = class {
  complete = false;
  naturalWidth = 0;
  src = '';
};
globalThis.ResizeObserver = class {
  observe() {}
  disconnect() {}
};
globalThis.requestAnimationFrame = () => 1;
globalThis.cancelAnimationFrame = () => {};
globalThis.window = new EventTarget();
globalThis.document = Object.assign(new EventTarget(), { hidden: false });
function makeEngine() {
  let snapshot;
  let draws = 0;
  const gradient = { addColorStop() {} };
  const base = { globalAlpha: 1, createRadialGradient: () => gradient };
  const ctx = new Proxy(base, {
    get(obj, key) {
      if (key in obj) return obj[key];
      return (...args) => {
        draws++;
        for (const arg of args)
          if (typeof arg === 'number')
            assert.ok(
              Number.isFinite(arg),
              'Non-finite drawing argument in ' + String(key),
            );
      };
    },
    set(obj, key, value) {
      obj[key] = value;
      return true;
    },
  });
  const canvas = Object.assign(new EventTarget(), {
    getContext: () => ctx,
    getBoundingClientRect: () => ({ width: 390, height: 844, left: 0, top: 0 }),
    focus() {},
    setPointerCapture() {},
    width: 0,
    height: 0,
  });
  const game = new VoroEngine(canvas, (value) => (snapshot = value));
  return {
    game,
    get snapshot() {
      return snapshot;
    },
    get draws() {
      return draws;
    },
  };
}
test('Engine renders real animation frames, absorbs a meal, and applies damage to the displayed biomass', () => {
  const fixture = makeEngine(),
    g = fixture.game;
  g.action('start');
  g.food = [
    { x: g.life.x + 28, y: g.life.y, seed: 1, rod: true, eaten: false },
  ];
  for (let i = 0; i < 120; i++) {
    g.time += 1 / 60;
    g.update(1 / 60);
    g.render();
  }
  g.publish();
  assert.equal(fixture.snapshot.biomass, 9);
  assert.equal(fixture.snapshot.eaten, 1);
  assert.ok(fixture.draws > 1000);
  const before = g.life.radius;
  g.life.x = g.predator.x - 95;
  g.life.y = g.predator.y;
  g.update(1 / 60);
  g.publish();
  assert.ok(fixture.snapshot.biomass < 9);
  assert.ok(fixture.snapshot.hurt > 0);
  assert.equal(fixture.snapshot.protected, true);
  g.life.x = 700;
  g.life.y = 970;
  g.food = [];
  for (let i = 0; i < 60; i++) {
    g.time += 1 / 60;
    g.update(1 / 60);
    g.render();
  }
  assert.ok(g.life.radius < before);
  assert.ok(g.membrane.every(Number.isFinite));
  g.action('restart');
  assert.equal(fixture.snapshot.biomass, 8);
  assert.equal(fixture.snapshot.hurt, 0);
  assert.equal(fixture.snapshot.dead, false);
  g.destroy();
});
test('Mobile drag drives the same motion state and pause freezes the membrane simulation', () => {
  const { game: g } = makeEngine();
  g.action('start');
  g.food = [];
  function pointer(type, x, y) {
    const event = new Event(type);
    Object.assign(event, {
      pointerId: 1,
      pointerType: 'touch',
      clientX: x,
      clientY: y,
    });
    g.canvas.dispatchEvent(event);
  }
  pointer('pointerdown', 90, 550);
  pointer('pointermove', 130, 510);
  const x = g.life.x,
    y = g.life.y;
  for (let i = 0; i < 30; i++) g.frame(1000 + i * 16.67);
  assert.ok(g.life.x > x && g.life.y < y);
  g.action('pause');
  const pausedX = g.life.x,
    profile = [...g.membrane];
  for (let i = 0; i < 20; i++) g.frame(1600 + i * 16.67);
  assert.equal(g.life.x, pausedX);
  assert.deepEqual(g.membrane, profile);
  g.action('pause');
  assert.equal(g.pointer, null);
  assert.equal(g.keys.size, 0);
  g.destroy();
});
