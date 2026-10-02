// Fixed food rewards calibrated against full real-engine campaigns (2026-09-30;
// City shortened to an eight-minute target on 2026-10-02).
// Minutes are design targets, never timers or adaptive throttles. Keep edible
// sizes, stage goals, movement, cinematics and existing saved progress intact.
export const CAMPAIGN_PACING = {
 micro: {minutes:8, biomass:.223}, pond:{minutes:8,biomass:.224},
 land:{minutes:8,biomass:.245}, water:{minutes:9,biomass:.163},
 city:{minutes:8,biomass:.190}, orbit:{minutes:7,biomass:.310},
 planets:{minutes:8,biomass:.169}, stars:{minutes:8,biomass:.213},
 galaxies:{minutes:7,biomass:.160}, universe:{minutes:5,biomass:.125},
};
export const biomassYield = id => CAMPAIGN_PACING[id]?.biomass ?? 1;
// Restore the food XP reward from before the 20% reduction (2993110).
export const ADAPTATION_FOOD_GAIN = 0.85;
// Apply once to both proportional and minimum incoming damage. Unspent XP
// follows the actual fraction of biomass lost, so it receives the same relief.
export const INCOMING_DAMAGE_FACTOR = 0.60;
// Actual gameplay loss: contacts cost 10%, projectiles can cost less. Keep
// this explicit instead of deriving contact damage from an old enemy value.
export const CONTACT_BIOMASS_LOSS = 0.10;
// Preserve that version's XP curve independently of biomass calibration.
// Stage duration changes must not silently change adaptation rewards again.
const ADAPTATION_REFERENCE = {
 micro:.13, pond:.16, land:.16, water:.136, city:.104,
 orbit:.32, planets:.2, stars:.23, galaxies:.3, universe:.3,
};
export const adaptationYield = id => Math.max(.25, Math.sqrt(ADAPTATION_REFERENCE[id] ?? 1));
