import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEngine } from './engine-fixture.mjs';
import { WorldGround } from '../app/world-ground.mjs';
import {
  drawInhabitant,
  animationCacheStats,
  clearAnimationCache,
  beginAnimationFrame,
  endAnimationFrame,
} from '../app/inhabitant-animation.mjs';
import { SPECIES_BY_ID } from '../app/journey-data.mjs';

test('A slow device can yield inside one pose instead of painting a whole animal in one frame', () => {
  const originalCanvas = globalThis.OffscreenCanvas;
  const originalClock = globalThis.performance;
  let clock = 0, triangles = 0;
  const c = new Proxy({ globalAlpha: 1, getTransform: () => ({a: 1, b: 0}) }, {
    get: (o, k) => k in o ? o[k] : k === 'clip' ? () => triangles++ : () => {},
    set: (o, k, v) => {o[k] = v; return true;},
  });
  try {
    globalThis.performance = { now: () => clock++ };
    globalThis.OffscreenCanvas = class { getContext() { return c; } };
    clearAnimationCache();
    beginAnimationFrame();
    drawInhabitant(c, {complete: true, naturalWidth: 1536, naturalHeight: 1024}, SPECIES_BY_ID['water-2'], 40, 0, 0);
    endAnimationFrame();
    let loops = 0;
    while ((animationCacheStats().pending || animationCacheStats().active) && loops++ < 200) {
      const before = triangles;
      beginAnimationFrame();
      assert.ok(triangles - before <= 8, 'At most eight triangles per slow-device slice');
      endAnimationFrame();
    }
    assert.ok(loops > 2 && loops < 200);
    assert.equal(animationCacheStats().entries, 1);
  } finally {
    clearAnimationCache();
    globalThis.performance = originalClock;
    globalThis.OffscreenCanvas = originalCanvas;
  }
});

test('Paused scene sleeps but redraws after resize, asset arrival and resume', () => {
  const fixture = makeEngine(),
    { game } = fixture;
  game.paused = true;
  game.frame(1000);
  const before = fixture.draws,
    time = game.time;
  for (let i = 1; i <= 60; i++) game.frame(1000 + i * 16.67);
  assert.equal(fixture.draws, before);
  assert.equal(game.time, time);
  game.resize();
  game.frame(2100);
  assert.ok(fixture.draws > before);
  const resized = fixture.draws;
  game.spriteAtlas.onload();
  game.frame(2200);
  assert.ok(fixture.draws > resized);
  game.paused = false;
  game.frame(2216);
  assert.ok(game.time > time);
  game.destroy();
});

test('Touch framebuffer reduces pixels without changing world framing or input', () => {
  const match = globalThis.matchMedia,
    dpr = globalThis.devicePixelRatio;
  try {
    globalThis.devicePixelRatio = 3;
    globalThis.matchMedia = (q) => ({ matches: q === '(pointer: coarse)' });
    const { game } = makeEngine();
    assert.equal(game.pixelRatio, 1.5);
    assert.equal(game.width, 480);
    assert.equal(game.height, 844 / (390 / 480));
    assert.equal(game.point({ clientX: 195, clientY: 0 }).x, 240);
    game.destroy();
  } finally {
    globalThis.matchMedia = match;
    globalThis.devicePixelRatio = dpr;
  }
});

test('Large DPR sprites reuse poses even without OffscreenCanvas, gallery remains continuous', () => {
  const oldCanvas = globalThis.OffscreenCanvas,
    oldCreate = Object.getOwnPropertyDescriptor(document, 'createElement');
  const c = new Proxy(
    { globalAlpha: 1, getTransform: () => ({ a: 2, b: 0 }) },
    {
      get: (o, k) => (k in o ? o[k] : () => {}),
      set: (o, k, v) => {
        o[k] = v;
        return true;
      },
    },
  );
  globalThis.OffscreenCanvas = undefined;
  Object.defineProperty(document, 'createElement', {
    configurable: true,
    value: () => ({ getContext: () => c }),
  });
  try {
    clearAnimationCache();
    const image = { complete: true, naturalWidth: 1536, naturalHeight: 1024 };
    for (let i = 0; i < 20; i++)
      drawInhabitant(c, image, SPECIES_BY_ID['water-2'], 90, 0, 1);
    assert.equal(animationCacheStats().misses, 1);
    assert.equal(animationCacheStats().hits, 19);
    assert.equal(animationCacheStats().direct, 0);
    drawInhabitant(c, image, SPECIES_BY_ID['water-2'], 90, 0, 1, {
      detail: true,
    });
    assert.equal(animationCacheStats().direct, 1);
  } finally {
    globalThis.OffscreenCanvas = oldCanvas;
    if (oldCreate) Object.defineProperty(document, 'createElement', oldCreate);
    else Reflect.deleteProperty(document, 'createElement');
    clearAnimationCache();
  }
});

test('Ground cache scrolls and scales continuously, invalidating on travel, biome and seed', () => {
  const draws = [];
  const layer = new Proxy(
    {},
    {
      get: (_, k) =>
        k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : () => {},
      set: () => true,
    },
  );
  const ground = new WorldGround(() => ({
    width: 0,
    height: 0,
    getContext: () => layer,
  }));
  const c = { drawImage: (...a) => draws.push(a) },
    image = { complete: true, naturalWidth: 100, width: 100, height: 100 };
  ground.draw(c, image, 'land', { x: 0, y: 0 }, 1, 850);
  ground.draw(c, image, 'land', { x: 10, y: 20 }, 1, 850);
  assert.equal(ground.redraws, 1);
  assert.equal(draws.at(-1)[1], -138);
  assert.equal(draws.at(-1)[2], -148);
  ground.draw(c, image, 'land', { x: 10, y: 20 }, 1.01, 850);
  assert.equal(ground.redraws, 1);
  ground.draw(c, image, 'land', { x: 500, y: 20 }, 1.01, 850);
  assert.equal(ground.redraws, 2);
  ground.draw(c, image, 'water', { x: 500, y: 20 }, 1.01, 850);
  assert.equal(ground.redraws, 3);
  ground.draw(c, image, 'water', { x: 500, y: 20 }, 1.01, 850, 23);
  assert.equal(ground.redraws, 4);
});

test('Cold encounters stay visible without baking inline; queued work is bounded and drains', () => {
  const oldCanvas = globalThis.OffscreenCanvas;
  let visible = 0;
  const c = new Proxy(
    {
      globalAlpha: 1,
      getTransform: () => ({ a: 1, b: 0 }),
      drawImage: () => visible++,
    },
    {
      get: (o, k) => (k in o ? o[k] : () => {}),
      set: (o, k, v) => {
        o[k] = v;
        return true;
      },
    },
  );
  globalThis.OffscreenCanvas = class {
    getContext() {
      return c;
    }
  };
  try {
    clearAnimationCache();
    const image = { complete: true, naturalWidth: 1536, naturalHeight: 1024 };
    beginAnimationFrame();
    for (let i = 0; i < 100; i++)
      drawInhabitant(
        c,
        image,
        SPECIES_BY_ID['water-' + (1 + (i % 10))],
        40,
        0,
        i * 0.23,
      );
    assert.equal(animationCacheStats().entries, 0);
    assert.equal(animationCacheStats().direct, 0);
    assert.equal(visible, 100);
    assert.ok(
      animationCacheStats().pending > 0 && animationCacheStats().pending <= 64,
    );
    endAnimationFrame();
    for (let i = 0; i < 80; i++) {
      beginAnimationFrame();
      assert.ok(animationCacheStats().generatedThisFrame <= 2);
      assert.ok(animationCacheStats().bytes <= animationCacheStats().limit);
      endAnimationFrame();
    }
    assert.equal(animationCacheStats().pending, 0);
    const before = animationCacheStats().entries;
    beginAnimationFrame();
    drawInhabitant(c, image, SPECIES_BY_ID['water-2'], 40, 0, 0.231);
    assert.equal(animationCacheStats().entries, before);
    endAnimationFrame();
    clearAnimationCache();
    assert.equal(animationCacheStats().pending, 0);
  } finally {
    endAnimationFrame();
    clearAnimationCache();
    globalThis.OffscreenCanvas = oldCanvas;
  }
});
