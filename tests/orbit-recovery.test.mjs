import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEngine} from './engine-fixture.mjs';
import {newJourney,chooseUpgrade,refreshOffer,journeyLife,saveJourney,loadJourney} from '../app/journey-progress.mjs';
import {journeyAdaptation} from '../app/mutations.mjs';
import {JourneyWorld,journeyEntity} from '../app/journey-world.mjs';
import {ORBITAL_EARTH as earth} from '../app/earth-landmark.mjs';
import {STAGES,SPECIES_BY_ID} from '../app/journey-data.mjs';
const orbit=STAGES.findIndex(s=>s.id==='orbit');
function isolate(g){g.world.entities=[];g.world.stream=()=>{};g.world.move=()=>{};g.world.replenish=()=>{};g.world.ensureOrbitalForage=()=>{};}

test('Choosing an adaptation discards all meal overflow and persists an empty new bar',()=>{
 for(const excess of [1.1,2,100]){
  const p=newJourney(834);p.xp=journeyAdaptation(0)*excess;refreshOffer(p);
  const xp=p.xp;assert.equal(chooseUpgrade(p,'invalid'),false);assert.equal(p.xp,xp);
  assert.equal(chooseUpgrade(p,p.offer[0]),true);assert.equal(p.xp,journeyAdaptation(0));assert.equal(p.level,1);assert.deepEqual(p.offer,[]);
  const d=loadJourney(saveJourney(p,journeyLife(p),new JourneyWorld(p.seed),true));
  assert.equal(d.progress.xp,journeyAdaptation(0));assert.deepEqual(d.progress.offer,[]);
 }
});

test('A depleted finite orbit restores accessible zero-threshold food after severe shrinkage, including reloaded worlds',()=>{
 for(const seed of [1,41,73,834])for(const angle of [0,1.5,3,4.5]){
  const p={x:earth.x+Math.cos(angle)*1900,y:earth.y+Math.sin(angle)*1900,biomass:.01,dead:false};
  const w=new JourneyWorld(seed,[],orbit);w.stream(p.x,p.y,0,true,3);
  const slots=new Set(w.entities.map(e=>e.id)),count=w.entities.length;
  for(const e of [...w.entities])if(e.requiredMass<=100000)w.eat(e,0);
  assert.equal(w.entities.filter(e=>!e.eaten).length,0);
  // Simulate restoring a save while every consumed slot is still on cooldown.
  const reloaded=new JourneyWorld(seed,[...w.journal],orbit);reloaded.stream(p.x,p.y,8,true,3);
  assert.ok(reloaded.ensureOrbitalForage(p,8)>0,`seed ${seed} angle ${angle}`);
  const food=reloaded.entities.filter(e=>!e.eaten&&e.requiredMass===0);
  assert.ok(food.length>=3);assert.ok(reloaded.entities.length<=count);
  for(const e of food){assert.ok(slots.has(e.id));assert.ok(Math.hypot(e.x-earth.x,e.y-earth.y)<earth.limit);assert.ok(Math.hypot(e.x-p.x,e.y-p.y)<850);assert.ok(Math.hypot(e.x-p.x,e.y-p.y)>=300);}
  assert.equal(reloaded.ensureOrbitalForage(p,16),0,'Do not add extra food to a recovered area');
 }
});

test('All black-hole variants damage a smaller cell in ordinary damage mode and honor explicit invulnerability',()=>{
 const {game:g}=makeEngine();
 for(const [stage,id]of [[7,'stars-Agujero negro estelar'],[8,'galaxies-black-hole'],[9,'universe-4']]){
  g.startTest(stage,2,false,false,false);isolate(g);g.life.invulnerable=0;
  const e=journeyEntity(SPECIES_BY_ID[id],g.life.x,g.life.y,0,'hole');g.world.entities=[e];
  const before=g.life.biomass;g.update(.016);assert.ok(g.life.biomass<before,id);assert.ok(g.life.hurt>0);
  g.testInvulnerable=true;g.life.invulnerable=0;const safe=g.life.biomass;g.update(.016);assert.equal(g.life.biomass,safe);
 }g.destroy();
});

test('Meeting a biome goal advances without needing a further meal; orbit intentionally waits for Earth contact',()=>{
 const {game:g}=makeEngine();
 for(let stage=0;stage<STAGES.length-1;stage++){
  g.startTest(stage,STAGES[stage].goal*1.1,false,false,true);isolate(g);g.progress.offer=[];g.progress.xp=0;
  if(stage===orbit){g.life.x=earth.x;g.life.y=earth.y+earth.limit-10;g.update(.016);assert.equal(g.earthAbsorption,0);assert.equal(g.transition,0);g.life.y=earth.y;}
  g.update(.016);assert.ok(stage===orbit?g.earthAbsorption>0:g.transition>0,STAGES[stage].id);
 }g.destroy();
});
