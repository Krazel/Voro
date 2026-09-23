import test from 'node:test';import assert from 'node:assert/strict';
import {JourneyWorld} from '../app/journey-world.mjs';
import {POPULATION_PLANS} from '../app/population.mjs';
import {SPECIES_BY_ID,STAGES,stageStartMass} from '../app/journey-data.mjs';
import {gameplayZoom,followGameplayZoom} from '../app/camera.mjs';
import {radiusForMass} from '../app/simulation.mjs';

test('Charca appends peaceful fauna while preserving all original slots and every other population',()=>{
 const revised=POPULATION_PLANS.pond.slots;let added=0,oldFauna=0,newFauna=0;
 try {for(let x=10;x<50;x++){
  POPULATION_PLANS.pond.slots=[7,5,1];const before=new JourneyWorld(123,[],1).generate(x,10,0).entities;
  POPULATION_PLANS.pond.slots=revised;const after=new JourneyWorld(123,[],1).generate(x,10,0).entities;
  const ids=new Set(before.map(e=>e.id));
  assert.deepEqual(after.filter(e=>ids.has(e.id)),before);
  const extra=after.filter(e=>!ids.has(e.id));added+=extra.length;
  assert.ok(extra.every(e=>!SPECIES_BY_ID[e.kind].edibleMatter&&!['hunter','hazard'].includes(SPECIES_BY_ID[e.kind].kind)&&e.kind!=='pond-0'));
  const fauna=e=>!SPECIES_BY_ID[e.kind].edibleMatter&&e.kind!=='pond-0';oldFauna+=before.filter(fauna).length;newFauna+=after.filter(fauna).length;
 }}finally{POPULATION_PLANS.pond.slots=revised;}
 assert.ok(added/40>9);assert.ok(newFauna/oldFauna>2);
 assert.deepEqual(Object.fromEntries(Object.entries(POPULATION_PLANS).filter(([id])=>id!=='pond').map(([id,p])=>[id,p.slots])),{micro:[0,0,0],land:[6,9,1],water:[5,5,2],city:[15,7,2],orbit:[4,4,1],planets:[2,3,1],stars:[3,3,1],galaxies:[4,5,1],universe:[4,5,1]});
});

test('All environments retain identical entry framing and useful vision at goal mass',()=>{
 for(let stage=0;stage<STAGES.length;stage++){
  const entry=radiusForMass(stageStartMass(stage)),end=radiusForMass(STAGES[stage].goal);
  assert.ok(Math.abs(entry*gameplayZoom(entry,entry)-26.88)<1e-9);
  assert.ok(end*gameplayZoom(end,entry)<105);
  let previous=Infinity,visible=0;
  for(let step=0;step<=100;step++){
   const r=entry+(end-entry)*step/100,z=gameplayZoom(r,entry);
   assert.ok(z<=previous+1e-9);assert.ok(r*z>=visible-1e-9);previous=z;visible=r*z;
  }
  for(const fps of [30,60,120]){let z=gameplayZoom(entry,entry);for(let i=0;i<fps*10;i++)z=followGameplayZoom(z,end,1/fps,1,entry);assert.ok(Math.abs(z-gameplayZoom(end,entry))<.002);}
 }
});
