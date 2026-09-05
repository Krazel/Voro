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
    slots: [5, 6, 1],
    note: 'Peces pequeños y fondo marino abierto. Nadadores y grandes depredadores son excepcionales.',
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
    14, 16, 15, 7, 5, 1.5, 4, 5, 1, 0.15, 0.25, 0.12, 0.25, 0.12, 0.35, 1,
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
export const COAST_TILE = 1200;
export function shoreFraction(x) {
  const tile = Math.floor(x / COAST_TILE),
    u = x / COAST_TILE - tile;
  return Math.abs(tile % 2) === 1 ? 1 - u : u;
}
export function shoreHabitat(s) {
  if (!s.edibleMatter) return 'dry';
  return /shell|scallop|pebble/.test(s.id) ? 'tidal' : 'dry';
}
export function shoreAllows(s, x) {
  const u = shoreFraction(x);
  return shoreHabitat(s) === 'tidal'
    ? u >= 0.25 && u <= 0.78
    : u <= 0.53 - s.r / COAST_TILE;
}
export function constrainToShore(e, s) {
  const tile = Math.floor(e.x / COAST_TILE),
    reversed = Math.abs(tile % 2) === 1;
  let u = shoreFraction(e.x);
  u =
    shoreHabitat(s) === 'tidal'
      ? Math.max(0.25, Math.min(0.78, u))
      : Math.min(0.53 - Math.max(s.r, e.r) / COAST_TILE, u);
  e.x = (tile + (reversed ? 1 - u : u)) * COAST_TILE;
}
