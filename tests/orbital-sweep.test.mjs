import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEngine} from './engine-fixture.mjs';
import {STAGES,SPECIES_BY_ID} from '../app/journey-data.mjs';
import {JourneyWorld,journeyEntity} from '../app/journey-world.mjs';
import {ORBITAL_EARTH as earth} from '../app/earth-landmark.mjs';
import {sweepPosition,restoreOrbitSweep} from '../app/orbital-sweep.mjs';
import {JOURNEY_SAVE} from '../app/journey-progress.mjs';
const orbit=STAGES.findIndex(s=>s.id==='orbit');
test('Orbital objects occupy and drift above the Earth disc instead of being filtered or pushed off',()=>{
 const w=new JourneyWorld(834,[],orbit);let over=0;
 for(let x=0;x<3;x++)for(let y=1;y<4;y++)over+=w.generate(x,y,0).entities.filter(e=>Math.hypot(e.x-earth.x,e.y-earth.y)<earth.radius).length;
 assert.ok(over>10);
 const e=journeyEntity(SPECIES_BY_ID['orbit-0'],earth.x,earth.y,0,'over-disc');w.entities=[e];
 const {game:g}=makeEngine();g.startTest(orbit,5);w.move(.02,0,g.life,g.stats,[]);
 assert.ok(Math.hypot(e.x-earth.x,e.y-earth.y)<10);g.destroy();
});
test('Earth and all remaining orbital objects converge; reload restarts the same capture without rewards or leftovers',()=>{
 const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 try{
  const {game:g}=makeEngine();g.startTest(orbit,STAGES[orbit].goal,false,true,true);g.testMode=false;
  g.life.x=earth.x;g.life.y=earth.y-100;g.life.invulnerable=20;
  const swallowed=g.world.entities[0];g.world.eat(swallowed,0);
  g.world.projectiles=[{x:earth.x+300,y:earth.y,r:6,vx:30,vy:0,plasma:true,life:4,damage:.1,edibleAt:200}];
  g.beginEvolution();const snapshot=g.progress.orbitSweep;
  assert.ok(snapshot.items.length>g.world.entities.length);assert.equal(new Set(snapshot.items.map(e=>e.id)).size,snapshot.items.length);
  assert.ok(!snapshot.items.some(e=>e.id===swallowed.id));assert.equal(snapshot.shots.length,1);
  for(const e of snapshot.items){const halfway=sweepPosition(e,g.life,.5),end=sweepPosition(e,g.life,1);assert.ok(Math.hypot(halfway.x-g.life.x,halfway.y-g.life.y)<=Math.hypot(e.x-g.life.x,e.y-g.life.y));assert.ok(Math.abs(end.x-g.life.x)<1e-8);assert.ok(Math.abs(end.y-g.life.y)<1e-8);assert.equal(end.r,0);}
  for(let i=0;i<50;i++)g.update(1/60);g.save();
  const {game:loaded}=makeEngine();assert.deepEqual(loaded.progress.orbitSweep,snapshot);
  const elapsed=loaded.earthAbsorption;loaded.update(1);assert.equal(loaded.earthAbsorption,elapsed,'menu must not finish capture');
  loaded.started=true;const xp=loaded.progress.xp,mass=loaded.life.biomass;
  for(let i=0;i<200;i++)loaded.update(1/60);
  assert.ok(loaded.progress.earthConsumed);assert.equal(loaded.progress.orbitSweep,null);assert.equal(loaded.food.length,0);assert.equal(loaded.world.projectiles.length,0);assert.equal(loaded.progress.xp,xp);assert.equal(loaded.life.biomass,mass);
  loaded.save();const {game:after}=makeEngine();assert.equal(after.food.length,0);assert.equal(after.progress.orbitSweep,null);after.started=true;
  for(let i=0;i<440;i++)after.update(1/60);
  assert.equal(after.progress.stage,orbit+1);assert.equal(after.world.entities.some(e=>e.kind==='earth'),false);assert.equal(after.progress.orbitSweep,null);
  assert.ok(data.has(JOURNEY_SAVE));g.destroy();loaded.destroy();after.destroy();
 }finally{delete globalThis.localStorage;}
 assert.equal(restoreOrbitSweep({items:[{x:NaN}],shots:[]}),null);
});
