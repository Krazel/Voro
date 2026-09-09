import test from 'node:test';
import assert from 'node:assert/strict';
import { JourneyWorld } from '../app/journey-world.mjs';
import { STAGES, STAGE_SPECIES, SPECIES_BY_ID } from '../app/journey-data.mjs';
import { cityLots, cityDistrict, constrainCity } from '../app/city-layout.mjs';
import { ORBITAL_EARTH as earth, constrainOrbit } from '../app/earth-landmark.mjs';
import { populationReport } from '../app/population-report.mjs';
import { makeEngine } from './engine-fixture.mjs';
import { journeyHeading } from '../app/journey-sprites.mjs';

test('Approaching Earth never clamps position or cancels inward velocity, including its centre',()=>{
  for(const d of [0, 100, earth.radius-20, earth.radius+10, earth.softLimit-1]) {
    const p={x:earth.x+d,y:earth.y,vx:-150,vy:4,radius:130};
    const before={...p}; constrainOrbit(p,1/60); assert.deepEqual(p,before);
  }
  const p={x:earth.x+earth.limit+100,y:earth.y,vx:-150,vy:4,radius:130};
  constrainOrbit(p,1/60); assert.equal(p.vx,-150);assert.ok(p.x<=earth.x+earth.limit);
});
test('City buildings occupy aligned persistent lots; eating one leaves a vacant lot',()=>{
  const stage=STAGES.findIndex(s=>s.id==='city'),w=new JourneyWorld(834,[],stage);
  const districts=new Set(),types=new Set();
  for(let x=-8;x<8;x++) {
    const expected=cityLots(x,-3,834), chunk=w.generate(x,-3,0);
    districts.add(cityDistrict(x,-3,834));
    const buildings=chunk.entities.filter(e=>SPECIES_BY_ID[e.kind].building);
    assert.equal(buildings.length,expected.length);
    for(const e of buildings) {
      const lot=expected.find(l=>l.x===e.x&&l.y===e.y); assert.equal(e.kind,lot.kind);
      assert.equal(journeyHeading(e.kind,2.1),0); types.add(e.kind);
    }
    w.eat(buildings[0],0);const after=w.generate(x,-3,1).entities;
    assert.equal(after.some(e=>e.id===buildings[0].id),false);
    for(const e of after) {const prev=chunk.entities.find(a=>a.id===e.id);assert.equal(e.x,prev.x);assert.equal(e.y,prev.y);}
  }
  assert.equal(districts.size,4);assert.equal(types.size,6);
  const e={x:85,y:50,homeY:22,cityAxis:'x'};constrainCity(e);assert.equal(e.y,22);
});
test('City background reuses bounded aligned district tiles while scrolling',()=>{
  const {game}=makeEngine();const stage=STAGES.findIndex(s=>s.id==='city');
  game.startTest(stage,40);game.drawBackground(stage);
  assert.equal(game.worldGround.cache.get(game.groundImages.city).patches.length,4);
  const before=game.worldGround.redraws;
  for(let i=0;i<240;i++){game.camera.x+=2;game.drawBackground(stage);}
  assert.ok(game.worldGround.redraws-before<8);game.destroy();
});
test('Planet ecology offers nine world types with rare ocean worlds and varied size ranges',()=>{
  const stage=STAGES.findIndex(s=>s.id==='planets'),list=STAGE_SPECIES[stage];
  const worlds=list.filter(s=>s.id.match(/^planets-[0-5]$/)||s.artProfile);
  assert.equal(worlds.length,9);
  const report=populationReport(stage);
  const ocean=report.rows.find(s=>s.id==='planets-1');assert.ok(ocean.count>0&&ocean.per100<2);
  for(const id of ['planets-desert','planets-sulfur','planets-ice-giant'])
    assert.ok(report.rows.find(s=>s.id===id).count>0);
  assert.ok(new Set(worlds.map(s=>s.sizeFactors.join(':'))).size>=6);
});

test('City sidewalks consistently receive a substantial civilian population without replacing buildings',()=>{
  const stage=STAGES.findIndex(s=>s.id==='city'),w=new JourneyWorld(51,[],stage);
  let people=0,total=0;
  for(let x=-15;x<15;x++) {
    const entities=w.generate(x,12,0).entities;
    const civilians=entities.filter(e=>e.kind==='city-0');people+=civilians.length;total+=entities.length;
    assert.ok(civilians.length>=9);assert.ok(entities.length<=24);
    assert.ok(civilians.every(e=>e.cityAxis==='x'||e.cityAxis==='y'));
    assert.equal(entities.filter(e=>SPECIES_BY_ID[e.kind].building).length,cityLots(x,12,51).length);
  }
  assert.ok(people/total>.38&&people/total<.5);
});
