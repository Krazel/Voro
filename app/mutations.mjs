import { random } from './simulation.mjs';
export const UPGRADES = [
  {
    id: 'reach',
    name: 'Pseudópodos largos',
    detail: '+8 % de alcance por nivel',
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
    detail: '+12 % de velocidad de digestión por nivel',
    max: 3,
    group: 'Comer',
  },
  {
    id: 'yield',
    name: 'Núcleo eficiente',
    detail: '+5 % de biomasa por alimento y nivel',
    max: 3,
    group: 'Comer',
  },
  {
    id: 'speed',
    name: 'Flagelos potentes',
    detail: '+8 % de velocidad por nivel',
    max: 3,
    group: 'Moverse',
  },
  {
    id: 'turn',
    name: 'Cuerpo flexible',
    detail: '+12 % de agilidad por nivel',
    max: 3,
    group: 'Moverse',
  },
  {
    id: 'dash',
    name: 'Impulso elástico',
    detail: 'Recarga del impulso un 8 % menor por nivel',
    max: 3,
    group: 'Moverse',
  },
  {
    id: 'pull',
    name: 'Corriente aspirante',
    detail: 'Atraes alimento pequeño desde más lejos',
    max: 3,
    group: 'Comer',
  },
  {
    id: 'armor',
    name: 'Membrana densa',
    detail: 'Recibes un 6 % menos de daño por nivel',
    max: 3,
    group: 'Defenderse',
  },
  {
    id: 'shield',
    name: 'Escudo gelatinoso',
    detail: 'Bloquea un golpe · recarga 24 / 20 / 16 s',
    max: 3,
    group: 'Defenderse',
  },
  {
    id: 'recycle',
    name: 'Reciclaje celular',
    detail: 'Recoge el 20 / 30 / 40 % de la biomasa perdida',
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
    detail: 'Ralentizas perseguidores un 10 / 15 / 20 %',
    max: 3,
    group: 'Cazar',
  },
  {
    id: 'tentacles',
    name: 'Tentáculos cazadores',
    detail: 'Sujetarán 1 / 2 / 3 presas comestibles cercanas',
    max: 3,
    group: 'Cazar',
  },
  {
    id: 'combo',
    name: 'Hambre encadenada',
    detail: '3 comidas seguidas: +10 % de movimiento y digestión durante 4 s',
    max: 1,
    group: 'Rara',
  },
];
export const levelOf = (chosen, id) => chosen.filter((x) => x === id).length;
export function upgradeStats(chosen, combo = false) {
  const n = (id) => Math.min(3, levelOf(chosen, id));
  return {
    reachFactor: 1 + n('reach') * 0.08,
    absorptionSlots: 3 + n('slots'),
    digestFactor: 1 + n('digest') * 0.12 + (combo ? 0.1 : 0),
    yieldFactor: 1 + n('yield') * 0.05,
    speedFactor: Math.min(1.3, 1 + n('speed') * 0.08 + (combo ? 0.1 : 0)),
    steeringFactor: 1 + n('turn') * 0.12,
    cooldownFactor: 1 - n('dash') * 0.08,
    damageFactor: 1 - n('armor') * 0.06,
    attraction: n('pull') * 16,
    shieldCooldown: n('shield') ? 28 - n('shield') * 4 : 0,
    recycleFraction: n('recycle') ? 0.1 + n('recycle') * 0.1 : 0,
    spikeFraction: n('spikes') * 0.08,
    trailSlow: n('trail') ? 0.05 + n('trail') * 0.05 : 0,
    tentacles: n('tentacles'),
  };
}
export const nextAdaptation = (level) => 6 + level * 6 + level * level * 1.5;
export const journeyAdaptation = (level) => 24 + level * 24 + level * level * 4;
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
