import { MATTER_CROPS } from './matter-crops.mjs';

// Radius uses the same local scale as animals. Biomass and adaptation rewards
// follow the existing digestion system; no separate currency or upgrade is needed.
const natural = 'naturalMatter',
  objects = 'objectMatter',
  cosmic = 'cosmicMatter';
const entries = [
  ['micro', natural, 0, 'lipid', 'Gota de lípidos', 6, 0.45, 'drift'],
  ['micro', natural, 1, 'crystal', 'Microcristal mineral', 12, 0.7, 'solid'],
  ['micro', natural, 2, 'membrane', 'Restos de membrana', 25, 1.2, 'drift'],
  ['micro', natural, 3, 'pollen', 'Grano de polen', 36, 2.2, 'drift'],
  ['pond', natural, 4, 'algae', 'Alga filamentosa', 18, 1.5, 'plant'],
  ['pond', natural, 5, 'leaf', 'Fragmento de hoja', 26, 2, 'drift'],
  ['pond', natural, 6, 'shell', 'Microconcha vacía', 42, 4, 'solid'],
  ['pond', natural, 11, 'sand', 'Grano de arena', 13, 1.1, 'solid'],
  ['land', natural, 7, 'scallop', 'Concha de playa', 70, 5, 'solid'],
  ['land', natural, 6, 'shell', 'Concha espiral', 32, 2, 'solid'],
  ['land', natural, 8, 'grass', 'Hierba de la orilla', 42, 3, 'plant'],
  ['land', natural, 9, 'acorn', 'Bellota', 35, 2.6, 'solid'],
  ['land', natural, 10, 'twig', 'Rama caída', 75, 6, 'solid'],
  ['land', natural, 11, 'pebble', 'Guijarro', 45, 3.3, 'solid'],
  ['land', natural, 5, 'leaf', 'Hoja caída', 40, 3, 'drift'],
  ['water', objects, 0, 'kelp', 'Alga marina', 28, 3, 'plant'],
  ['water', objects, 1, 'coral', 'Rama de coral', 24, 2.5, 'solid'],
  ['water', objects, 2, 'bottle', 'Botella hundida', 14, 1.2, 'solid'],
  ['water', objects, 3, 'wreck', 'Restos de naufragio', 165, 20, 'solid'],
  ['water', objects, 9, 'boulder', 'Roca del fondo', 120, 13, 'solid'],
  ['water', natural, 7, 'shell', 'Concha marina', 6, 0.65, 'solid'],
  ['city', objects, 4, 'can', 'Lata vacía', 2, 0.35, 'solid'],
  ['city', objects, 5, 'bench', 'Banco de madera', 6, 1, 'solid'],
  ['city', objects, 6, 'lamp', 'Farola', 18, 2.6, 'solid'],
  ['city', objects, 7, 'shrub', 'Arbusto', 10, 1.8, 'plant'],
  ['city', objects, 8, 'palm', 'Palmera', 35, 6, 'plant'],
  ['city', objects, 10, 'sign', 'Señal de tráfico', 9, 1.5, 'solid'],
  ['city', objects, 11, 'container', 'Contenedor de carga', 41, 8, 'solid'],
  ['orbit', cosmic, 0, 'scrap', 'Chatarra orbital', 8, 0.65, 'drift'],
  ['orbit', cosmic, 1, 'panel', 'Panel solar desprendido', 25, 2.2, 'drift'],
  ['orbit', cosmic, 2, 'comet', 'Cometa de hielo', 70, 7, 'drift'],
  ['orbit', cosmic, 3, 'rock', 'Fragmento de asteroide', 40, 4, 'drift'],
  ['planets', cosmic, 2, 'comet', 'Cometa errante', 16, 1.3, 'drift'],
  ['planets', cosmic, 3, 'crust', 'Corteza planetaria', 33, 3, 'drift'],
  ['planets', cosmic, 4, 'ring', 'Anillo de escombros', 95, 12, 'drift'],
  ['planets', cosmic, 5, 'gas', 'Disco protoplanetario', 65, 7, 'cloud'],
  ['stars', cosmic, 6, 'plasma', 'Arco de plasma', 30, 3, 'cloud'],
  ['stars', cosmic, 7, 'dust', 'Nube de polvo estelar', 75, 8, 'cloud'],
  ['stars', cosmic, 8, 'ejecta', 'Restos de supernova', 125, 16, 'cloud'],
  ['galaxies', cosmic, 7, 'dust', 'Polvo intergaláctico', 14, 1.3, 'cloud'],
  ['galaxies', cosmic, 9, 'filament', 'Filamento interestelar', 55, 6, 'cloud'],
  ['galaxies', cosmic, 10, 'gas', 'Nudo de gas cósmico', 100, 13, 'cloud'],
  ['universe', cosmic, 9, 'filament', 'Filamento de materia', 20, 2.4, 'cloud'],
  ['universe', cosmic, 10, 'knot', 'Concentración de materia', 70, 8, 'cloud'],
  ['universe', cosmic, 11, 'web', 'Rama de la red cósmica', 135, 22, 'cloud'],
];
export const EDIBLE_MATTER = entries.map(
  ([stageId, atlas, index, key, name, r, value, matterMotion]) => ({
    id: `${stageId}-matter-${key}`,
    stageId,
    atlas,
    index,
    name,
    r,
    value,
    matterMotion,
    edibleMatter: true,
    kind: 'still',
    motion: 'matter',
    speed: matterMotion === 'drift' ? 5 : matterMotion === 'cloud' ? 2 : 0,
    cols: 4,
    rows: 3,
    crop: MATTER_CROPS[atlas][index],
  }),
);

export function matterAnimation(s) {
  const plant = s.matterMotion === 'plant',
    cloud = s.matterMotion === 'cloud';
  return {
    family: plant ? 'plant' : cloud ? 'matterCloud' : 'prop',
    rigid: !plant && !cloud,
    period: plant ? 4.8 : 9,
    amount: plant ? 0.035 : 0.025,
    precession: s.matterMotion === 'drift' ? 0.035 : 0,
    description: plant
      ? 'Balanceo suave de las hojas, con la base estable.'
      : cloud
        ? 'Flujo lento de gas y polvo dentro de su silueta.'
        : s.matterMotion === 'drift'
          ? 'Deriva y giro lentos, conservando su forma.'
          : 'Permanece en su lugar y conserva su forma al ser absorbido.',
    revision: 1,
  };
}
