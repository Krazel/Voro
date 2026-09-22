# VORO age-rating investigation — 2026-09-22

Release candidate: 0.6.2(1), build 118537c4-7428-4664-a1da-1b96cb35e240, source aa0695334e428c03820aa2c5b442235b94189694. This is a content assessment, not an individual ruling from App Review.

## Findings

Absorbing smaller organisms does not by itself establish frequent fantasy violence. Current US App Store examples include Osmos (4+), Hole.io (4+) and Agar.io (9+; its displayed descriptors include infrequent crude humor and loot boxes, not fantasy violence). These are useful comparisons, not binding precedents for VORO.

The complete VORO candidate also includes armed soldiers, a shield unit, an armored vehicle, a tank, a helicopter and an armed spacecraft. Verified in the exact candidate's app/journey-data.mjs and the matching public/inhabitants/city.png artwork. app/journey-world.mjs spawns repeated aimed projectiles at intervals of 2.2–4 seconds for city attackers in range. app/engine.ts renders these and applies damage on collision; app/simulation.mjs models mass loss, knockback and death. This goes beyond passive abstract absorption. No changes to these inspected files since the candidate commit.

Apple defines fantasy violence as fantastical physical conflict or harm; weapons include depictions or references to guns and other harmful weapons. Current global categories place frequent fantasy violence and frequent weapons at 13+, and infrequent instances at 9+. A mild visual style does not automatically make repeated content infrequent; current API values are NONE, INFREQUENT and FREQUENT.

Assessment: retaining 13+ is the better-supported interpretation for the existing full game, particularly the recurring armed combat in the city stage. Frequency is a qualitative classification, not an Apple-published numeric shots-per-minute threshold. An authoritative borderline determination would require App Review clarification; comparisons cannot guarantee a lower rating.

Found an incorrect questionnaire answer: gunsOrOtherWeapons was NONE. The scoped correction sets it to FREQUENT, keeping the other existing declarations and the selected candidate. It does not submit a review or change the game's content. A dark color palette alone is not proof of horror; this research does not claim to settle that separate descriptor.

## Primary sources checked

- https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions
- https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating
- https://developer.apple.com/documentation/appstoreconnectapi/age-ratings
- https://apps.apple.com/us/app/osmos/id382991304
- https://apps.apple.com/us/app/hole-io/id1389111413
- https://apps.apple.com/us/app/agar-io/id995999703
