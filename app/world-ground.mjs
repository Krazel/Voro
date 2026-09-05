import { COAST_TILE } from './population.mjs';

export const GROUND_PROFILES = {
  pond: { file: 'pond', step: 360, depth: 1, tint: '#102c29' },
  land: { file: 'shore', step: 600, depth: 1, tint: '#1d3437' },
  water: { file: 'sea', step: 420, depth: 1, tint: '#082f3b' },
  city: { file: 'city', step: 440, depth: 1, tint: '#1c2930' },
  orbit: { file: 'orbit', step: 600, depth: 0.48, tint: '#060e1c' },
  planets: { file: 'planets', step: 640, depth: 0.4, tint: '#050d1a' },
  stars: { file: 'stars', step: 660, depth: 0.35, tint: '#120d19' },
  galaxies: { file: 'galaxies', step: 700, depth: 0.3, tint: '#0b091c' },
  universe: { file: 'universe', step: 740, depth: 0.25, tint: '#080b13' },
};

function hash(x, y, seed) {
  let n = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ seed;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return (n ^ (n >>> 16)) >>> 0;
}
// A region keeps its painting when revisited, including negative coordinates.
// Shore variants only flip vertically: the sand/water boundary stays aligned
// with the habitat coordinates used by the animals.
export function groundPatch(stage, x, y, seed = 834) {
  const n = hash(x, y, seed + stage.length * 101);
  return {
    variant: n % 8,
    flipX: stage !== 'land' && !!(n & 16),
    flipY: !!(n & 32),
    turn: stage === 'land' ? 0 : (n >>> 7) % 4,
  };
}

export class WorldGround {
  constructor(createCanvas = () => document.createElement('canvas')) {
    this.createCanvas = createCanvas;
    this.cache = new Map();
    this.surface = null;
  }
  prepare(image, shore) {
    const key = image;
    const cached = this.cache.get(key);
    if (cached?.shore === shore) return cached.patches;
    const patches = [];
    const size = 384,
      sw = image.width / 2,
      sh = image.height / 2;
    for (let i = 0; i < 8; i++) {
      const panel = i % 4,
        crop = i < 4 || shore ? 1 : 0.8;
      const canvas = this.createCanvas();
      canvas.width = size;
      canvas.height = size;
      const c = canvas.getContext('2d');
      c.drawImage(
        image,
        (panel % 2) * sw + (sw * (1 - crop)) / 2,
        Math.floor(panel / 2) * sh + (sh * (1 - crop)) / 2,
        sw * crop,
        sh * crop,
        0,
        0,
        size,
        size,
      );
      c.globalCompositeOperation = 'destination-in';
      // Adjacent patches overlap by one quarter. Linear edge weights sum to
      // one; additive compositing avoids dark seams and visible tile borders.
      for (const horizontal of shore ? [false] : [true, false]) {
        const g = c.createLinearGradient(
          0,
          0,
          horizontal ? size : 0,
          horizontal ? 0 : size,
        );
        g.addColorStop(0, 'transparent');
        g.addColorStop(0.25, '#fff');
        g.addColorStop(0.75, '#fff');
        g.addColorStop(1, 'transparent');
        c.fillStyle = g;
        c.fillRect(0, 0, size, size);
      }
      patches.push(canvas);
    }
    this.cache.set(key, { shore, patches });
    // Bound decoded texture memory when using the environment test controls.
    if (this.cache.size > 3) this.cache.delete(this.cache.keys().next().value);
    return patches;
  }
  draw(c, image, stage, camera, zoom, height, seed = 834) {
    const profile = GROUND_PROFILES[stage];
    if (!profile || !image?.complete || !image.naturalWidth) return false;
    const shore = stage === 'land',
      patches = this.prepare(image, shore);
    if (!this.surface) this.surface = this.createCanvas();
    const surface = this.surface;
    if (surface.width !== 480 || surface.height !== Math.ceil(height)) {
      surface.width = 480;
      surface.height = Math.ceil(height);
    }
    const layer = surface.getContext('2d');
    layer.clearRect(0, 0, 480, height);
    layer.globalCompositeOperation = 'lighter';
    const depth = profile.depth;
    const px = camera.x * depth,
      py = camera.y * depth;
    const sx = shore ? COAST_TILE : profile.step,
      sy = profile.step;
    const width = shore ? sx : (sx * 4) / 3,
      h = (sy * 4) / 3;
    const x0 = Math.floor((px - 240 / zoom) / sx) - 1;
    const x1 = Math.floor((px + 240 / zoom) / sx) + 1;
    const y0 = Math.floor((py - (height * 0.48) / zoom) / sy) - 1;
    const y1 = Math.floor((py + (height * 0.52) / zoom) / sy) + 1;
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const patch = groundPatch(stage, x, y, seed);
        const fx = shore ? Math.abs(x % 2) === 1 : patch.flipX;
        // Snap shared shore edges to the same pixel to avoid a hairline gap
        // when mirrored rectangles meet at fractional camera coordinates.
        const left = Math.round((x * sx - px) * zoom + 240);
        const right = Math.round(((x + 1) * sx - px) * zoom + 240);
        const drawWidth = shore ? right - left : width * zoom;
        layer.save();
        layer.translate(
          shore ? (left + right) / 2 : (x * sx + width / 2 - px) * zoom + 240,
          (y * sy + h / 2 - py) * zoom + height * 0.48,
        );
        layer.scale(fx ? -1 : 1, patch.flipY ? -1 : 1);
        layer.rotate((patch.turn * Math.PI) / 2);
        layer.drawImage(
          patches[patch.variant],
          -drawWidth / 2,
          (-h * zoom) / 2,
          drawWidth,
          h * zoom,
        );
        layer.restore();
      }
    layer.globalCompositeOperation = 'destination-over';
    layer.fillStyle = profile.tint;
    layer.fillRect(0, 0, 480, height);
    // Composite once so evolution crossfades retain their intended opacity.
    c.drawImage(surface, 0, 0);
    return true;
  }
}
