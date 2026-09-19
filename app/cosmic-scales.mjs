// Keep starter bodies and food, but give the upper end of each population
// room to feel enormous. Individual collision/eating sizes use these factors.
export function applyCosmicScales(byId) {
  const ranges = {
    'planets-0':[.35,2.2], 'planets-1':[.5,2], 'planets-2':[.45,2],
    'planets-3':[.35,2.3], 'planets-4':[.6,2.2], 'planets-5':[.65,2],
    'planets-desert':[.35,2.4], 'planets-sulfur':[.45,2.1], 'planets-ice-giant':[.5,2.5],
    'stars-0':[.45,1.7], 'stars-1':[.45,2.1], 'stars-2':[.5,2],
    'stars-3':[.6,2.2], 'stars-4':[.55,2.1], 'stars-5':[.6,1.8],
    'galaxies-0':[.35,1.9], 'galaxies-1':[.4,2.1], 'galaxies-2':[.45,2.3],
    'galaxies-3':[.5,2.25], 'galaxies-4':[.4,2.4], 'galaxies-5':[.55,2.2],
  };
  for(const [id,sizeFactors] of Object.entries(ranges)) byId[id].sizeFactors=sizeFactors;
  Object.assign(byId['stars-Agujero negro estelar'],{r:280,sizeFactors:[.9,1.45],populationWeight:.18});
  // The six galaxies are not aligned to the atlas's nominal 256px rows:
  // their upper arms begin above y=768. Retain the complete painted bounds.
  const tops=[736,740,740,738,754,766];
  tops.forEach((y,i)=>Object.assign(byId[`galaxies-${i}`],{
    crop:[i*256,y,256,1024-y], animationCropRevision:1,
  }));
}
