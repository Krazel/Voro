export const MIN_SIZE_FACTOR = 0.88;
export const MAX_SIZE_FACTOR = 1.12;
// Shared by world generation and the atlas. Ranges describe a population,
// not an automatic growth modifier for every species.
export function sizeFactors(s) {
  if (s.kind === 'final' || s.unique) return [1, 1];
  if (s.sizeFactors) return s.sizeFactors;
  if (s.motion === 'swimmer' || /^city-[0-3]$/.test(s.id)) return [0.94, 1.06];
  if (s.motion === 'vehicle' || s.motion === 'rotor') return [0.9, 1.1];
  if (s.motion === 'building') return [0.7, 1.35];
  if (s.motion === 'planet') return [0.55, 1.5];
  if (s.motion === 'galaxy') return [0.6, 1.4];
  if (s.motion === 'star') return [0.75, 1.3];
  if (s.motion === 'spin' || s.edibleMatter) return [0.65, 1.4];
  if (s.motion === 'fish') return [0.8, 1.2];
  if (s.motion === 'jelly' || s.motion === 'octopus') return [0.75, 1.25];
  if (s.motion === 'insect') return [0.85, 1.15];
  if (s.motion === 'walker' || s.motion === 'hop') return [0.85, 1.18];
  return [MIN_SIZE_FACTOR, MAX_SIZE_FACTOR];
}
export function sizeRange(species) {
  const [min, max] = sizeFactors(species);
  return {
    min: species.r * min,
    max: species.r * max,
  };
}
export function comparisonScale(species) {
  return Math.min(1, 145 / Math.max(...species.map((s) => sizeRange(s).max)));
}
