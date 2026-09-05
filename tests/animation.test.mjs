import test from 'node:test';
import assert from 'node:assert/strict';
import { ANIMATIONS, animationCrop } from '../app/animation-catalog.mjs';
import {
  poseMesh,
  drawInhabitant,
  animationCacheStats,
  clearAnimationCache,
} from '../app/inhabitant-animation.mjs';
import { STAGE_SPECIES } from '../app/journey-data.mjs';
import { newJourney, journeyLife } from '../app/journey-progress.mjs';
import { HuntingTentacles } from '../app/hunting-tentacles.mjs';
const sizes = {
  naturalMatter: [1448, 1086],
  objectMatter: [1536, 1024],
  cosmicMatter: [1536, 1024],
  swimmer: [425, 160],
  femaleSwimmer: [1774, 887],
  micro: [1448, 1086],
  water: [1536, 1024],
  land: [1448, 1086],
  city: [1448, 1086],
  cosmos: [1536, 1024],
  universe: [1536, 1024],
};
test('All 152 edible elements have an explicit animation profile and valid art bounds', () => {
  assert.equal(Object.keys(ANIMATIONS).length, 152);
  for (const s of STAGE_SPECIES.flat()) {
    const p = ANIMATIONS[s.id];
    assert.ok(p.family && p.description && p.period > 0);
    const [w, h] = sizes[s.imageAtlas || s.atlas],
      crop = animationCrop(s, { naturalWidth: w, naturalHeight: h });
    assert.ok(
      crop[0] >= 0 &&
        crop[1] >= 0 &&
        crop[2] > 0 &&
        crop[3] > 0 &&
        crop[0] + crop[2] <= w &&
        crop[1] + crop[3] <= h,
      s.id,
    );
    for (const phase of [0, 0.5, 1.8, 3.5, 5.9, Math.PI * 2])
      for (const activity of [0.35, 1, 1.5]) {
        const mesh = poseMesh(p, phase, activity, 20, 10, crop[3] / crop[2]);
        assert.ok(
          mesh.verts.every(
            (v) =>
              Number.isFinite(v.x) &&
              Number.isFinite(v.y) &&
              Math.abs(v.x) < 3 &&
              Math.abs(v.y) < 3,
          ),
          s.id,
        );
      }
  }
});
test('Mesh loops meet exactly at their seam, and the sardine skull stays stable while its tail moves', () => {
  for (const p of Object.values(ANIMATIONS)) {
    const a = poseMesh(p, 0),
      b = poseMesh(p, Math.PI * 2);
    for (let i = 0; i < a.verts.length; i++)
      assert.ok(
        Math.hypot(a.verts[i].x - b.verts[i].x, a.verts[i].y - b.verts[i].y) <
          1e-8,
        p.id,
      );
  }
  const p = ANIMATIONS['water-2'],
    a = poseMesh(p, 1, 1, 20, 10),
    b = poseMesh(p, 2.4, 1, 20, 10);
  const headIndex = 5 * 21 + 20,
    tailIndex = 5 * 21 + 1;
  assert.deepEqual(a.verts[headIndex], b.verts[headIndex]);
  assert.ok(Math.abs(a.verts[tailIndex].y - b.verts[tailIndex].y) > 0.01);
});
test('Pseudopods deform the existing cell boundary, without a separate arm surface', () => {
  const p = journeyLife(newJourney(3)),
    arms = new HuntingTentacles(),
    points = Array.from({ length: 100 }, (_, i) => ({
      x: Math.cos((i / 100) * Math.PI * 2) * p.radius,
      y: Math.sin((i / 100) * Math.PI * 2) * p.radius,
    }));
  assert.equal(arms.deform(points, p, 0), points);
  arms.arms = [{ x: p.x + 65, y: p.y, grip: 0, phase: 0, target: { r: 7 } }];
  const extended = arms.deform(points, p, 0.1);
  assert.equal(extended.length, points.length);
  assert.ok(extended[0].x > 60);
  assert.ok(Math.abs(extended[50].x - points[50].x) < 0.001);
  assert.ok(
    extended.every((v) => Number.isFinite(v.x) && Number.isFinite(v.y)),
  );
  arms.clear();
  assert.equal(arms.deform(points, p, 0), points);
});
test('Impulse strength depends only on selected ranks, never on stage or biomass', () => {
  for (let rank = 0; rank < 4; rank++) {
    const values = [];
    for (let stage = 0; stage < 9; stage++) {
      const progress = newJourney(1);
      progress.stage = stage;
      progress.mutations = Array(rank).fill('dash');
      const life = journeyLife(progress);
      life.biomass = 200;
      values.push([
        life.boostStrength,
        life.boostDuration,
        life.cooldownSeconds * life.cooldownFactor,
      ]);
    }
    assert.ok(
      values.every((v) => JSON.stringify(v) === JSON.stringify(values[0])),
    );
  }
});
test('Lazy animation cache stays within 24 MiB and is reusable across instances', () => {
  const previous = globalThis.OffscreenCanvas;
  const context = new Proxy(
    { globalAlpha: 1, getTransform: () => ({ a: 1, b: 0 }) },
    {
      get(o, k) {
        return k in o ? o[k] : () => {};
      },
      set(o, k, v) {
        o[k] = v;
        return true;
      },
    },
  );
  globalThis.OffscreenCanvas = class {
    getContext() {
      return context;
    }
  };
  try {
    clearAnimationCache();
    for (const s of STAGE_SPECIES.flat())
      for (let phase = 0; phase < 6; phase++) {
        const [width, height] = sizes[s.imageAtlas || s.atlas],
          image = {
            complete: true,
            naturalWidth: width,
            naturalHeight: height,
          };
        drawInhabitant(
          context,
          image,
          s,
          70,
          0,
          (ANIMATIONS[s.id].period * phase) / 6,
        );
        assert.ok(animationCacheStats().bytes <= animationCacheStats().limit);
      }
    const before = animationCacheStats().bytes;
    const s = STAGE_SPECIES.at(-1).at(-1),
      image = { complete: true, naturalWidth: 1536, naturalHeight: 1024 };
    drawInhabitant(context, image, s, 70, 0, (ANIMATIONS[s.id].period * 5) / 6);
    assert.equal(animationCacheStats().bytes, before);
  } finally {
    globalThis.OffscreenCanvas = previous;
    clearAnimationCache();
  }
});
import {
  ANATOMICAL_RIGS,
  poseChain,
  anatomicalPose,
} from '../app/anatomical-rigs.mjs';

test('Authored limbs keep bone lengths and shells stay rigid throughout the cycle', () => {
  for (const [id, rig] of Object.entries(ANATOMICAL_RIGS)) {
    for (const phase of [0, 0.8, 2, 3.5, 5]) {
      for (const ch of rig.spine ? [rig.spine] : rig.chains || []) {
        const pose = poseChain(ch, phase, 1.35, 0.6);
        for (let i = 1; i < pose.rest.length; i++) {
          const length = (points) =>
            Math.hypot(
              points[i].x - points[i - 1].x,
              points[i].y - points[i - 1].y,
            );
          assert.ok(
            Math.abs(length(pose.rest) - length(pose.posed)) < 1e-9,
            id,
          );
        }
      }
      if (['land-2', 'land-3', 'land-6', 'land-7'].includes(id)) {
        const [x, y] = rig.body[0],
          p = anatomicalPose(id, phase, 1.35, 0.6)(x, y);
        assert.deepEqual(p, { x, y }, id);
      }
    }
  }
});

test('Butterfly folding stays monotonic across the thorax instead of turning wings inside out', () => {
  for (let f = 0; f < 24; f++) {
    const mesh = poseMesh(
      ANIMATIONS['land-5'],
      (f / 24) * Math.PI * 2,
      1.5,
      48,
      32,
      355 / 338,
    );
    const { verts: v, cols: c, rows: r } = mesh;
    for (let j = 0; j < r; j++)
      for (let i = 0; i < c; i++) {
        const k = j * (c + 1) + i;
        for (const [a, b, d] of [
          [v[k], v[k + 1], v[k + c + 2]],
          [v[k], v[k + c + 2], v[k + c + 1]],
        ])
          assert.ok((b.x - a.x) * (d.y - a.y) - (d.x - a.x) * (b.y - a.y) > 0);
      }
  }
});
import { JourneyWorld } from '../app/journey-world.mjs';
import { SPECIES_BY_ID } from '../app/journey-data.mjs';

test('Swimmer variants coexist deterministically without adding encounter slots or changing edible size', () => {
  const world = new JourneyWorld(1834, [], 3),
    seen = new Set();
  for (let x = 20; x < 50; x++) {
    const chunk = world.generate(x, 20, 0),
      again = world.generate(x, 20, 0);
    assert.ok(chunk.entities.length >= 11 && chunk.entities.length <= 12);
    assert.deepEqual(
      chunk.entities.map((e) => [e.kind, e.x, e.y]),
      again.entities.map((e) => [e.kind, e.x, e.y]),
    );
    for (const e of chunk.entities) seen.add(e.kind);
  }
  assert.ok(seen.has('water-14') && seen.has('water-16'));
  for (const key of ['r', 'value', 'speed', 'kind', 'requiredMass'])
    assert.equal(
      SPECIES_BY_ID['water-14'][key],
      SPECIES_BY_ID['water-16'][key],
    );
  assert.notEqual(
    ANIMATIONS['water-14'].assetKey,
    ANIMATIONS['water-16'].assetKey,
  );
});

test('Space structures retain rigid geometry and surface flows keep their outer boundary fixed', () => {
  for (const p of Object.values(ANIMATIONS).filter(
    (p) => p.rigid || p.surface,
  )) {
    for (const phase of [0.4, 2, 4.7]) {
      const mesh = poseMesh(p, phase, 1.5, 20, 10, 0.8);
      for (const v of mesh.verts)
        if (p.rigid || v.u === 0 || v.u === 1 || v.v === 0 || v.v === 1)
          assert.ok(Math.hypot(v.x - v.u, v.y - v.v) < 1e-8, p.id);
    }
  }
});
