import { createLife, clamp, radiusForMass } from './simulation.mjs';

export const STAGES = [
  {
    name: 'El despertar',
    form: 'Organismo unicelular',
    world: 'Una gota de agua',
    baseSize: 40,
    unit: 'µm',
    goal: 26,
    tint: '#092b3c',
    atlas: '',
    panel: 0,
    food: 'nutrientes',
    kinds: ['nutrient', 'bacteria', 'bacteria'],
    message: 'Nada hacia el dorado. Tu membrana hará el resto.',
    transition:
      'Tu membrana se multiplica. Generación tras generación, la gota se convierte en un océano.',
  },
  {
    name: 'La primera marea',
    form: 'Colonia acuática',
    world: 'El estanque',
    baseSize: 4,
    unit: 'mm',
    goal: 32,
    tint: '#0e3434',
    atlas: 'near-atlas.png',
    panel: 0,
    food: 'criaturas',
    kinds: ['krill', 'fish', 'jelly'],
    message:
      'Los peces pequeños alimentan tu colonia. Los grandes todavía se defienden.',
    transition:
      'Aprendes a retener el agua. La vida se arrastra hacia la orilla.',
  },
  {
    name: 'Fuera del agua',
    form: 'Masa anfibia',
    world: 'El bosque húmedo',
    baseSize: 20,
    unit: 'cm',
    goal: 38,
    tint: '#17302a',
    atlas: 'near-atlas.png',
    panel: 1,
    food: 'organismos',
    kinds: ['mushroom', 'beetle', 'fern'],
    message: 'Absorbe hongos e insectos. Crece para engullir la vegetación.',
    transition:
      'Las raíces dejan de ser un obstáculo. A lo lejos, un nuevo mundo brilla.',
  },
  {
    name: 'La ciudad diminuta',
    form: 'Organismo colosal',
    world: 'La costa habitada',
    baseSize: 30,
    unit: 'm',
    goal: 44,
    tint: '#122a35',
    atlas: 'near-atlas.png',
    panel: 2,
    food: 'estructuras',
    kinds: ['car', 'building', 'tower'],
    message:
      'Empieza por los vehículos. Cuando crezcas, los edificios cederán.',
    transition:
      'No queda nada que pueda contenerte. La gravedad empieza a parecer una sugerencia.',
  },
  {
    name: 'Sin gravedad',
    form: 'Leviatán orbital',
    world: 'La órbita',
    baseSize: 200,
    unit: 'km',
    goal: 52,
    tint: '#0d1b34',
    atlas: 'space-atlas.png',
    panel: 0,
    food: 'cuerpos',
    kinds: ['asteroid', 'satellite', 'moon'],
    message: 'Devora fragmentos y lunas. Evita las tormentas solares.',
    transition: 'La Tierra queda atrás. Tu hambre viaja entre las estrellas.',
  },
  {
    name: 'El hambre del universo',
    form: 'Devoramundos',
    world: 'El sistema olvidado',
    baseSize: 8000,
    unit: 'km',
    goal: 62,
    tint: '#12192f',
    atlas: 'space-atlas.png',
    panel: 1,
    food: 'mundos',
    kinds: ['moon', 'planet', 'gas'],
    message: 'Crece hasta 56 de biomasa y busca Gaia, el último mundo.',
    transition:
      'De una célula a un universo por dentro. El último planeta late en tu núcleo.',
  },
];
export const MUTATIONS = [
  {
    id: 'flow',
    name: 'Flagelos vivos',
    detail: '+12 % de velocidad · impulso más frecuente',
    icon: 'flow',
  },
  {
    id: 'shell',
    name: 'Membrana densa',
    detail: 'Recibes un 15 % menos de daño',
    icon: 'shell',
  },
  {
    id: 'hunger',
    name: 'Núcleo voraz',
    detail: 'Digestión un 20 % más rápida · mayor atracción',
    icon: 'hunger',
  },
];
export const SAVE_KEY = 'voro-campaign-v1';
export function newCampaign() {
  return {
    stage: 0,
    mutations: /** @type {string[]} */ ([]),
    won: false,
    deaths: 0,
    totalEaten: 0,
    totalTime: 0,
  };
}
export function stageLife(campaign) {
  const stage = STAGES[campaign.stage];
  const count = (id) => campaign.mutations.filter((x) => x === id).length;
  return createLife({
    goalMass: stage.goal,
    maxMass: stage.goal + 10,
    speedFactor: 1 + count('flow') * 0.12,
    cooldownFactor: Math.pow(0.9, count('flow')),
    damageFactor: Math.pow(0.85, count('shell')),
    digestFactor: 1 + count('hunger') * 0.2,
    attraction: count('hunger') * 14,
    finalRequired: campaign.stage === STAGES.length - 1,
  });
}
export function advanceCampaign(campaign, life, mutation) {
  if (
    !life.complete ||
    life.dead ||
    campaign.won ||
    !MUTATIONS.some((m) => m.id === mutation)
  )
    return false;
  if (campaign.stage >= STAGES.length - 1) return false;
  campaign.totalEaten += life.eaten;
  campaign.totalTime += life.elapsed;
  campaign.mutations.push(mutation);
  campaign.stage++;
  return true;
}
export function physicalSize(stage, mass) {
  const value = STAGES[stage].baseSize * Math.sqrt(Math.max(0, mass) / 8);
  return value >= 1000 ? Math.round(value) : Math.round(value * 10) / 10;
}
export function encodeSave(campaign, life, sound) {
  return JSON.stringify({
    version: 1,
    campaign,
    sound,
    life: {
      biomass: life.biomass,
      x: life.x,
      y: life.y,
      elapsed: life.elapsed,
      eaten: life.eaten,
      complete: life.complete,
      finalEaten: life.finalEaten,
      dead: life.dead,
    },
  });
}
export function decodeSave(raw) {
  try {
    const data = JSON.parse(raw);
    if (data.version !== 1 || !data.campaign || !data.life) return null;
    const c = data.campaign,
      l = data.life;
    if (
      !Number.isInteger(c.stage) ||
      c.stage < 0 ||
      c.stage >= STAGES.length ||
      !Array.isArray(c.mutations) ||
      c.mutations.length !== c.stage ||
      c.mutations.some((id) => !MUTATIONS.some((m) => m.id === id))
    )
      return null;
    for (const n of [
      c.deaths,
      c.totalEaten,
      c.totalTime,
      l.biomass,
      l.x,
      l.y,
      l.elapsed,
      l.eaten,
    ])
      if (!Number.isFinite(n) || n < 0) return null;
    const campaign = {
      stage: c.stage,
      mutations: [...c.mutations],
      won: c.won === true,
      deaths: Math.floor(c.deaths),
      totalEaten: Math.floor(c.totalEaten),
      totalTime: c.totalTime,
    };
    const life = stageLife(campaign);
    life.biomass = clamp(l.biomass, 0, life.maxMass);
    life.x = clamp(l.x, 100, 1300);
    life.y = clamp(l.y, 130, 1570);
    life.elapsed = l.elapsed;
    life.eaten = Math.floor(l.eaten);
    life.radius = radiusForMass(life.biomass);
    life.evolved = life.biomass >= life.goalMass;
    life.evolution = life.evolved ? 1 : 0;
    life.finalEaten = l.finalEaten === true;
    life.dead = life.biomass === 0;
    life.complete =
      !life.dead &&
      life.evolved &&
      (!life.finalRequired || life.finalEaten) &&
      l.complete === true;
    life.discovered = life.complete;
    campaign.won =
      campaign.won && campaign.stage === STAGES.length - 1 && life.complete;
    life.invulnerable = 2;
    return { campaign, life, sound: data.sound !== false };
  } catch {
    return null;
  }
}
