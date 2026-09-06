import { ANIMATIONS, animationCrop } from './animation-catalog.mjs';
import { anatomicalPose, ANATOMICAL_RIGS } from './anatomical-rigs.mjs';
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (v) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
const rotate = (x, y, cx, cy, a) => ({
  x: cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a),
  y: cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a),
});
const blend = (p, q, w) => ({
  x: p.x + (q.x - p.x) * w,
  y: p.y + (q.y - p.y) * w,
});

// A vertex follows a local joint with a soft skin weight. The skull/shell/torso
// remains fixed while the limb rotates; no image strips are translated.
function joint(p, cx, cy, angle, weight) {
  return blend(p, rotate(p.x, p.y, cx, cy, angle), clamp(weight));
}
function gait(p, phase, pairs, amount, center = 0.5) {
  const side = p.y < center ? -1 : 1,
    extent = Math.abs(p.y - center);
  const i = Math.round(clamp((p.x - 0.3) / 0.48) * (pairs - 1)),
    anchor = 0.3 + (i * 0.48) / Math.max(1, pairs - 1);
  const weight =
    smooth((extent - 0.11) / 0.16) *
    smooth((p.x - 0.07) / 0.12) *
    (1 - smooth((p.x - 0.9) / 0.08));
  const angle =
    Math.sin(phase + i * Math.PI + (side > 0 ? Math.PI : 0)) * amount * side;
  const q = joint(p, anchor, center + side * 0.1, angle, weight);
  return joint(
    q,
    anchor + side * 0.03,
    center + side * 0.29,
    -angle * 0.7,
    weight * smooth((extent - 0.26) / 0.12),
  );
}
function spine(phase, head, amount, aspect) {
  const n = 24,
    step = head / n,
    points = [{ x: head, y: 0, a: 0 }];
  for (let i = 1; i <= n; i++) {
    const u = (i - 0.5) / n,
      a = amount * u ** 1.25 * Math.sin(phase - u * 5.3),
      last = points[i - 1];
    points.push({
      x: last.x - step * Math.cos(a),
      y: last.y - (step * Math.sin(a)) / aspect,
      a,
    });
  }
  return points;
}
export function poseMesh(
  profile,
  phase,
  activity = 1,
  cols = 20,
  rows = 10,
  aspect = 1,
) {
  const { family: f } = profile,
    a = clamp(activity, 0.12, 1.8),
    s = Math.sin(phase),
    k = profile.amount || 0.08;
  const head = profile.head || 0.79,
    axis = profile.axis || 0.5;
  const bones = ['fish', 'flagellate'].includes(f)
    ? spine(phase, head, k * a, aspect)
    : null;
  const verts = [];
  const anatomy = anatomicalPose(profile.rigId || profile.id, phase, a, aspect);
  for (let j = 0; j <= rows; j++)
    for (let i = 0; i <= cols; i++) {
      const u = i / cols,
        v = j / rows;
      let p = { x: u, y: v };
      if (anatomy) {
        p = anatomy(u, v);
      } else if (profile.surface) {
        // Flow stays inside the painted sphere/disc. Its rim and lighting axis
        // remain fixed instead of spinning the entire cutout like a wheel.
        const {
          cx = 0.5,
          cy = 0.5,
          rx = 0.43,
          ry = 0.43,
          angle = 0,
          amount = 0.035,
        } = profile.surface;
        const ca = Math.cos(angle),
          sa = Math.sin(angle),
          dx = u - cx,
          dy = (v - cy) * aspect;
        const x = (dx * ca + dy * sa) / rx,
          y = (-dx * sa + dy * ca) / (ry * aspect);
        const radius = Math.hypot(x, y),
          weight = 1 - smooth((radius - 0.3) / 0.65);
        if (profile.surface.disc) {
          const holeWeight = profile.surface.hole
            ? smooth((Math.hypot(dx, dy) - profile.surface.hole) / 0.06)
            : 1;
          const turn = Math.sin(phase) * amount * weight * holeWeight,
            q = rotate(x, y, 0, 0, turn);
          p = {
            x: cx + q.x * rx * ca - q.y * ry * aspect * sa,
            y: cy + (q.x * rx * sa + q.y * ry * aspect * ca) / aspect,
          };
        } else {
          p.x += Math.sin(phase + v * 2) * amount * weight;
        }
      } else if (f === 'plant') {
        // Anchored stems: only the free end and foliage follow the current.
        p.x += Math.sin(phase + v * 2) * k * a * (1 - v) ** 2;
      } else if (f === 'matterCloud') {
        const envelope = Math.sin(u * Math.PI) * Math.sin(v * Math.PI);
        p.x += Math.sin(phase + v * 3) * k * envelope;
        p.y += Math.cos(phase + u * 3) * k * 0.45 * envelope;
      } else if (profile.rigid) {
        // Metal panels and hulls preserve every point of their silhouette.
      } else if (bones) {
        let px = u,
          py = axis,
          ang = 0;
        if (u < head) {
          const b = ((head - u) / head) * 24,
            n = Math.min(23, Math.floor(b)),
            r = b - n;
          px = bones[n].x + (bones[n + 1].x - bones[n].x) * r;
          py += bones[n].y + (bones[n + 1].y - bones[n].y) * r;
          ang = bones[n].a + (bones[n + 1].a - bones[n].a) * r;
        }
        let off = v - axis;
        off *=
          1 -
          (1 - smooth((u - 0.08) / 0.13)) *
            (profile.tailFan ?? 0.24) *
            (0.5 + 0.5 * Math.cos(phase - 4.9));
        const fin =
          smooth((Math.abs(off) - 0.13) / 0.18) *
          smooth((u - 0.22) / 0.1) *
          (1 - smooth((u - 0.69) / 0.11));
        off *=
          1 + fin * (profile.finFlutter ?? 0.09) * Math.sin(phase * 2 - u * 7);
        p = {
          x: px - Math.sin(ang) * off * aspect,
          y: py + Math.cos(ang) * off,
        };
      } else if (['serpentine', 'chain', 'bacillus'].includes(f)) {
        p.y += Math.sin(phase - u * 6) * k * a * (0.3 + 0.7 * (1 - u));
        p.x += (u - 0.5) * 0.022 * s;
      } else if (f === 'cocci') {
        const cx = u < 0.5 ? 0.29 : 0.71,
          amount = 0.035 * Math.sin(phase + (u < 0.5 ? 0 : Math.PI));
        p.x += (u - cx) * amount;
        p.y += (v - 0.5) * amount;
      } else if (['amoeba', 'cilia', 'spines'].includes(f)) {
        const dx = u - 0.5,
          dy = v - 0.5,
          r = Math.hypot(dx, dy),
          ang = Math.atan2(dy, dx);
        const outer = smooth((r - 0.18) / 0.25);
        const wave =
          f === 'cilia'
            ? Math.sin(phase * 3 - ang * 11) * k
            : f === 'spines'
              ? Math.max(0, s) * 0.08 * a
              : Math.sin(phase - ang * 3) * k * a;
        p.x += dx * wave * outer;
        p.y += dy * wave * outer;
      } else if (f === 'krill') {
        p.y += Math.sin(phase - u * 5) * 0.032 * a * (1 - u);
        p = gait(p, phase * 2, 5, 0.2 * a, 0.49);
        if (u > 0.65)
          p.y += smooth((u - 0.65) / 0.25) * Math.sin(phase + v * 4) * 0.035;
      } else if (f === 'puffer') {
        const inflation = 0.018 * s + 0.13 * Math.max(0, a - 1);
        p.x += (u - 0.52) * inflation;
        p.y += (v - 0.5) * inflation;
        p.y +=
          Math.sin(phase * 6) *
          0.027 *
          smooth((Math.abs(u - 0.5) - 0.23) / 0.18);
      } else if (f === 'seahorse') {
        p = joint(p, 0.55, 0.55, 0.2 * s * a, smooth((v - 0.51) / 0.24));
        p.x +=
          Math.sin(phase * 7) *
          0.017 *
          smooth((v - 0.25) / 0.12) *
          (1 - smooth((v - 0.63) / 0.15));
      } else if (f === 'jelly') {
        const cx = profile.cx,
          cy = profile.cy,
          tail = smooth((v - cy - 0.12) / 0.4),
          pump = Math.max(0, Math.sin(phase));
        p.x += (u - cx) * (-0.13 * pump) * (1 - tail);
        p.y += (v - cy) * (0.1 * pump) * (1 - tail);
        p.x +=
          tail * Math.sin(phase - v * 5 + u * 4) * profile.amount * 0.5 * a;
        p.y += tail * 0.032 * Math.cos(phase - v * 4);
      } else if (f === 'squid') {
        const arm = smooth((u - 0.5) / 0.4),
          pulse = Math.max(0, Math.sin(phase));
        p.y += (v - 0.51) * (-0.12 * pulse) * (1 - arm);
        p.x += 0.018 * pulse * (1 - arm);
        p.y += arm * Math.sin(phase - u * 6 + v * 8) * 0.065 * a;
        p.x += arm * Math.cos(phase - u * 4 + v * 7) * 0.022;
      } else if (f === 'octopus') {
        const dx = u - profile.cx,
          dy = v - profile.cy,
          r = Math.hypot(dx, dy),
          ang = Math.atan2(dy, dx);
        const w = smooth((r - 0.17) / 0.3),
          turn = Math.sin(phase - ang * 2 - r * 5) * 0.2 * a * w;
        p = joint(p, profile.cx, profile.cy, turn, w);
        p.x += dx * 0.1 * s * w;
        p.y += dy * 0.1 * s * w;
      } else if (f === 'eel') {
        const tail = (1 - smooth((u - 0.65) / 0.3)) * (0.4 + 0.6 * v);
        p = joint(p, 0.78, 0.25, Math.sin(phase - v * 6) * 0.16 * a, tail);
        p.y += Math.sin(phase - u * 6 - v * 3) * k * a * tail;
      } else if (f === 'ray') {
        const side = v < 0.48 ? -1 : 1,
          w = smooth((Math.abs(v - 0.48) - 0.07) / 0.36);
        p.y = 0.48 + (v - 0.48) * (1 - w * (0.23 + 0.22 * Math.sin(phase)));
        p.x += w * 0.025 * Math.cos(phase - side * 0.7);
        p.y += (1 - smooth((u - 0.25) / 0.22)) * 0.04 * Math.sin(phase - u * 6);
      } else if (f === 'swimmer') {
        // Source is diagonal: hands to the right, feet to the lower left.
        p = joint(
          p,
          0.66,
          0.39,
          0.24 * Math.sin(phase) * a,
          smooth((u - 0.63) / 0.25),
        );
        p = joint(
          p,
          0.42,
          0.56,
          0.16 * Math.sin(phase + (v > 0.65 ? Math.PI : 0)) * a,
          (1 - smooth((u - 0.35) / 0.21)) * smooth((v - 0.46) / 0.2),
        );
      } else if (f === 'insect' || f === 'scorpion') {
        p = gait(p, phase, profile.pairs, k * a);
        if (f === 'scorpion') {
          p = joint(
            p,
            0.31,
            0.52,
            0.16 * s * a,
            (1 - smooth((u - 0.43) / 0.1)) * (1 - smooth((v - 0.4) / 0.15)),
          );
          p = joint(
            p,
            0.75,
            0.5,
            0.13 * s * (v > 0.5 ? 1 : -1),
            smooth((u - 0.71) / 0.16),
          );
        } else
          p.y += smooth((u - 0.85) / 0.1) * 0.026 * Math.sin(phase + v * 4);
      } else if (f === 'larva') {
        const dx = u - 0.53,
          dy = v - 0.5,
          ang = Math.atan2(dy, dx),
          w = 1 - smooth((u - 0.7) / 0.22);
        p.x += dx * 0.075 * Math.sin(phase - ang * 2) * w;
        p.y += dy * 0.075 * Math.sin(phase - ang * 2) * w;
      } else if (f === 'snail') {
        p.y += smooth((v - 0.68) / 0.18) * 0.028 * Math.sin(phase - u * 6);
        p = joint(p, 0.74, 0.68, 0.08 * s, smooth((u - 0.7) / 0.22));
      } else if (f === 'butterfly') {
        const cx = 0.56,
          cy = 0.48,
          dx = u - cx,
          dy = v - cy,
          along = dx * 0.8 - dy * 0.6,
          across = dx * 0.6 + dy * 0.8;
        const wing = smooth((Math.abs(across) - 0.025) / 0.11),
          fold = 1 - wing * (0.2 + 0.48 * (0.5 + 0.5 * Math.sin(phase)));
        p = {
          x: cx + along * 0.8 + across * 0.6 * fold,
          y: cy - along * 0.6 + across * 0.8 * fold,
        };
      } else if (f === 'frog') {
        const push = Math.max(0, s),
          side = v < 0.5 ? -1 : 1;
        p = joint(
          p,
          0.43,
          0.5 + side * 0.13,
          -side * 0.55 * push * a,
          (1 - smooth((u - 0.45) / 0.25)) *
            smooth((Math.abs(v - 0.5) - 0.12) / 0.22),
        );
        p.x += (u - 0.6) * (-0.05 * Math.max(0, -s));
      } else if (f === 'lizard') {
        p = gait(p, phase, 2, 0.22 * a, 0.48);
        p = joint(
          p,
          0.53,
          0.5,
          0.15 * Math.sin(phase - u * 5) * a,
          1 - smooth((u - 0.25) / 0.35),
        );
      } else if (f === 'mouse' || f === 'rabbit') {
        const foot = smooth((v - 0.64) / 0.25);
        p = joint(
          p,
          0.57,
          0.63,
          0.23 * Math.sin(phase + (u > 0.65 ? Math.PI : 0)) * a,
          foot,
        );
        if (f === 'mouse')
          p = joint(
            p,
            0.27,
            0.5,
            0.18 * Math.sin(phase - u * 4),
            1 - smooth((u - 0.12) / 0.22),
          );
        else {
          p = joint(
            p,
            0.71,
            0.4,
            0.11 * Math.sin(phase - 0.7),
            smooth((u - 0.49) / 0.15) * (1 - smooth((v - 0.28) / 0.2)),
          );
          p.y += (v - 0.55) * 0.045 * s;
        }
      } else if (f === 'human') {
        const legs = (1 - smooth((u - 0.45) / 0.18)) * smooth((v - 0.52) / 0.2);
        p = joint(
          p,
          0.45,
          0.6,
          k * Math.sin(phase + (u < 0.3 ? 0 : Math.PI)) * a,
          legs,
        );
        const arms = smooth((u - 0.57) / 0.2) * smooth((v - 0.45) / 0.18);
        p = joint(
          p,
          0.57,
          0.43,
          (profile.armed ? 0.03 : profile.shield ? 0.08 : 0.18) *
            Math.sin(phase + Math.PI) *
            a,
          arms,
        );
        if (profile.armed)
          p.x -=
            smooth((u - 0.6) / 0.22) *
            Math.max(0, Math.sin(phase * 2)) *
            0.02 *
            Math.max(0, a - 1);
      } else if (f === 'spaceship') {
        p.y += smooth((v - 0.74) / 0.22) * 0.045 * Math.sin(phase * 4) * a;
      } else if (f === 'satellite') {
        p = joint(
          p,
          0.39,
          0.42,
          0.07 * s,
          (1 - smooth((u - 0.26) / 0.15)) * (1 - smooth((v - 0.35) / 0.17)),
        );
        p = joint(
          p,
          0.61,
          0.59,
          -0.07 * s,
          smooth((u - 0.65) / 0.15) * smooth((v - 0.62) / 0.15),
        );
      } else if (
        [
          'ocean',
          'gas',
          'volcanic',
          'star',
          'pulsar',
          'galaxy',
          'barred',
          'nebula',
          'cluster',
          'supernova',
          'blackhole',
          'quasar',
          'collision',
          'web',
          'filament',
          'void',
          'universe',
        ].includes(f)
      ) {
        const dx = u - 0.5,
          dy = v - 0.5,
          r = Math.hypot(dx, dy),
          ang = Math.atan2(dy, dx),
          edge = smooth((r - 0.2) / 0.23);
        if (['galaxy', 'barred', 'blackhole', 'void'].includes(f)) {
          const angle =
            Math.sin(phase) *
            0.12 *
            (f === 'blackhole' ? edge : 1 - smooth((r - 0.15) / 0.5));
          p = rotate(u, v, 0.5, 0.5, angle);
        } else if (f === 'collision') {
          const left = u < 0.5,
            cx = left ? 0.33 : 0.65,
            cy = left ? 0.65 : 0.4;
          p = rotate(u, v, cx, cy, Math.sin(phase) * (left ? 0.12 : -0.12));
        } else if (f === 'gas' || f === 'ocean') {
          p.x +=
            0.017 *
            Math.sin(phase + v * (f === 'gas' ? 15 : 5)) *
            (1 - smooth((r - 0.31) / 0.12));
        } else if (f === 'supernova') {
          const w = 0.055 * Math.sin(phase) * smooth((r - 0.18) / 0.17);
          p.x += dx * w;
          p.y += dy * w;
        } else if (f === 'pulsar' || f === 'quasar') {
          p = rotate(u, v, 0.5, 0.5, 0.06 * Math.sin(phase));
          p.x += dx * 0.025 * s * edge;
          p.y += dy * 0.025 * s * edge;
        } else if (f === 'star' || f === 'volcanic') {
          const wobble =
            f === 'volcanic' ? 0 : Math.sin(phase + ang * 4) * k * edge;
          p.x += dx * wobble;
          p.y += dy * wobble;
        } else if (f === 'universe') {
          const contract = Math.max(0, a - 1) * 0.08 * (0.5 + 0.5 * s);
          p.x -= dx * contract;
          p.y -= dy * contract;
        } else {
          const weight = f === 'filament' ? 1 : edge;
          p.x += Math.sin(phase + v * 7) * k * weight;
          p.y += Math.cos(phase + u * 6) * k * weight;
        }
      }
      verts.push({ u, v, x: p.x, y: p.y });
    }
  return { verts, cols, rows };
}

function texturedTriangle(c, image, crop, a, b, d, w, h, mask, overlap = 0.3) {
  const den = (b.u - a.u) * (d.v - a.v) - (d.u - a.u) * (b.v - a.v);
  const xx =
    (((b.x - a.x) * (d.v - a.v) - (d.x - a.x) * (b.v - a.v)) / den) * w;
  const yx =
    (((b.y - a.y) * (d.v - a.v) - (d.y - a.y) * (b.v - a.v)) / den) * h;
  const xy =
    (((d.x - a.x) * (b.u - a.u) - (b.x - a.x) * (d.u - a.u)) / den) * w;
  const yy =
    (((d.y - a.y) * (b.u - a.u) - (b.y - a.y) * (d.u - a.u)) / den) * h;
  c.save();
  c.beginPath();
  const cx = ((a.x + b.x + d.x) * w) / 3,
    cy = ((a.y + b.y + d.y) * h) / 3;
  [a, b, d].forEach((p, i) => {
    const dx = p.x * w - cx,
      dy = p.y * h - cy,
      k = overlap / Math.max(1, Math.hypot(dx, dy));
    const x = p.x * w + dx * k - w / 2,
      y = p.y * h + dy * k - h / 2;
    if (i) c.lineTo(x, y);
    else c.moveTo(x, y);
  });
  c.closePath();
  c.clip();
  c.transform(
    xx,
    yx,
    xy,
    yy,
    a.x * w - xx * a.u - xy * a.v - w / 2,
    a.y * h - yx * a.u - yy * a.v - h / 2,
  );
  if (mask) {
    c.beginPath();
    mask.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.clip();
  }
  c.drawImage(image, ...crop, 0, 0, 1, 1);
  c.restore();
}
function part(c, image, crop, w, h, cx, cy, radius, angle) {
  c.save();
  c.translate((cx - 0.5) * w, (cy - 0.5) * h);
  c.rotate(angle);
  c.beginPath();
  c.arc(0, 0, radius * w, 0, TAU);
  c.clip();
  c.drawImage(image, ...crop, -cx * w, -cy * h, w, h);
  c.restore();
}
const rigidFamilies = new Set([
  'drift',
  'tumble',
  'planet',
  'ringed',
  'station',
  'motorbike',
  'car',
  'van',
  'armored',
  'tank',
  'helicopter',
  'building',
  'tower',
  'elliptical',
  'lenticular',
]);
export function drawPose(
  c,
  image,
  s,
  r,
  phase,
  { activity = 1, detail = false } = {},
) {
  const profile = ANIMATIONS[s.id],
    f = profile.family,
    crop = animationCrop(s, image),
    w = r * 2,
    h = (w * crop[3]) / crop[2];
  c.save();
  if (f === 'puffer') {
    const inflation =
      1 + 0.009 * Math.sin(phase) + Math.max(0, activity - 1) * 0.12;
    c.scale(inflation, inflation);
  }
  if (profile.precession != null)
    c.rotate(Math.sin(phase) * profile.precession);
  else if (
    [
      'tumble',
      'planet',
      'elliptical',
      'satellite',
      'station',
      'galaxy',
      'barred',
      'blackhole',
      'void',
    ].includes(f)
  )
    c.rotate(phase);
  if (
    !profile.surface &&
    profile.precession == null &&
    ['drift', 'ringed', 'lenticular'].includes(f)
  )
    c.rotate(Math.sin(phase) * (profile.turn || 0.12));
  if (['frog', 'rabbit'].includes(f))
    c.translate(0, -Math.max(0, Math.sin(phase)) * r * 0.1 * activity);
  if (['human', 'mouse', 'insect'].includes(f))
    c.translate(0, Math.cos(phase * 2) * r * 0.005 * activity);
  if (['motorbike', 'car', 'van', 'armored', 'tank'].includes(f)) {
    c.rotate(Math.sin(phase) * 0.012 * activity);
    c.translate(0, Math.sin(phase * 4) * r * 0.006 * activity);
  }
  if (f === 'helicopter') {
    // Rig cutouts use the original painted rotor blades. The fuselage is clipped
    // as its own rigid layer, so a stationary rotor is not left underneath.
    c.save();
    c.beginPath();
    const poly = [
      [0.01, 0.43],
      [0.12, 0.43],
      [0.12, 0.35],
      [0.21, 0.35],
      [0.21, 0.42],
      [0.4, 0.4],
      [0.51, 0.36],
      [0.68, 0.38],
      [0.98, 0.4],
      [0.98, 0.55],
      [0.66, 0.58],
      [0.5, 0.56],
      [0.41, 0.53],
      [0.21, 0.52],
      [0.21, 0.62],
      [0.12, 0.62],
      [0.12, 0.52],
      [0.07, 0.52],
    ];
    poly.forEach(([x, y], i) =>
      i
        ? c.lineTo((x - 0.5) * w, (y - 0.5) * h)
        : c.moveTo((x - 0.5) * w, (y - 0.5) * h),
    );
    c.closePath();
    c.clip();
    c.drawImage(image, ...crop, -w / 2, -h / 2, w, h);
    c.restore();
    // The four diagonal blade regions rotate together around the painted hub.
    c.save();
    c.translate((0.56 - 0.5) * w, (0.455 - 0.5) * h);
    c.rotate(phase * 3);
    c.beginPath();
    const blades = [
      [
        [0.56, 0.455],
        [0.3, 0.03],
        [0.36, 0.0],
        [0.6, 0.44],
      ],
      [
        [0.56, 0.455],
        [0.91, 0.13],
        [0.98, 0.17],
        [0.61, 0.49],
      ],
      [
        [0.56, 0.455],
        [0.94, 0.8],
        [0.89, 0.86],
        [0.52, 0.5],
      ],
      [
        [0.56, 0.455],
        [0.19, 0.79],
        [0.14, 0.73],
        [0.51, 0.42],
      ],
    ];
    for (const poly of blades) {
      poly.forEach(([x, y], i) =>
        i
          ? c.lineTo((x - 0.56) * w, (y - 0.455) * h)
          : c.moveTo((x - 0.56) * w, (y - 0.455) * h),
      );
      c.closePath();
    }
    c.clip();
    c.drawImage(image, ...crop, -0.56 * w, -0.455 * h, w, h);
    c.restore();
    part(c, image, crop, w, h, 0.56, 0.455, 0.04, 0);
  } else if (profile.rigid || (rigidFamilies.has(f) && !profile.surface)) {
    c.drawImage(image, ...crop, -w / 2, -h / 2, w, h);
  } else {
    const mesh = poseMesh(
        profile,
        phase,
        activity,
        ANATOMICAL_RIGS[s.animationId || s.id]
          ? detail
            ? 48
            : 28
          : detail
            ? 32
            : 14,
        ANATOMICAL_RIGS[s.animationId || s.id]
          ? detail
            ? 32
            : 18
          : detail
            ? 16
            : 8,
        h / w,
      ),
      { verts: v, cols, rows } = mesh;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const k = j * (cols + 1) + i;
        texturedTriangle(
          c,
          image,
          crop,
          v[k],
          v[k + 1],
          v[k + cols + 2],
          w,
          h,
          profile.mask,
          profile.surface ? 1.3 : 0.3,
        );
        texturedTriangle(
          c,
          image,
          crop,
          v[k],
          v[k + cols + 2],
          v[k + cols + 1],
          w,
          h,
          profile.mask,
          profile.surface ? 1.3 : 0.3,
        );
      }
  }
  if (f === 'building' || f === 'tower')
    for (const [x, y] of profile.fans)
      part(c, image, crop, w, h, x, y, 0.039, phase * 4);
  if (f === 'tank') {
    const shift = (phase / TAU) % 1,
      bandWidth = 0.77;
    for (const y of [0.09, 0.87]) {
      const [sx, sy, sw, sh] = crop;
      c.drawImage(
        image,
        sx + sw * (0.05 + shift * bandWidth),
        sy + sh * y,
        sw * bandWidth * (1 - shift),
        sh * 0.07,
        -0.45 * w,
        (y - 0.5) * h,
        bandWidth * (1 - shift) * w,
        0.07 * h,
      );
      if (shift > 0)
        c.drawImage(
          image,
          sx + sw * 0.05,
          sy + sh * y,
          sw * bandWidth * shift,
          sh * 0.07,
          (-0.45 + bandWidth * (1 - shift)) * w,
          (y - 0.5) * h,
          bandWidth * shift * w,
          0.07 * h,
        );
    }
  }
  if (f === 'tank' || f === 'armored')
    part(
      c,
      image,
      crop,
      w,
      h,
      f === 'tank' ? 0.44 : 0.48,
      f === 'tank' ? 0.48 : 0.41,
      0.13,
      Math.sin(phase) * 0.1,
    );
  if (f === 'car' || f === 'van' || f === 'motorbike') {
    const wheelX = f === 'motorbike' ? 0.89 : 0.8;
    for (const y of f === 'motorbike' ? [0.5] : [0.08, 0.92])
      part(c, image, crop, w, h, wheelX, y, 0.038, Math.sin(phase) * 0.1);
  }
  // Light is an animated effect; the underlying buildings and cosmic bodies stay intact.
  if (
    [
      'tower',
      'spaceship',
      'star',
      'volcanic',
      'quasar',
      'pulsar',
      'cluster',
      'web',
      'filament',
      'universe',
    ].includes(f)
  ) {
    c.save();
    c.globalCompositeOperation = 'screen';
    c.globalAlpha =
      (0.035 + 0.065 * (0.5 + 0.5 * Math.sin(phase * 2))) * activity;
    if (f === 'spaceship') {
      // Engine light belongs at the exhausts, not over the entire metal hull.
      c.beginPath();
      c.rect(-w / 2, h * 0.28, w, h * 0.22);
      c.clip();
    }
    c.drawImage(image, ...crop, -w / 2, -h / 2, w, h);
    c.restore();
  }
  c.restore();
}

// Bounded lazy cache: only encountered poses are baked, shared by every instance
// of a species. Large gallery previews bypass this cache for smooth inspection.
const frames = new Map();
const poseGroups = new Map();
const latestByAsset = new Map();
const pending = new Map();
let paced = false;
let generatedThisFrame = 0;
let approximations = 0;
const CACHE_LIMIT = 24 * 1024 * 1024;
const QUEUE_LIMIT = 64;
let bytes = 0;
let hits = 0,
  misses = 0,
  direct = 0;
const POSE_COUNT = 24;
// New poses can involve a thousand textured triangles. Keep that work out of
// the visible draw loop and amortize it over frames, including cold encounters.
export function beginAnimationFrame() {
  paced = true;
  generatedThisFrame = 0;
  const start = performance.now();
  while (
    pending.size &&
    generatedThisFrame < 2 &&
    performance.now() - start < 2
  ) {
    const [key, job] = pending.entries().next().value;
    pending.delete(key);
    if (!frames.has(key)) {
      bakePose(job);
      generatedThisFrame++;
    }
  }
}
export function endAnimationFrame() {
  paced = false;
}
function bakePose({ key, group, asset, size, pose, energy, image, s }) {
  const canvas = poseCanvas(size),
    ctx = canvas.getContext('2d');
  ctx.translate(size / 2, size / 2);
  const crop = animationCrop(s, image),
    aspect = crop[3] / crop[2];
  drawPose(
    ctx,
    image,
    s,
    size / (3 * Math.max(1, aspect)),
    (pose / POSE_COUNT) * TAU,
    { activity: energy },
  );
  const entry = {
    key,
    group,
    asset,
    pose,
    canvas,
    bytes: size * size * 4,
    extent: 3 * Math.max(1, aspect),
  };
  while (bytes + entry.bytes > CACHE_LIMIT && frames.size) {
    const oldest = frames.keys().next().value,
      evicted = frames.get(oldest);
    bytes -= evicted.bytes;
    frames.delete(oldest);
    const poses = poseGroups.get(evicted.group);
    poses[evicted.pose] = undefined;
    if (!poses.some(Boolean)) poseGroups.delete(evicted.group);
    if (latestByAsset.get(evicted.asset) === evicted)
      latestByAsset.delete(evicted.asset);
  }
  frames.set(key, entry);
  bytes += entry.bytes;
  if (!poseGroups.has(group)) poseGroups.set(group, Array(POSE_COUNT));
  poseGroups.get(group)[pose] = entry;
  latestByAsset.set(asset, entry);
  return entry;
}
function nearestPose(group, pose, asset) {
  const poses = poseGroups.get(group);
  if (poses)
    for (let d = 1; d <= POSE_COUNT / 2; d++) {
      const entry =
        poses[(pose + d) % POSE_COUNT] ||
        poses[(pose - d + POSE_COUNT) % POSE_COUNT];
      if (entry) return entry;
    }
  return latestByAsset.get(asset);
}
function poseCanvas(size) {
  const canvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(size, size)
      : typeof document !== 'undefined' && 'createElement' in document
        ? document.createElement('canvas')
        : null;
  if (canvas) canvas.width = canvas.height = size;
  return canvas;
}
export function animationCacheStats() {
  return {
    entries: frames.size,
    bytes,
    limit: CACHE_LIMIT,
    hits,
    misses,
    direct,
    pending: pending.size,
    generatedThisFrame,
    approximations,
  };
}
export function clearAnimationCache() {
  frames.clear();
  poseGroups.clear();
  latestByAsset.clear();
  pending.clear();
  paced = false;
  generatedThisFrame = approximations = 0;
  bytes = 0;
  hits = misses = direct = 0;
}
export function drawInhabitant(
  c,
  image,
  s,
  r,
  seed,
  time,
  { activity = 1, detail = false, cache = true, hurt = 0 } = {},
) {
  if (!image?.complete || !image.naturalWidth || r <= 0) return;
  const profile = ANIMATIONS[s.id];
  if (!profile) return;
  const phase =
    ((((time / profile.period + (seed || 0) / TAU) % 1) + 1) % 1) * TAU;
  c.save();
  if (hurt > 0) c.globalAlpha *= 0.75 + 0.25 * Math.cos(hurt * 12);
  const transform =
    typeof c.getTransform === 'function' ? c.getTransform() : null;
  const screenR = transform ? Math.hypot(transform.a, transform.b) * r : r;
  if (
    !detail &&
    cache &&
    (typeof OffscreenCanvas !== 'undefined' ||
      (typeof document !== 'undefined' && 'createElement' in document))
  ) {
    const size =
      screenR < 24 ? 64 : screenR < 65 ? 128 : screenR < 160 ? 192 : 256;
    const pose = Math.floor((phase / TAU) * POSE_COUNT),
      energy = activity < 0.65 ? 0.35 : activity > 1.25 ? 1.5 : 1;
    const group = `${profile.assetKey}:${size}:${energy}`;
    const key = `${group}:${pose}`;
    let entry = frames.get(key);
    if (!entry) {
      misses++;
      const job = {
        key,
        group,
        asset: profile.assetKey,
        size,
        pose,
        energy,
        image,
        s,
      };
      if (paced) {
        if (!pending.has(key) && pending.size < QUEUE_LIMIT)
          pending.set(key, job);
        entry = nearestPose(group, pose, profile.assetKey);
        approximations++;
      } else entry = bakePose(job);
    } else {
      hits++;
      frames.delete(key);
      frames.set(key, entry);
    }
    if (entry) {
      const extent = r * entry.extent;
      c.drawImage(entry.canvas, -extent / 2, -extent / 2, extent, extent);
    } else {
      // Keep a newly encountered animal visible while its first pose is queued.
      const crop = animationCrop(s, image),
        h = (r * 2 * crop[3]) / crop[2];
      c.drawImage(image, ...crop, -r, -h / 2, r * 2, h);
    }
  } else {
    direct++;
    drawPose(c, image, s, r, phase, { activity, detail });
  }
  c.restore();
}
