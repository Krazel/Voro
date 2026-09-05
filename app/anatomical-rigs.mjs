// Joints are authored against each painted silhouette. Coordinates are normalized
// to its crop; rotations use pixel aspect, so a bone never changes length.
const PI = Math.PI;
// Very small fins lie over the torso in the painting; isolate their influence
// instead of letting the shell protection suppress their beat.
const chain = (
  points,
  width = 0.045,
  swing = 0.16,
  phase = 0,
  bend = -0.65,
) => ({ points, width, swing, phase, bend });
const ellipse = (x, y, rx, ry) => [x, y, rx, ry];
export const ANATOMICAL_RIGS = {
  'water-16': {
    body: [ellipse(0.54, 0.46, 0.13, 0.19), ellipse(0.76, 0.49, 0.055, 0.13)],
    chains: [
      chain(
        [
          [0.4487, 0.3856],
          [0.2779, 0.3777],
          [0.0564, 0.2244],
        ],
        0.046,
        0.12,
        0,
        -0.6,
      ),
      chain(
        [
          [0.4493, 0.5344],
          [0.2751, 0.5524],
          [0.0609, 0.7136],
        ],
        0.046,
        0.12,
        PI,
        -0.6,
      ),
      chain(
        [
          [0.6635, 0.3484],
          [0.7818, 0.3619],
          [0.9436, 0.425],
        ],
        0.035,
        0.16,
        PI,
        -0.65,
      ),
      chain(
        [
          [0.6516, 0.5784],
          [0.5981, 0.8106],
          [0.5344, 0.7497],
        ],
        0.04,
        0.18,
        0,
        -0.65,
      ),
    ],
  },
  'city-0': {
    body: [ellipse(0.48, 0.42, 0.22, 0.23), ellipse(0.64, 0.3, 0.15, 0.14)],
    chains: [
      chain(
        [
          [0.41, 0.65],
          [0.24, 0.79],
          [0.1, 0.83],
          [0.14, 0.94],
        ],
        0.061,
        0.19,
        0,
        -0.65,
      ),
      chain(
        [
          [0.55, 0.64],
          [0.69, 0.79],
          [0.89, 0.75],
        ],
        0.067,
        0.19,
        PI,
        -0.65,
      ),
      chain(
        [
          [0.54, 0.23],
          [0.72, 0.12],
          [0.91, 0.28],
        ],
        0.048,
        0.1,
        PI,
        -0.5,
      ),
      chain(
        [
          [0.51, 0.48],
          [0.53, 0.75],
          [0.65, 0.9],
        ],
        0.06,
        0.12,
        0,
        -0.5,
      ),
    ],
  },
  'city-1': {
    body: [
      ellipse(0.41, 0.43, 0.23, 0.21),
      ellipse(0.6, 0.25, 0.16, 0.14),
      ellipse(0.79, 0.43, 0.22, 0.085),
    ],
    chains: [
      chain(
        [
          [0.34, 0.63],
          [0.19, 0.78],
          [0.055, 0.84],
          [0.15, 0.94],
        ],
        0.06,
        0.15,
        0,
        -0.6,
      ),
      chain(
        [
          [0.45, 0.61],
          [0.55, 0.8],
          [0.68, 0.87],
        ],
        0.069,
        0.15,
        PI,
        -0.6,
      ),
    ],
  },
  'city-2': {
    body: [
      ellipse(0.42, 0.42, 0.23, 0.21),
      ellipse(0.56, 0.22, 0.17, 0.16),
      ellipse(0.8, 0.4, 0.19, 0.29),
    ],
    chains: [
      chain(
        [
          [0.34, 0.58],
          [0.19, 0.74],
          [0.055, 0.86],
          [0.14, 0.93],
        ],
        0.065,
        0.14,
        0,
        -0.6,
      ),
      chain(
        [
          [0.44, 0.59],
          [0.43, 0.71],
          [0.58, 0.78],
        ],
        0.055,
        0.12,
        PI,
        -0.6,
      ),
      chain(
        [
          [0.46, 0.54],
          [0.45, 0.73],
          [0.78, 0.95],
        ],
        0.045,
        0.045,
        PI,
        1,
      ),
    ],
  },
  'city-3': {
    body: [
      ellipse(0.39, 0.45, 0.22, 0.25),
      ellipse(0.46, 0.25, 0.17, 0.15),
      ellipse(0.72, 0.55, 0.27, 0.14),
    ],
    chains: [
      chain(
        [
          [0.34, 0.68],
          [0.28, 0.82],
          [0.39, 0.93],
        ],
        0.067,
        0.11,
        0,
        -0.5,
      ),
      chain(
        [
          [0.53, 0.68],
          [0.59, 0.8],
          [0.71, 0.8],
        ],
        0.06,
        0.11,
        PI,
        -0.5,
      ),
    ],
  },
  'water-0': {
    body: [ellipse(0.56, 0.32, 0.27, 0.1)],
    chains: [
      chain(
        [
          [0.43, 0.36],
          [0.28, 0.44],
          [0.17, 0.65],
          [0.12, 0.84],
        ],
        0.065,
        0.055,
        0,
        0.35,
      ),
      ...Array.from({ length: 6 }, (_, i) =>
        chain(
          [
            [0.34 + i * 0.069, 0.4 - i * 0.012],
            [0.4 + i * 0.058, 0.56],
            [0.4 + i * 0.056, 0.73],
          ],
          0.022,
          0.19,
          i * 0.65,
          -0.8,
        ),
      ),
      chain(
        [
          [0.77, 0.32],
          [0.9, 0.38],
          [0.99, 0.68],
        ],
        0.016,
        0.045,
      ),
      chain(
        [
          [0.78, 0.31],
          [0.91, 0.3],
          [0.99, 0.21],
        ],
        0.016,
        0.045,
        PI,
      ),
    ],
  },
  'water-5': {
    body: [ellipse(0.59, 0.52, 0.34, 0.41)],
    chains: [
      chain(
        [
          [0.26, 0.49],
          [0.08, 0.47],
        ],
        0.17,
        0.07,
      ),
      {
        ...chain(
          [
            [0.6, 0.47],
            [0.52, 0.39],
          ],
          0.035,
          0.13,
          0,
          0,
        ),
        overBody: true,
      },
      chain(
        [
          [0.32, 0.35],
          [0.26, 0.22],
        ],
        0.065,
        0.14,
        PI,
        0,
      ),
    ],
  },
  'water-6': {
    body: [
      ellipse(0.61, 0.24, 0.32, 0.23),
      ellipse(0.53, 0.48, 0.18, 0.22),
      ellipse(0.41, 0.79, 0.24, 0.2),
    ],
    chains: [
      chain(
        [
          [0.39, 0.49],
          [0.27, 0.45],
        ],
        0.09,
        0.14,
        0,
        0,
      ),
    ],
    frequency: 4,
  },
  'water-9': {
    body: [ellipse(0.34, 0.42, 0.29, 0.12)],
    chains: [
      chain(
        [
          [0.6, 0.43],
          [0.7, 0.21],
          [0.8, 0.07],
          [0.91, 0.11],
        ],
        0.036,
        0.065,
        0,
        0.35,
      ),
      chain(
        [
          [0.61, 0.45],
          [0.77, 0.34],
          [0.92, 0.23],
          [0.99, 0.28],
        ],
        0.04,
        0.06,
        1,
        0.4,
      ),
      chain(
        [
          [0.61, 0.47],
          [0.8, 0.45],
          [0.98, 0.43],
          [0.99, 0.53],
        ],
        0.042,
        0.045,
        2,
        0.4,
      ),
      chain(
        [
          [0.6, 0.48],
          [0.73, 0.63],
          [0.9, 0.7],
        ],
        0.035,
        0.075,
        3,
        0.4,
      ),
      chain(
        [
          [0.59, 0.49],
          [0.71, 0.75],
          [0.93, 0.86],
        ],
        0.04,
        0.07,
        4,
        0.4,
      ),
    ],
  },
  'water-11': {
    spine: chain(
      [
        [0.86, 0.18],
        [0.57, 0.15],
        [0.26, 0.22],
        [0.13, 0.4],
        [0.26, 0.57],
        [0.57, 0.68],
        [0.7, 0.82],
        [0.55, 0.91],
        [0.28, 0.88],
      ],
      0.15,
      0.055,
      0,
      0.5,
    ),
  },
  'water-14': {
    body: [ellipse(0.54, 0.36, 0.17, 0.19), ellipse(0.72, 0.34, 0.07, 0.15)],
    chains: [
      chain(
        [
          [0.4, 0.32],
          [0.23, 0.23],
          [0.04, 0.07],
        ],
        0.055,
        0.12,
        0,
        -0.6,
      ),
      chain(
        [
          [0.4, 0.48],
          [0.2, 0.59],
          [0.035, 0.72],
        ],
        0.055,
        0.12,
        PI,
        -0.6,
      ),
      chain(
        [
          [0.68, 0.16],
          [0.83, 0.25],
          [0.96, 0.33],
        ],
        0.035,
        0.17,
        PI,
        -0.7,
      ),
      chain(
        [
          [0.59, 0.49],
          [0.55, 0.85],
          [0.47, 0.77],
        ],
        0.035,
        0.2,
        0,
        -0.7,
      ),
    ],
  },
  'land-2': {
    body: [ellipse(0.47, 0.51, 0.43, 0.28)],
    chains: [
      ...Array.from({ length: 14 }, (_, i) => {
        const side = i % 2 ? 1 : -1,
          x = 0.17 + Math.floor(i / 2) * 0.097;
        return chain(
          [
            [x, 0.5 + side * 0.22],
            [x + 0.025, 0.5 + side * 0.33],
            [x + 0.065, 0.5 + side * 0.4],
          ],
          0.025,
          0.16,
          Math.floor(i / 2) * 0.65 + (side > 0 ? PI : 0),
        );
      }),
      chain(
        [
          [0.85, 0.44],
          [0.9, 0.27],
          [0.96, 0.1],
        ],
        0.02,
        0.07,
      ),
      chain(
        [
          [0.85, 0.59],
          [0.9, 0.77],
          [0.99, 0.9],
        ],
        0.02,
        0.07,
        PI,
      ),
    ],
  },
  'land-3': {
    body: [
      ellipse(0.33, 0.57, 0.3, 0.25),
      ellipse(0.64, 0.57, 0.18, 0.22),
      ellipse(0.83, 0.57, 0.11, 0.14),
    ],
    chains: [
      chain(
        [
          [0.34, 0.37],
          [0.3, 0.23],
          [0.13, 0.1],
        ],
        0.026,
        0.18,
      ),
      chain(
        [
          [0.57, 0.37],
          [0.54, 0.2],
          [0.52, 0.04],
        ],
        0.03,
        0.18,
        PI,
      ),
      chain(
        [
          [0.72, 0.4],
          [0.85, 0.24],
          [0.96, 0.34],
        ],
        0.03,
        0.17,
      ),
      chain(
        [
          [0.34, 0.76],
          [0.2, 0.86],
          [0.01, 0.9],
        ],
        0.027,
        0.18,
        PI,
      ),
      chain(
        [
          [0.57, 0.75],
          [0.49, 0.9],
          [0.45, 0.98],
        ],
        0.03,
        0.18,
      ),
      chain(
        [
          [0.73, 0.74],
          [0.88, 0.77],
          [0.97, 0.87],
        ],
        0.025,
        0.18,
        PI,
      ),
    ],
  },
  'land-5': {
    wings: { center: [0.56, 0.48], axis: [0.68, -0.73], bodyWidth: 0.042 },
  },
  'land-6': {
    body: [ellipse(0.25, 0.53, 0.21, 0.13), ellipse(0.55, 0.51, 0.16, 0.13)],
    chains: [
      chain(
        [
          [0.49, 0.43],
          [0.43, 0.16],
          [0.24, 0.04],
        ],
        0.045,
        0.13,
      ),
      chain(
        [
          [0.57, 0.42],
          [0.65, 0.08],
          [0.77, 0.01],
        ],
        0.04,
        0.14,
        PI,
      ),
      chain(
        [
          [0.62, 0.45],
          [0.81, 0.28],
          [0.96, 0.26],
        ],
        0.043,
        0.13,
      ),
      chain(
        [
          [0.65, 0.51],
          [0.85, 0.47],
          [0.98, 0.55],
        ],
        0.035,
        0.14,
        PI,
      ),
      chain(
        [
          [0.64, 0.55],
          [0.83, 0.7],
          [0.97, 0.8],
        ],
        0.04,
        0.13,
      ),
      chain(
        [
          [0.57, 0.61],
          [0.69, 0.81],
          [0.75, 0.98],
        ],
        0.043,
        0.14,
        PI,
      ),
      chain(
        [
          [0.47, 0.62],
          [0.4, 0.84],
          [0.36, 0.97],
        ],
        0.045,
        0.13,
      ),
      chain(
        [
          [0.43, 0.59],
          [0.24, 0.78],
          [0.04, 0.83],
        ],
        0.043,
        0.14,
        PI,
      ),
    ],
  },
  'land-7': {
    body: [ellipse(0.43, 0.6, 0.29, 0.13)],
    chains: [
      chain(
        [
          [0.22, 0.6],
          [0.11, 0.4],
          [0.15, 0.15],
          [0.31, 0.07],
          [0.47, 0.14],
        ],
        0.055,
        0.035,
        0,
        0.6,
      ),
      chain(
        [
          [0.68, 0.55],
          [0.81, 0.37],
          [0.94, 0.4],
        ],
        0.078,
        0.07,
      ),
      chain(
        [
          [0.69, 0.68],
          [0.81, 0.8],
          [0.96, 0.77],
        ],
        0.073,
        0.07,
        PI,
      ),
      ...Array.from({ length: 8 }, (_, i) => {
        const side = i % 2 ? 1 : -1,
          x = 0.25 + Math.floor(i / 2) * 0.105;
        return chain(
          [
            [x, 0.6 + side * 0.1],
            [x - 0.02, 0.6 + side * 0.22],
            [x - 0.08, 0.6 + side * 0.34],
          ],
          0.025,
          0.13,
          i * 1.7,
        );
      }),
    ],
  },
  'land-8': {
    body: [ellipse(0.58, 0.52, 0.32, 0.2), ellipse(0.83, 0.51, 0.16, 0.22)],
    chains: [
      chain(
        [
          [0.36, 0.35],
          [0.17, 0.26],
          [0.38, 0.1],
          [0.48, 0.025],
        ],
        0.063,
        0.17,
        0,
        -0.8,
      ),
      chain(
        [
          [0.36, 0.68],
          [0.15, 0.8],
          [0.38, 0.92],
          [0.5, 0.92],
        ],
        0.067,
        -0.17,
        0,
        -0.8,
      ),
      chain(
        [
          [0.69, 0.36],
          [0.72, 0.21],
          [0.92, 0.16],
        ],
        0.045,
        0.12,
        PI,
      ),
      chain(
        [
          [0.69, 0.68],
          [0.75, 0.81],
          [0.94, 0.84],
        ],
        0.047,
        -0.12,
        PI,
      ),
    ],
  },
  'land-9': {
    body: [ellipse(0.58, 0.43, 0.25, 0.11), ellipse(0.87, 0.52, 0.12, 0.1)],
    chains: [
      chain(
        [
          [0.4, 0.32],
          [0.22, 0.19],
          [0.08, 0.28],
          [0.07, 0.54],
          [0.19, 0.8],
          [0.42, 0.94],
          [0.56, 0.91],
        ],
        0.047,
        0.045,
        0,
        0.4,
      ),
      chain(
        [
          [0.74, 0.43],
          [0.67, 0.24],
          [0.82, 0.12],
        ],
        0.037,
        0.15,
      ),
      chain(
        [
          [0.79, 0.6],
          [0.7, 0.78],
          [0.81, 0.87],
        ],
        0.04,
        0.15,
        PI,
      ),
      chain(
        [
          [0.5, 0.32],
          [0.53, 0.15],
          [0.64, 0.05],
        ],
        0.047,
        0.15,
        PI,
      ),
      chain(
        [
          [0.53, 0.49],
          [0.42, 0.61],
          [0.33, 0.77],
        ],
        0.04,
        0.15,
      ),
    ],
  },
  'land-10': {
    body: [ellipse(0.51, 0.42, 0.31, 0.23), ellipse(0.81, 0.41, 0.16, 0.18)],
    chains: [
      chain(
        [
          [0.34, 0.58],
          [0.4, 0.71],
          [0.48, 0.75],
        ],
        0.033,
        0.2,
      ),
      chain(
        [
          [0.69, 0.57],
          [0.79, 0.71],
          [0.86, 0.67],
        ],
        0.031,
        0.2,
        PI,
      ),
      chain(
        [
          [0.24, 0.36],
          [0.08, 0.48],
          [0.03, 0.74],
          [0.19, 0.89],
          [0.48, 0.95],
        ],
        0.022,
        0.06,
        0,
        0.4,
      ),
    ],
  },
  'land-11': {
    body: [ellipse(0.46, 0.66, 0.38, 0.22), ellipse(0.81, 0.54, 0.15, 0.17)],
    chains: [
      chain(
        [
          [0.31, 0.77],
          [0.41, 0.92],
          [0.5, 0.93],
        ],
        0.045,
        0.2,
        0,
        -0.8,
      ),
      chain(
        [
          [0.79, 0.69],
          [0.9, 0.76],
          [0.95, 0.71],
        ],
        0.038,
        0.18,
        PI,
      ),
      chain(
        [
          [0.74, 0.38],
          [0.64, 0.2],
          [0.57, 0.05],
        ],
        0.065,
        0.045,
        1,
        0.2,
      ),
      chain(
        [
          [0.8, 0.4],
          [0.77, 0.24],
          [0.69, 0.12],
        ],
        0.055,
        0.04,
        1.3,
        0.2,
      ),
    ],
  },
};
const clamp = (v) => Math.max(0, Math.min(1, v));
const smooth = (v) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
export function poseChain(ch, phase, activity, aspect) {
  const rest = ch.points.map(([x, y]) => ({ x, y: y * aspect })),
    posed = [rest[0]],
    angles = [];
  for (let i = 0; i < rest.length - 1; i++) {
    const angle =
      ch.swing *
      activity *
      Math.sin(phase + ch.phase - i * 0.55) *
      (i === 0 ? 1 : ch.bend);
    angles.push(angle);
    const dx = rest[i + 1].x - rest[i].x,
      dy = rest[i + 1].y - rest[i].y;
    posed.push({
      x: posed[i].x + dx * Math.cos(angle) - dy * Math.sin(angle),
      y: posed[i].y + dx * Math.sin(angle) + dy * Math.cos(angle),
    });
  }
  return { ...ch, rest, posed, angles };
}
function segmentBinding(p, ch, i) {
  const root = ch.rest[i],
    end = ch.rest[i + 1],
    dx = end.x - root.x,
    dy = end.y - root.y;
  const t = clamp(
    ((p.x - root.x) * dx + (p.y - root.y) * dy) / (dx * dx + dy * dy),
  );
  return { i, t, d: Math.hypot(p.x - root.x - t * dx, p.y - root.y - t * dy) };
}
function mapped(p, ch, b) {
  const a = ch.angles[b.i],
    root = ch.rest[b.i],
    out = ch.posed[b.i],
    dx = p.x - root.x,
    dy = p.y - root.y;
  return {
    x: out.x + dx * Math.cos(a) - dy * Math.sin(a),
    y: out.y + dx * Math.sin(a) + dy * Math.cos(a),
  };
}
export function anatomicalPose(id, phase, activity, aspect) {
  const rig = ANATOMICAL_RIGS[id];
  if (!rig) return null;
  const chains = (rig.spine ? [rig.spine] : rig.chains || []).map((ch) =>
    poseChain(
      ch,
      phase * (rig.frequency || 1),
      Math.min(1.35, activity),
      aspect,
    ),
  );
  return (u, v) => {
    const p = { x: u, y: v * aspect };
    if (rig.wings) {
      const { center, axis, bodyWidth } = rig.wings,
        cx = center[0],
        cy = center[1] * aspect;
      const len = Math.hypot(axis[0], axis[1] * aspect),
        ax = axis[0] / len,
        ay = (axis[1] * aspect) / len;
      const along = (p.x - cx) * ax + (p.y - cy) * ay,
        across = -(p.x - cx) * ay + (p.y - cy) * ax;
      const fold = 0.62 + 0.34 * Math.cos(phase + (across > 0 ? 0.12 : -0.12));
      const z = Math.max(0, Math.abs(across) - bodyWidth);
      const normal =
        z === 0
          ? across
          : Math.sign(across) *
            (bodyWidth +
              fold * z +
              (1 - fold) * 0.025 * (1 - Math.exp(-z / 0.025)));
      return {
        x: cx + along * ax - normal * ay,
        y: (cy + along * ay + normal * ax) / aspect,
      };
    }
    let protection = 0;
    for (const [x, y, rx, ry] of rig.body || [])
      protection = Math.max(
        protection,
        1 - smooth((Math.hypot((u - x) / rx, (v - y) / ry) - 0.83) / 0.22),
      );
    if (protection === 1 && !rig.spine && !chains.some((ch) => ch.overBody))
      return { x: u, y: v };
    let best = null;
    for (const ch of chains) {
      const bindings = ch.angles
          .map((_, i) => segmentBinding(p, ch, i))
          .sort((a, b) => a.d - b.d),
        b = bindings[0];
      if (!best || b.d / ch.width < best.score)
        best = { ch, b, bindings, score: b.d / ch.width };
    }
    if (!best) return { x: u, y: v };
    const { ch, b, bindings } = best;
    let q = mapped(p, ch, b);
    // Blend only adjacent joints, never unrelated legs. Rigid bone interiors
    // keep their painted shape; the small elbow seam is smoothly skinned.
    const other = bindings.find((k) => Math.abs(k.i - b.i) === 1);
    if (other && Math.abs(other.d - b.d) < 0.022) {
      const z = mapped(p, ch, other),
        weight = 0.5 * (1 - smooth(Math.abs(other.d - b.d) / 0.022));
      q = { x: q.x + (z.x - q.x) * weight, y: q.y + (z.y - q.y) * weight };
    }
    let weight = rig.spine
      ? 1
      : (1 - smooth((b.d / ch.width - 0.85) / 0.9)) *
        (ch.overBody ? 1 : 1 - protection);
    // The first spine joint attaches to the skull; hold that painted head.
    if (rig.spine && b.i === 0) weight *= smooth(b.t / 0.8);
    return {
      x: u + (q.x - p.x) * weight,
      y: v + ((q.y - p.y) * weight) / aspect,
    };
  };
}
