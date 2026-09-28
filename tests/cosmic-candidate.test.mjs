import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEngine} from './engine-fixture.mjs';
import {STAGES,SPECIES_BY_ID,STAGE_SPECIES,isDanger} from '../app/journey-data.mjs';
import {JourneyWorld,journeyEntity} from '../app/journey-world.mjs';
import {ORBITAL_EARTH,earthConsumptionPose,drawOrbitalEarth} from '../app/earth-landmark.mjs';
import {gameplayZoom,visualSpeedFactor} from '../app/camera.mjs';
import {integrate} from '../app/simulation.mjs';
import {groundPanels} from '../app/world-ground.mjs';
import {POPULATION_PLANS} from '../app/population.mjs';
import {captureOrbit,restoreOrbitSweep} from '../app/orbital-sweep.mjs';

test('Earth remains fixed while VORO grows to cover its farthest edge; capture stays inside save limits',()=>{
 const life={x:ORBITAL_EARTH.x,y:ORBITAL_EARTH.y-1300,radius:100,biomass:400,goalMass:400};
 let previous=0;const draws=[];
 const c=new Proxy({globalAlpha:1,drawImage(...args){draws.push(args)}},{get:(o,k)=>o[k]??(()=>{})});
 for(const t of [0,.25,.5,.75,1]){
  const pose=earthConsumptionPose(life,t);assert.ok(pose.radius>=previous);previous=pose.radius;
  drawOrbitalEarth(c,{naturalWidth:1254},{x:life.x,y:life.y},1000,.1,life,t,480);
 }
 assert.ok(previous>ORBITAL_EARTH.radius+1300);
 assert.ok(draws.every(args=>args[3]===ORBITAL_EARTH.radius*.2));
 assert.deepEqual(draws[0].slice(1),draws.at(-1).slice(1));
 const w=new JourneyWorld(834,[],STAGES.findIndex(s=>s.id==='orbit')),sweep=captureOrbit(w,[],0);assert.ok(sweep.items.length<=1500);assert.ok(restoreOrbitSweep(sweep));
});
test('Asteroids move their collision positions smoothly and preserve deterministic residents and density',()=>{
 const {game:g}=makeEngine();g.startTest(STAGES.findIndex(s=>s.id==='orbit'),2);const w=g.world;
 for(const id of ['orbit-0','orbit-matter-rock']){
  const s=SPECIES_BY_ID[id],e=journeyEntity(s,g.life.x+100,g.life.y,1,'moving-'+id);w.entities=[e];
  const x=e.x,y=e.y;
  for(let i=0;i<600;i++){
   const before={x:e.x,y:e.y};w.move(1/60,i/60,g.life,g.stats,[]);
   assert.ok(Math.hypot(e.x-before.x,e.y-before.y)<=s.speed/60+1e-6);
  }
  assert.ok(Math.hypot(e.x-x,e.y-y)>35,id);assert.equal(e.id,'moving-'+id);
 }
 g.destroy();
});
test('Large bodies keep readable screen travel with a smoothed automatic camera; manual zoom never changes simulation speed',()=>{
 const {game:g}=makeEngine();
 for(const biomass of [2,25,150,400]){
  g.startTest(7,biomass);const p=g.life,z=gameplayZoom(p.radius,g.cameraEntryRadius);
  for(let i=0;i<120;i++)integrate(p,1/60,{x:1,y:0},visualSpeedFactor(g.cameraEntryRadius,p.radius,z));
  const begin=p.x;for(let i=0;i<60;i++)integrate(p,1/60,{x:1,y:0},visualSpeedFactor(g.cameraEntryRadius,p.radius,z));
  assert.ok(Math.abs((p.x-begin)*z-(p.evolved?162.4:140))<.1);
 }
 const normal=visualSpeedFactor(24,100,.5),manual=visualSpeedFactor(24,100,(.5*1.75)/1.75);assert.equal(normal,manual);g.destroy();
});
test('Early cosmic habitats exclude spiral ground panels and star crops stop before galactic artwork',()=>{
 assert.ok(!groundPanels('planets').includes(0));assert.ok(!groundPanels('planets').includes(3));
 assert.ok(!groundPanels('stars').includes(3));
 for(const [i,top] of [736,740,740,738,754,766].entries()){
  const star=SPECIES_BY_ID['stars-'+i];assert.ok(star.crop[1]+star.crop[3]<top);
 }
 for(const id of ['planets','stars'])for(const s of STAGE_SPECIES[STAGES.findIndex(e=>e.id===id)])assert.ok(!/^galaxies-/.test(s.id));
});
test('A recognizable black hole appears occasionally inside the existing galaxy threat budget',()=>{
 const stage=STAGES.findIndex(s=>s.id==='galaxies'),w=new JourneyWorld(834,[],stage);let holes=0,total=0;
 for(let x=-20;x<20;x++)for(let y=-10;y<10;y++){
  const items=w.generate(x,y,0).entities;total+=items.length;
  assert.ok(items.filter(e=>isDanger(SPECIES_BY_ID[e.kind])).length<=POPULATION_PLANS.galaxies.slots[2]);
  holes+=items.filter(e=>e.kind==='galaxies-black-hole').length;
 }
 assert.ok(holes>0);assert.ok(holes<total*.02);
 const h=SPECIES_BY_ID['galaxies-black-hole'];assert.equal(h.kind,'gravity');assert.equal(h.index,SPECIES_BY_ID['universe-4'].index);assert.equal(h.artProfile.rigid,true);
});
test('Engine keeps music active at reduced level while choices are shown; effects remain silent',()=>{
 const {game:g}=makeEngine();let args;g.music={setState:(...a)=>args=a,destroy(){}};g.started=true;
 g.progress.offer=['speed'];g.syncMusic();assert.equal(args[1],true);assert.equal(args[4],.3);assert.equal(g.effectsAudible(),false);
 g.sound=false;g.syncMusic();assert.equal(args[1],false);g.sound=true;g.progress.offer=[];g.syncMusic();assert.equal(args[4],1);g.destroy();
});
