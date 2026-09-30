import { SPECIES_BY_ID } from './journey-data.mjs';
import { drawInhabitant } from './inhabitant-animation.mjs';
import { citySpriteScale } from './city-layout.mjs';
export const journeyHeading = (id, heading) => SPECIES_BY_ID[id]?.directionalArt ? 0 : SPECIES_BY_ID[id]?.fixedHeading ?? heading;
// The gallery and the game use the identical pose renderer.
/** @param {import('./animation-sheets.mjs').AnimationSheets | null} sheets */
export function drawJourneySprite(
  c,
  images,
  id,
  r,
  seed,
  time,
  motion = 1,
  hurt = 0,
  sheets = null,
  heading = 0,
) {
  const s = SPECIES_BY_ID[id];
  if (!s) return;
  drawInhabitant(c, images[s.imageAtlas || s.atlas], s, r * citySpriteScale(s), seed, time, {
    activity: motion,
    hurt,
    sheets,
    heading,
  });
}
