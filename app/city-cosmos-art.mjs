import CROPS from './city-cosmos-crops.json' with { type: 'json' };
// New artwork is attached after the historic catalogue so saved IDs remain valid.
export function applyCityCosmosArt(stages, lists, byId, urls) {
  urls.cityBuildings = './inhabitants/city-buildings-v2.webp';
  urls.ringedPlanet = './inhabitants/ringed-planet-v2.webp';
  urls.planetDiversity = './inhabitants/planet-diversity-v2.webp';
  const city = stages.findIndex(s => s.id === 'city');
  const planets = stages.findIndex(s => s.id === 'planets');
  for (const id of ['city-matter-bench','city-matter-lamp','city-matter-sign','city-matter-container'])
    byId[id].fixedHeading = 0;
  const add = (source, id, name, stage, changes) => {
    const s = { ...source, id, name, stage, ...changes };
    lists[stage].push(s); byId[id] = s; return s;
  };
  const building = (s, i, r) => Object.assign(s, { building: true, fixedHeading: 0,
    imageAtlas: 'cityBuildings', crop: CROPS.city[i],
    r, sizeFactors: [.92,1.06], kind: 'still', speed: 0, requiredMass: undefined,
    artProfile: { family: 'prop', rigid: true, period: 8, revision: 3,
      description: 'Edificio fijo, alineado con su parcela y las calles.' } });
  building(byId['city-10'], 1, 78); byId['city-10'].name = 'Bloque de apartamentos';
  building(byId['city-11'], 4, 102); byId['city-11'].name = 'Torre de oficinas';
  for (const [id,name,i,r,value] of [
    ['house','Casa de tejas',0,42,9], ['market','Supermercado',2,87,16],
    ['warehouse','Nave industrial',3,96,19], ['civic','Edificio municipal',5,102,24],
  ]) building(add(byId['city-10'], 'city-'+id,name,city,{value}), i,r);
  const planet = (s, i) => Object.assign(s, { imageAtlas: 'planetDiversity',
    crop: CROPS.planets[i],
    fixedHeading: 0, artProfile: { family: 'prop', rigid: true, period: 40,
      revision: 3, description: 'Globo estable con iluminación coherente; deriva orbital lenta.' } });
  for (const [id,i] of [[0,1],[2,5],[3,6],[4,4],[5,7]]) planet(byId['planets-'+id],i);
  for (const [id,name,i,r,value,range,weight] of [
    ['desert','Mundo desértico',0,34,3.5,[.5,1.7],8],
    ['sulfur','Mundo de nubes sulfurosas',2,58,6,[.65,1.45],6],
    ['ice-giant','Gigante de hielo',3,103,16,[.8,1.6],3],
  ]) planet(add(byId['planets-0'],'planets-'+id,name,planets,
    {r,value,sizeFactors:range,populationWeight:weight,requiredMass:undefined}),i);
  Object.assign(byId['planets-5'], {imageAtlas:'ringedPlanet', crop:[4,100,632,447]});
  // Ocean worlds are exceptional, not the default model for a planet.
  byId['planets-1'].populationWeight = .35;
}
