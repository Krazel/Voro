import { random } from './simulation.mjs';
import { SHIELD_RECHARGE } from './shields.mjs';
const CARD_ART = {
  reach: 0,
  slots: 1,
  digest: 2,
  yield: 3,
  speed: 4,
  turn: 5,
  dash: 6,
  pull: 7,
  shield: 9,
  recycle: 10,
  spikes: 11,
  tentacles: 13,
  tentacleReach: 0,
  combo: 14,
};
export const UPGRADES = [
  {
    id: 'reach',
    name: 'Pseudópodos largos',
    detail: '+7,5 % de alcance',
    max: 6,
    group: 'Comer',
  },
  {
    id: 'slots',
    name: 'Vacuolas adicionales',
    detail: '+1 alimento simultáneo',
    max: 6,
    group: 'Comer',
  },
  {
    id: 'digest',
    name: 'Enzimas rápidas',
    detail: '+12,5 % de velocidad de digestión',
    max: 8,
    group: 'Comer',
  },
  {
    id: 'yield',
    name: 'Núcleo eficiente',
    detail: '+6 % de biomasa por alimento',
    max: 8,
    group: 'Comer',
  },
  {
    id: 'speed',
    name: 'Flagelos potentes',
    detail: '+7,5 % de velocidad',
    max: 6,
    group: 'Moverse',
  },
  {
    id: 'turn',
    name: 'Cuerpo flexible',
    detail: '+15 % de agilidad',
    max: 4,
    group: 'Moverse',
  },
  {
    id: 'dash',
    name: 'Impulso elástico',
    detail: '+0,18 de potencia · +0,05 s de impulso · −1 s de recarga',
    max: 4,
    group: 'Moverse',
  },
  {
    id: 'pull',
    name: 'Corriente aspirante',
    detail: '+14 de alcance de la corriente aspirante',
    max: 6,
    group: 'Comer',
  },
  {
    id: 'shield',
    name: 'Escudo gelatinoso',
    detail: '+1 escudo que bloquea un golpe y se recarga en 40 s',
    max: 4,
    group: 'Defenderse',
  },
  {
    id: 'recycle',
    name: 'Reciclaje celular',
    detail: '+12,5 % de recuperación de la biomasa perdida',
    max: 6,
    group: 'Defenderse',
  },
  {
    id: 'spikes',
    name: 'Espinas retráctiles',
    detail: '+6 % de daño al atacante cuando te golpea',
    max: 6,
    group: 'Cazar',
  },
  {
    id: 'tentacles',
    name: 'Tentáculos cazadores',
    detail: '+1 tentáculo que agarra y acerca lentamente presas comestibles',
    max: 6,
    group: 'Cazar',
  },
  {
    id: 'tentacleReach',
    name: 'Tentáculos extensibles',
    detail: '+15 % del radio corporal de alcance para tus tentáculos',
    requires: 'tentacles',
    max: 4,
    group: 'Cazar',
  },
  {
    id: 'combo',
    name: 'Hambre encadenada',
    detail: '3 comidas seguidas: +10 % de movimiento y digestión durante 4 s',
    max: 4,
    group: 'Rara',
  },
].map((u) => ({ ...u, artIndex: CARD_ART[u.id] }));
// Keep each painted card tied to its original cell in the illustrated atlas.

export const eligibleUpgrade = (chosen, u) =>
  levelOf(chosen, u.id) < u.max && (!u.requires || chosen.includes(u.requires));
export const MAX_UPGRADE_CHOICES = UPGRADES.reduce((sum, u) => sum + u.max, 0);
export const levelOf = (chosen, id) => chosen.filter((x) => x === id).length;
export function upgradeStats(chosen, combo = false) {
  const n = (id) =>
    Math.min(UPGRADES.find((u) => u.id === id)?.max ?? 0, levelOf(chosen, id));
  return {
    reachFactor: 1 + n('reach') * 0.075,
    absorptionSlots: 3 + n('slots'),
    digestFactor: 1 + n('digest') * 0.125 + (combo ? n('combo') * 0.1 : 0),
    yieldFactor: 1 + n('yield') * 0.06,
    speedFactor: 1 + n('speed') * 0.075 + (combo ? n('combo') * 0.1 : 0),
    steeringFactor: 1 + n('turn') * 0.15,
    cooldownSeconds: 7,
    cooldownFactor: (7 - n('dash')) / 7,
    boostStrength: 2.5 + n('dash') * 0.18,
    boostDuration: 0.42 + n('dash') * 0.05,
    damageFactor: 1,
    attraction: n('pull') * 14,
    shieldCooldown: n('shield') ? SHIELD_RECHARGE : 0,
    shieldCapacity: n('shield'),
    recycleFraction: n('recycle') * 0.125,
    spikeFraction: n('spikes') * 0.06,
    trailSlow: 0,
    tentacles: n('tentacles'),
    tentacleReach: n('tentacleReach') * 0.15,
  };
}
export const nextAdaptation = (level) => 6 + level * 6 + level * level * 1.5;
export const previousJourneyAdaptation = (level) =>
  24 + level * 24 + level * level * 4;
export const v3JourneyAdaptation = (level) =>
  18 + level * 18 + level * level * 3;
export const journeyAdaptation = (level) => 12 + level * 12 + level * level * 2;
export function offerUpgrades(chosen, seed, level, excluded = []) {
  const rng = random(
    (seed + Math.imul(level + 1, 104729) + (excluded.length ? 32452843 : 0)) >>>
      0,
  );
  const pool = UPGRADES.filter((u) => eligibleUpgrade(chosen, u))
    .map((u) => ({ ...u, key: rng() ** (u.group === 'Rara' ? 1.7 : 1) }))
    .sort((a, b) => b.key - a.key);
  return [
    ...pool.filter((u) => !excluded.includes(u.id)),
    ...pool.filter((u) => excluded.includes(u.id)),
  ]
    .slice(0, 3)
    .map((u) => u.id);
}
export function validChoice(chosen, id, offer) {
  const u = UPGRADES.find((u) => u.id === id);
  return !!u && offer.includes(id) && eligibleUpgrade(chosen, u);
}

// Preserve choice order when older saves contain selections above a revised cap.
export function boundedUpgrades(chosen) {
  const kept = [];
  for (const id of chosen) {
    const upgrade = UPGRADES.find((u) => u.id === id);
    if (upgrade && levelOf(kept, id) < upgrade.max) kept.push(id);
  }
  return kept;
}
