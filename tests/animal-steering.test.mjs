import test from 'node:test';
import assert from 'node:assert/strict';
import { animalTarget } from '../app/animal-steering.mjs';
import { JourneyWorld, journeyEntity } from '../app/journey-world.mjs';
import { STAGE_SPECIES } from '../app/journey-data.mjs';

const entity = () => ({ x:0,y:0,homeX:0,homeY:0,seed:0,requiredMass:20,escape:0 });
const target = (e, kind, d, time=0, mass=1) => animalTarget(e,{kind},{x:e.x+d,y:e.y,biomass:mass},time,340,280,80);

test('Detection has separate enter/leave boundaries and fear survives small mass oscillations',()=>{
 const e=entity();target(e,'hunter',339);
 for(let i=0;i<100;i++) {const t=target(e,'hunter',i%2?341:339,i/60);assert.ok(e.aiEngaged);assert.ok(t.x>e.x);}
 target(e,'hunter',421,2);assert.equal(e.aiEngaged,false);
 target(e,'hunter',380,3);assert.equal(e.aiEngaged,false);
 target(e,'hunter',200,4,20);assert.ok(e.aiAfraid);
 target(e,'hunter',200,5,19.9);assert.ok(e.aiAfraid);
 target(e,'hunter',200,6,17);assert.equal(e.aiAfraid,false);
});

test('Ranged creatures settle within a firing band but flee when edible or frightened',()=>{
 const e=entity();target(e,'ranged',220);assert.equal(e.aiRangeSign,-1);
 for(const d of [229,231,229,231,250]) {const t=target(e,'ranged',d);assert.ok(t.x<e.x);}
 assert.equal(target(e,'ranged',270).x,e.x);
 assert.ok(target(e,'ranged',301).x>e.x);
 assert.ok(target(e,'ranged',299).x>e.x);
 assert.equal(target(e,'ranged',274).x,e.x);
 assert.ok(target(e,'ranged',280,1,20).x<e.x);
 const scared=entity();scared.escape=1;assert.ok(target(scared,'ranged',280).x<scared.x);
});

test('Territory edge starts a committed return and movement stays finite instead of clamping in place',()=>{
 const e=entity();e.x=270;target(e,'hunter',100,0);assert.ok(e.aiReturning);
 e.x=150;assert.equal(target(e,'hunter',100,.5).x,0);assert.ok(e.aiReturning);
 e.x=60;target(e,'hunter',100,1);assert.equal(e.aiReturning,false);
 const world=new JourneyWorld(1,[],3),s=STAGE_SPECIES[3].find(s=>s.kind==='hunter');
 const creature=journeyEntity(s,0,0,0,'edge');creature.x=280;world.entities=[creature];
 for(let i=0;i<60;i++) world.move(1/60,i/60,{x:380,y:0,biomass:0,radius:10},{},[]);
 assert.ok(creature.x<260);assert.ok(Number.isFinite(creature.heading));
});
