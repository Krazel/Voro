import { UPGRADES, boundedUpgrades, levelOf, upgradeStats } from './mutations.mjs';

// Read-only view of the same bounded selections used by the simulation.
export function ownedAdaptations(mutations) {
  const chosen = boundedUpgrades(mutations);
  return UPGRADES.map((upgrade, art) => ({
    ...upgrade, art, count: levelOf(chosen, upgrade.id),
  })).filter(upgrade => upgrade.count > 0);
}

export function ownedEffect(id, count, language = 'es') {
  const upgrade = UPGRADES.find(item => item.id === id);
  if (!upgrade || count <= 0) return '';
  const n = Math.min(upgrade.max, Math.floor(count));
  const s = upgradeStats(Array(n).fill(id));
  const en = language === 'en';
  const num = value => new Intl.NumberFormat(en ? 'en' : 'es', { maximumFractionDigits: 3 }).format(value);
  const pct = value => num(value * 100);
  const messages = {
    slots: en ? `Absorb ${s.absorptionSlots} foods at once (${n} extra).` : `Absorbe ${s.absorptionSlots} alimentos a la vez (${n} más).`,
    digest: en ? `Digest food ${pct(s.digestFactor - 1)}% faster.` : `Digieres la comida un ${pct(s.digestFactor - 1)} % más rápido.`,
    yield: en ? `Each food gives ${pct(s.adaptationFactor - 1)}% more adaptation progress.` : `Cada alimento da un ${pct(s.adaptationFactor - 1)} % más de progreso de adaptación.`,
    speed: en ? `Move ${pct(s.speedFactor - 1)}% faster.` : `Te mueves un ${pct(s.speedFactor - 1)} % más rápido.`,
    turn: en ? `Turn and change direction with ${pct(s.steeringFactor - 1)}% more agility.` : `Giras y cambias de dirección con un ${pct(s.steeringFactor - 1)} % más de agilidad.`,
    dash: en ? `Dash recharges in ${num(s.cooldownSeconds * s.cooldownFactor)} s. +${num(n * .1)} power and +${num(n * .025)} s duration.` : `El impulso recarga en ${num(s.cooldownSeconds * s.cooldownFactor)} s. +${num(n * .1)} de potencia y +${num(n * .025)} s de duración.`,
    pull: en ? `Pulls edible food towards you. Extra reach: ${pct(s.attraction)}% of your body radius, at least ${n * 14} world units.` : `Atrae comida comestible hacia ti. Alcance extra: ${pct(s.attraction)} % de tu radio corporal, mínimo ${n * 14} unidades del mundo.`,
    shield: en ? `Blocks one hit. Recharges every ${s.shieldCooldown} s.` : `Bloquea un golpe. Se recarga cada ${s.shieldCooldown} s.`,
    recycle: en ? `Recover ${pct(s.recycleFraction)}% of lost biomass by eating your scattered fragments.` : `Recupera el ${pct(s.recycleFraction)} % de la biomasa perdida comiendo tus fragmentos dispersos.`,
    spikes: en ? `Pushes an attacker away on contact by ${pct(s.repulsionFactor)}% of your body radius.` : `Repele al atacante al tocarte una distancia equivalente al ${pct(s.repulsionFactor)} % de tu radio corporal.`,
    tentacles: en ? `${s.tentacles} hunting ${s.tentacles === 1 ? 'tentacle grabs' : 'tentacles grab'} edible prey and slowly bring it closer.` : `${s.tentacles} ${s.tentacles === 1 ? 'tentáculo agarra' : 'tentáculos agarran'} presas comestibles y las acerca${s.tentacles === 1 ? '' : 'n'} lentamente.`,
    tentacleReach: en ? `Your hunting tentacles reach an extra ${pct(s.tentacleReach)}% of your body radius.` : `Tus tentáculos cazadores alcanzan un ${pct(s.tentacleReach)} % más de tu radio corporal.`,
    decoy: en ? 'Each dash leaves a decoy that distracts pursuers for 2 s. Shares the dash cooldown.' : 'Cada impulso deja una copia que distrae a tus perseguidores durante 2 s. Comparte la recarga del impulso.',
    combo: en ? `After 3 consecutive meals: +${n * 10}% movement and digestion speed for 4 s.` : `Tras 3 comidas seguidas: +${n * 10} % de velocidad de movimiento y digestión durante 4 s.`,
  };
  return messages[id];
}
