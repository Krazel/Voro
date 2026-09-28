import test from 'node:test';
import assert from 'node:assert/strict';
import {UPGRADES,MAX_UPGRADE_CHOICES,offerUpgrades,upgradeStats,journeyAdaptation} from '../app/mutations.mjs';
import {newJourney,journeyLife,saveJourney,loadJourney,chooseUpgrade,migrateMicro} from '../app/journey-progress.mjs';
import {newMicro,saveMicro,microLife} from '../app/micro-progress.mjs';
import {JourneyWorld} from '../app/journey-world.mjs';

test('Removed absorption is never offered or applied; tentacle range and suction remain separate',()=>{
 assert.equal(UPGRADES.length,14);assert.equal(MAX_UPGRADE_CHOICES,74);
 assert.equal(UPGRADES.some(u=>u.id==='reach'),false);
 for(let seed=0;seed<80;seed++)assert.equal(offerUpgrades([],seed,0).includes('reach'),false);
 assert.equal(upgradeStats(['reach']).reachFactor,1);
 assert.equal(upgradeStats(['pull']).tentacleReach,0);
 assert.equal(upgradeStats(['tentacles','tentacleReach']).attraction,0);
});

test('Saved absorption choices are refunded once and survive save/reload between choices',()=>{
 const p=newJourney(42);p.mutations=['reach','speed','reach'];p.level=3;p.xp=journeyAdaptation(2)+3;
 const l=journeyLife(p);l.biomass=40;const w=new JourneyWorld(42);
 let r=loadJourney(saveJourney(p,l,w,true));assert.ok(r);
 assert.deepEqual(r.progress.mutations,['speed']);assert.equal(r.progress.refundChoices,2);
 assert.equal(r.life.biomass,40);assert.equal(r.life.reachFactor,1);assert.equal(r.progress.offer.length,3);
 for(let i=0;i<2;i++){
  assert.ok(chooseUpgrade(r.progress,r.progress.offer[0]));
  r=loadJourney(saveJourney(r.progress,r.life,w,true));assert.ok(r);
  assert.equal(r.progress.refundChoices,1-i);
 }
 assert.equal(r.progress.level,3);assert.deepEqual(r.progress.offer,[]);
 const again=loadJourney(saveJourney(r.progress,r.life,w,true));assert.equal(again.progress.refundChoices,0);
});

test('Full legacy saves and oldest microscope saves remain loadable without impossible refunds',()=>{
 const p=newJourney(42);p.mutations=[...UPGRADES.flatMap(u=>Array(u.max).fill(u.id)),...Array(6).fill('reach')];
 p.level=p.mutations.length;p.xp=journeyAdaptation(p.level-1);
 const w=new JourneyWorld(42);const r=loadJourney(saveJourney(p,journeyLife(p),w,true));
 assert.ok(r);assert.equal(r.progress.level,74);assert.equal(r.progress.refundChoices,0);assert.deepEqual(r.progress.offer,[]);
 const m=newMicro(11);m.mutations=['reach','speed'];m.level=2;m.xp=40;
 const migrated=migrateMicro(saveMicro(m,microLife(m),w,true));assert.ok(migrated);
 assert.deepEqual(migrated.progress.mutations,['speed']);assert.equal(migrated.progress.refundChoices,1);
 assert.ok(migrated.progress.offer.length);
 p.mutations.push('reach');p.level++;assert.equal(loadJourney(saveJourney(p,journeyLife(p),w,true)),null);
});
