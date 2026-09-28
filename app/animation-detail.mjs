// Approved clear cases from the complete 2026-09-28 audit. Preserve the rigs,
// timings and standard fallback; additional detail is exported, never meshed live.
export const DETAILED_ANIMATIONS = new Set([
 'spiny','giant','pond-3','pond-4','pond-5','pond-6','pond-7',
 'land-5','land-7','land-8','land-9','land-10','land-11','land-matter-grass',
 'water-8','water-10','water-11','water-12','water-13','water-14','water-15','water-16',
 'water-matter-kelp','city-matter-palm',
]);
export function exportDetailTiers(s,crop) {
 const normal=['hunter','giant'].includes(s.id)?256:192;
 const tiers={normal};
 if(DETAILED_ANIMATIONS.has(s.id)) {
  const extent=3*Math.max(1,crop[3]/crop[2]);
  tiers.md=Math.ceil((s.id==='giant'?224:192)*extent/2);
  tiers.hd=['spiny','giant'].includes(s.id)?384:Math.ceil(Math.min(320,crop[2])*extent/2);
 }
 if(s.id==='hunter')tiers.hd=384;
 return tiers;
}
