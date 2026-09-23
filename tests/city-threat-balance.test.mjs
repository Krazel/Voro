import test from 'node:test';import assert from 'node:assert/strict';
import {STAGES,SPECIES_BY_ID as S} from '../app/journey-data.mjs';
import {JourneyWorld,journeyEntity} from '../app/journey-world.mjs';
import {makeEngine} from './engine-fixture.mjs';
test('City heavy shots persist into mid/late growth while small arms and oversized player contact stay harmless',()=>{
 const {game:g}=makeEngine();g.startTest(4,20,false,false,false);
 const shoot=id=>{const w=new JourneyWorld(42,[],4),e=journeyEntity(S[id],g.life.x+300,g.life.y,0,id);e.shotClock=0;w.entities=[e];w.move(.02,0,g.life,g.stats,[]);assert.equal(w.projectiles.length,1);return w.projectiles[0];};
 const soldier=shoot('city-1'),tank=shoot('city-8'),heli=shoot('city-9');
 assert.ok(soldier.edibleAt>4&&soldier.edibleAt<12);assert.ok(tank.edibleAt>=190&&tank.edibleAt<=230);assert.ok(heli.edibleAt>200&&heli.edibleAt<=270);
 g.world.stream=()=>{};g.world.move=()=>{};g.world.replenish=()=>{};g.world.entities=[];
 for(const [mass,shot,hurt] of [[20,soldier,false],[160,tank,true],[300,tank,false],[300,heli,false]]){
  g.life.biomass=mass;g.life.invulnerable=0;g.life.hurt=0;g.world.projectiles=[{...shot,x:g.life.x,y:g.life.y,vx:0,vy:0}];g.update(.01);assert.equal(g.life.hurt>0,hurt);
 }
 assert.equal(STAGES[4].goal,300);assert.equal(STAGES[4].growth,.22);g.destroy();
});
