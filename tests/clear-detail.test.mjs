import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AnimationSheets} from '../app/animation-sheets.mjs';
import {DETAILED_ANIMATIONS} from '../app/animation-detail.mjs';
import {SPECIES_BY_ID} from '../app/journey-data.mjs';
import {ANIMATIONS} from '../app/animation-catalog.mjs';
import {simpleAnimation} from '../app/inhabitant-animation.mjs';
import {sizeRange} from '../app/entity-sizes.mjs';
import ART from '../app/clear-art.json' with {type:'json'};
import sheets from '../app/animation-sheets.json' with {type:'json'};

test('All and only the 48 approved clear cases receive improved art/animation, keeping physical size ranges',()=>{
 const audit=JSON.parse(readFileSync(new URL('../design/asset-audit-2026-09-28/review.json',import.meta.url)));
 const expected=audit.assets.filter(a=>a.assessment==='Claro');
 const changed=new Set([...DETAILED_ANIMATIONS,...ART.flatMap(a=>a.ids)]);
 assert.deepEqual([...changed].sort(),expected.map(a=>a.id).sort());
 for(const a of expected){
  assert.deepEqual(sizeRange(SPECIES_BY_ID[a.id]),a.range,a.id);
  if(!DETAILED_ANIMATIONS.has(a.id))continue;
  const v=sheets[a.id];assert.ok(v.md1&&v.hd1);
  for(const e of [1,1.5])for(const tier of ['md','hd']){
   assert.ok(v[tier+e].size>v[e].size,a.id);
   assert.equal(v[tier+e].frames,v[e].frames,'No frames discarded to gain resolution');
   assert.ok(v[tier+e].cols*v[tier+e].w<=4096);
   assert.ok(Math.ceil(v[tier+e].frames/v[tier+e].cols)*v[tier+e].h<=4096);
  }
 }
 for(const a of ART)for(const id of a.ids){assert.equal(SPECIES_BY_ID[id].imageAtlas,`clearDetail${a.number}`);assert.ok(a.crop[2]>=1000);assert.ok(simpleAnimation(ANIMATIONS[id]));}
});

test('Detailed cycles reserve the other residents basic animations and reuse detail for small individuals',()=>{
 const meta=(url,size,bytes)=>({url,size,bytes,frames:24,cols:6,w:2,h:2,x:0,y:0,extent:3});
 const manifest={'water-2':{1:meta('low',192,10),md1:meta('mid',288,35),hd1:meta('high',480,80)},
  'water-3':{1:meta('other',192,70)}};
 const cache=new AnimationSheets({manifest,limit:100});cache.highDetail=true;
 cache.setSpecies([{id:'water-2'},{id:'water-3'}]);
 const c=new Proxy({getTransform:()=>({a:1,b:0})},{get:(o,k)=>o[k]??(()=>{})});
 cache.draw(c,SPECIES_BY_ID['water-2'],300,0,1);
 assert.ok(cache.entries.has('low'));assert.ok(!cache.entries.has('high'));assert.ok(!cache.entries.has('mid'));
 assert.ok(cache.request(manifest['water-3'][1]));assert.ok(cache.bytes<=100);
 cache.destroy();
 const large=new AnimationSheets({manifest,limit:200});large.highDetail=true;large.setSpecies([{id:'water-2'}]);
 const e=large.request(manifest['water-2'].hd1);e.state='ready';e.image={};
 assert.equal(large.draw(c,SPECIES_BY_ID['water-2'],10,0,1),'ready');
 assert.equal(large.entries.size,1,'A smaller individual can share the ready high quality cycle');
 assert.equal(large.selections.get('water-2').bodyPixels,320);large.destroy();
});
