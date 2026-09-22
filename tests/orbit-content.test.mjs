import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGES,STAGE_SPECIES,SPECIES_BY_ID} from '../app/journey-data.mjs';
import {JourneyWorld,journeyEntity} from '../app/journey-world.mjs';
import {ORBITAL_EARTH as e,constrainOrbit} from '../app/earth-landmark.mjs';
test('Orbit has no planet-shaped residents; satellites cover larger, distinct sizes',()=>{
 const stage=STAGES.findIndex(s=>s.id==='orbit');
 assert.ok(STAGE_SPECIES[stage].every(s=>!['orbit-5','orbit-Luna helada','orbit-Luna volcánica'].includes(s.id)));
 const w=new JourneyWorld(55,[],stage);
 for(let x=-3;x<=3;x++)for(let y=-3;y<=3;y++)assert.ok(w.generate(x,y,0).entities.every(v=>!['orbit-5','orbit-Luna helada','orbit-Luna volcánica'].includes(v.kind)));
 const s=SPECIES_BY_ID['orbit-2'];const sizes=Array.from({length:150},(_,i)=>journeyEntity(s,0,0,i*.1,'size'+i).r);
 assert.ok(Math.min(...sizes)>15);assert.ok(Math.max(...sizes)>50);assert.ok(Math.max(...sizes)/Math.min(...sizes)>3);
});
test('No gravity anywhere over the visible planet or its free ring; pull only outside',()=>{
 for(let i=0;i<32;i++)for(const r of [0,e.radius-1,e.radius+1,e.softLimit]){
  const p={x:e.x+Math.cos(i)*r,y:e.y+Math.sin(i)*r,vx:0,vy:0};const before={...p};constrainOrbit(p,1/60);
  assert.ok(Math.abs(p.x-before.x)<1e-8&&Math.abs(p.y-before.y)<1e-8);
 }
 const p={x:e.x,y:e.y+e.softLimit+150,vx:0,vy:-100};const before=p.y;constrainOrbit(p,1/60);
 assert.ok(p.y<before);assert.equal(p.vy,-100,'approaching Earth is never blocked');
});
