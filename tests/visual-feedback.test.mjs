import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEngine} from './engine-fixture.mjs';
import {SPECIES_BY_ID as S,STAGES} from '../app/journey-data.mjs';
import {journeyEntity,JourneyWorld} from '../app/journey-world.mjs';
import {radiusForMass,beginAbsorb} from '../app/simulation.mjs';
import {projectileThreatMass} from '../app/threat-scale.mjs';
import {drawOrbitalEarth,ORBITAL_EARTH} from '../app/earth-landmark.mjs';
import {FINALE_SECONDS} from '../app/universe-finale.mjs';
import {saveJourney,loadJourney} from '../app/journey-progress.mjs';
function isolate(g){g.world.entities=[];g.world.stream=()=>{};g.world.move=()=>{};g.world.replenish=()=>{};}
test('Tall buildings require exceeding their longest visible dimension, without changing people/vehicles',()=>{
 const {game:g}=makeEngine();g.startTest(4,2,false,true,false);
 for(const s of Object.values(S).filter(s=>s.building)){
  const e=journeyEntity(s,g.life.x,g.life.y,1,s.id),r=e.r*Math.max(1,s.crop[3]/s.crop[2]);
  assert.ok(Math.abs(radiusForMass(e.requiredMass)-r*1.17)<1e-8);
  g.life.biomass=e.requiredMass*.99;g.life.radius=radiusForMass(g.life.biomass);assert.equal(beginAbsorb(g.life,e),false);
  g.life.biomass=e.requiredMass;g.life.radius=radiusForMass(g.life.biomass);g.life.digestion=[];assert.equal(beginAbsorb(g.life,e),true);
 }g.destroy();
});
test('Shots compare live mass at impact: outgrown soldiers are harmless, larger weapons remain dangerous',()=>{
 const {game:g}=makeEngine();g.startTest(4,2,false,false,false);isolate(g);
 const soldier=journeyEntity(S['city-1'],g.life.x,g.life.y,0,'s');
 const threshold=projectileThreatMass(soldier.requiredMass,S['city-1'].shot.damage);
 const shot=()=>({x:g.life.x,y:g.life.y,vx:0,vy:0,life:4,edibleAt:threshold,r:3,damage:.08});
 g.life.biomass=threshold*1.01;g.life.radius=radiusForMass(g.life.biomass);g.life.invulnerable=0;g.world.projectiles=[shot()];g.update(.01);assert.equal(g.life.hurt,0);
 g.life.biomass=threshold*.9;g.life.invulnerable=0;g.world.projectiles=[shot()];g.update(.01);assert.ok(g.life.hurt>0);
 assert.ok(projectileThreatMass(soldier.requiredMass,.22)>threshold);g.destroy();
});
test('Earth painting tracks the same world coordinates and radius as gravity at every zoom',()=>{
 const positions=[];const c=new Proxy({drawImage:(_, ...coords)=>positions.push(coords)},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 for(const zoom of [.624,1.114,2.3]){
  drawOrbitalEarth(c,{naturalWidth:1254},{x:ORBITAL_EARTH.x+100,y:ORBITAL_EARTH.y+200},844,zoom);
  const [x,y,w,h]=positions.at(-1);
  assert.equal(w,ORBITAL_EARTH.radius*2*zoom);assert.equal(h,w);
  assert.ok(Math.abs((x+w/2-240)/zoom+100)<1e-8);
  assert.ok(Math.abs((y+h/2-844*.48)/zoom+200)<1e-8);
 }
});
test('Completed survivor moves with every input route, preserves completion and never resumes world rewards',()=>{
 const {game:g}=makeEngine();g.startTest(STAGES.length-1,230,false,true,true);isolate(g);g.update(.02);g.update(FINALE_SECONDS);
 assert.equal(g.cameraInputAllowed(),true);const mass=g.life.biomass,xp=g.progress.xp,elapsed=g.life.elapsed;
 for(const mode of ['keyboard','touch','pad','tilt']){
  g.life.x=g.camera.x;g.life.y=g.camera.y;g.life.vx=g.life.vy=0;
  g.keys.clear();g.pointer=null;g.padInput={x:0,y:0};g.tilt.enabled=false;
  if(mode==='keyboard')g.keys.add('KeyD');
  if(mode==='touch')g.pointer={x:80,y:0,sx:0,sy:0,touch:true};
  if(mode==='pad')g.padInput={x:1,y:0};
  if(mode==='tilt'){g.tilt.enabled=true;g.tilt.read=()=>({x:1,y:0});}
  const startX=g.life.x;
  for(let i=0;i<60;i++)g.updateSurvivor(1/60);
  assert.ok(g.life.x>startX+60,mode);assert.equal(g.life.biomass,mass);assert.equal(g.progress.xp,xp);assert.equal(g.life.elapsed,elapsed);
 }
 g.action('pause');assert.equal(g.paused,true);assert.equal(g.cameraInputAllowed(),false);g.action('pause');assert.equal(g.paused,false);
 assert.equal(loadJourney(saveJourney(g.progress,g.life,g.world,false)).progress.completed,true);
 assert.equal(g.world.entities.length,0);g.destroy();
});
test('Orbital viewport optimisation keeps all objects and suspends only remote motion',()=>{
 const w=new JourneyWorld(834,[],5);w.stream(700,970,0,true,2);const ids=w.entities.map(e=>e.id),far=w.entities.find(e=>Math.hypot(e.x-700,e.y-970)>1300);
 const before={x:far.x,y:far.y};w.move(.1,3,{x:700,y:970,biomass:2,radius:24,reachFactor:1},{trailSlow:0},[],{left:300,right:1100,top:300,bottom:1500});
 assert.deepEqual(w.entities.map(e=>e.id),ids);assert.deepEqual({x:far.x,y:far.y},before);
});
