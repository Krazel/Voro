import test from 'node:test';
import assert from 'node:assert/strict';
import {AnimationSheets} from '../app/animation-sheets.mjs';
import {drawInhabitant,animationCacheStats,clearAnimationCache} from '../app/inhabitant-animation.mjs';
import {SPECIES_BY_ID,STAGE_SPECIES} from '../app/journey-data.mjs';
import manifest from '../app/animation-sheets.json' with {type:'json'};

test('Every galaxy animation variant fits together and revised crops never trigger live pose generation',async()=>{
  const variants=new Map(STAGE_SPECIES[8].flatMap(s=>Object.values(manifest[s.id]||{})).map(m=>[m.url,m]));
  assert.ok([...variants.values()].reduce((n,m)=>n+m.bytes,0)<=64*1024*1024);
  const sheets=new AnimationSheets({createImage:()=>({naturalWidth:100,decode:async()=>{},set src(v){if(v)queueMicrotask(()=>this.onload?.());}})});
  sheets.setSpecies(STAGE_SPECIES[8]);
  for(const m of variants.values())assert.ok(sheets.request(m));
  for(let i=0;i<variants.size;i++){sheets.pump();await new Promise(r=>setImmediate(r));}
  assert.equal(sheets.stats().pending,0);assert.equal(sheets.stats().errors,0);
  let draws=0;const c=new Proxy({globalAlpha:1,drawImage(){draws++;}},{get:(o,k)=>o[k]??(()=>{})});
  clearAnimationCache();
  for(let i=0;i<6;i++)for(const activity of [1,1.5])for(const r of [20,90,250,600])for(let f=0;f<64;f++)
    drawInhabitant(c,{complete:true,naturalWidth:1536},SPECIES_BY_ID['galaxies-'+i],r,17,f/2,{sheets,activity});
  assert.equal(draws,6*2*4*64);assert.equal(animationCacheStats().entries,0);assert.equal(animationCacheStats().pending,0);
  assert.equal(sheets.draw(c,{...SPECIES_BY_ID['galaxies-0'],animationCropRevision:2},30,0,1),'unavailable','Stale crops must be rejected');
  sheets.destroy();clearAnimationCache();
});
