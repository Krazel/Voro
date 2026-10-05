import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES_BY_ID as species,STAGES} from '../app/journey-data.mjs';
import {journeyEntity,JourneyWorld} from '../app/journey-world.mjs';
import {createLife,radiusForMass,canBeginAbsorb} from '../app/simulation.mjs';
import {cityBarriers,constrainCityBarriers} from '../app/city-barriers.mjs';
import {PlanetMeteors,sweptShotHit} from '../app/planet-meteors.mjs';
import {makeEngine} from './engine-fixture.mjs';

test('A body-sized protagonist can swallow a ray on contact, not by its empty tail corners',()=>{
  for(const heading of [0,Math.PI/2,Math.PI,Math.PI*1.5])for(const seed of [1,3,5]){
    const ray=journeyEntity(species['water-15'],0,0,seed,'ray');ray.heading=heading;
    const p=createLife();p.biomass=8*(ray.r/48)**2;p.radius=radiusForMass(p.biomass);
    p.x=Math.cos(heading)*ray.r*1.6;p.y=Math.sin(heading)*ray.r*1.6;
    assert.ok(p.biomass>=ray.requiredMass);assert.ok(canBeginAbsorb(p,ray));
    p.biomass=ray.requiredMass*.9;assert.equal(canBeginAbsorb(p,ray),false);
    p.biomass=ray.requiredMass*1.3;p.x=ray.r*4;p.y=ray.r*4;assert.equal(canBeginAbsorb(p,ray),false);
  }
});
test('Ice planet has a globe mask; the adjoining purple ring cannot be rendered',()=>{
  const ice=species['planets-3'];assert.ok(ice.artProfile.circularClip);assert.deepEqual(ice.crop,[782,575,350,348]);
});
test('City fences stop boosts, permit a detour at either end, and do not fence the arrival',()=>{
  assert.deepEqual(cityBarriers(1,1,41),[]);
  let count=0;
  for(let x=-5;x<5;x++)for(let y=-5;y<5;y++)for(const b of cityBarriers(x,y,41)){
    count++;
    for(const side of [-1,1]){
      const middle=b.vertical?b.x+b.w/2:b.y+b.h/2,along=b.vertical?b.y+b.h/2:b.x+b.w/2;
      const previous=b.vertical?{x:middle+side*150,y:along}:{x:along,y:middle+side*150};
      const p={...previous,radius:80,vx:300,vy:300};if(b.vertical)p.x=middle-side*150;else p.y=middle-side*150;
      constrainCityBarriers(p,previous,41);assert.ok(((b.vertical?p.x:p.y)-middle)*side>0);
      const end=b.vertical?b.y+b.h+75:b.x+b.w+75;
      if(b.vertical){previous.y=p.y=end;p.x=middle-side*150;}else{previous.x=p.x=end;p.y=middle-side*150;}
      constrainCityBarriers(p,previous,41);assert.ok(((b.vertical?p.x:p.y)-middle)*side<0);
    }
  }assert.ok(count>20);
});
test('Meteorites enter off screen with a warning, fixed velocities, varied sizes and bounded numbers',()=>{
  const field=new PlanetMeteors(41),p={x:0,y:0,vx:0,vy:0},view={left:-300,right:300,top:-500,bottom:500},shots=[];
  for(let i=0;i<200;i++)field.update(.1,p,view,shots);
  assert.ok(shots.length>=1&&shots.length<=4);
  for(const s of shots){assert.ok(s.x<view.left||s.x>view.right||s.y<view.top||s.y>view.bottom);assert.ok(s.warning>=1);assert.ok(Math.hypot(s.vx,s.vy)>150);assert.equal(s.edibleAt,Infinity);}
  for(let i=0;i<1000;i++)field.update(.1,p,view,shots);assert.equal(shots.length,4);
  assert.ok(sweptShotHit({x:200,y:0,r:10},-200,0,{x:0,y:0,radius:30}));
});

test('Meteor arrivals include close pairs and quiet spells without periodic timing or queued bursts',()=>{
 const p={x:0,y:0,vx:0,vy:0},view={left:-600,right:600,top:-450,bottom:450};
 const run=(seed)=>{
  const field=new PlanetMeteors(seed),times=[];let now=0;
  for(let i=0;i<24000;i++){
   now+=.05;const shots=[];field.update(.05,p,view,shots);
   if(shots.length)times.push(now);
  }
  return times;
 };
 const times=run(41),gaps=times.slice(1).map((t,i)=>t-times[i]);
 assert.deepEqual(times,run(41));assert.notDeepEqual(times,run(73));
 assert.ok(gaps.filter(t=>t<1.6).length>10,'occasional closely spaced arrivals');
 assert.ok(gaps.filter(t=>t>11).length>10,'quiet spells');
 assert.ok(gaps.every(t=>t>=.65-1e-8&&t<=19.05));
 assert.ok(!gaps.some((t,i)=>i>0&&t<1.6&&gaps[i-1]<1.6),'at most two in a close group');
 const full=Array.from({length:4},()=>({meteor:true,life:10})),field=new PlanetMeteors(4);
 field.clock=0;field.update(.1,p,view,full);assert.equal(full.length,4);
 const empty=[];field.update(0,p,view,empty);assert.equal(empty.length,0,'no queued burst after a blocked spawn');
 field.update(60,p,view,empty);assert.equal(empty.length,1,'long frame cannot spawn a catch-up barrage');
});
test('In-engine meteors damage, respect invulnerability, and do not exist in orbit',()=>{
  const {game:g}=makeEngine();g.startTest(STAGES.findIndex(s=>s.id==='planets'),50,false,false,false);
  g.world.entities=[];g.world.stream=()=>{};g.world.move=()=>{};
  const p=g.life;p.invulnerable=0;const mass=p.biomass;
  const shot=()=>({meteor:true,x:p.x-5,y:p.y,r:20,vx:400,vy:0,warning:0,life:4,damage:.08/.6,edibleAt:Infinity});
  g.world.projectiles=[shot()];g.update(.016);assert.ok(p.biomass<mass);assert.ok(p.biomass>=mass*.9);
  const after=p.biomass;g.world.projectiles=[shot()];g.update(.016);assert.equal(p.biomass,after);
  g.startTest(STAGES.findIndex(s=>s.id==='orbit'),50,false,false,false);assert.equal(g.world.projectiles.length,0);g.destroy();
});

test('Meteor screen crossing preserves the slower pace across phone/tablet/desktop and camera zoom',()=>{
 for(const [w,h] of [[390,844],[1024,768],[1920,1080]])for(const zoom of [.18,.5,1.2]){
  const field=new PlanetMeteors(73),shots=[];field.clock=0;
  field.update(.016,{x:0,y:0,vx:0,vy:0},{left:-w/2/zoom,right:w/2/zoom,top:-h/2/zoom,bottom:h/2/zoom},shots);
  const seconds=Math.hypot(w,h)/(Math.hypot(shots[0].vx,shots[0].vy)*zoom);
  assert.ok(seconds>=2.8&&seconds<=7.5);
 }
});

test('Meteor showers mix sizes and speeds, mostly pass by, and aim only once at current position',()=>{
 const field=new PlanetMeteors(419),p={x:0,y:0,vx:300,vy:-300};
 const view={left:-600,right:600,top:-450,bottom:450},samples=[];
 for(let i=0;i<600;i++){
  const shots=[];field.clock=0;field.update(.016,p,view,shots);const s=shots[0];samples.push(s);
  const speed=Math.hypot(s.vx,s.vy),distance=Math.hypot(s.x,s.y);
  const missDistance=Math.abs(s.x*s.vy-s.y*s.vx)/speed;
  if(s.aimed){assert.ok(missDistance<1e-8);assert.ok(s.x*s.vx+s.y*s.vy<0);}
  else assert.ok(missDistance>100,'passing trajectory should not converge on the player');
  assert.ok(s.life>distance/speed+1.1,'rock must survive its warning and travel');
  const velocity=[s.vx,s.vy];field.update(.01,{...p,x:500,y:500},view,shots);
  assert.deepEqual([s.vx,s.vy],velocity,'moving player must not redirect an existing rock');
 }
 const aimed=samples.filter(s=>s.aimed).length;assert.ok(aimed>120&&aimed<240);
 const speeds=samples.map(s=>Math.hypot(s.vx,s.vy));assert.ok(Math.max(...speeds)/Math.min(...speeds)>2.4);
 for(const [min,max]of [[10,18],[20,30],[34,48]])assert.ok(samples.filter(s=>s.r>=min&&s.r<=max).length>70);
});
