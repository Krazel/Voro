import {makeEngine} from '../tests/engine-fixture.mjs';
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import {ATLAS_URLS,STAGES} from '../app/journey-data.mjs';
import {GROUND_PROFILES,WorldGround} from '../app/world-ground.mjs';
import {clearAnimationCache,animationCacheStats} from '../app/inhabitant-animation.mjs';
import {AnimationSheets} from '../app/animation-sheets.mjs';
const req=createRequire(process.env.VORO_CANVAS_RUNTIME || import.meta.url);
const {createCanvas,loadImage}=req('@napi-rs/canvas');
globalThis.OffscreenCanvas=class {constructor(w,h){return createCanvas(w,h);}};
Object.defineProperty(document,'createElement',{configurable:true,value:()=>createCanvas(1,1)});
const atlases={},grounds={};
for(const [k,p] of Object.entries(ATLAS_URLS))atlases[k]=await loadImage('public/'+p.slice(2));
for(const [k,p] of Object.entries(GROUND_PROFILES))grounds[k]=await loadImage('public/backgrounds/'+p.file+'-variants.webp');
const background=await loadImage('public/abyssal-background.png');
const results=[];
for(const repetition of [0,1,2]) for(const sheetsEnabled of [false,true]) for(const stage of [0,1,2,3,4,5,6,7,8,9]) {
  const {game}=makeEngine();game.progress.seed=834;
  game.ctx=createCanvas(585,1266).getContext('2d');game.pixelRatio=1.5;
  game.worldGround=new WorldGround(()=>createCanvas(1,1));
  game.animationSheets=new AnimationSheets();game.animationSheets.enabled=sheetsEnabled;
  game.animationSheets.pump=()=>{}; // Native decoder below, outside the timed CPU frame.
  game.assetStages = "";
  game.startTest(stage,STAGES[stage].goal*.65,false,true);
  Object.assign(game.atlasImages,atlases);Object.assign(game.groundImages,grounds);
  game.spriteAtlas=atlases.micro;game.background=background;
  game.keys.add('KeyD');clearAnimationCache();
  const times=[],decodes=[];
  for(let f=0;f<180;f++) {
    const t=performance.now();game.time+=1/60;game.update(1/60);game.render();times.push(performance.now()-t);
    for(const e of game.animationSheets.entries.values()) if(e.state==='queued') {
      const start=performance.now();e.image=await loadImage('public/'+e.meta.url.slice(2));e.state='ready';
      decodes.push(performance.now()-start);
    }
  }
  times.sort((a,b)=>a-b);
  const item={repetition,stage:STAGES[stage].id,sheetsEnabled,frames:times.length,cpuMeanMs:+(times.reduce((a,b)=>a+b,0)/times.length).toFixed(2),cpuP95Ms:+times[Math.ceil(times.length*.95)-1].toFixed(2),cpuPeakMs:+times.at(-1).toFixed(2),sheets:game.animationSheets.stats(),fallback:animationCacheStats(),decodedImages:decodes.length};
  results.push(item);console.log(JSON.stringify({stage:item.stage,sheetsEnabled,mean:item.cpuMeanMs,p95:item.cpuP95Ms,mb:item.sheets.bytes/1048576,fallbackPoses:item.fallback.entries}));
  game.destroy();
}
writeFileSync('design/animation-sheet-benchmark.json',JSON.stringify({kind:'Windows CPU Skia engine smoke/benchmark; sheets vs updated procedural fallback, 180 moving frames each biome at 65% goal mass; native decodes outside timing; no browser GPU/compositor, not iPhone/iPad FPS',results},null,2)+'\n');
