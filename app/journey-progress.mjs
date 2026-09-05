import { createLife, radiusForMass, clamp } from './simulation.mjs';
import { newMicro, loadMicro, MICRO_SAVE } from './micro-progress.mjs';
import {
  upgradeStats,
  UPGRADES,
  MAX_UPGRADE_CHOICES,
  levelOf,
  offerUpgrades,
  validChoice,
  journeyAdaptation,
  nextAdaptation,
  previousJourneyAdaptation,
  v3JourneyAdaptation,
  eligibleUpgrade,
  boundedUpgrades,
} from './mutations.mjs';
import {
  STAGES,
  SPECIES_BY_ID,
  stageStartMass,
  physicalDiameter,
  metersPerUnit,
} from './journey-data.mjs';
import { restoreShieldTimers } from './shields.mjs';
export { MICRO_SAVE };
export const JOURNEY_SAVE = 'voro-journey-v1';
export function newJourney(seed) {
  return {
    ...newMicro(seed),
    stage: 0,
    adaptationVersion: 4,
    upgradeLimitsVersion: 1,
    journeyVersion: 2,
    rerollUsed: false,
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
  life.biomass = stageStartMass(p.stage || 0);
  life.radius = radiusForMass(life.biomass);
  life.free = true;
  return life;
}
export function advanceJourney(p, life) {
  if (p.stage >= STAGES.length - 1) return life;
  const previousDiameter = physicalDiameter(p.stage, life.biomass);
  p.totalTime += life.elapsed;
  p.totalEaten += life.eaten;
  p.stage++;
  p.pendingEvolution = false;
  p.finalReady = false;
  p.shieldRecharge = 0;
  p.shieldTimers = [];
  const next = journeyLife(p);
  const scale = STAGES[p.stage].base * metersPerUnit(STAGES[p.stage].unit);
  next.biomass = Math.max(next.biomass, 8 * (previousDiameter / scale) ** 2);
  next.radius = radiusForMass(next.biomass);
  next.invulnerable = 3;
  return next;
}
export function saveJourney(p, l, w, sound, fragments = []) {
  return JSON.stringify({
    version: 1,
    progress: p,
    sound,
    fragments: fragments.filter((f) => !f.eaten).slice(-24),
    journal: [...w.journal],
    life: {
      biomass: l.biomass,
      x: l.x,
      y: l.y,
      eaten: l.eaten,
      elapsed: l.elapsed,
      cooldown: l.cooldown,
      digestion: l.digestion,
    },
  });
}
export function migrateMicro(raw) {
  const d = loadMicro(raw);
  if (!d) return null;
  const p = { ...newJourney(d.progress.seed), ...d.progress, stage: 0 };
  p.xp = migrateAdaptationXp(p.xp, p.level);
  p.mutations = boundedUpgrades(p.mutations);
  p.level = p.mutations.length;
  p.adaptationVersion = 4;
  p.offer = [];
  refreshOffer(p);
  const l = journeyLife(p);
  Object.assign(l, d.life);
  l.maxMass = STAGES[0].goal * 1.5;
  return { ...d, progress: p, life: l, fragments: [] };
}
export function loadJourney(raw) {
  try {
    const d = JSON.parse(raw);
    if (d.version !== 1 || !d.progress || !d.life) return null;
    const p = d.progress,
      l = d.life;
    const stage =
      p.journeyVersion === 2 ? p.stage : [0, 3, 2, 4, 5, 6, 7, 8, 9][p.stage];
    if (!Number.isInteger(stage) || stage < 0 || stage >= STAGES.length)
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
      p.mutations.length > Math.max(45, MAX_UPGRADE_CHOICES) ||
      p.level !== p.mutations.length ||
      p.mutations.some(
        (id) =>
          !UPGRADES.some((u) => u.id === id) &&
          !['armor', 'trail'].includes(id),
      ) ||
      ['armor', 'trail'].some((id) => levelOf(p.mutations, id) > 3) ||
      UPGRADES.some(
        (u) =>
          levelOf(p.mutations, u.id) >
          (p.upgradeLimitsVersion === 1 ? u.max : Math.max(3, u.max)),
      )
    )
      return null;
    const mutations = boundedUpgrades(p.mutations);
    const progress = {
      ...newJourney(p.seed),
      stage,
      xp:
        p.adaptationVersion === 4
          ? p.xp
          : migrateAdaptationXp(p.xp, p.level, p.adaptationVersion),
      rerollUsed: p.rerollUsed === true,
      // Refund retired choices as ready adaptations, retaining the earned XP floor.
      level: mutations.length,
      mutations,
      deaths: p.deaths,
      totalEaten: p.totalEaten,
      totalTime: p.totalTime,
      shieldRecharge: clamp(p.shieldRecharge, 0, 30),
      shieldTimers: restoreShieldTimers(
        p,
        upgradeStats(mutations).shieldCapacity,
      ),
      maturitySeen: p.maturitySeen === true,
      pendingEvolution:
        p.pendingEvolution === true && stage < STAGES.length - 1,
      completed: p.completed === true && stage === STAGES.length - 1,
      finalReady: p.finalReady === true && stage === STAGES.length - 1,
    };
    if (progress.level < p.level) {
      // The earned XP floor leaves removed repetitions available as new choices.
      progress.xp = Math.max(progress.xp, journeyAdaptation(p.level - 1));
      progress.rerollUsed = false;
    }
    if (!progress.completed) refreshOffer(progress);
    const life = journeyLife(progress);
    Object.assign(life, {
      biomass: clamp(l.biomass, 0, life.maxMass),
      x: l.x,
      y: l.y,
      eaten: l.eaten,
      elapsed: l.elapsed,
      cooldown: Number.isFinite(l.cooldown)
        ? clamp(l.cooldown, 0, life.cooldownSeconds)
        : 0,
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
    const fragments =
      !life.dead && Array.isArray(d.fragments)
        ? d.fragments
            .slice(-24)
            .filter(
              (f) =>
                f &&
                f.recycled === true &&
                !f.eaten &&
                SPECIES_BY_ID[f.kind] &&
                [
                  f.x,
                  f.y,
                  f.vx,
                  f.vy,
                  f.age,
                  f.collectDelay,
                  f.heading,
                  f.seed,
                  f.r,
                  f.value,
                ].every(Number.isFinite) &&
                f.r > 0 &&
                f.r < 160 &&
                f.value > 0 &&
                f.value <= 50 &&
                f.age >= 0 &&
                f.collectDelay >= 0 &&
                f.collectDelay <= 0.85 &&
                Math.hypot(f.x - life.x, f.y - life.y) < 1300,
            )
            .map((f) => ({ ...f, requiredMass: 0, final: false }))
        : [];
    return { progress, life, sound: d.sound !== false, journal, fragments };
  } catch {
    return null;
  }
}

// Preserve progress within the current adaptation when loading the previous cadence.
export function migrateAdaptationXp(xp, level, version = 1) {
  const oldThreshold =
    version === 3
      ? v3JourneyAdaptation
      : version === 2
        ? previousJourneyAdaptation
        : nextAdaptation;
  const oldStart = level ? oldThreshold(level - 1) : 0,
    newStart = level ? journeyAdaptation(level - 1) : 0;
  const fraction = Math.max(
    0,
    (xp - oldStart) / (oldThreshold(level) - oldStart),
  );
  return newStart + fraction * (journeyAdaptation(level) - newStart);
}
export function refreshOffer(p) {
  if (!p.offer.length && !p.completed && p.xp >= journeyAdaptation(p.level)) {
    const original = offerUpgrades(p.mutations, p.seed, p.level);
    p.offer = p.rerollUsed
      ? offerUpgrades(p.mutations, p.seed, p.level, original)
      : original;
  }
  return p.offer;
}
export function canReroll(p) {
  return (
    !p.completed &&
    !p.rerollUsed &&
    p.offer.length > 0 &&
    UPGRADES.some(
      (u) => eligibleUpgrade(p.mutations, u) && !p.offer.includes(u.id),
    )
  );
}
export function rerollAdaptation(p) {
  if (!canReroll(p)) return false;
  p.offer = offerUpgrades(p.mutations, p.seed, p.level, p.offer);
  p.rerollUsed = true;
  return true;
}
export function chooseUpgrade(p, id) {
  if (!validChoice(p.mutations, id, p.offer)) return false;
  p.mutations.push(id);
  if (id === 'shield') {
    p.shieldTimers = restoreShieldTimers(
      p,
      upgradeStats(p.mutations).shieldCapacity - 1,
    );
    p.shieldTimers.push(0);
    p.shieldRecharge = 0;
  }
  p.level++;
  p.offer = [];
  p.rerollUsed = false;
  refreshOffer(p);
  return true;
}

// Only unspent progress is at risk. Earned adaptations and their thresholds
// remain intact, including when a hit is fatal.
export function loseAdaptationProgress(p, fraction) {
  const start = p.level ? journeyAdaptation(p.level - 1) : 0;
  const lost = Math.max(0, p.xp - start) * clamp(fraction, 0, 1);
  p.xp -= lost;
  if (p.xp < journeyAdaptation(p.level)) p.offer = [];
  return lost;
}
