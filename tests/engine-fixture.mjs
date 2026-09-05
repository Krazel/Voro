import assert from 'node:assert/strict';
import { VoroEngine } from '../app/engine.ts';
globalThis.matchMedia = () => ({ matches: false });
globalThis.devicePixelRatio = 1;
globalThis.Image = class {
  complete = true;
  naturalWidth = 1448;
  width = 1448;
  height = 1086;
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
export function makeEngine() {
  let snapshot;
  let draws = 0;
  const gradient = { addColorStop() {} };
  const base = {
    globalAlpha: 1,
    createRadialGradient: () => gradient,
    createLinearGradient: () => gradient,
  };
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
  game.worldGround.createCanvas = () => ({
    width: 0,
    height: 0,
    getContext: () => ctx,
  });
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
