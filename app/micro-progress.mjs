import { createLife, radiusForMass, clamp } from './simulation.mjs';
import {
  UPGRADES,
  MAX_UPGRADE_CHOICES,
  upgradeStats,
  offerUpgrades,
  validChoice,
  nextAdaptation,
  levelOf,
} from './mutations.mjs';
import { SPECIES_BY_ID } from './micro-world.mjs';
import { restoreShieldTimers } from './shields.mjs';
export const MICRO_SAVE = 'voro-micro-v1';
export const MATURITY = 150;
export function newMicro(seed = Math.floor(Math.random() * 0x7fffffff)) {
  return {
    seed,
    xp: 0,
    level: 0,
    mutations: /** @type {string[]} */ ([]),
    offer: /** @type {string[]} */ ([]),
    maturitySeen: false,
    deaths: 0,
    totalEaten: 0,
    totalTime: 0,
    shieldRecharge: 0,
    shieldTimers: /** @type {number[]} */ ([]),
  };
}
export function microLife(progress) {
  const life = createLife({
    unbounded: true,
    goalMass: MATURITY,
    maxMass: 240,
    growthFactor: 0.55,
    ...upgradeStats(progress.mutations),
  });
  life.free = true;
  return life;
}
export function refreshOffer(progress) {
  if (!progress.offer.length && progress.xp >= nextAdaptation(progress.level))
    progress.offer = offerUpgrades(
      progress.mutations,
      progress.seed,
      progress.level,
    );
  return progress.offer;
}
export function chooseUpgrade(progress, id) {
  if (!validChoice(progress.mutations, id, progress.offer)) return false;
  progress.mutations.push(id);
  progress.level++;
  progress.offer = [];
  refreshOffer(progress);
  return true;
}
export function saveMicro(progress, life, world, sound) {
  return JSON.stringify({
    version: 1,
    progress,
    sound,
    journal: [...world.journal],
    life: {
      biomass: life.biomass,
      x: life.x,
      y: life.y,
      eaten: life.eaten,
      elapsed: life.elapsed,
      digestion: life.digestion,
    },
  });
}
export function loadMicro(raw) {
  try {
    const d = JSON.parse(raw);
    if (d.version !== 1 || !d.progress || !d.life) return null;
    const p = d.progress,
      l = d.life;
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
      p.mutations.length > Math.max(45, MAX_UPGRADE_CHOICES) ||
      p.level !== p.mutations.length ||
      p.mutations.some(
        (id) =>
          !UPGRADES.some((u) => u.id === id) &&
          !['armor', 'trail'].includes(id),
      ) ||
      ['armor', 'trail'].some((id) => levelOf(p.mutations, id) > 3) ||
      UPGRADES.some((u) => levelOf(p.mutations, u.id) > Math.max(3, u.max))
    )
      return null;
    const progress = {
      ...newMicro(p.seed),
      xp: p.xp,
      level: p.level,
      mutations: p.mutations,
      maturitySeen: p.maturitySeen === true,
      deaths: p.deaths,
      totalEaten: p.totalEaten,
      totalTime: p.totalTime,
      shieldRecharge: Math.min(30, p.shieldRecharge),
      shieldTimers: restoreShieldTimers(
        p,
        upgradeStats(p.mutations).shieldCapacity,
      ),
    };
    refreshOffer(progress);
    const life = microLife(progress);
    life.biomass = clamp(l.biomass, 0, 240);
    life.radius = radiusForMass(life.biomass);
    life.x = l.x;
    life.y = l.y;
    life.eaten = l.eaten;
    life.elapsed = l.elapsed;
    life.dead = life.biomass === 0;
    life.invulnerable = 2;
    if (Array.isArray(l.digestion) && !life.dead)
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
            f.value <= 20 &&
            f.r > 0 &&
            f.r <= 150,
        )
        .map((f) => ({ ...f, done: false, final: false }));
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
