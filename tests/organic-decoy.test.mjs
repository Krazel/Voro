import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEngine} from './engine-fixture.mjs';
import {releaseDecoy,decoyTarget,tickDecoy,aspirationReach} from '../app/organic-decoy.mjs';
import {animalTarget} from '../app/animal-steering.mjs';
import {JourneyWorld,journeyEntity} from '../app/journey-world.mjs';
import {SPECIES_BY_ID,STAGE_SPECIES} from '../app/journey-data.mjs';
import {newJourney,journeyLife,chooseUpgrade,saveJourney,loadJourney} from '../app/journey-progress.mjs';
import {UPGRADES,upgradeStats,offerUpgrades,journeyAdaptation} from '../app/mutations.mjs';
import {adaptationYield} from '../app/campaign-pacing.mjs';

test('One rare choice survives save/load and cannot be offered twice',()=>{
 const u=UPGRADES.find(u=>u.id==='decoy');assert.equal(u.group,'Rara');assert.equal(u.max,1);
 const p=newJourney(41);p.offer=['decoy'];assert.ok(chooseUpgrade(p,'decoy'));
 for(let s=0;s<60;s++)assert.ok(!offerUpgrades(p.mutations,s,p.level).includes('decoy'));
 const l=journeyLife(p);releaseDecoy(l,[],{},340);
 const restored=loadJourney(saveJourney(p,l,new JourneyWorld(41),true));
 assert.deepEqual(restored.progress.mutations,['decoy']);assert.equal(restored.life.decoy,null);
 assert.equal(restored.progress.xp,journeyAdaptation(0));
});
test('Dash releases exactly one decoy, rejects cooldown/paused dashes, ticks in simulation and works again on next dash',()=>{
 const {game:g}=makeEngine();g.progress.mutations=['decoy'];g.started=true;g.birth=0;g.life.cooldown=0;
 const e=journeyEntity(SPECIES_BY_ID.hunter,g.life.x-90,g.life.y,1,'hunter');
 e.requiredMass=100;e.aiEngaged=true;g.world.entities=[e];
 g.action('dash');const first=g.life.decoy;assert.ok(first);assert.ok(first.targets.has(e.id));
 g.action('dash');assert.equal(g.life.decoy,first);
 g.paused=true;g.life.cooldown=0;g.action('dash');assert.equal(g.life.decoy,first);
 g.paused=false;g.world.stream=()=>{};g.world.replenish=()=>{};
 g.update(.1);assert.ok(g.life.decoy.remaining<2);assert.equal(typeof g.life.decoy,'object');
 tickDecoy(g.life,2);assert.equal(g.life.decoy,null);
 g.life.cooldown=0;g.action('dash');assert.ok(g.life.decoy);assert.notEqual(g.life.decoy,first);
 g.seed();assert.equal(g.life.decoy,null);g.destroy();
});
test('Pursuers turn toward copy; edible prey, new enemies and static hazards are not distracted',()=>{
 const p=journeyLife(newJourney(41));p.biomass=1;
 const e=journeyEntity(SPECIES_BY_ID.hunter,p.x-80,p.y,1,'hunter');e.requiredMass=100;e.aiEngaged=true;
 releaseDecoy(p,[e],SPECIES_BY_ID,240);p.x-=200;
 assert.ok(animalTarget(e,SPECIES_BY_ID.hunter,p,1,240,260,65).x>e.x,'copy to right, player to left');
 assert.equal(decoyTarget({...e,id:'new'},SPECIES_BY_ID.hunter,p),null);
 assert.equal(decoyTarget(e,{kind:'danger'},p),null);
 assert.equal(decoyTarget(e,{kind:'ranged',speed:0},p),null);
 p.biomass=200;assert.equal(decoyTarget(e,SPECIES_BY_ID.hunter,p),null);
 p.biomass=1;tickDecoy(p,2);
 assert.ok(animalTarget(e,SPECIES_BY_ID.hunter,p,2,240,260,65).x<e.x);
});
test('Ranged enemies aim at the copy without teleporting existing projectiles',()=>{
 const s=STAGE_SPECIES[4].find(s=>s.kind==='ranged'&&s.shot);assert.ok(s);
 const p=journeyLife({...newJourney(41),stage:4});p.biomass=.1;
 const e=journeyEntity(s,p.x-100,p.y,1,'shooter');e.requiredMass=100;e.aiEngaged=true;e.shotClock=0;
 const w=new JourneyWorld(41,[],4);w.entities=[e];releaseDecoy(p,[e],SPECIES_BY_ID,340);p.x-=200;
 w.move(.01,1,p,upgradeStats([]),[]);assert.equal(w.projectiles.length,1);assert.ok(w.projectiles[0].vx>0);
});
test('Suction scales with body, XP bonus caps at40%, dash base intact and max moderated',()=>{
 const p={radius:20,...upgradeStats(Array(6).fill('pull'))};
 assert.ok(Math.abs(aspirationReach(p)-(p.radius+22)-84)<1e-9);
 p.radius=100;const a=aspirationReach(p)-(p.radius+22);p.radius=1000;
 assert.ok(Math.abs((aspirationReach(p)-(p.radius+22))/a-10)<1e-9);
 assert.equal(upgradeStats(Array(8).fill('yield')).adaptationFactor,1.4);
 const base=upgradeStats([]),max=upgradeStats(Array(8).fill('dash'));
 assert.equal(base.boostStrength,2.5);assert.equal(base.boostDuration,.42);assert.equal(base.cooldownFactor*7,7);
 assert.equal(max.boostStrength,3.3);assert.equal(max.boostDuration,.62);assert.equal(max.cooldownFactor*7,3);
 for(const [id,reference] of Object.entries({micro:.13,city:.104,stars:.23,universe:.3}))
  for(const level of [0,20,55,74])assert.equal(adaptationYield(id,level),Math.sqrt(reference));
});
