import { createLife, radiusForMass, clamp } from './simulation.mjs';
import {
  newMicro,
  loadMicro,
  MICRO_SAVE,
  refreshOffer,
  chooseUpgrade,
} from './micro-progress.mjs';
import { upgradeStats, UPGRADES, levelOf } from './mutations.mjs';
import { STAGES, SPECIES_BY_ID } from './journey-data.mjs';
export { refreshOffer, chooseUpgrade, MICRO_SAVE };
export const JOURNEY_SAVE = 'voro-journey-v1';
export function newJourney(seed) {
  return {
    ...newMicro(seed),
    stage: 0,
    completed: false,
    pendingEvolution: false,
    finalReady: false,
  };
}
export function journeyLife(p) {
  const s = STAGES[p.stage || 0];
  const life = createLife({
    unbounded: true,
    goalMass: s.goal,
    maxMass: s.goal * 1.5,
    growthFactor: s.growth,
    ...upgradeStats(p.mutations),
  });
  life.free = true;
  return life;
}
export function advanceJourney(p, life) {
  if (p.stage >= STAGES.length - 1) return life;
  p.totalTime += life.elapsed;
  p.totalEaten += life.eaten;
  p.stage++;
  p.pendingEvolution = false;
  p.finalReady = false;
  p.shieldRecharge = 0;
  const next = journeyLife(p);
  next.invulnerable = 3;
  return next;
}
export function saveJourney(p, l, w, sound) {
  return JSON.stringify({
    version: 1,
    progress: p,
    sound,
    journal: [...w.journal],
    life: {
      biomass: l.biomass,
      x: l.x,
      y: l.y,
      eaten: l.eaten,
      elapsed: l.elapsed,
      digestion: l.digestion,
    },
  });
}
export function migrateMicro(raw) {
  const d = loadMicro(raw);
  if (!d) return null;
  const p = { ...newJourney(d.progress.seed), ...d.progress, stage: 0 };
  const l = journeyLife(p);
  Object.assign(l, d.life);
  l.maxMass = STAGES[0].goal * 1.5;
  return { ...d, progress: p, life: l };
}
export function loadJourney(raw) {
  try {
    const d = JSON.parse(raw);
    if (d.version !== 1 || !d.progress || !d.life) return null;
    const p = d.progress,
      l = d.life;
    if (!Number.isInteger(p.stage) || p.stage < 0 || p.stage >= STAGES.length)
      return null;
    for (const n of [
      p.seed,
      p.xp,
      p.level,
      p.deaths,
      p.totalEaten,
      p.totalTime,
      p.shieldRecharge,
      l.biomass,
      l.eaten,
      l.elapsed,
    ])
      if (!Number.isFinite(n) || n < 0) return null;
    if (
      !Number.isFinite(l.x) ||
      !Number.isFinite(l.y) ||
      Math.abs(l.x) > 1e12 ||
      Math.abs(l.y) > 1e12
    )
      return null;
    if (
      !Array.isArray(p.mutations) ||
      p.mutations.length > 43 ||
      p.level !== p.mutations.length ||
      p.mutations.some((id) => !UPGRADES.some((u) => u.id === id)) ||
      UPGRADES.some((u) => levelOf(p.mutations, u.id) > u.max)
    )
      return null;
    const progress = {
      ...newJourney(p.seed),
      stage: p.stage,
      xp: p.xp,
      level: p.level,
      mutations: p.mutations,
      deaths: p.deaths,
      totalEaten: p.totalEaten,
      totalTime: p.totalTime,
      shieldRecharge: clamp(p.shieldRecharge, 0, 30),
      maturitySeen: p.maturitySeen === true,
      pendingEvolution: p.pendingEvolution === true && p.stage < 8,
      completed: p.completed === true && p.stage === 8,
      finalReady: p.finalReady === true && p.stage === 8,
    };
    if (!progress.completed) refreshOffer(progress);
    const life = journeyLife(progress);
    Object.assign(life, {
      biomass: clamp(l.biomass, 0, life.maxMass),
      x: l.x,
      y: l.y,
      eaten: l.eaten,
      elapsed: l.elapsed,
      invulnerable: 2,
    });
    life.radius = radiusForMass(life.biomass);
    life.dead = life.biomass === 0;
    if (life.dead) progress.pendingEvolution = false;
    if (Array.isArray(l.digestion) && !life.dead && !progress.completed)
      life.digestion = l.digestion
        .slice(0, life.absorptionSlots)
        .filter(
          (f) =>
            f &&
            SPECIES_BY_ID[f.kind] &&
            [f.dx, f.dy, f.progress, f.rotation, f.value, f.r].every(
              Number.isFinite,
            ) &&
            f.progress >= 0 &&
            f.progress < 1 &&
            f.value > 0 &&
            f.value <= 50 &&
            f.r > 0 &&
            f.r <= 320,
        )
        .map((f) => ({
          ...f,
          done: false,
          final: f.final === true && f.kind === 'universe-11',
        }));
    const journal = Array.isArray(d.journal)
      ? d.journal
          .slice(-2048)
          .filter(
            (e) =>
              Array.isArray(e) &&
              typeof e[0] === 'string' &&
              e[0].length < 80 &&
              Number.isFinite(e[1]) &&
              e[1] > life.elapsed &&
              e[1] <= life.elapsed + 160,
          )
      : [];
    return { progress, life, sound: d.sound !== false, journal };
  } catch {
    return null;
  }
}
