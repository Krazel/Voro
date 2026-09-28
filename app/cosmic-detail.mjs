import {sizeFactors} from './entity-sizes.mjs';
// Keep encounter IDs and physical sizes. Only art and its inexpensive painter
// change; no giant is reduced to disguise a low-resolution texture.
export function applyCosmicDetail(byId,urls) {
 for(const key of ['cosmic-wall','lensed-crown','cosmic-confluence','cosmic-tide']) {
  urls[key]=`./inhabitants/${key}-detail-v2.webp`;
  byId[`universe-${key}`].crop=[0,0,1254,1254];
 }
 const profiles=[['galaxy',16],['galaxy',20],['elliptical',25],['barred',22],['nebula',11],['lenticular',24]];
 for(let i=0;i<6;i++) {
  const key=`galaxyDetail${i}`;urls[key]=`./inhabitants/galaxy-detail-${i}-v1.webp`;
  Object.assign(byId[`galaxies-${i}`],{imageAtlas:key,crop:[0,0,1254,1254],
   artProfile:{family:profiles[i][0],period:profiles[i][1],rigid:true,precession:0,revision:3,
    highDetailFlow:{rx:.34,ry:i===5?.13:.32,angle:i===5?-.38:0},
    description:'Materia estelar con detalle completo y circulación continua dentro del disco.'}});
 }
 urls.blackHoleDetail='./inhabitants/black-hole-detail-v1.webp';
 for(const id of ['stars-Agujero negro estelar','galaxies-black-hole','universe-4'])
  Object.assign(byId[id],{imageAtlas:'blackHoleDetail',crop:[0,0,1254,1254],
   artProfile:{family:'blackhole',period:9,rigid:true,precession:0,revision:3,
    highDetailFlow:{rx:.38,ry:.2,angle:-.58,hole:.12},
    description:'Horizonte negro nítido y filamentos del disco que circulan suavemente.'}});
 // These IDs formerly reused cosmic clouds resembling distant galaxies.
 // Keep saved meals readable, replace their actual bitmap with planetary art.
 for(const [id,name,source]of [['planets-Nube protoplanetaria','Planeta en formación','planets-sulfur'],
  ['planets-matter-gas','Planeta gaseoso joven','planets-ice-giant']]) {
  const s=byId[source];Object.assign(byId[id],{name,imageAtlas:s.imageAtlas,crop:s.crop,sizeFactors:sizeFactors(byId[id]),
   artProfile:{family:'prop',rigid:true,period:40,precession:.012,revision:3,
    description:'Globo planetario estable con una deriva lenta.'}});
 }
}
