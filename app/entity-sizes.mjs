export const MIN_SIZE_FACTOR = 0.88;
export const MAX_SIZE_FACTOR = 1.12;
export function sizeRange(species) {
  return {
    min: species.r * (species.kind === 'final' ? 1 : MIN_SIZE_FACTOR),
    max: species.r * (species.kind === 'final' ? 1 : MAX_SIZE_FACTOR),
  };
}
export function comparisonScale(species) {
  return Math.min(1, 145 / Math.max(...species.map((s) => sizeRange(s).max)));
}
