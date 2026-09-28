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
// Fixed food reward per biome. Never penalize earned choices, elapsed time
// or being ahead of a stage target. Existing XP and thresholds stay intact.
export const adaptationYield = id => Math.max(.25, Math.sqrt(biomassYield(id)));
