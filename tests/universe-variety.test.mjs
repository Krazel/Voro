import test from 'node:test';
import assert from 'node:assert/strict';
import {JourneyWorld,journeyEntity} from '../app/journey-world.mjs';
import {STAGES,SPECIES_BY_ID as S} from '../app/journey-data.mjs';
import {POPULATION_PLANS} from '../app/population.mjs';
test('New cosmic structures fit the final food chain and existing population budget',()=>{
 const stage=STAGES.findIndex(s=>s.id==='universe'),found=new Set();
 const ids=['cosmic-wall','lensed-crown','cosmic-confluence'].map(id=>'universe-'+id);
 for(const id of ids)for(let i=0;i<200;i++){
  const e=journeyEntity(S[id],0,0,i/10,'size-check');
  assert.ok(e.requiredMass>50,id+' must feel enormous');
  assert.ok(e.requiredMass<STAGES[stage].goal,id+' must become edible before ending');
 }
 const w=new JourneyWorld(63281,[],stage),limit=POPULATION_PLANS.universe.slots.reduce((a,b)=>a+b);
 for(let x=0;x<40;x++)for(let y=0;y<20;y++){
  const a=w.generate(x,y,0).entities;
  assert.ok(a.filter(e=>!e.id.startsWith('first:')).length<=limit);
  for(const e of a)if(ids.includes(e.kind))found.add(e.kind);
 }
 assert.equal(found.size,3,'each new silhouette actually spawns');
});
