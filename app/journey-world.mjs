import {
  POPULATION_PLANS,
  populationWeight,
  shoreAllows,
  constrainToShore,
} from './population.mjs';
import { MicroWorld, makeEntity, TILE } from './micro-world.mjs';
import { random, clamp } from './simulation.mjs';
import {
  STAGE_SPECIES,
  STAGES,
  SPECIES_BY_ID,
  isDanger,
  stageStartMass,
} from './journey-data.mjs';
export function journeyEntity(s, x, y, seed, id) {
  const e = makeEntity(s, x, y, seed, id);
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
    if (this.stage === 0) {
      const chunk = super.generate(cx, cy, time);
      const matter = STAGE_SPECIES[0].filter((s) => s.edibleMatter);
      chunk.entities = chunk.entities.map((e) => {
        // Keep nutrients and predators, and replace only existing food slots.
        if (e.kind === 'nutrient' || isDanger(SPECIES_BY_ID[e.kind])) return e;
        const rng = random(Math.floor(e.seed * 100000) ^ this.seed ^ 91827);
        if (rng() >= 0.35) return e;
        const pool =
          e.requiredMass <= stageStartMass(0)
            ? matter.filter((s) => s.r <= 15)
            : matter;
        return journeyEntity(
          pool[Math.floor(rng() * pool.length)],
          e.x,
          e.y,
          e.seed,
          e.id,
        );
      });
      return chunk;
    }
    let depleted = false;
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
      occupied = [],
      motes = [];
    const stageId = STAGES[this.stage].id,
      plan = POPULATION_PLANS[stageId];
    const weight = (s) => populationWeight(s, stageId, list);
    const pick = (arr) => {
      let roll = rng() * arr.reduce((n, s) => n + weight(s), 0);
      return arr.find((s) => (roll -= weight(s)) < 0) || arr.at(-1);
    };
    const [starters, forage, threats] = plan.slots;
    const recovery = [...small].sort((a, b) => a.r - b.r)[0];
    for (let i = 0; i < starters + forage + threats; i++) {
      const pool =
        i < starters ? small : i < starters + forage ? medium : danger;
      const s = i === 0 ? recovery : pick(pool.length ? pool : list);
      const seed = rng() * 6.28,
        id = `${cx}:${cy}:${i}`;
      const candidate = journeyEntity(s, 0, 0, seed, id);
      const margin = Math.max(40, Math.min(220, candidate.r * 1.1 + 8));
      let x = 0,
        y = 0,
        placed = false;
      for (let attempt = 0; attempt < 10; attempt++) {
        x = cx * TILE + margin + rng() * (TILE - 2 * margin);
        y = cy * TILE + margin + rng() * (TILE - 2 * margin);
        if (stageId === 'land' && !shoreAllows(s, x)) continue;
        if (
          occupied.some(
            (e) =>
              Math.hypot(e.x - x, e.y - y) < 0.9 * (e.r + candidate.r) + 12,
          )
        )
          continue;
        placed = true;
        break;
      }
      if (!placed) continue;
      // Consumed slots also reserve their geometry until regeneration, so eating
      // one object never moves or rerolls neighbouring objects on chunk reload.
      occupied.push({ x, y, r: candidate.r });
      if (isDanger(s) && Math.hypot(x - 700, y - 970) < 310) continue;
      if ((this.journal.get(id) || 0) > time) { depleted = true; continue; }
      const inhabitant =
        s.id === 'water-14' && seed >= Math.PI ? SPECIES_BY_ID['water-16'] : s;
      entities.push(journeyEntity(inhabitant, x, y, seed, id));
    }
    if (cx === 1 && cy === 1)
      for (let i = 0; i < 7; i++) {
        const id = `first:${i}`;
        if ((this.journal.get(id) || 0) > time) { depleted = true; continue; }
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
    if (stageId === 'land')
      for (const e of entities) constrainToShore(e, SPECIES_BY_ID[e.kind]);
    for (let i = 0; i < 25; i++)
      motes.push({
        x: cx * TILE + rng() * TILE,
        y: cy * TILE + rng() * TILE,
        r: 0.4 + rng() * 1.4,
        phase: rng() * 6.28,
      });
    return { entities, motes, depleted };
  }
  move(dt, time, p, stats, trail) {
    if (this.stage === 0) {
      super.move(dt, time, p, stats, trail);
      for (const e of this.entities) {
        const s = SPECIES_BY_ID[e.kind];
        if (s?.edibleMatter && !e.eaten) this.moveMatter(e, s, dt, time);
      }
      return;
    }
    for (const e of this.entities) {
      if (e.eaten) continue;
      const s = SPECIES_BY_ID[e.kind];
      if (!s) continue;
      if (s.edibleMatter) {
        this.moveMatter(e, s, dt, time);
        continue;
      }
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
      if (STAGES[this.stage].id === 'land') constrainToShore(e, s);
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
            r: STAGES[this.stage].id === 'city' ? 3 : 6,
            plasma: STAGES[this.stage].id !== 'city',
          });
        }
      }
    }
  }
  moveMatter(e, s, dt, time) {
    e.escape = Math.max(0, (e.escape || 0) - dt);
    e.flash = Math.max(0, e.flash - dt * 2);
    if (!s.speed || e.wound >= 1) return;
    const tx = e.homeX + Math.sin(time * 0.1 + e.seed) * 35,
      ty = e.homeY + Math.cos(time * 0.09 + e.seed) * 35,
      distance = Math.max(1, Math.hypot(tx - e.x, ty - e.y)),
      step = Math.min(distance, s.speed * dt);
    e.x += ((tx - e.x) / distance) * step;
    e.y += ((ty - e.y) / distance) * step;
    // No animal steering or escape behaviour for loose matter.
    if (s.matterMotion === 'drift') e.heading += dt * 0.025;
    if (STAGES[this.stage].id === 'land') constrainToShore(e, s);
  }
  stream(x, y, time, force = false, radius = this.radius) {
    super.stream(x, y, time, force, radius);
    if (this.finalEntity && !this.entities.includes(this.finalEntity))
      this.entities.push(this.finalEntity);
  }
  spawnFinal(p) {
    if (this.stage !== STAGES.length - 1 || p.finalEaten) return;
    if (p.digestion.some((f) => f.final)) {
      this.finalSpawned = true;
      return;
    }
    if (this.finalSpawned && this.finalEntity && !this.finalEntity.eaten)
      return;
    const s = STAGE_SPECIES.at(-1).find((s) => s.kind === 'final');
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
