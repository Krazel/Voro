import { random } from './simulation.mjs';
export const UPGRADES = [
  {
    id: 'reach',
    name: 'Pseudópodos largos',
    detail: '+15 % de alcance por nivel',
    max: 3,
    group: 'Comer',
  },
  {
    id: 'slots',
    name: 'Vacuolas adicionales',
    detail: '+1 alimento simultáneo por nivel',
    max: 3,
    group: 'Comer',
  },
  {
    id: 'digest',
    name: 'Enzimas rápidas',
    detail: '+25 % de velocidad de digestión por nivel',
    max: 3,
    group: 'Comer',
  },
  {
    id: 'yield',
    name: 'Núcleo eficiente',
    detail: '+12 % de biomasa por alimento y nivel',
    max: 3,
    group: 'Comer',
  },
  {
    id: 'speed',
    name: 'Flagelos potentes',
    detail: '+15 % de velocidad por nivel',
    max: 3,
    group: 'Moverse',
  },
  {
    id: 'turn',
    name: 'Cuerpo flexible',
    detail: '+30 % de agilidad por nivel',
    max: 3,
    group: 'Moverse',
  },
  {
    id: 'dash',
    name: 'Impulso elástico',
    detail: 'Impulso más potente y largo · recarga 7 / 5 / 3 s',
    max: 3,
    group: 'Moverse',
  },
  {
    id: 'pull',
    name: 'Corriente aspirante',
    detail: 'Amplía mucho la corriente que acerca el alimento pequeño',
    max: 3,
    group: 'Comer',
  },
  {
    id: 'armor',
    name: 'Membrana densa',
    detail: 'Recibes un 12 % menos de daño por nivel',
    max: 3,
    group: 'Defenderse',
  },
  {
    id: 'shield',
    name: 'Escudo gelatinoso',
    detail: 'Bloquea un golpe · recarga 20 / 16 / 12 s',
    max: 3,
    group: 'Defenderse',
  },
  {
    id: 'recycle',
    name: 'Reciclaje celular',
    detail: 'Recupera el 25 / 40 / 55 % de la biomasa perdida',
    max: 3,
    group: 'Defenderse',
  },
  {
    id: 'spikes',
    name: 'Espinas retráctiles',
    detail: 'Dañas y ahuyentas al atacante al recibir un golpe',
    max: 3,
    group: 'Cazar',
  },
  {
    id: 'trail',
    name: 'Estela viscosa',
    detail: 'Ralentizas perseguidores un 20 / 30 / 40 %',
    max: 3,
    group: 'Cazar',
  },
  {
    id: 'tentacles',
    name: 'Tentáculos cazadores',
    detail:
      '1 / 2 / 3 tentáculos persiguen, agarran y acercan presas comestibles',
    max: 3,
    group: 'Cazar',
  },
  {
    id: 'combo',
    name: 'Hambre encadenada',
    detail: '3 comidas seguidas: +20 % de movimiento y digestión durante 4 s',
    max: 1,
    group: 'Rara',
  },
];
export const levelOf = (chosen, id) => chosen.filter((x) => x === id).length;
export function upgradeStats(chosen, combo = false) {
  const n = (id) => Math.min(3, levelOf(chosen, id));
  return {
    reachFactor: 1 + n('reach') * 0.15,
    absorptionSlots: 3 + n('slots'),
    digestFactor: 1 + n('digest') * 0.25 + (combo ? 0.2 : 0),
    yieldFactor: 1 + n('yield') * 0.12,
    speedFactor: Math.min(1.65, 1 + n('speed') * 0.15 + (combo ? 0.2 : 0)),
    steeringFactor: 1 + n('turn') * 0.3,
    cooldownSeconds: 9,
    cooldownFactor: (9 - n('dash') * 2) / 9,
    boostStrength: [1.45, 1.8, 2.15, 2.5][n('dash')],
    boostDuration: 0.28 + n('dash') * 0.1,
    damageFactor: 1 - n('armor') * 0.12,
    attraction: n('pull') * 28,
    shieldCooldown: n('shield') ? 24 - n('shield') * 4 : 0,
    recycleFraction: n('recycle') ? 0.1 + n('recycle') * 0.15 : 0,
    spikeFraction: n('spikes') * 0.12,
    trailSlow: n('trail') ? 0.1 + n('trail') * 0.1 : 0,
    tentacles: n('tentacles'),
  };
}
export const nextAdaptation = (level) => 6 + level * 6 + level * level * 1.5;
export const previousJourneyAdaptation = (level) =>
  24 + level * 24 + level * level * 4;
export const journeyAdaptation = (level) => 18 + level * 18 + level * level * 3;
export function offerUpgrades(chosen, seed, level, excluded = []) {
  const rng = random(
    (seed + Math.imul(level + 1, 104729) + (excluded.length ? 32452843 : 0)) >>>
      0,
  );
  const pool = UPGRADES.filter((u) => levelOf(chosen, u.id) < u.max)
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
  return !!u && offer.includes(id) && levelOf(chosen, id) < u.max;
}
