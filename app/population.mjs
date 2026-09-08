import { shoreDepth, dryClearance } from './shore-geography.mjs';
// Maximum encounter slots per 600x600 region: newborn food, larger food, danger.
// Empty water on the shore and protected spawn areas can leave some slots unused.
export const POPULATION_PLANS = {
  micro: {
    slots: [0, 0, 0],
    note: 'Se conserva la población microscópica: nutrientes y células pequeñas predominan.',
  },
  pond: {
    slots: [6, 5, 1],
    note: 'Vida diminuta entre algas y restos; un peligro como máximo por zona.',
  },
  land: {
    slots: [6, 9, 1],
    note: 'Arena, conchas y vegetación. Los animales terrestres permanecen fuera del agua.',
  },
  water: {
    slots: [5, 5, 2],
    note: 'Una plaza de cazador y otra de peligro por zona, con la misma densidad total. Nadadores y tiburones martillo siguen siendo escasos.',
  },
  city: {
    slots: [5, 7, 2],
    note: 'Predominan objetos y edificios. Las personas son una minoría; la defensa también usa vehículos.',
  },
  orbit: {
    slots: [5, 8, 1],
    note: 'Más escombros, roca y hielo que naves o estaciones.',
  },
  planets: {
    slots: [4, 7, 1],
    note: 'Mundos pequeños y materia suelta, con gigantes dispersos.',
  },
  stars: {
    slots: [4, 7, 1],
    note: 'Estrellas pequeñas, polvo y plasma; las estrellas extremas son escasas.',
  },
  galaxies: {
    slots: [4, 5, 1],
    note: 'Menor densidad al aumentar la escala, con polvo y cúmulos entre galaxias.',
  },
  universe: {
    slots: [4, 5, 1],
    note: 'Grandes espacios entre filamentos y cúmulos. El universo final aparece una sola vez.',
  },
};
const WEIGHTS = {
  pond: [12, 10, 8, 3, 1, 1, 2, 0.4],
  land: [12, 10, 7, 6, 3, 2, 1, 0.3, 0.7, 0.4, 0.5, 0.65],
  water: [
    14, 16, 15, 7, 5, 1.5, 4, 5, 1, 0.15, 1.1, 0.7, 0.8, 0.18, 0.35, 1,
  ],
  city: [1, 0.7, 0.25, 0.25, 1, 0.8, 0.5, 2, 1, 0.6, 5, 2],
  orbit: [10, 12, 2, 1, 0.15, 2, 1, 0.3],
  planets: [8, 5, 0.5, 4, 1, 0.6, 10, 5],
  stars: [10, 6, 4, 0.5, 1, 0.3, 4, 0.5],
  galaxies: [10, 5, 3, 2, 4, 1, 7, 0.3, 0.3, 1],
  universe: [10, 5, 4, 0.4, 0.25, 0.2, 0.3, 3, 2, 1, 0.5, 0],
};
const MATTER_WEIGHTS = {
  pond: [7, 6, 3, 9],
  land: [10, 9, 8, 5, 6, 8, 8],
  water: [8, 4, 3, 1, 3, 8],
  city: [18, 10, 6, 9, 3, 6, 4],
  orbit: [12, 8, 7, 6],
  planets: [9, 7, 3, 5],
  stars: [6, 6, 2],
  galaxies: [9, 6, 3],
  universe: [8, 5, 2],
};
export function populationWeight(s, stageId, list) {
  if (s.edibleMatter)
    return (
      MATTER_WEIGHTS[stageId]?.[
        list.filter((e) => e.edibleMatter).indexOf(s)
      ] ?? 1
    );
  if (s.variantOf) return 0;
  return (
    WEIGHTS[stageId]?.[
      list.filter((e) => !e.edibleMatter && !e.variantOf).indexOf(s)
    ] ?? 1
  );
}
export function shoreHabitat(s) {
  if (!s.edibleMatter) return 'dry';
  return /shell|scallop|pebble/.test(s.id) ? 'tidal' : 'dry';
}
export function shoreAllows(s, x, y, radius = s.r) {
  const d = shoreDepth(x, y);
  return shoreHabitat(s) === 'tidal' ? d >= -70 && d <= 18 : dryClearance(x, y, radius) <= -8;
}
export function constrainToShore(e, s) {
  const radius = Math.max(s.r, e.r);
  if (shoreAllows(s, e.x, e.y, radius)) { e.shoreSafe = { x: e.x, y: e.y }; return; }
  if (e.shoreSafe) { e.x = e.shoreSafe.x; e.y = e.shoreSafe.y; return; }
  // Handles arrival food and old saved inhabitants without clamping them all
  // onto a straight edge. Normal movement returns to its last safe position.
  const ox = e.x, oy = e.y;
  for (let distance = 24; distance <= 1200; distance += 24)
    for (let i = 0; i < 16; i++) {
      const a = i * Math.PI / 8, x = ox + Math.cos(a) * distance, y = oy + Math.sin(a) * distance;
      if (shoreAllows(s, x, y, radius)) { e.x = x; e.y = y; e.shoreSafe = { x, y }; return; }
    }
}
