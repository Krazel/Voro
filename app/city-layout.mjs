// Streets and edible buildings share world geometry, including negative chunks.
export const CITY_BLOCK = 600;
export function cityDistrict(x, y, seed = 834) {
  let n = Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ seed;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return (n >>> 0) % 4;
}
export function cityLots(cx, cy, seed) {
  const district = cityDistrict(cx, cy, seed);
  const kinds = [
    ['city-house', 'city-10', 'city-market', 'city-10'],
    ['city-11', 'city-market', 'city-10', 'city-civic'],
    ['city-warehouse', 'city-market', 'city-warehouse', 'city-10'],
    ['city-house', 'city-10', 'city-civic'],
  ][district];
  return kinds.map((kind, i) => ({ kind, x: cx * 600 + (i % 2 ? 415 : 185),
    y: cy * 600 + (i > 1 ? 415 : 185), slot: i }));
}
export function cityPlacement(s, x, y, cx, cy) {
  if (s.motion === 'rotor') return { x, y };
  const vehicle = s.motion === 'vehicle';
  const horizontal = ((Math.floor(x + y) % 2) === 0);
  const lane = vehicle ? 22 : 57;
  const edge = (Math.floor(x) % 2) ? lane : 600 - lane;
  return horizontal ? { x, y: cy * 600 + edge, axis: 'x' }
    : { x: cx * 600 + edge, y, axis: 'y' };
}
export function constrainCity(e) {
  if (e.cityAxis === 'x') e.y = e.homeY;
  if (e.cityAxis === 'y') e.x = e.homeX;
}

// Four reusable district surfaces. Roads meet at exactly the same coordinates;
// no random rotation, alpha mixing or buildings baked into the ground.
export function cityTiles(image, createCanvas) {
  const sw = image.width / 2, sh = image.height / 2;
  return Array.from({ length: 4 }, (_, district) => {
    const canvas = createCanvas(); canvas.width = canvas.height = 600;
    const c = canvas.getContext('2d');
    const texture = (panel, x, y, w, h, step) => {
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
      for (let yy = y; yy < y + h; yy += step)
        for (let xx = x; xx < x + w; xx += step)
          c.drawImage(image, (panel % 2) * sw, Math.floor(panel / 2) * sh, sw, sh, xx, yy, step, step);
      c.restore();
    };
    texture(0, 0, 0, 600, 600, 150);
    texture(1, 42, 42, 516, 516, 72);
    c.strokeStyle = '#aaa99e'; c.lineWidth = 3; c.strokeRect(43,43,514,514);
    texture(3, 72, 72, 456, 456, 100);
    // Passageways between properties are kept clear when buildings are eaten.
    c.strokeStyle = '#777c77'; c.lineWidth = 2;
    c.strokeRect(77,77,218,218); c.strokeRect(305,77,218,218);
    c.strokeRect(77,305,218,218); c.strokeRect(305,305,218,218);
    // Narrow access streets between properties make the district read as a
    // neighbourhood, instead of four buildings standing in an enormous plaza.
    texture(1,270,68,60,464,72); texture(1,68,270,464,60,72);
    texture(0,282,42,36,516,150); texture(0,42,282,516,36,150);
    c.strokeStyle='#b3b3a8';c.lineWidth=2;
    for(const edge of [280,320]) {
      c.beginPath();c.moveTo(edge,68);c.lineTo(edge,532);c.stroke();
      c.beginPath();c.moveTo(68,edge);c.lineTo(532,edge);c.stroke();
    }
    if (district === 3) {
      texture(2, 317, 317, 196, 196, 90);
      texture(1, 405, 317, 20, 196, 60);
      texture(1, 317, 405, 196, 20, 60);
      c.fillStyle = '#6d7b67'; c.fillRect(348,362,30,7); c.fillRect(451,460,30,7);
    }
    c.strokeStyle = '#d5c991'; c.lineWidth = 2; c.setLineDash([22,22]);
    for (const edge of [0,600]) {
      c.beginPath(); c.moveTo(edge,83); c.lineTo(edge,517); c.stroke();
      c.beginPath(); c.moveTo(83,edge); c.lineTo(517,edge); c.stroke();
    }
    c.setLineDash([]); c.fillStyle = '#d5d6cb';
    // Each tile owns its half of the pedestrian crossing at each junction.
    for (const edge of [0,600]) for (let i=0;i<4;i++) {
      const q = edge === 0 ? 4+i*9 : 596-i*9-5;
      c.fillRect(q,64,5,21); c.fillRect(q,515,5,21);
      c.fillRect(64,q,21,5); c.fillRect(515,q,21,5);
    }
    c.fillStyle = '#283330';
    for (const x of [48,540]) for (const y of [112,488]) {
      c.fillRect(x,y,10,5);
      c.fillStyle='#768079'; for(let i=1;i<5;i++) c.fillRect(x+i*2,y,1,5);
      c.fillStyle='#283330';
    }
    return canvas;
  });
}
