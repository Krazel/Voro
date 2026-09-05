import { SPECIES as MICRO_SPECIES } from './micro-world.mjs';
export const STAGE_START_MASS = 2;
export const stageStartMass = (stage) =>
  STAGES[stage].startMass ?? STAGE_START_MASS;
export const STAGES = [
  {
    id: 'micro',
    name: 'La vida en una gota',
    short: 'Microscopio',
    intro: 'Come lo pequeño. Evita a los cazadores.',
    evolution: 'La gota ya no puede contenerte.',
    goal: 150,
    growth: 0.55,
    base: 40,
    unit: 'µm',
    color: '#8dbfc5',
    background: -1,
  },
  {
    id: 'water',
    name: 'Bajo la superficie',
    short: 'Agua',
    intro: 'Los bancos se dispersan. Los tiburones te han visto.',
    evolution: 'El agua se queda pequeña.',
    goal: 180,
    growth: 0.35,
    base: 0.04,
    unit: 'm',
    color: '#83b9b5',
    background: 0,
  },
  {
    id: 'land',
    name: 'El primer paso',
    short: 'Tierra',
    intro: 'Las presas corren. Los cazadores saltan.',
    evolution: 'Tu sombra alcanza las calles.',
    goal: 190,
    growth: 0.34,
    base: 0.5,
    unit: 'm',
    color: '#a6b790',
    background: 1,
  },
  {
    id: 'city',
    name: 'La respuesta humana',
    short: 'Ciudad',
    intro: 'Esquiva los disparos. Crece hasta poder absorberlos.',
    evolution: 'El horizonte se curva bajo ti.',
    goal: 210,
    growth: 0.33,
    base: 8,
    unit: 'm',
    color: '#a4b5c0',
    background: 2,
  },
  {
    id: 'orbit',
    name: 'Más allá del cielo',
    short: 'Órbita',
    intro: 'Satélites, estaciones y lunas flotan a tu alcance.',
    evolution: 'Los mundos parecen semillas.',
    goal: 180,
    growth: 0.35,
    base: 80,
    unit: 'km',
    color: '#98b5d1',
    background: 3,
  },
  {
    id: 'planets',
    name: 'Devoramundos',
    short: 'Planetas',
    intro: 'Absorbe mundos pequeños antes de acercarte a los gigantes.',
    evolution: 'Ahora tienes hambre de luz.',
    goal: 200,
    growth: 0.32,
    base: 2400,
    unit: 'km',
    color: '#91b7d0',
    background: 4,
  },
  {
    id: 'stars',
    name: 'El hambre de luz',
    short: 'Estrellas',
    intro: 'Las estrellas más intensas aún pueden desgarrarte.',
    evolution: 'Cada punto de luz contiene un cielo.',
    goal: 210,
    growth: 0.32,
    base: 800000,
    unit: 'km',
    color: '#dfbd8b',
    background: 5,
  },
  {
    id: 'galaxies',
    name: 'Mares de estrellas',
    short: 'Galaxias',
    intro: 'Las galaxias giran. Los cuásares lanzan materia.',
    evolution: 'Solo queda la red que lo une todo.',
    goal: 220,
    growth: 0.3,
    base: 2000,
    unit: 'años luz',
    color: '#b7a9d2',
    background: 6,
  },
  {
    id: 'universe',
    name: 'La última frontera',
    short: 'Universo',
    intro: 'Absorbe la red cósmica. Busca el último horizonte.',
    evolution: 'Todo vuelve a tu núcleo.',
    goal: 230,
    growth: 0.3,
    base: 200000000,
    unit: 'años luz',
    color: '#d6c8a4',
    background: 7,
  },
];
const micro = MICRO_SPECIES.map((s) => ({
  ...s,
  atlas: 'micro',
  imageAtlas: 'micro',
  shot: null,
  motion: 'micro',
  stage: 0,
}));
// [name, behavior, animation, radius, energy, speed, optional mass required].
const rows = [
  [
    ['Krill', 'flee', 'fish', 5, 0.8, 28],
    ['Anchoa', 'flee', 'fish', 12, 1.2, 38],
    ['Sardina', 'flee', 'fish', 17, 2, 34],
    ['Pez payaso', 'drift', 'fish', 14, 1.8, 18],
    ['Pez cirujano', 'flee', 'fish', 25, 2.5, 43],
    ['Pez globo', 'hazard', 'puffer', 30, 6, 12],
    ['Caballito de mar', 'drift', 'float', 13, 2, 10],
    ['Medusa luna', 'drift', 'jelly', 24, 3.5, 14],
    ['Medusa de filamentos', 'hazard', 'jelly', 40, 9, 15],
    ['Calamar', 'flee', 'squid', 38, 4.5, 48],
    ['Pulpo', 'hunter', 'octopus', 42, 7, 35],
    ['Morena', 'hunter', 'worm', 65, 11, 54],
    ['Tiburón de arrecife', 'hunter', 'fish', 105, 14, 58],
    ['Tiburón martillo', 'hunter', 'fish', 140, 20, 50],
    ['Nadador', 'flee', 'swimmer', 90, 6, 29],
    ['Mantarraya', 'drift', 'wing', 125, 16, 22],
  ],
  [
    ['Hormiga', 'flee', 'insect', 4, 0.8, 30],
    ['Larva', 'drift', 'worm', 9, 1, 10],
    ['Cochinilla', 'drift', 'insect', 11, 1.5, 12],
    ['Escarabajo', 'flee', 'insect', 14, 2.5, 34],
    ['Caracol', 'drift', 'float', 25, 3, 7],
    ['Mariposa', 'flee', 'wing', 25, 3, 43],
    ['Araña', 'hunter', 'insect', 22, 6, 60],
    ['Escorpión', 'hunter', 'insect', 28, 8, 40],
    ['Rana', 'hunter', 'hop', 42, 12, 56],
    ['Lagartija', 'hunter', 'walker', 65, 16, 68],
    ['Ratón', 'flee', 'walker', 60, 12, 62],
    ['Conejo', 'flee', 'hop', 135, 21, 59],
  ],
  [
    ['Civil', 'flee', 'walker', 13, 1.3, 34],
    ['Soldado', 'ranged', 'walker', 14, 2.5, 26, 9],
    ['Unidad con escudo', 'hunter', 'walker', 15, 5, 52, 20],
    ['Soldado pesado', 'ranged', 'walker', 15, 4, 20, 18],
    ['Motocicleta', 'flee', 'vehicle', 30, 3, 65],
    ['Automóvil', 'flee', 'vehicle', 50, 5, 53],
    ['Furgoneta', 'flee', 'vehicle', 62, 6, 42],
    ['Blindado', 'ranged', 'vehicle', 83, 10, 25, 38],
    ['Tanque', 'ranged', 'vehicle', 113, 17, 18, 75],
    ['Helicóptero', 'ranged', 'rotor', 99, 14, 42, 58],
    ['Edificio bajo', 'still', 'building', 98, 15, 0],
    ['Torre', 'still', 'building', 149, 25, 0],
  ],
  [
    ['Asteroide', 'drift', 'spin', 12, 1.2, 9],
    ['Restos metálicos', 'drift', 'spin', 9, 0.8, 12],
    ['Satélite', 'drift', 'spin', 28, 2.8, 13],
    ['Estación espacial', 'still', 'spin', 61, 6, 0],
    ['Nave armada', 'ranged', 'vehicle', 73, 8, 39, 28],
    ['Luna craterizada', 'drift', 'planet', 125, 20, 6],
  ],
  [
    ['Mundo rocoso', 'drift', 'planet', 19, 2, 5],
    ['Mundo oceánico', 'drift', 'planet', 43, 4.5, 5],
    ['Mundo volcánico', 'hazard', 'plasma', 88, 11, 4],
    ['Mundo helado', 'drift', 'planet', 61, 7, 5],
    ['Gigante gaseoso', 'drift', 'planet', 120, 19, 3],
    ['Gigante anillado', 'drift', 'planet', 145, 26, 3],
  ],
  [
    ['Enana marrón', 'drift', 'star', 14, 1.8, 4],
    ['Enana roja', 'drift', 'star', 29, 3.5, 4],
    ['Estrella amarilla', 'drift', 'star', 59, 7, 3],
    ['Estrella azul', 'hazard', 'star', 95, 13, 3],
    ['Gigante roja', 'drift', 'star', 140, 25, 2],
    ['Estrella de neutrones', 'ranged', 'star', 113, 19, 3, 80],
  ],
  [
    ['Galaxia enana', 'drift', 'galaxy', 18, 2.4, 5],
    ['Galaxia espiral', 'drift', 'galaxy', 69, 8, 3],
    ['Galaxia elíptica', 'drift', 'galaxy', 93, 12, 3],
    ['Espiral barrada', 'drift', 'galaxy', 113, 17, 3],
    ['Galaxia irregular', 'drift', 'galaxy', 40, 4.5, 5],
    ['Galaxia lenticular', 'drift', 'galaxy', 133, 23, 3],
  ],
  [
    ['Cúmulo de estrellas', 'drift', 'cosmic', 14, 1.8, 5],
    ['Nudo de nebulosa', 'drift', 'cosmic', 29, 3.5, 5],
    ['Vivero estelar', 'drift', 'cosmic', 47, 5, 5],
    ['Remanente de supernova', 'hazard', 'plasma', 80, 10, 3],
    ['Agujero negro', 'gravity', 'galaxy', 107, 18, 3],
    ['Cuásar', 'ranged', 'star', 124, 23, 3],
    ['Galaxias en colisión', 'hazard', 'galaxy', 96, 14, 3],
    ['Cúmulo galáctico', 'drift', 'cosmic', 91, 14, 4],
    ['Supercúmulo', 'drift', 'cosmic', 112, 20, 3],
    ['Filamento cósmico', 'drift', 'cosmic', 129, 24, 3],
    ['Borde del vacío', 'drift', 'cosmic', 143, 28, 2],
    ['Universo', 'final', 'cosmic', 290, 0.5, 0, 230],
  ],
];
const landCrops = [
  [24, 56, 326, 245],
  [437, 93, 251, 224],
  [729, 81, 339, 218],
  [1110, 37, 323, 271],
  [17, 425, 345, 260],
  [378, 354, 338, 355],
  [744, 375, 324, 328],
  [1111, 350, 324, 341],
  [18, 722, 322, 303],
  [365, 751, 369, 269],
  [750, 788, 342, 237],
  [1112, 731, 322, 279],
];
const cityCrops = [
  [68, 62, 265, 240],
  [426, 57, 275, 242],
  [802, 35, 240, 270],
  [1123, 37, 311, 271],
  [18, 428, 331, 205],
  [397, 407, 316, 234],
  [738, 403, 331, 233],
  [1110, 379, 322, 252],
  [9, 739, 359, 236],
  [366, 646, 377, 392],
  [752, 678, 315, 376],
  [1125, 645, 318, 402],
];
export const STAGE_SPECIES = [
  micro,
  ...rows.map((list, j) =>
    list.map(([name, kind, motion, r, value, speed, requiredMass], i) => {
      const stage = j + 1,
        id = STAGES[stage].id + '-' + i;
      const atlas =
        stage <= 3 ? STAGES[stage].id : stage <= 7 ? 'cosmos' : 'universe';
      return {
        id,
        name,
        kind,
        motion,
        r,
        value,
        speed,
        requiredMass,
        stage,
        atlas,
        imageAtlas: atlas,
        index: stage >= 4 && stage <= 7 ? (stage - 4) * 6 + i : i,
        cols: stage === 1 ? 4 : stage >= 4 && stage <= 7 ? 6 : 4,
        rows: stage === 1 || atlas === 'cosmos' ? 4 : 3,
        crop: stage === 2 ? landCrops[i] : stage === 3 ? cityCrops[i] : null,
        shot:
          kind === 'ranged'
            ? {
                interval: stage === 3 ? (i === 1 ? 2.2 : i === 3 ? 3 : 4) : 3.5,
                speed: stage === 3 ? 185 : 130,
                damage: stage === 3 ? (i === 8 ? 0.17 : 0.08) : 0.13,
                edibleAt:
                  stage === 3
                    ? i === 1
                      ? 26
                      : i === 3
                        ? 44
                        : i === 7
                          ? 78
                          : i === 8
                            ? 120
                            : 96
                    : stage === 4
                      ? 65
                      : 135,
              }
            : null,
      };
    }),
  ),
];
// Reuse stellar matter and singularities at adjacent cosmic scales, with their own relative sizes.
function cousin(stage, source, name, r, value, kind = source.kind) {
  return {
    ...source,
    id: STAGES[stage].id + '-' + name,
    name,
    stage,
    r,
    value,
    kind,
    requiredMass: undefined,
  };
}
STAGE_SPECIES[4].push(
  cousin(4, STAGE_SPECIES[5][3], 'Luna helada', 95, 13),
  cousin(4, STAGE_SPECIES[5][2], 'Luna volcánica', 139, 25, 'hazard'),
);
STAGE_SPECIES[5].push(
  cousin(5, STAGE_SPECIES[4][0], 'Fragmento planetario', 10, 1),
  cousin(5, STAGE_SPECIES[8][1], 'Nube protoplanetaria', 31, 3.5),
);
STAGE_SPECIES[6].push(
  cousin(6, STAGE_SPECIES[8][2], 'Nube estelar', 85, 11),
  cousin(6, STAGE_SPECIES[8][4], 'Agujero negro estelar', 141, 25, 'gravity'),
);
STAGE_SPECIES[7].push(
  cousin(7, STAGE_SPECIES[8][0], 'Cúmulo abierto', 11, 1.3),
  cousin(7, STAGE_SPECIES[8][5], 'Núcleo activo', 102, 16, 'ranged'),
  cousin(7, STAGE_SPECIES[8][6], 'Colisión galáctica', 136, 24, 'hazard'),
  cousin(7, STAGE_SPECIES[8][7], 'Grupo galáctico', 145, 28),
);
// Alternate swimmer artwork shares the same encounter slot and balance.
STAGE_SPECIES[1].push({
  ...STAGE_SPECIES[1][14],
  id: 'water-16',
  name: 'Nadadora',
  imageAtlas: 'femaleSwimmer',
  crop: [0, 0, 1774, 887],
  variantOf: 'water-14',
});
// Every habitat retains one tiny food source, even after severe damage.
for (const list of STAGE_SPECIES) {
  const smallest = list
    .filter(
      (s) =>
        !['hunter', 'hazard', 'ranged', 'gravity', 'final'].includes(s.kind),
    )
    .sort((a, b) => a.r - b.r)[0];
  smallest.requiredMass = 0;
}
export const SPECIES_BY_ID = Object.fromEntries(
  STAGE_SPECIES.flat().map((s) => [s.id, s]),
);
SPECIES_BY_ID['water-14'].imageAtlas = 'swimmer';
SPECIES_BY_ID['water-12'].spawnWeight = 0.2;
SPECIES_BY_ID['water-13'].spawnWeight = 0.1;
export const ATLAS_URLS = {
  femaleSwimmer: './inhabitants/female-swimmer-v1.png',
  swimmer: './inhabitants/swimmer-v2.png',
  micro: './inhabitants/micro.png',
  water: './inhabitants/water.png',
  land: './inhabitants/land.png',
  city: './inhabitants/city.png',
  cosmos: './inhabitants/cosmos.png',
  universe: './inhabitants/universe.png',
};
export const stageOf = (p) => STAGES[p.stage || 0];
export const formatSize = (stage, mass) => {
  const s = STAGES[stage];
  let n = s.base * Math.sqrt(Math.max(0, mass) / 8),
    unit = s.unit;
  if (unit === 'm' && n < 0.01) {
    n *= 1000;
    unit = 'mm';
  } else if (unit === 'm' && n < 1) {
    n *= 100;
    unit = 'cm';
  }
  return (
    new Intl.NumberFormat('es', {
      maximumFractionDigits: n < 10 ? 2 : 0,
      notation: n >= 1e7 ? 'compact' : 'standard',
    }).format(n) +
    ' ' +
    unit
  );
};
export const isDanger = (s) =>
  ['hunter', 'hazard', 'ranged', 'gravity'].includes(s?.kind);

const CUSTOM_RECTS = {
  'cosmos:1': [280, 25, 221, 240],
  'cosmos:3': [769, 0, 255, 265],
  'cosmos:6': [0, 268, 256, 238],
  'cosmos:7': [256, 269, 256, 237],
  'cosmos:8': [512, 265, 256, 241],
  'cosmos:9': [768, 268, 256, 238],
  'cosmos:10': [1024, 265, 256, 241],
  'cosmos:11': [1267, 271, 269, 219],
  'cosmos:17': [1290, 493, 229, 272],
  'universe:5': [399, 326, 355, 337],
};
for (const s of STAGE_SPECIES.flat())
  if (CUSTOM_RECTS[s.atlas + ':' + s.index])
    s.crop = CUSTOM_RECTS[s.atlas + ':' + s.index];
// Cosmic attacks leave a longer escape window; their energy becomes food before their full bodies do.
STAGE_SPECIES[7].find((s) => s.kind === 'ranged').shot = {
  interval: 6,
  speed: 115,
  damage: 0.06,
  edibleAt: 36,
};
STAGE_SPECIES[8].find((s) => s.kind === 'ranged').shot = {
  interval: 5,
  speed: 120,
  damage: 0.08,
  edibleAt: 75,
};

// The atlas layout above remains stable; journey order is independent of artwork order.
const sea = STAGES[1],
  shore = STAGES[2];
const pond = {
  ...sea,
  id: 'pond',
  name: 'Una charca litoral',
  short: 'Charca',
  intro: 'Entre algas y larvas, busca la vida más pequeña.',
  evolution: 'Ya puedes explorar la orilla.',
  goal: 150,
  growth: 0.4,
  base: 0.002,
  startMass: 0.45,
};
Object.assign(shore, {
  name: 'La orilla',
  short: 'Orilla',
  base: 0.042,
  startMass: 0.45,
  intro: 'De insectos diminutos a animales pequeños.',
  evolution: 'El mar se abre ante ti.',
});
Object.assign(sea, {
  name: 'El mar abierto',
  short: 'Mar',
  base: 1.2,
  startMass: 0.45,
  intro: 'Busca peces pequeños. Los grandes depredadores aún te superan.',
  evolution: 'Tu sombra alcanza las calles.',
});
STAGES[3].base = 14;
const pondInhabitant = (source, id, name, r, value, kind = source.kind) => ({
  ...source,
  id: 'pond-' + id,
  animationId: source.id,
  name,
  r,
  value,
  kind,
  requiredMass: undefined,
  shot: null,
  stage: 1,
  speed: Math.min(32, source.speed),
  variantOf: undefined,
});
const pondSpecies = [
  pondInhabitant(micro[3], 0, 'Fragmento de alga', 6, 0.6, 'drift'),
  pondInhabitant(STAGE_SPECIES[1][0], 1, 'Microcrustáceo', 8, 0.8),
  pondInhabitant(STAGE_SPECIES[2][1], 2, 'Larva acuática', 13, 1.3),
  pondInhabitant(STAGE_SPECIES[1][7], 3, 'Hidromedusa', 30, 3),
  pondInhabitant(
    STAGE_SPECIES[1][8],
    4,
    'Hidromedusa urticante',
    48,
    5,
    'hazard',
  ),
  pondInhabitant(STAGE_SPECIES[1][9], 5, 'Larva de cefalópodo', 55, 6),
  pondInhabitant(STAGE_SPECIES[1][1], 6, 'Alevín', 70, 9),
  pondInhabitant(STAGE_SPECIES[1][1], 7, 'Alevín cazador', 95, 14, 'hunter'),
];
pondSpecies[0].requiredMass = 0;
STAGES.splice(1, 2, pond, shore, sea);
const seaSpecies = STAGE_SPECIES[1],
  shoreSpecies = STAGE_SPECIES[2];
STAGE_SPECIES.splice(1, 2, pondSpecies, shoreSpecies, seaSpecies);
for (const [stage, list] of STAGE_SPECIES.entries())
  for (const s of list) {
    s.stage = stage;
    SPECIES_BY_ID[s.id] = s;
  }
// Marine lengths share a common scale: small fish, then cephalopods, people and sharks.
for (const [id, r] of Object.entries({
  'water-0': 3,
  'water-1': 6,
  'water-2': 10,
  'water-3': 5,
  'water-4': 12,
  'water-5': 16,
  'water-6': 6,
  'water-7': 12,
  'water-9': 20,
  'city-0': 7,
  'city-1': 7.5,
  'city-2': 8,
  'city-3': 8,
  'city-4': 9,
  'city-5': 15,
  'city-6': 20,
  'city-7': 26,
  'city-8': 30,
  'city-9': 48,
  'city-10': 70,
  'city-11': 105,
}))
  SPECIES_BY_ID[id].r = r;

export const metersPerUnit = (unit) =>
  ({ µm: 1e-6, m: 1, km: 1000, 'años luz': 9.4607e15 })[unit];
export const physicalDiameter = (stage, mass) =>
  STAGES[stage].base *
  metersPerUnit(STAGES[stage].unit) *
  Math.sqrt(Math.max(0, mass) / 8);
