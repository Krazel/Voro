import test from 'node:test';
import assert from 'node:assert/strict';
import { newJourney, journeyLife, saveJourney, loadJourney } from '../app/journey-progress.mjs';
import { journeyAdaptation, v4JourneyAdaptation, offerUpgrades } from '../app/mutations.mjs';
import { JourneyWorld } from '../app/journey-world.mjs';
import { POPULATION_PLANS } from '../app/population.mjs';
import { makeEngine } from './engine-fixture.mjs';

test('TF build 3 adaptation progress migrates once, including an earned pending choice',()=>{
 for(const fraction of [.4,1,1.2]){
  const p=newJourney(19);p.adaptationVersion=4;p.mutations=['speed'];p.level=1;
  p.xp=v4JourneyAdaptation(0)+fraction*(v4JourneyAdaptation(1)-v4JourneyAdaptation(0));
  if(fraction>=1)p.offer=offerUpgrades(p.mutations,p.seed,p.level);
  const l=journeyLife(p),w=new JourneyWorld(19);l.biomass=45;
  const old=JSON.stringify(p.offer),loaded=loadJourney(saveJourney(p,l,w,true));
  assert.equal(loaded.progress.xp,journeyAdaptation(0)+fraction*(journeyAdaptation(1)-journeyAdaptation(0)));
  assert.equal(JSON.stringify(loaded.progress.offer),old);assert.equal(loaded.life.biomass,45);
  assert.equal(loadJourney(saveJourney(loaded.progress,loaded.life,w,true)).progress.xp,loaded.progress.xp);
 }
});
test('Pond adds only one small-food slot, keeping the danger budget unchanged',()=>{
 assert.deepEqual(POPULATION_PLANS.pond.slots,[7,5,1]);
 assert.deepEqual(POPULATION_PLANS.water.slots,[5,5,2]);
});
test('Pause return to menu keeps the run and resumes without a new birth',()=>{
 const {game}=makeEngine();game.started=true;game.paused=true;game.progress.mutations=['speed'];game.progress.level=1;game.life.biomass=40;
 game.returnToMenu();assert.equal(game.started,false);assert.equal(game.life.biomass,40);assert.deepEqual(game.progress.mutations,['speed']);assert.equal(game.menuRun,true);
 game.action('start');assert.equal(game.started,true);assert.equal(game.birth,0);assert.equal(game.life.biomass,40);game.destroy();
});
