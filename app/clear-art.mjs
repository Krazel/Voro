import ART from './clear-art.json' with {type:'json'};
export function applyClearArt(species,urls) {
 for(const a of ART){
  const key=`clearDetail${a.number}`;urls[key]=a.url;
  for(const id of a.ids)Object.assign(species[id],{imageAtlas:key,crop:a.crop,
   animationCropRevision:3,artProfile:{...a.profile,revision:4}});
 }
}
