import { MIN_SIZE_FACTOR, MAX_SIZE_FACTOR } from './entity-sizes.mjs';
import { random, clamp } from './simulation.mjs';
export const TILE = 600;
export const SPECIES = [
  {
    id: 'nutrient',
    name: 'Nutrientes',
    requiredMass: 0,
    r: 7,
    value: 0.6,
    speed: 0,
    kind: 'still',
    crop: [38, 50, 295, 267],
  },
  {
    id: 'bacillus',
    name: 'Bacilo verde',
    r: 13,
    value: 0.9,
    speed: 12,
    kind: 'drift',
    crop: [368, 106, 336, 161],
  },
  {
    id: 'cocci',
    name: 'Cocos gemelos',
    r: 15,
    value: 1.1,
    speed: 5,
    kind: 'drift',
    crop: [783, 93, 266, 197],
  },
  {
    id: 'diatom',
    name: 'Diatomea azul',
    r: 23,
    value: 1.6,
    speed: 3,
    kind: 'drift',
    crop: [1123, 100, 286, 181],
  },
  {
    id: 'paramecium',
    name: 'Paramecio',
    r: 32,
    value: 2.5,
    speed: 32,
    kind: 'flee',
    crop: [17, 429, 331, 221],
  },
  {
    id: 'amoeba',
    name: 'Ameba pequeña',
    r: 37,
    value: 3,
    speed: 14,
    kind: 'drift',
    crop: [410, 400, 285, 255],
  },
  {
    id: 'flagellate',
    name: 'Flagelado',
    r: 29,
    value: 2.2,
    speed: 50,
    kind: 'flee',
    crop: [730, 468, 350, 146],
  },
  {
    id: 'spiral',
    name: 'Bacteria espiral',
    r: 24,
    value: 1.7,
    speed: 26,
    kind: 'flee',
    crop: [1122, 443, 300, 175],
  },
  {
    id: 'hunter',
    name: 'Ciliado cazador',
    r: 66,
    value: 6,
    speed: 48,
    kind: 'hunter',
    crop: [19, 757, 337, 253],
  },
  {
    id: 'spiny',
    name: 'Protista espinoso',
    r: 86,
    value: 9,
    speed: 4,
    kind: 'hazard',
    crop: [364, 746, 354, 275],
  },
  {
    id: 'giant',
    name: 'Ameba gigante',
    r: 105,
    value: 14,
    speed: 24,
    kind: 'hunter',
    crop: [745, 692, 355, 351],
  },
  {
    id: 'chain',
    name: 'Cadena celular',
    r: 45,
    value: 4,
    speed: 12,
    kind: 'drift',
    crop: [1119, 780, 307, 225],
  },
];
export const SPECIES_BY_ID = Object.fromEntries(SPECIES.map((s) => [s.id, s]));
const hash = (seed, x, y) =>
  (seed ^ Math.imul(x | 0, 73856093) ^ Math.imul(y | 0, 19349663)) >>> 0;
export function makeEntity(species, x, y, seed, id) {
  const sizeFactor =
    species.kind === 'final'
      ? 1
      : MIN_SIZE_FACTOR +
        random(Math.floor(seed * 100000) ^ 78493)() *
          (MAX_SIZE_FACTOR - MIN_SIZE_FACTOR);
  const r = species.r * sizeFactor;
  return {
    id,
    x,
    y,
    homeX: x,
    homeY: y,
    seed,
    eaten: false,
    rod: false,
    kind: species.id,
    r,
    sizeFactor,
    value: species.value * sizeFactor ** 2,
    requiredMass:
      (species.requiredMass ?? 8 * ((species.r * 1.17) / 48) ** 2) *
      sizeFactor ** 2,
    heading: seed,
    escape: 0,
    wound: 0,
    flash: 0,
    recycled: false,
  };
}
export class MicroWorld {
  constructor(seed = 1834, journal = []) {
    this.seed = seed;
    this.chunks = new Map();
    this.journal = new Map(journal);
    this.center = '';
    this.radius = 2;
    this.entities = [];
    this.motes = [];
  }
  generate(cx, cy, time) {
    const rng = random(hash(this.seed, cx, cy)),
      entities = [],
      motes = [];
    for (let i = 0; i < 20; i++) {
      const index =
        i < 9
          ? i % 3
          : i < 15
            ? 3 + (i % 5)
            : i === 15
              ? 11
              : i === 16
                ? 8
                : i === 17
                  ? 9
                  : i === 18
                    ? 10
                    : 0;
      const x = cx * TILE + 35 + rng() * (TILE - 70),
        y = cy * TILE + 35 + rng() * (TILE - 70);
      const heading = rng() * Math.PI * 2;
      // A safe waking area, only. The rest of the world retains its predators.
      if (index >= 8 && index <= 10 && Math.hypot(x - 700, y - 970) < 310)
        continue;
      const id = `${cx}:${cy}:${i}`;
      if ((this.journal.get(id) || 0) > time) continue;
      entities.push(makeEntity(SPECIES[index], x, y, heading, id));
    }
    if (cx === 1 && cy === 1)
      for (let i = 0; i < 7; i++) {
        const id = `first:${i}`;
        if ((this.journal.get(id) || 0) > time) continue;
        const a = i * 2.399,
          d = 105 + i * 17;
        entities.push(
          makeEntity(
            SPECIES[i % 3],
            700 + Math.cos(a) * d,
            970 + Math.sin(a) * d,
            i,
            id,
          ),
        );
      }
    for (let i = 0; i < 25; i++)
      motes.push({
        x: cx * TILE + rng() * TILE,
        y: cy * TILE + rng() * TILE,
        r: 0.4 + rng() * 1.4,
        phase: rng() * 6.28,
      });
    return { entities, motes };
  }
  stream(x, y, time, force = false, radius = this.radius) {
    this.radius = clamp(Math.ceil(radius), 2, 6);
    const cx = Math.floor(x / TILE),
      cy = Math.floor(y / TILE),
      center = `${cx}:${cy}:${this.radius}`;
    if (center === this.center && !force) return;
    this.center = center;
    for (const [id, until] of this.journal)
      if (until <= time) this.journal.delete(id);
    const keep = new Set();
    for (let yy = cy - this.radius; yy <= cy + this.radius; yy++)
      for (let xx = cx - this.radius; xx <= cx + this.radius; xx++) {
        const key = `${xx}:${yy}`;
        keep.add(key);
        if (!this.chunks.has(key))
          this.chunks.set(key, this.generate(xx, yy, time));
      }
    for (const key of this.chunks.keys())
      if (!keep.has(key)) this.chunks.delete(key);
    this.entities = Array.from(this.chunks.values()).flatMap((c) => c.entities);
    this.motes = Array.from(this.chunks.values()).flatMap((c) => c.motes);
  }
  eat(entity, time) {
    entity.eaten = true;
    this.journal.delete(entity.id);
    this.journal.set(entity.id, time + 150);
    while (this.journal.size > 2048)
      this.journal.delete(this.journal.keys().next().value);
  }
  replenish(x, y, time) {
    // Rebuild only consumed slots whose regrowth time has elapsed; never erase live movement.
    for (const [key, chunk] of this.chunks) {
      const [cx, cy] = key.split(':').map(Number);
      const alive = new Set(
        chunk.entities.filter((e) => !e.eaten).map((e) => e.id),
      );
      const replacements = this.generate(cx, cy, time).entities.filter(
        (e) => !alive.has(e.id) && Math.hypot(e.x - x, e.y - y) > 300,
      );
      chunk.entities = [
        ...chunk.entities.filter((e) => !e.eaten),
        ...replacements,
      ];
    }
    this.stream(x, y, time, true);
  }
  move(dt, time, player, stats, trail) {
    for (const e of this.entities) {
      if (e.eaten) continue;
      const s = SPECIES_BY_ID[e.kind];
      if (!s) continue;
      e.escape = Math.max(0, e.escape - dt);
      e.flash = Math.max(0, e.flash - dt * 2);
      const d = Math.hypot(player.x - e.x, player.y - e.y);
      if (d > 1000) continue;
      const edible = player.biomass >= e.requiredMass;
      let tx = e.homeX + Math.sin(time * 0.21 + e.seed) * 65,
        ty = e.homeY + Math.cos(time * 0.17 + e.seed) * 65;
      if ((s.kind === 'hunter' || s.kind === 'flee') && d < 240) {
        const direction = edible || e.escape > 0 ? -1 : 1;
        tx = e.x + (player.x - e.x) * direction;
        ty = e.y + (player.y - e.y) * direction;
      }
      const len = Math.max(1, Math.hypot(tx - e.x, ty - e.y));
      let speed = e.wound >= 1 ? 0 : s.speed;
      if (
        stats.trailSlow &&
        trail.some((q) => Math.hypot(q.x - e.x, q.y - e.y) < q.r)
      )
        speed *= 1 - stats.trailSlow;
      e.x += ((tx - e.x) / len) * speed * dt;
      e.y += ((ty - e.y) / len) * speed * dt;
      e.x = clamp(e.x, e.homeX - 260, e.homeX + 260);
      e.y = clamp(e.y, e.homeY - 260, e.homeY + 260);
      if (speed > 4)
        e.heading +=
          Math.atan2(
            Math.sin(Math.atan2(ty - e.y, tx - e.x) - e.heading),
            Math.cos(Math.atan2(ty - e.y, tx - e.x) - e.heading),
          ) * Math.min(1, dt * 2.5);
    }
  }
}
