import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEngine} from './engine-fixture.mjs';
import {SPECIES_BY_ID as S,STAGES} from '../app/journey-data.mjs';
import {JourneyWorld,journeyEntity} from '../app/journey-world.mjs';
import {radiusForMass,beginAbsorb} from '../app/simulation.mjs';
import {saveJourney,loadJourney} from '../app/journey-progress.mjs';
const city=STAGES.findIndex(s=>s.id==='city');
function isolate(g){g.world.entities=[];g.world.stream=()=>{};g.world.move=()=>{};g.world.replenish=()=>{};}
test('City armed people and vehicles use their actual size, allow absorption at threshold and refuse below it',()=>{
 for(const id of ['city-0','city-1','city-2','city-3','city-5','city-7','city-8','city-9'])for(const seed of [0,1.5,3.8,6]){
  const {game:g}=makeEngine();g.startTest(city,2,false,false,false);isolate(g);
  const e=journeyEntity(S[id],g.life.x,g.life.y,seed,'target');
  assert.ok(Math.abs(radiusForMass(e.requiredMass)-e.r*1.17)<1e-8);
  g.life.biomass=e.requiredMass*.999;g.life.radius=radiusForMass(g.life.biomass);
  assert.equal(beginAbsorb(g.life,e),false);
  g.life.biomass=e.requiredMass;g.life.radius=radiusForMass(g.life.biomass);
  g.world.entities=[e];g.update(1/60);
  assert.equal(e.eaten,true,id);assert.equal(g.life.digestion.length,1);assert.equal(g.life.hurt,0);
  const loaded=loadJourney(saveJourney(g.progress,g.life,g.world,false));assert.equal(loaded.life.digestion[0].kind,id);
  g.destroy();
 }
});
test('Big military vehicles remain inedible to newborns; edible shooters still shoot and capacity still matters',()=>{
 const {game:g}=makeEngine();g.startTest(city,2,false,false,false);isolate(g);
 for(const id of ['city-7','city-8','city-9']){
  const e=journeyEntity(S[id],g.life.x,g.life.y,0,id);assert.ok(e.requiredMass>2);assert.equal(beginAbsorb(g.life,e),false);
 }
 const e=journeyEntity(S['city-1'],g.life.x+300,g.life.y,0,'shooter');e.shotClock=0;
 const w=new JourneyWorld(8,[],city);w.entities=[e];w.move(.02,0,g.life,g.stats,[]);assert.equal(w.projectiles.length,1);
 e.x=g.life.x;e.y=g.life.y;g.world.entities=[e];
 g.life.digestion=Array.from({length:g.life.absorptionSlots},()=>({progress:0,done:false,value:1,kind:'city-0',r:10,dx:0,dy:0}));
 g.update(.01);assert.equal(e.eaten,false);assert.equal(g.life.hurt,0);
 g.destroy();
});
test('Larger people and one unarmed car slot preserve bounded, deterministic streets and consumed slots',()=>{
 assert.ok(S['city-0'].r>=10&&S['city-3'].r>=10.7);assert.equal(S['city-5'].shot,null);
 const w=new JourneyWorld(51,[],city);let cars=0,total=0;
 for(let x=-20;x<20;x++){
  const chunk=w.generate(x,12,0);assert.ok(chunk.entities.length<=24);
  const found=chunk.entities.filter(e=>e.kind==='city-5');assert.ok(found.length<=1);cars+=found.length;total+=chunk.entities.length;
  assert.deepEqual(w.generate(x,12,0),chunk);
  if(found[0]){w.eat(found[0],0);assert.ok(!w.generate(x,12,0).entities.some(e=>e.id===found[0].id));}
 }
 assert.ok(cars>=35);assert.ok(cars/total<.06);
});
