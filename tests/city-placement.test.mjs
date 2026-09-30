import test from 'node:test';
import assert from 'node:assert/strict';
import {JourneyWorld} from '../app/journey-world.mjs';
import {SPECIES_BY_ID} from '../app/journey-data.mjs';
import {cityBounds,cityOverlap,cityDistrict,cityLots,CITY_PLOTS} from '../app/city-layout.mjs';
import {journeyHeading} from '../app/journey-sprites.mjs';

test('City buildings stay centred inside their actual parcels at every generated size',()=>{
 const w=new JourneyWorld(834,[],4);
 for(let cy=-12;cy<12;cy++)for(let cx=-8;cx<8;cx++) {
  const entities=w.generate(cx,cy,0).entities;
  for(const e of entities.filter(e=>SPECIES_BY_ID[e.kind].building)) {
   const lot=cityLots(cx,cy,834).find(p=>p.kind===e.kind&&p.x===e.x&&p.y===e.y);
   const p=CITY_PLOTS[lot.slot],b=cityBounds(SPECIES_BY_ID[e.kind],e);
   assert.equal(e.x,cx*600+p.x+p.w/2);assert.equal(e.y,cy*600+p.y+p.h/2);
   assert.ok(b.x>=cx*600+p.x+8&&b.x+b.w<=cx*600+p.x+p.w-8);
   assert.ok(b.y>=cy*600+p.y+8&&b.y+b.h<=cy*600+p.y+p.h-8);
  }
 }
});
test('City props reserve their whole silhouettes, with foliage in parks and containers in yards',()=>{
 const w=new JourneyWorld(834,[],4),seen=new Set();
 for(let cy=-10;cy<10;cy++)for(let cx=-10;cx<10;cx++) {
  const entities=w.generate(cx,cy,0).entities.filter(e=>!e.eaten);
  const plots=cityLots(cx,cy,834).map(l=>({...CITY_PLOTS[l.slot],x:cx*600+CITY_PLOTS[l.slot].x,y:cy*600+CITY_PLOTS[l.slot].y}));
  const props=entities.filter(e=>SPECIES_BY_ID[e.kind].edibleMatter);
  for(const e of props) {
   const s=SPECIES_BY_ID[e.kind],b=cityBounds(s,e);seen.add(e.kind);
   assert.ok(plots.every(p=>!cityOverlap(b,p,7.9)),e.id+' '+e.kind);
   for(const other of props)if(other!==e)assert.ok(!cityOverlap(b,cityBounds(SPECIES_BY_ID[other.kind],other),7.9));
   if(['city-matter-palm','city-matter-shrub','city-matter-container'].includes(e.kind)) {
    assert.equal(cityDistrict(cx,cy,834),e.kind==='city-matter-container'?2:3);
    assert.ok(b.x>=cx*600+342&&b.x+b.w<=cx*600+516);
    assert.ok(b.y>=cy*600+342&&b.y+b.h<=cy*600+516);
    assert.equal(journeyHeading(e.kind,3),0);
   }
  }
 }
 for(const id of ['city-matter-palm','city-matter-shrub','city-matter-container'])assert.ok(seen.has(id),id);
});
test('Eating a city object cannot move its neighbours or refill its reserved footprint',()=>{
 for(const [cx,cy] of [[0,0],[1,1]]) {
 const w=new JourneyWorld(834,[],4),before=w.generate(cx,cy,0).entities;
 const food=before.find(e=>e.id.startsWith('first:'))||before.find(e=>e.kind==='city-matter-container')||before.find(e=>SPECIES_BY_ID[e.kind].edibleMatter);
 assert.ok(food);w.eat(food,0);
 const after=w.generate(cx,cy,1).entities;
 assert.ok(!after.some(e=>e.id===food.id));
 for(const e of after){const prior=before.find(p=>p.id===e.id);assert.ok(prior);assert.equal(e.x,prior.x);assert.equal(e.y,prior.y);}
 }
});
