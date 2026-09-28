// Reward coefficients only: keep goals, edible sizes, movement and saved mass.
// Human reference: ~30 min now versus 16.5 min for the efficient autopilot.
// These budgets are targets, not a measured duration for every player.
export const CAMPAIGN_PACING = {
 micro: {minutes:19, biomass:.13}, pond:{minutes:16,biomass:.16},
 land:{minutes:18,biomass:.16}, water:{minutes:17,biomass:.136},
 city:{minutes:18,biomass:.104}, orbit:{minutes:11,biomass:.32},
 planets:{minutes:8,biomass:.2}, stars:{minutes:7,biomass:.23},
 galaxies:{minutes:4,biomass:.3}, universe:{minutes:2,biomass:.3},
};
export const biomassYield = id => CAMPAIGN_PACING[id]?.biomass ?? 1;
// Adaptations remain more frequent than biome changes. Existing XP is intact.
export const ADAPTATION_PACING = {
 micro:.7, pond:.8, land:.85, water:.9, city:.65,
 orbit:1, planets:1.35, stars:1.6, galaxies:1.8, universe:1.8,
};
// Soft pacing, not a biome lock: prolonged feeding can always earn another
// choice, but cannot cheaply exhaust the campaign's finite pool early on.
export const ADAPTATION_SOFT_TARGET = {
 micro:10, pond:18, land:26, water:34, city:43,
 orbit:49, planets:55, stars:60, galaxies:65, universe:70,
};
export const adaptationYield = (id,level=0) => {
 const ahead=Math.max(0,level-(ADAPTATION_SOFT_TARGET[id] ?? 70));
 return Math.max(.25, Math.sqrt(biomassYield(id))) * (ADAPTATION_PACING[id] ?? 1)
   / (1+(ahead/3)**2);
};
