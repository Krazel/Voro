// Fixed food rewards calibrated against full real-engine campaigns (2026-09-29).
// Minutes are design targets, never timers or adaptive throttles. Keep edible
// sizes, stage goals, movement, cinematics and existing saved progress intact.
export const CAMPAIGN_PACING = {
 micro: {minutes:12, biomass:.158}, pond:{minutes:10,biomass:.172},
 land:{minutes:10,biomass:.191}, water:{minutes:10,biomass:.145},
 city:{minutes:12,biomass:.128}, orbit:{minutes:7,biomass:.257},
 planets:{minutes:8,biomass:.169}, stars:{minutes:8,biomass:.206},
 galaxies:{minutes:7,biomass:.160}, universe:{minutes:5,biomass:.130},
};
export const biomassYield = id => CAMPAIGN_PACING[id]?.biomass ?? 1;
// Increase the approved 0.68 food XP reward by 10%, without adaptive pacing.
export const ADAPTATION_FOOD_GAIN = 0.748;
// Apply once to both proportional and minimum incoming damage. Unspent XP
// follows the actual fraction of biomass lost, so it receives the same relief.
export const INCOMING_DAMAGE_FACTOR = 0.60;
// Actual gameplay loss: contacts cost 10%, projectiles can cost less. Keep
// this explicit instead of deriving contact damage from an old enemy value.
export const CONTACT_BIOMASS_LOSS = 0.10;
// Fixed food reward per biome. Never penalize earned choices, elapsed time
// or being ahead of a stage target. Existing XP and thresholds stay intact.
export const adaptationYield = id => Math.max(.25, Math.sqrt(biomassYield(id)));
