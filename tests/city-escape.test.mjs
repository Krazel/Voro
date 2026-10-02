import test from 'node:test';
import assert from 'node:assert/strict';
import { cityEscapeSpecies, cityEscapeSpeed, advanceCityGait } from '../app/city-escape.mjs';
import { JourneyWorld, journeyEntity } from '../app/journey-world.mjs';
import { SPECIES_BY_ID } from '../app/journey-data.mjs';

const player = {x:0,y:0,radius:20,biomass:100};
const setup = id => {
  const s=SPECIES_BY_ID[id], e=journeyEntity(s,100,0,1,id);
  e.cityAxis='x';
  const w=new JourneyWorld(41,[],4);w.entities=[e];
  return {s,e,w};
};

test('Pedestrians and cars accelerate on approach, ease back after escape, and do not scale with player speed',()=>{
  for(const id of ['city-0','city-civilian-0','city-5','city-6']) {
    const {s,e,w}=setup(id);
    w.move(1/60,1/60,player,{},[]);
    assert.ok(e.citySpeedFactor>1 && e.citySpeedFactor<1.1,'gradual first step');
    for(let i=1;i<60;i++)w.move(1/60,(i+1)/60,player,{},[]);
    assert.ok(e.x-e.homeX>s.speed*1.4,id+' actually moves faster');
    assert.ok(e.cityAnimationTime>1.4,'gait follows distance');
    const before=e.citySpeedFactor;
    w.move(1/60,2,{...player,x:950}, {}, []);
    assert.ok(e.citySpeedFactor<before && e.citySpeedFactor>1,'gradual deceleration');
    for(let i=0;i<300;i++)cityEscapeSpeed(e,s,{...player,x:950},1/60);
    assert.ok(e.citySpeedFactor<1.01);
  }
});

test('Fleeing speed depends on proximity, is frame-rate independent, and excludes other biomes',()=>{
  const factors=[];
  for(const hz of [30,60,120]) {
    const {s,e}=setup('city-0');e.aiEngaged=true;
    for(let i=0;i<hz;i++)cityEscapeSpeed(e,s,player,1/hz);
    factors.push(e.citySpeedFactor);
  }
  assert.ok(Math.max(...factors)-Math.min(...factors)<1e-12);
  const {s,e}=setup('city-0');e.aiEngaged=true;
  const close=cityEscapeSpeed({...e},s,player,1);
  const far=cityEscapeSpeed({...e},s,{...player,x:-230},1);
  assert.ok(close>far);
  for(const id of ['water-0','land-0','orbit-0','city-9','city-10'])assert.equal(cityEscapeSpecies(SPECIES_BY_ID[id]),false,id);
});

test('Armed units keep fighting normally; only threatened/edible units flee faster',()=>{
  const {s,e,w}=setup('city-1');
  const weak={...player,x:e.x+270,biomass:0};
  for(let i=0;i<60;i++)w.move(1/60,i/60,weak,{},[]);
  assert.equal(e.citySpeedFactor,1);
  assert.equal(e.x,e.homeX,'firing band must stay still');
  w.move(.1,2,{...weak,biomass:100}, {}, []);
  assert.ok(e.citySpeedFactor>1);assert.ok(e.x<e.homeX);
});

test('Big player triggers escape at body edge; perpendicular approach escapes along lane; wounded units stay still',()=>{
  const {e,w}=setup('city-5');
  w.move(.1,1,{...player,x:e.x,y:500,radius:300}, {}, []);
  assert.ok(e.aiEngaged);assert.ok(e.citySpeedFactor>1);
  assert.ok(Math.abs(e.x-e.homeX)>0);assert.equal(e.y,e.homeY);
  e.wound=1;const x=e.x,clock=e.cityAnimationTime;
  w.move(.1,1.1,player,{},[]);
  assert.equal(e.x,x);assert.equal(e.cityAnimationTime,clock);
});

test('Gait accumulates travelled distance without jumping when speed changes',()=>{
  const {s,e}=setup('city-0');
  advanceCityGait(e,s,s.speed/60,1/60,100);
  const before=e.cityAnimationTime;
  advanceCityGait(e,s,s.speed*1.9/60,1/60,100+1/60);
  assert.ok(Math.abs(e.cityAnimationTime-before-1.9/60)<1e-10);
  advanceCityGait(e,s,0,1/60,100+2/60);
  assert.ok(Math.abs(e.cityAnimationTime-before-1.9/60)<1e-10);
});
