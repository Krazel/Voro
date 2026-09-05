import { MicroWorld, makeEntity, TILE } from './micro-world.mjs';
import { random, clamp } from './simulation.mjs';
import {
  STAGE_SPECIES,
  SPECIES_BY_ID,
  isDanger,
  stageStartMass,
} from './journey-data.mjs';
export function journeyEntity(s, x, y, seed, id) {
  const e = makeEntity(s, x, y, seed, id);
  e.requiredMass = s.requiredMass ?? e.requiredMass;
  e.final = s.kind === 'final';
  e.shotClock = 1.2 + (seed % 1) * 2;
  e.attack = 0;
  return e;
}
export class JourneyWorld extends MicroWorld {
  constructor(seed = 1834, journal = [], stage = 0) {
    super(seed, journal);
    this.stage = stage;
    this.projectiles = [];
    this.finalSpawned = false;
    this.finalEntity = null;
  }
  generate(cx, cy, time) {
    if (this.stage === 0) return super.generate(cx, cy, time);
    const list = STAGE_SPECIES[this.stage].filter(
      (s) => s.kind !== 'final' && !s.variantOf,
    );
    const small = list.filter(
        (s) =>
          journeyEntity(s, 0, 0, 0, 'starter').requiredMass <=
            stageStartMass(this.stage) && !isDanger(s),
      ),
      medium = list.filter((s) => !small.includes(s) && !isDanger(s)),
      danger = list.filter(isDanger);
    const rng = random(
        (this.seed ^
          Math.imul(cx | 0, 73856093) ^
          Math.imul(cy | 0, 19349663) ^
          Math.imul(this.stage, 917731)) >>>
          0,
      ),
      entities = [],
      motes = [];
    const pick = (arr) => arr[Math.floor(rng() * arr.length)];
    const water = this.stage === 1;
    for (let i = 0; i < (water ? 14 : 22); i++) {
      const pool =
        i < (water ? 6 : 9) ? small : i < (water ? 11 : 18) ? medium : danger;
      const s = pick(pool.length ? pool : list);
      const x = cx * TILE + 40 + rng() * (TILE - 80),
        y = cy * TILE + 40 + rng() * (TILE - 80),
        seed = rng() * 6.28,
        id = `${cx}:${cy}:${i}`;
      if (isDanger(s) && Math.hypot(x - 700, y - 970) < 310) continue;
      if ((this.journal.get(id) || 0) > time) continue;
      const inhabitant =
        s.id === 'water-14' && seed >= Math.PI ? SPECIES_BY_ID['water-16'] : s;
      entities.push(journeyEntity(inhabitant, x, y, seed, id));
    }
    if (cx === 1 && cy === 1)
      for (let i = 0; i < 7; i++) {
        const id = `first:${i}`;
        if ((this.journal.get(id) || 0) > time) continue;
        const a = i * 2.399,
          d = 105 + i * 20;
        entities.push(
          journeyEntity(
            small[i % small.length],
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
  move(dt, time, p, stats, trail) {
    if (this.stage === 0) {
      super.move(dt, time, p, stats, trail);
      return;
    }
    for (const e of this.entities) {
      if (e.eaten) continue;
      const s = SPECIES_BY_ID[e.kind];
      if (!s) continue;
      e.escape = Math.max(0, (e.escape || 0) - dt);
      e.flash = Math.max(0, e.flash - dt * 2);
      e.attack = Math.max(0, (e.attack || 0) - dt * 2);
      const dx = p.x - e.x,
        dy = p.y - e.y,
        d = Math.hypot(dx, dy);
      if (d > 1100) continue;
      const edible = p.biomass >= e.requiredMass;
      let tx = e.homeX + Math.sin(time * 0.21 + e.seed) * 80,
        ty = e.homeY + Math.cos(time * 0.17 + e.seed) * 80;
      if (['hunter', 'flee', 'ranged'].includes(s.kind) && d < 340) {
        let sign = edible || e.escape > 0 || s.kind === 'flee' ? -1 : 1;
        if (s.kind === 'ranged') sign = d < 230 ? -1 : d > 300 ? 1 : 0;
        tx = e.x + dx * sign;
        ty = e.y + dy * sign;
      }
      let speed = e.wound >= 1 ? 0 : s.speed;
      const step = Math.sin(time * (s.motion === 'insect' ? 16 : 8) + e.seed);
      if (s.motion === 'hop') speed *= 0.2 + 1.8 * Math.max(0, step);
      if (s.motion === 'squid') speed *= 0.5 + Math.max(0, step);
      if (
        stats.trailSlow &&
        trail.some((q) => Math.hypot(q.x - e.x, q.y - e.y) < q.r)
      )
        speed *= 1 - stats.trailSlow;
      const len = Math.max(1, Math.hypot(tx - e.x, ty - e.y));
      e.x += ((tx - e.x) / len) * speed * dt;
      e.y += ((ty - e.y) / len) * speed * dt;
      e.x = clamp(e.x, e.homeX - 280, e.homeX + 280);
      e.y = clamp(e.y, e.homeY - 280, e.homeY + 280);
      if (speed > 4) {
        const angle = Math.atan2(ty - e.y, tx - e.x);
        e.heading +=
          Math.atan2(Math.sin(angle - e.heading), Math.cos(angle - e.heading)) *
          Math.min(1, dt * 3);
      } else if (['spin', 'galaxy', 'cosmic'].includes(s.motion))
        e.heading += dt * (s.motion === 'spin' ? 0.06 : 0.025);
      if (s.kind === 'gravity' && !edible && d < 320 && d > 1) {
        p.x -= (dx / d) * (1 - d / 320) * 28 * dt;
        p.y -= (dy / d) * (1 - d / 320) * 28 * dt;
      }
      if (s.shot && e.wound < 1 && d < 410 && d > p.radius * 1.1) {
        e.shotClock = Math.max(0, (e.shotClock ?? s.shot.interval) - dt);
        if (e.shotClock === 0 && this.projectiles.length < 72) {
          e.shotClock = s.shot.interval;
          e.attack = 1;
          const angle = Math.atan2(dy, dx),
            v = s.shot.speed;
          this.projectiles.push({
            x: e.x + Math.cos(angle) * e.r * 0.65,
            y: e.y + Math.sin(angle) * e.r * 0.65,
            vx: Math.cos(angle) * v,
            vy: Math.sin(angle) * v,
            life: 4.5,
            damage: s.shot.damage,
            edibleAt: s.shot.edibleAt,
            r: this.stage === 3 ? 3 : 6,
            plasma: this.stage !== 3,
          });
        }
      }
    }
  }
  stream(x, y, time, force = false, radius = this.radius) {
    super.stream(x, y, time, force, radius);
    if (this.finalEntity && !this.entities.includes(this.finalEntity))
      this.entities.push(this.finalEntity);
  }
  spawnFinal(p) {
    if (this.stage !== 8 || p.finalEaten) return;
    if (p.digestion.some((f) => f.final)) {
      this.finalSpawned = true;
      return;
    }
    if (this.finalSpawned && this.finalEntity && !this.finalEntity.eaten)
      return;
    const s = STAGE_SPECIES[8].find((s) => s.kind === 'final');
    this.finalEntity = journeyEntity(
      s,
      p.x + 540,
      p.y - 160,
      0,
      'universe-final',
    );
    this.entities.push(this.finalEntity);
    this.finalSpawned = true;
  }
}
