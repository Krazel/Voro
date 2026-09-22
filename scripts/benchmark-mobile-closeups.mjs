// Real Skia raster comparison. Measures this draw path, not physical iOS FPS.
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import {drawInhabitant,clearAnimationCache,animationCacheStats,beginAnimationFrame,endAnimationFrame} from '../app/inhabitant-animation.mjs';
import {AnimationSheets} from '../app/animation-sheets.mjs';
import {SPECIES_BY_ID,ATLAS_URLS} from '../app/journey-data.mjs';
const req=createRequire(process.env.VORO_CANVAS_RUNTIME || import.meta.url);
const {createCanvas,loadImage}=req('@napi-rs/canvas');
globalThis.OffscreenCanvas=class {constructor(w,h){return createCanvas(w,h);}};
const image=await loadImage('public/'+ATLAS_URLS.micro.slice(2));
const results=[];
for(const id of ['amoeba','hunter','giant']) {
  clearAnimationCache();
  const sheets=new AnimationSheets();sheets.setSpecies([SPECIES_BY_ID[id]]);sheets.pump=()=>{};
  for(const m of Object.values(sheets.manifest[id])) {
    const e=sheets.request(m);e.image=await loadImage('public/'+m.url.slice(2));e.state='ready';
  }
  const canvas=createCanvas(480,480),ctx=canvas.getContext('2d');
  let draws=0,clips=0;
  const c=new Proxy(ctx,{get:(o,k)=> k==='drawImage' ? (...args)=>{draws++;return o.drawImage(...args);} : k==='clip' ? (...args)=>{clips++;return o.clip(...args);} : typeof o[k]==='function'?o[k].bind(o):o[k],set:(o,k,v)=>{o[k]=v;return true;}});
  const times=[];
  for(let f=0;f<90;f++) {
    c.resetTransform();c.fillStyle='#041423';c.fillRect(0,0,480,480);c.translate(240,240);
    const start=performance.now();beginAnimationFrame();sheets.beginFrame();
    drawInhabitant(c,image,SPECIES_BY_ID[id],130,0,f/60,{activity:1.5,sheets});endAnimationFrame();
    times.push(performance.now()-start);
  }
  times.sort((a,b)=>a-b);
  results.push({id,frames:90,radiusPixels:130,meanMs:times.reduce((a,b)=>a+b)/90,p95Ms:times[85],draws,clips,sheets:sheets.stats(),cache:animationCacheStats()});
  sheets.destroy();
}
mkdirSync('design/mobile-performance-2026-09-22',{recursive:true});
writeFileSync(`design/mobile-performance-2026-09-22/${process.argv[2] || 'current'}.json`,JSON.stringify({kind:'Windows Skia close-up raster, loaded textures, 90 frames/species; not iOS or browser FPS',results},null,2)+'\n');
console.log(JSON.stringify(results.map(({id,meanMs,p95Ms,draws,clips})=>({id,meanMs,p95Ms,draws,clips}))));
