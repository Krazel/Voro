// Streets and edible buildings share world geometry, including negative chunks.
export const CITY_BLOCK = 600;
// Shared by ground painting, building centres and prop placement. The old
// centres (185/415) did not match the parcels left by the access streets.
export const CITY_PLOTS = [
  {x:76,y:76,w:190,h:190}, {x:334,y:76,w:190,h:190},
  {x:76,y:334,w:190,h:190}, {x:334,y:334,w:190,h:190},
];
export function citySpriteScale(s) {
  if (!s.building) return s.artScale ?? 1;
  const aspect = s.crop[3] / s.crop[2];
  return Math.min(1, 86 / (s.r * (s.sizeFactors?.[1] || 1) * Math.max(1,aspect)));
}
export function cityBounds(s,e) {
  const rx=e.r*citySpriteScale(s),ry=rx*(s.crop?.[3]||1)/(s.crop?.[2]||1);
  return {x:e.x-rx,y:e.y-ry,w:rx*2,h:ry*2};
}
export function cityOverlap(a,b,gap=8) {
  return a.x < b.x+b.w+gap && a.x+a.w+gap > b.x &&
    a.y < b.y+b.h+gap && a.y+a.h+gap > b.y;
}
export function cityAllowsSpecies(s,district) {
  if (s.id==='city-matter-container') return district===2;
  if (s.id==='city-matter-palm'||s.id==='city-matter-shrub') return district===3;
  return true;
}
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
    ['city-warehouse', 'city-market', 'city-warehouse'],
    ['city-house', 'city-10', 'city-civic'],
  ][district];
  return kinds.map((kind, i) => ({ kind, x: cx * 600 + CITY_PLOTS[i].x + CITY_PLOTS[i].w/2,
    y: cy * 600 + CITY_PLOTS[i].y + CITY_PLOTS[i].h/2, slot: i }));
}
export function cityPlacement(s, x, y, cx, cy, radius=s.r, seed=834) {
  if (s.motion === 'rotor') return { x, y };
  if(s.edibleMatter) {
    const district=cityDistrict(cx,cy,seed);
    if(!cityAllowsSpecies(s,district))return null;
    const bounds=cityBounds(s,{x:0,y:0,r:radius}),rx=bounds.w/2,ry=bounds.h/2;
    // The loading yard and the park are separate empty parcels, not sidewalks.
    const garden=s.id==='city-matter-palm'||s.id==='city-matter-shrub';
    if(s.id==='city-matter-container') {
      const bay=Math.abs(Math.floor(x+y))%2;
      return {x:cx*600+429,y:cy*600+(bay?476:396)};
    }
    let regions=garden ?
      [{x:342,y:342,w:174,h:174}] :
      [{x:46,y:46,w:508,h:24},{x:46,y:530,w:508,h:24},
       {x:46,y:76,w:24,h:448},{x:530,y:76,w:24,h:448}];
    // Lampposts occupy the larger paved corner areas, clear of crossings.
    if(s.id==='city-matter-lamp') regions=[{x:46,y:76,w:38,h:448},{x:516,y:76,w:38,h:448}];
    regions=regions.filter(a=>a.w>=bounds.w+4&&a.h>=bounds.h+4);
    if(!regions.length)return null;
    const localX=x-cx*600,localY=y-cy*600;
    const region=regions[Math.abs(Math.floor(localX+localY))%regions.length];
    const u=((localX*0.61803398875)%1+1)%1,v=((localY*0.41421356237)%1+1)%1;
    return {x:cx*600+region.x+rx+2+u*(region.w-2*rx-4),
      y:cy*600+region.y+ry+2+v*(region.h-2*ry-4)};
  }
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
    for(const p of CITY_PLOTS)c.strokeRect(p.x,p.y,p.w,p.h);
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
      // Grass stays inside the park curb, never underneath an access road.
      texture(1,334,334,190,190,72);
      texture(2,342,342,174,174,90);
      c.strokeStyle='#9b9d87';c.lineWidth=2;c.strokeRect(341,341,176,176);
    }
    if(district===2) {
      texture(1,334,334,190,190,72);
      c.strokeStyle='#b6ac7a';c.lineWidth=2;
      for(const y of [367,447])c.strokeRect(355,y,148,58);
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
