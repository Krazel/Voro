import test from 'node:test';
import assert from 'node:assert/strict';
import {repelAttacker,advanceRepulsion} from '../app/contact-repulsion.mjs';
import {JourneyWorld,journeyEntity} from '../app/journey-world.mjs';
import {STAGE_SPECIES,SPECIES_BY_ID} from '../app/journey-data.mjs';
import {upgradeStats} from '../app/mutations.mjs';
import {makeEngine} from './engine-fixture.mjs';
import {journeyLife,newJourney} from '../app/journey-progress.mjs';

test('Repulsion moves attackers smoothly, clears overlap, preserves their eating threshold and value',()=>{
 const p={x:0,y:0,radius:40},s={speed:20};
 for(const n of [1,6]){
  const e={x:20,y:0,r:30,homeX:20,homeY:0,seed:0,requiredMass:100,value:12,wound:0};
  assert.ok(repelAttacker(e,s,p,upgradeStats(Array(n).fill('spikes')).repulsionFactor));
  assert.equal(e.x,20,'no teleport at impact');
  advanceRepulsion(e,.1);const partial=e.x;assert.ok(partial>20);
  for(let i=0;i<3;i++)advanceRepulsion(e,.1);
  assert.ok(e.x>partial);assert.ok(Math.abs(e.x-(40*.85+30*.76+40*.5*n))<1e-8);
  assert.equal(e.homeX,e.x,'roaming anchor follows, avoiding leash snap-back');
  assert.equal(e.requiredMass,100);assert.equal(e.value,12);assert.equal(e.wound,0);
  assert.equal(advanceRepulsion(e,.1),false);
 }
 const fixed={x:0,y:0,r:10};assert.equal(repelAttacker(fixed,{speed:0},p,3),false);
 const same={x:0,y:0,r:10,homeX:0,homeY:0,seed:1};repelAttacker(same,s,p,.5);advanceRepulsion(same,.4);assert.ok(Number.isFinite(same.x)&&Math.hypot(same.x,same.y)>0);
});

test('Repulsion runs through microscopic and later-world movement and pauses ranged shooting',()=>{
 for(const stage of [0,3,4,5,7]){
  const s=STAGE_SPECIES[stage].find(s=>s.speed>0&&['hunter','ranged','danger'].includes(s.kind)&&!s.edibleMatter);
  assert.ok(s,`movable threat in ${stage}`);
  const w=new JourneyWorld(41,[],stage);const e=journeyEntity(s,730,970,1,'push');w.entities=[e];
  const p={x:700,y:970,radius:24,biomass:.1,reachFactor:1};
  const before=e.x;repelAttacker(e,s,p,1);e.shotClock=0;
  w.move(.05,1,p,{},[]);assert.ok(e.x>before,`outward motion in stage ${stage}`);assert.equal(w.projectiles.length,0);
 }
});

test('Absorption reach no longer changes aspiration, but does collect nearer food sooner',()=>{
 function run(chosen,distance){
  const {game:g}=makeEngine();g.progress=newJourney(41);g.progress.mutations=chosen;g.life=journeyLife(g.progress);
  g.world=new JourneyWorld(41);g.seed();g.action('start');g.birth=0;
  const e=journeyEntity(SPECIES_BY_ID.nutrient,g.life.x+distance,g.life.y,1,'meal');
  g.world.entities=[e];g.food=[e];g.world.move=()=>{};g.world.stream=()=>{};g.world.replenish=()=>{};
  g.time+=1/60;g.update(1/60);const result={distance:e.x-g.life.x,eaten:e.eaten};g.destroy();return result;
 }
 const base=run([],42),wide=run(Array(6).fill('reach'),42);
 assert.equal(wide.distance,base.distance,'same attraction radius and force');
 assert.equal(wide.eaten,false);
 assert.equal(run([],34).eaten,false);assert.equal(run(Array(6).fill('reach'),34).eaten,true);
 assert.ok(run(['pull'],55).distance<55,'aspiration still extends with its own choice');
});
