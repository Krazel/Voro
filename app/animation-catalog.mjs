import { ANATOMICAL_RIGS } from './anatomical-rigs.mjs';
import { STAGE_SPECIES } from './journey-data.mjs';
// Individual art-directed rigs. Shared families describe anatomy, not a universal wobble.
const rig = (family, description, period, options = {}) => ({
  family,
  description,
  period,
  ...options,
});
const micro = [
  rig('drift', 'Deriva lenta de partículas, sin deformar la materia.', 6, {
    turn: 0.09,
  }),
  rig('bacillus', 'Flexión suave de la cápsula y contracción interna.', 2.8, {
    amount: 0.035,
  }),
  rig('cocci', 'Contracción alterna de las dos células unidas.', 2.4),
  rig('drift', 'Rotación lenta de la cubierta rígida de sílice.', 8, {
    turn: 0.15,
  }),
  rig('cilia', 'Batido de cilios que avanza por el borde del paramecio.', 1.4, {
    amount: 0.022,
  }),
  rig(
    'amoeba',
    'Pseudópodos que se estiran y recogen alrededor del núcleo.',
    3.5,
    { amount: 0.07 },
  ),
  rig(
    'flagellate',
    'El flagelo impulsa el cuerpo con una onda que crece hacia la punta.',
    0.9,
    { amount: 0.13, head: 0.72 },
  ),
  rig('serpentine', 'Una onda continua recorre la bacteria espiral.', 1.2, {
    amount: 0.09,
  }),
  rig('cilia', 'Cilios rápidos y contracción del extremo de ataque.', 0.9, {
    amount: 0.035,
  }),
  rig(
    'spines',
    'Las espinas se abren al reaccionar; el centro se mantiene estable.',
    2.8,
  ),
  rig(
    'amoeba',
    'Lóbulos amplios que se estiran y vuelven al citoplasma.',
    4.2,
    { amount: 0.09 },
  ),
  rig('chain', 'Cada célula sigue a la anterior con un pequeño retardo.', 2.5, {
    amount: 0.065,
  }),
];
const water = [
  rig(
    'krill',
    'Abdomen articulado, patas nadadoras y antenas independientes.',
    0.7,
    { amount: 0.11 },
  ),
  rig('fish', 'Cabeza estable, cola rápida y aletas pequeñas.', 0.52, {
    head: 0.8,
    amount: 0.17,
    axis: 0.51,
  }),
  rig(
    'fish',
    'El nado aprobado: cabeza estable, flexión corporal y cola propulsora.',
    0.62,
    { head: 0.79, amount: 0.22, axis: 0.49, crop: [789, 62, 353, 139] },
  ),
  rig(
    'fish',
    'Aleteo corto, cola flexible y respiración de las branquias.',
    0.82,
    { head: 0.75, amount: 0.16, axis: 0.52 },
  ),
  rig('fish', 'Cola amarilla con barrido amplio y aletas de ajuste.', 0.69, {
    head: 0.77,
    amount: 0.21,
    axis: 0.5,
  }),
  rig(
    'puffer',
    'Respira al nadar y se infla al reaccionar; aletas rápidas.',
    2.1,
  ),
  rig(
    'seahorse',
    'Aleta dorsal rápida, cabeza estable y cola que se enrosca.',
    2.7,
  ),
  rig(
    'jelly',
    'La campana se contrae; los filamentos la siguen con retardo.',
    2.2,
    { cx: 0.7, cy: 0.3, amount: 0.13 },
  ),
  rig(
    'jelly',
    'Contracción de campana y ondas largas por los tentáculos.',
    2.9,
    { cx: 0.68, cy: 0.2, amount: 0.17 },
  ),
  rig(
    'squid',
    'El manto se comprime antes del impulso; brazos con flexión propia.',
    1.15,
    { head: 0.53, amount: 0.12 },
  ),
  rig(
    'octopus',
    'Brazos que se recogen y se despliegan alrededor de un manto estable.',
    3.1,
    { cx: 0.45, cy: 0.39, amount: 0.13 },
  ),
  rig('eel', 'Onda que recorre el cuerpo curvado y llega a la cola.', 1.75, {
    amount: 0.085,
  }),
  rig('fish', 'Tronco firme y barrido lento de la cola del tiburón.', 1.05, {
    head: 0.78,
    amount: 0.14,
    axis: 0.5,
  }),
  rig(
    'fish',
    'Cabeza ancha estable y movimiento potente desde el pedúnculo.',
    1.22,
    { head: 0.75, amount: 0.17, axis: 0.51 },
  ),
  rig('swimmer', 'Brazada y patada alterna, con el torso estable.', 1.5),
  rig(
    'ray',
    'Las aletas pectorales baten desde sus raíces y la cola las sigue.',
    2.4,
  ),
];
const land = [
  rig(
    'insect',
    'Seis patas alternan dos trípodes; las antenas exploran.',
    0.62,
    { pairs: 3, amount: 0.24 },
  ),
  rig('larva', 'Contracción por segmentos alrededor del cuerpo curvado.', 2.5),
  rig(
    'insect',
    'Las patas avanzan en una onda bajo la cubierta segmentada.',
    1.05,
    { pairs: 6, amount: 0.16 },
  ),
  rig('insect', 'Élitros rígidos y seis patas articuladas.', 0.85, {
    pairs: 3,
    amount: 0.2,
  }),
  rig('snail', 'Onda en el pie, tentáculos sensibles y concha estable.', 4.5),
  rig(
    'butterfly',
    'Las alas se pliegan desde el tórax, sin aplastar el cuerpo.',
    0.8,
  ),
  rig('insect', 'Ocho patas alternan apoyos alrededor del cuerpo.', 1.0, {
    pairs: 4,
    amount: 0.28,
  }),
  rig(
    'scorpion',
    'Patas alternas, pinzas móviles y cola que se prepara para atacar.',
    1.5,
    { pairs: 4, amount: 0.2 },
  ),
  rig(
    'frog',
    'Se agacha, extiende las patas traseras, salta y amortigua la caída.',
    1.8,
  ),
  rig('lizard', 'Apoyos diagonales de las patas y contrapeso de la cola.', 1.1),
  rig('mouse', 'Pasos cortos, respiración y cola flexible.', 0.75),
  rig(
    'rabbit',
    'Compresión antes del salto, extensión y orejas con retardo.',
    1.7,
  ),
];
const city = [
  rig('human', 'Pasos alternos y balanceo de brazos al huir.', 0.9, {
    amount: 0.25,
  }),
  rig(
    'human',
    'Piernas articuladas; mantiene el arma y reacciona con retroceso.',
    1.1,
    { amount: 0.18, armed: true },
  ),
  rig(
    'human',
    'Avanza con el escudo firme y adelanta la porra al atacar.',
    1.35,
    { amount: 0.15, shield: true },
  ),
  rig('human', 'Paso pesado, arma estable y retroceso al disparar.', 1.5, {
    amount: 0.12,
    armed: true,
  }),
  rig('motorbike', 'Dirección delantera y suspensión durante la marcha.', 1.3),
  rig('car', 'Ruedas delanteras orientables y suspensión suave.', 1.8),
  rig('van', 'Suspensión más lenta y balanceo del vehículo al girar.', 2.1),
  rig('armored', 'Ruedas y torreta independientes; retroceso al atacar.', 2.3),
  rig('tank', 'Orugas en movimiento y cañón con giro y retroceso.', 2.8),
  rig(
    'helicopter',
    'Rotor principal articulado sobre el fuselaje estable.',
    0.75,
  ),
  rig('building', 'Edificio estable: giran los ventiladores de la azotea.', 4, {
    fans: [
      [0.845, 0.3],
      [0.845, 0.38],
      [0.845, 0.47],
      [0.3, 0.66],
    ],
  }),
  rig(
    'tower',
    'Ventilación y balizas de la azotea; la estructura permanece rígida.',
    5,
    {
      fans: [
        [0.19, 0.37],
        [0.2, 0.75],
      ],
    },
  ),
];
const cosmos = [
  rig(
    'tumble',
    'Rotación de un asteroide rígido y deriva de sus fragmentos.',
    12,
    { turn: 0.4 },
  ),
  rig('tumble', 'Restos que giran lentamente sobre su centro de masa.', 10, {
    turn: 0.6,
  }),
  rig(
    'satellite',
    'Orientación del satélite y ligera articulación de los paneles.',
    9,
  ),
  rig(
    'station',
    'Giro de la estación y orientación de sus módulos solares.',
    14,
  ),
  rig(
    'spaceship',
    'Los motores emiten pulsos y el casco permanece rígido.',
    1.6,
  ),
  rig('planet', 'Rotación suave de la luna craterizada.', 18, { turn: 0.07 }),
  rig('planet', 'Rotación lenta de la superficie rocosa.', 20, { turn: 0.08 }),
  rig('ocean', 'Rotación del mundo y circulación suave de las nubes.', 18, {
    turn: 0.06,
  }),
  rig('volcanic', 'Pulsos de lava en la corteza, sin deformar la esfera.', 5, {
    turn: 0.025,
  }),
  rig('planet', 'Giro lento de la superficie helada.', 23, { turn: 0.05 }),
  rig('gas', 'Las bandas gaseosas circulan a distintas velocidades.', 12),
  rig('ringed', 'El planeta gira suavemente dentro de sus anillos.', 20),
  rig('star', 'Convección lenta de la superficie de la enana marrón.', 5.5, {
    amount: 0.018,
  }),
  rig('star', 'Pulsos de la corona roja y pequeñas erupciones.', 4.5, {
    amount: 0.027,
  }),
  rig('star', 'La fotosfera circula y la corona lanza llamaradas.', 3.7, {
    amount: 0.03,
  }),
  rig('star', 'Corona azul más rápida e intensa al reaccionar.', 2.7, {
    amount: 0.035,
  }),
  rig('star', 'Pulsación lenta de una gigante y expansión de su corona.', 6, {
    amount: 0.05,
  }),
  rig('pulsar', 'Precesión de los chorros y pulsos del núcleo compacto.', 2.3),
  rig('galaxy', 'Rotación del disco estelar alrededor del núcleo.', 16, {
    amount: 0.08,
  }),
  rig(
    'galaxy',
    'Los brazos espirales giran alrededor de un núcleo estable.',
    20,
    { amount: 0.12 },
  ),
  rig('elliptical', 'Rotación lenta de una población estelar elíptica.', 25),
  rig(
    'barred',
    'La barra central gira con el disco; los brazos la siguen.',
    22,
  ),
  rig(
    'nebula',
    'Deriva irregular de nubes y regiones de formación estelar.',
    11,
    { amount: 0.03 },
  ),
  rig('lenticular', 'Rotación de perfil del disco y brillo del núcleo.', 24),
];
const universe = [
  rig('cluster', 'Las estrellas orbitan lentamente y cambian de brillo.', 12, {
    amount: 0.025,
  }),
  rig(
    'nebula',
    'Corrientes internas de gas alrededor del centro de la nebulosa.',
    10,
    { amount: 0.045 },
  ),
  rig(
    'nebula',
    'Las columnas conservan su forma mientras fluye el gas exterior.',
    14,
    { amount: 0.025 },
  ),
  rig(
    'supernova',
    'La onda exterior se expande mientras el centro permanece vacío.',
    6,
  ),
  rig(
    'blackhole',
    'El disco de acreción circula alrededor del horizonte oscuro.',
    9,
  ),
  rig(
    'quasar',
    'Chorros pulsantes sobre un disco de acreción en movimiento.',
    3.2,
  ),
  rig('collision', 'Dos núcleos orbitan y arrastran sus brazos estelares.', 17),
  rig('cluster', 'Pequeñas galaxias orbitan dentro del cúmulo.', 20, {
    amount: 0.025,
  }),
  rig('web', 'La luz recorre las conexiones del supercúmulo.', 15, {
    amount: 0.016,
  }),
  rig('filament', 'Pulsos que recorren los filamentos entre sus nudos.', 12, {
    amount: 0.025,
  }),
  rig('void', 'Materia que circula por el borde de un vacío estable.', 18),
  rig(
    'universe',
    'La red se ilumina por sectores y converge al reaccionar.',
    20,
  ),
];
const atlases = { micro, water, land, city, cosmos, universe };
// Some painted silhouettes cross the original regular grid. These source
// bounds and clipping polygons isolate them without changing their pixels.
const waterCrops = [
  [16, 74, 341, 164],
  [419, 73, 325, 126],
  [789, 62, 353, 139],
  [1207, 43, 318, 155],
  [29, 274, 326, 205],
  [423, 254, 327, 236],
  [851, 250, 224, 251],
  [1172, 221, 364, 289],
  [0, 508, 377, 250],
  [391, 516, 428, 225],
  [845, 509, 310, 253],
  [1150, 510, 386, 234],
  [14, 778, 408, 212],
  [405, 770, 412, 208],
  [826, 806, 402, 184],
  [1138, 746, 398, 272],
];
water.forEach((p, i) => {
  p.crop = waterCrops[i];
});
water[11].mask = [
  [0.05, 0],
  [1, 0],
  [1, 1],
  [0.05, 1],
];
water[12].mask = [
  [0, 0],
  [0.75, 0],
  [1, 0.48],
  [1, 0.91],
  [0.62, 1],
  [0, 1],
];
water[13].mask = [
  [0, 0.04],
  [0.33, 0.23],
  [0.39, 0.02],
  [0.47, 0],
  [0.61, 0.17],
  [0.84, 0.1],
  [0.9, 0.04],
  [1, 0.06],
  [1, 0.91],
  [0.86, 0.93],
  [0.81, 0.98],
  [0.45, 0.92],
  [0.24, 0.68],
  [0.05, 0.95],
  [0.13, 0.6],
  [0.13, 0.43],
];
water[14].mask = [
  [0, 0.95],
  [0, 0.55],
  [0.38, 0.22],
  [0.59, 0],
  [0.81, 0.22],
  [1, 0.5],
  [1, 0.7],
  [0.57, 0.61],
  [0.23, 1],
];
water[15].mask = [
  [0, 1],
  [0.26, 0.7],
  [0.4, 0.46],
  [0.34, 0],
  [0.53, 0.13],
  [0.69, 0.3],
  [0.88, 0.27],
  [1, 0.37],
  [1, 0.63],
  [0.7, 0.74],
  [0.49, 0.84],
  [0.32, 0.82],
];
land[6].crop = [740, 347, 338, 364];
city[4].crop = [17, 413, 334, 224];
cosmos[10].crop = [1030, 264, 237, 238];
cosmos[12].crop = [0, 516, 256, 232];
cosmos[13].crop = [256, 502, 256, 247];
cosmos[14].crop = [512, 500, 256, 246];
cosmos[15].crop = [768, 509, 256, 241];
cosmos[16].crop = [1024, 505, 256, 248];
universe[1].crop = [394, 5, 365, 319];
universe[7].crop = [1155, 344, 378, 318];
universe[9].crop = [386, 662, 381, 362];
universe[11].crop = [1154, 676, 382, 348];
// Corrections reviewed per silhouette: less flexion in broad fish and sharks.
Object.assign(water[3], {
  head: 0.45,
  amount: 0.1,
  tailFan: 0.12,
  finFlutter: 0.025,
});
Object.assign(water[4], {
  head: 0.42,
  amount: 0.12,
  tailFan: 0.12,
  finFlutter: 0.02,
  description: 'Cuerpo firme, barrido corto de la cola y aletas de ajuste.',
});
Object.assign(water[12], {
  amount: 0.065,
  tailFan: 0.055,
  finFlutter: 0,
  period: 1.25,
});
Object.assign(water[13], {
  amount: 0.07,
  tailFan: 0.05,
  finFlutter: 0,
  period: 1.4,
});
Object.assign(water[14], {
  crop: [0, 0, 425, 160],
  description:
    'Nadador aislado: hombros, codos, caderas y rodillas articulados.',
});
delete water[14].mask;
water[6].description =
  'Cuerpo y cola estables; batido de la pequeña aleta dorsal.';
land[2].pairs = 7;
land[8].description =
  'Patas traseras que se recogen y extienden desde caderas y rodillas.';
land[11].description =
  'Pequeños saltos con patas articuladas y orejas de movimiento suave.';
for (const p of city.slice(0, 4)) p.revision = 2;
city[9].revision = 2;
city[0].description =
  'Pasos alternos desde caderas y rodillas; brazos que acompañan la carrera.';
city[1].description =
  'Rodillas articuladas y pasos cortos, con torso y fusil estables.';
city[2].description =
  'Avance con el escudo firme, pasos contenidos y movimiento de la porra.';
city[3].description =
  'Pasos pesados desde las caderas, manteniendo firme el arma.';
Object.assign(cosmos[2], {
  rigid: true,
  precession: 0.07,
  revision: 2,
  description: 'Orientación suave del satélite, con paneles solares rígidos.',
});
Object.assign(cosmos[3], {
  rigid: true,
  precession: 0.045,
  revision: 2,
  description: 'Orientación lenta de la estación, sin doblar sus módulos.',
});
Object.assign(cosmos[4], {
  rigid: true,
  revision: 2,
  description: 'Casco firme y pulsos de luz concentrados en los motores.',
});
for (const i of [5, 6, 7, 9, 11])
  Object.assign(cosmos[i], {
    surface: {
      amount: i === 7 ? 0.024 : 0.016,
      rx: i === 11 ? 0.29 : 0.43,
      ry: i === 11 ? 0.34 : 0.43,
    },
    precession: 0,
    revision: 2,
    description:
      i === 11
        ? 'Movimiento suave de la superficie, con los anillos estables.'
        : 'Movimiento suave de la superficie, conservando el contorno y la iluminación.',
  });
for (const i of [18, 19, 20, 21, 23])
  Object.assign(cosmos[i], {
    surface: {
      disc: true,
      amount: 0.1,
      rx: 0.43,
      ry: i === 23 ? 0.14 : i === 20 ? 0.29 : 0.35,
      angle: i === 23 ? -0.38 : 0,
    },
    precession: 0,
    revision: 2,
    description:
      'Circulación lenta de la materia, conservando la inclinación del disco.',
  });
Object.assign(universe[4], {
  surface: {
    disc: true,
    amount: 0.18,
    rx: 0.45,
    ry: 0.21,
    angle: -0.58,
    hole: 0.12,
  },
  precession: 0,
  revision: 2,
  description:
    'El disco de acreción circula alrededor de un horizonte estable.',
});
export const ANIMATIONS = Object.fromEntries(
  STAGE_SPECIES.flat().map((s) => {
    const index =
      s.atlas === 'micro'
        ? STAGE_SPECIES[0].findIndex((e) => e.id === (s.animationId || s.id))
        : s.index;
    return [
      s.id,
      {
        ...atlases[s.atlas][index],
        ...(s.id === 'water-16'
          ? {
              crop: s.crop,
              period: 1.65,
              revision: 2,
              description:
                'Brazos y piernas articulados, con brazada y patada alternas.',
            }
          : {}),
        id: s.id,
        rigId: s.animationId || s.id,
        revised:
          !!atlases[s.atlas][index].revision ||
          !!ANATOMICAL_RIGS[s.id] ||
          ['water-3', 'water-4', 'water-12', 'water-13'].includes(s.id),
        assetKey: `${s.imageAtlas || s.atlas}:${index}`,
      },
    ];
  }),
);
export function animationCrop(s, image) {
  return (
    ANIMATIONS[s.id].crop ||
    s.crop || [
      ((s.index % s.cols) * image.naturalWidth) / s.cols + 3,
      (Math.floor(s.index / s.cols) * (image.naturalHeight || image.height)) /
        s.rows +
        3,
      image.naturalWidth / s.cols - 6,
      (image.naturalHeight || image.height) / s.rows - 6,
    ]
  );
}
