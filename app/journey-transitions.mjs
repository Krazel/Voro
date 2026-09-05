export const smooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** @type {Record<string, string>} */
export const TRANSITION_ROUTES = {
  micro: 'La gota forma parte de una charca junto a la costa.',
  pond: 'El agua se hace somera. La arena aparece bajo ti.',
  land: 'La marea cubre la arena. Sigues creciendo bajo el agua.',
  water: 'Sigues la costa hasta el puerto y sus calles.',
  city: 'Las calles se alejan. La curvatura del mundo aparece.',
  orbit: 'Dejas atrás la órbita y alcanzas los mundos vecinos.',
  planets: 'Más allá de los planetas están los soles que los iluminan.',
  stars: 'Al alejarte, los soles dibujan los brazos de una galaxia.',
  galaxies: 'Las galaxias se unen en filamentos de una misma red.',
};
export function transitionScene(stageId, progress, reduced = false) {
  const t = Math.max(0, Math.min(1, progress)),
    coastal = ['pond', 'land', 'water'].includes(stageId);
  return {
    coastal,
    incoming: smooth(0.18, 0.72, t),
    outgoing: 1 - smooth(0.12, 0.72, t),
    scale: reduced
      ? 1
      : coastal
        ? 1 + 0.1 * smooth(0, 1, t)
        : 1 - 0.85 * smooth(0.08, 0.82, t),
    panX: reduced
      ? 0
      : stageId === 'land'
        ? -20 * smooth(0, 1, t)
        : stageId === 'water'
          ? 20 * smooth(0, 1, t)
          : 0,
    panY: reduced ? 0 : stageId === 'pond' ? 12 * smooth(0, 1, t) : 0,
    wash: Math.sin(t * Math.PI) * (coastal ? 0.12 : 0.22),
  };
}
