// Stable, continuous tidal terrain. There are no repeated coast-image tiles.
const smooth = t => t * t * (3 - 2 * t);
function noise(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y), tx = smooth(x - ix), ty = smooth(y - iy);
  const hash = (a, b) => {
    let n = Math.imul(a, 374761393) ^ Math.imul(b, 668265263) ^ seed;
    n = Math.imul(n ^ n >>> 13, 1274126177);
    return ((n ^ n >>> 16) >>> 0) / 4294967295 - .5;
  };
  return (hash(ix, iy) * (1 - tx) + hash(ix + 1, iy) * tx) * (1 - ty)
    + (hash(ix, iy + 1) * (1 - tx) + hash(ix + 1, iy + 1) * tx) * ty;
}
export function shoreDepth(x, y) {
  const terrain = noise(x / 920, y / 920, 823) * 520
    + noise(x / 340, y / 340, 921) * 230
    + noise(x / 125, y / 125, 334) * 42 - 12;
  // A small dry arrival patch; fades continuously into the same infinite field.
  const distance = Math.hypot(x - 700, y - 970);
  const arrival = smooth(Math.max(0, Math.min(1, (distance - 90) / 120)));
  const pool = Math.exp(-(((x - 875) / 80) ** 2 + ((y - 1060) / 65) ** 2)) * 205;
  return terrain * arrival - 105 * (1 - arrival) + pool;
}
export function coastHabitat(x, y) {
  const d = shoreDepth(x, y);
  return d < -35 ? 'Arena seca' : d < 0 ? 'Arena húmeda' : 'Agua';
}
// Move creatures back to the nearest admissible sand, using the same field
// that paints the water. Sampling their perimeter also protects large animals.
export function dryClearance(x, y, radius) {
  let depth = shoreDepth(x, y);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    depth = Math.max(depth, shoreDepth(x + Math.cos(a) * radius, y + Math.sin(a) * radius));
  }
  return depth;
}
