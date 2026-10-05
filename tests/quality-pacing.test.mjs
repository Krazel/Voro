import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CAMPAIGN_PACING,biomassYield} from '../app/campaign-pacing.mjs';
import {newJourney,journeyLife,loadJourney,saveJourney} from '../app/journey-progress.mjs';
import {JourneyWorld} from '../app/journey-world.mjs';
import {STAGES,STAGE_SPECIES,SPECIES_BY_ID} from '../app/journey-data.mjs';
import {AnimationSheets} from '../app/animation-sheets.mjs';
import {ANIMATIONS} from '../app/animation-catalog.mjs';
import manifest from '../app/animation-sheets.json' with {type:'json'};
import {sizeRange} from '../app/entity-sizes.mjs';
test('Campaign rewards slow feeding without changing stage sizes/goals, and legacy saves keep mass, XP, choices and pending food',()=>{
 assert.equal(Object.values(CAMPAIGN_PACING).reduce((n,p)=>n+p.minutes,0),77);
 assert.deepEqual(STAGES.slice(0,5).map(s=>CAMPAIGN_PACING[s.id].minutes),[8,8,8,9,8]);
 const space=STAGES.slice(5).map(s=>CAMPAIGN_PACING[s.id].minutes);
 assert.deepEqual(space,[8,8,8,7,5]);
 for(const [stage,s]of STAGES.entries()){
  const p=newJourney(834);p.stage=stage;p.mutations=['speed','digest'];p.level=2;p.xp=48;
  p.totalEaten=17;p.totalTime=123;p.offer=[];
  const l=journeyLife(p);l.biomass=36.5;l.elapsed=99;l.x=50;l.y=-60;
  l.digestion=[{kind:STAGE_SPECIES[stage][0].id,dx:10,dy:4,progress:.4,rotation:0,value:1,r:6}];
  const d=loadJourney(saveJourney(p,l,new JourneyWorld(834,[],stage),true));
  assert.equal(d.life.biomass,36.5);assert.equal(d.progress.xp,48);assert.equal(d.life.elapsed,99);
  assert.deepEqual(d.progress.mutations,p.mutations);assert.equal(d.life.digestion.length,1);
  assert.equal(d.life.goalMass,s.goal);assert.equal(d.life.growthFactor,s.growth*biomassYield(s.id));
 }
});
test('Micro cycles advance at 30 poses/s; high resolution is optional and budget exhaustion never requests a live mesh',()=>{
 for(const s of STAGE_SPECIES[0].filter(s=>manifest[s.id]))
  assert.ok(manifest[s.id][1].frames/ANIMATIONS[s.id].period>=29.9,s.id);
 const sheets=new AnimationSheets({limit:1});sheets.setSpecies(STAGE_SPECIES[0]);
 const c={getTransform:()=>({a:3,b:0})};
 for(const id of ['hunter','spiny','giant']){
  assert.equal(manifest[id].hd1.size,384);
  assert.equal(sheets.draw(c,SPECIES_BY_ID[id],200,0,1),'pending');
 }
 assert.equal(sheets.bytes,0);sheets.destroy();
});
test('Giant cosmic bodies preserve physical ranges and use detailed alpha artwork; Planet clouds use real planet bitmaps',()=>{
 assert.equal(sizeRange(SPECIES_BY_ID['stars-Agujero negro estelar']).max,406);
 for(let i=0;i<6;i++)assert.equal(SPECIES_BY_ID[`galaxies-${i}`].imageAtlas,`galaxyDetail${i}`);
 for(const id of ['planets-Nube protoplanetaria','planets-matter-gas'])
  assert.equal(SPECIES_BY_ID[id].imageAtlas,'planetDiversity');
 const art=JSON.parse(readFileSync(new URL('../design/quality-pacing-2026-09-28/art/manifest.json',import.meta.url)));
 for(const a of art.assets.filter(a=>!a.name.includes('dust')))assert.ok(a.width>=1254&&a.alpha);
 // Check generated populations, not just labels: no galaxy/black-hole texture is reachable in Planets.
 for(const seed of [1,41,73,834,930]){
  const w=new JourneyWorld(seed,[],6);
  for(let x=-3;x<=3;x++)for(let y=-3;y<=3;y++)for(const e of w.generate(x,y,0).entities){
   const s=SPECIES_BY_ID[e.kind];assert.ok(!/^galax|blackHole/.test(s.imageAtlas));
   assert.notEqual(s.imageAtlas,'universe');
  }
 }
});
