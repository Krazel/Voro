import test from 'node:test';
import assert from 'node:assert/strict';
import BEFORE from '../design/city-street-props-2026-10-01/before.json' with {type:'json'};
import {JourneyWorld} from '../app/journey-world.mjs';
import {SPECIES_BY_ID} from '../app/journey-data.mjs';
import {cityBounds,cityOverlap} from '../app/city-layout.mjs';

test('Six street-object slots preserve every previous resident, building and arrival object',()=>{
 for(const {seed,x,y,entities} of BEFORE){
  const after=new JourneyWorld(seed,[],4).generate(x,y,0).entities;
  assert.deepEqual(after.filter(e=>!e.id.startsWith('city-street:')).map(({id,kind,x,y,r})=>({id,kind,x,y,r})),entities);
 }
});

test('Street objects are varied, bounded and clear of other silhouettes',()=>{
 let count=0;
 for(let x=-10;x<10;x++)for(let y=-3;y<3;y++){
  const entities=new JourneyWorld(834,[],4).generate(x,y,0).entities;
  const added=entities.filter(e=>e.id.startsWith('city-street:'));count+=added.length;
  assert.ok(added.length<=6);
  for(const e of added){
   assert.ok(SPECIES_BY_ID[e.kind].edibleMatter);
   const b=cityBounds(SPECIES_BY_ID[e.kind],e);
   for(const other of entities)if(e!==other&&SPECIES_BY_ID[other.kind].motion!=='rotor')
    assert.ok(!cityOverlap(b,cityBounds(SPECIES_BY_ID[other.kind],other),7.9),e.id+' overlaps '+other.id);
  }
 }
 assert.ok(count/120>=5.5,'Most of the six slots should really be placed');
});

test('Consumed street objects reserve their space and regrow without shifting neighbours',()=>{
 const world=new JourneyWorld(834,[],4),before=world.generate(1,1,0).entities;
 const item=before.find(e=>e.id.startsWith('city-street:'));assert.ok(item);
 world.eat(item,0);
 const after=world.generate(1,1,1).entities;
 assert.ok(!after.some(e=>e.id===item.id));
 for(const e of after){const old=before.find(v=>v.id===e.id);assert.ok(old);assert.equal(e.x,old.x);assert.equal(e.y,old.y);}
 assert.ok(world.generate(1,1,151).entities.some(e=>e.id===item.id&&e.x===item.x&&e.y===item.y));
});
