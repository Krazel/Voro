// The threat travels with the shot. Compare it to the player's current biomass
// on impact, so growth also neutralizes shots that were already in flight.
export function projectileThreatMass(sourceRequiredMass, damage) {
  const potency = 1 + Math.max(1, Math.min(3, damage / .08)) * .5;
  return Math.max(0, sourceRequiredMass) * potency * potency;
}
