// Playable sizes, not an astronomical simulator. Keep coherent ordering within
// each habitat and never reuse a small astronomical object as a giant structure.
export function applyScaleAudit(stages, lists, byId) {
  stages.find(s => s.id === 'orbit').base = 0.08;
  stages.find(s => s.id === 'orbit').intro = 'La Tierra sigue bajo ti. Empieza por los restos orbitales.';
  stages.find(s => s.id === 'planets').base = 8700;
  stages.find(s => s.id === 'galaxies').base = 20000;
  const set = (id, changes) => Object.assign(byId[id], changes);
  set('water-10', { r: 36 });
  set('water-14', { r: 72 });
  set('water-16', { r: 72 });
  set('water-8', { r: 30 });
  set('city-matter-can', { r: 0.6 });
  for (const id of ['city-0', 'city-1']) set(id, { r: 6.17 });
  for (const id of ['city-2', 'city-3']) set(id, { r: 6.6 });
  set('orbit-matter-panel', { r: 5 });
  set('orbit-matter-comet', { name: 'Fragmento de cometa' });
  set('planets-matter-comet', { name: 'Núcleo de planetoide helado' });
  set('orbit-0', { r: 40, requiredMass: undefined, sizeFactors: [0.45, 1.7] });
  set('orbit-1', { r: 4, requiredMass: 0 });
  set('orbit-2', { r: 8 });
  set('orbit-4', { r: 48 });
  set('orbit-5', { name: 'Asteroide craterizado', sizeFactors: [0.55, 1.45] });
  set('orbit-Luna helada', { name: 'Bloque de hielo orbital', sizeFactors: [0.5, 1.5] });
  set('orbit-Luna volcánica', { name: 'Fragmento volcánico', sizeFactors: [0.6, 1.4] });
  set('planets-0', { sizeFactors: [0.45, 1.6] });
  set('planets-1', { sizeFactors: [0.6, 1.55] });
  set('planets-2', { sizeFactors: [0.55, 1.45] });
  set('planets-3', { sizeFactors: [0.5, 1.6] });
  set('planets-4', { sizeFactors: [0.8, 1.5] });
  set('planets-5', { sizeFactors: [0.85, 1.35] });
  // A pulsar's surrounding energy is the large target, not its compact core.
  set('stars-5', { name: 'Envoltura de un púlsar', sizeMeaning: 'Zona de energía alrededor del núcleo compacto' });
  set('stars-Agujero negro estelar', { name: 'Disco de acreción estelar', sizeMeaning: 'Disco de materia, no diámetro del agujero negro' });
  set('galaxies-Cúmulo abierto', { name: 'Cúmulo estelar', r: 2, requiredMass: 0 });
  const cosmicNames = ['Grupo de galaxias', 'Nudo de la red cósmica', 'Región de formación galáctica',
    'Frente de energía intergaláctico', 'Concentración oscura', 'Región de núcleos activos',
    'Supercúmulos en colisión'];
  cosmicNames.forEach((name, i) => set(`universe-${i}`, { name }));
  set('universe-7', { name: 'Cúmulo galáctico', r: 8, requiredMass: 0 });
  set('universe-8', { r: 45 });
  // The same detailed Earth is visible from orbit and eventually edible.
  const stage = stages.findIndex(s => s.id === 'planets');
  const earth = { ...byId['planets-1'], id: 'earth', animationId: 'planets-1',
    name: 'La Tierra', stage, r: 70.3, value: 15, speed: 0, kind: 'still',
    imageAtlas: 'earth', crop: [0, 0, 1254, 1254],
    unique: true, requiredMass: undefined, sizeMeaning: 'Tu mundo de origen' };
  lists[stage].push(earth);
  byId.earth = earth;
}
