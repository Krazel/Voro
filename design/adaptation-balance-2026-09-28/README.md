# Adaptation separation and balance review

User request: decouple aspiration from pseudopods, replace contact damage with
attacker repulsion, retain hunting tentacles in Hunting, audit long-campaign
balance and suggest new choices only if genuinely useful.

## Implemented candidate

- `reach` renamed Absorción amplia / Wider absorption: fixed +7.5%, cap6
  unchanged. Only absorption distance improves. Aspiration uses radius+22+14n,
  no reach multiplier. Hunting tentacle reach remains independent.
- Historical `spikes` ID preserved for saves, renamed Membrana repulsora /
  Repelling membrane, moved to Defense. Each choice grants .5 player radii of
  additional separation; cap6 =3 radii. Resolves initial overlap, then visibly
  eases the attacker outward over .4s. Only moving contact attackers; no remote
  projectile reflection or movement of static hazards. Does not change enemy
  wounds, value or edible mass. Works on shielded contact. Ranged shooting and
  steering yield during the push; home anchor follows actual displacement to
  avoid leash snapback. Shore/city constraints still apply. Directional membrane
  pulse replaces the old thorn rendering. Existing selected `spikes` choices
  automatically gain the new effect without changing save IDs or limits.
- Tentacles stays Hunting. No new adaptations, XP thresholds, other bonuses,
  or caps changed. Total capacity remains75. Local candidate only; installed
  Windows0.8.1 and TestFlight0.8.1 are unchanged.

## Balance findings (recommendations, not implemented)

Actual stage targets total120 minutes, an estimate based on the earlier human
reference, not a measured duration for everyone. Two seed41 natural-feeding
pilots were run with the same navigation and different preference for yield.
See balance-summary.json. Prioritizing yield:3963 simulated seconds, no deaths,
75 choices, capped by entry to Stars. Yield last:4883 seconds, no deaths,
68 choices. Differing navigation/feeding outcomes mean the timing difference
is not a causal estimate of the upgrade's power. Early stage choices:17 vs13
at Pond,49 vs36 at City,70 vs51 at Orbit.

All14 reviewed:

| Adaptation | Assessment |
| --- | --- |
| Wider absorption | Overlaps initial tentacle reach at high growth. Current max1.624R exceeds initial tentacle1.5R+10 once R>80.65. Proposed +5% per choice (max1.456R) preserves the distinct short-range role. Not changed without discussion. |
| Additional vacuoles | 3 to9 slots; mainly useful in dense food. Adds capacity, not yield. Retain. |
| Fast enzymes | 1.65s to.825s; max.6875s with full combo. Retain; complementary to slots, capped. |
| Accelerated adaptation | Most consequential for campaign length:8 choices reach+80% XP and can exhaust the choice pool early. Consider reducing to+5% each (max+40%) and re-running several seeds before settling. No cadence changed yet. |
| Powerful flagella | Max+45% permanent movement; full combo brings it to+85%, additive. Retain. |
| Flexible body | Max+60% steering response, not speed. Distinct but subtle; clearer card description may be preferable to more power. |
| Elastic dash | Max3s recharge, .62s boost, target speed3.22x. Strong but intermittent; preserve pending physical feel testing. |
| Aspiration | Broad weak passive pull; fixed84-unit bonus loses relative reach as body grows. Distinct from active tentacles, monitor usefulness late; no unsupported buff. |
| Gel shield | One40s renewable block; cannot stack invulnerability. Retain. |
| Recycling | Up to75% recovery requires collecting pieces; no XP refund. Strong survival choice, retains loss and recovery effort. |
| Repelling membrane | New contact escape tool; six equal increments. Needs player feel test, not declared fully balanced from unit tests. |
| Hunting tentacles | Six simultaneous edible-only captures. Clear capacity role; retains Hunting rarity. |
| Extensible tentacles | Requires tentacles; +.6R total reach. Clear range role once absorption overlap is reduced. |
| Chained hunger | +40% temporary movement/digestion, renewed feeding, broken by damage; additive to permanent bonuses. Strong active reward with rare offers. |

No new adaptation recommended: existing choices already cover absorption,
throughput, XP, movement, contact defense, recovery and automatic capture.
Fix overlap and early exhaustion before expanding the pool.

## Verification

15 targeted tests passed, including live engine interactions and three
microscopic survival seeds. New tests cover absorption/aspiration independence,
smooth repulsion, unchanged enemy value/threshold, coincident centers, static
hazards and movement integration across five environments, including shooters.
English translations verified. TypeScript and mobile/PC production builds pass.
Real local browser capture before/during/after confirms outward movement and no
renderer errors. Candidate catalogue has14 cards and3 Defense cards.

`pilot-yield-first.json` is the initial yield-first run (its per-choice events
array is empty; per-stage acquisition counts are valid). Only
`pilot-yield-last-verified.json` uses the corrected yield-last switch; the earlier
untracked duplicate yield-last run was not used for comparison.
