import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEngine } from './engine-fixture.mjs';
import { STAGES, STAGE_SPECIES, stageStartMass, isDanger } from '../app/journey-data.mjs';
import { journeyEntity } from '../app/journey-world.mjs';
import { adaptationYield } from '../app/campaign-pacing.mjs';

test('Damage scaling helper preserves proportional unspent XP loss', () => {
  const { game } = makeEngine();
  try {
    for (let stage = 0; stage < STAGES.length; stage++) {
      for (const mass of [2, 100]) {
        game.startTest(stage, mass, false, false, true);
        game.progress.xp = 20;
        const before = game.life.biomass;
        const oldLoss = Math.max(0.6, before * 0.25);
        const lost = game.receiveHit({ x: game.life.x + 40, y: game.life.y }, 0.25);
        assert.ok(Math.abs(lost - oldLoss * 0.60) < 1e-9, STAGES[stage].id);
        assert.ok(Math.abs(game.progress.xp - 20 * (1 - lost / before)) < 1e-9);
        assert.equal(game.receiveHit({ x: 0, y: 0 }, 0.25), 0);
        assert.equal(game.progress.mutations.length, 0);
      }
    }
  } finally { game.destroy(); }
});

test('Real world contacts remove exactly 10% of current biomass and unspent XP, including tiny bodies',()=>{
 const {game:g}=makeEngine();
 try {
  for(let stage=0;stage<STAGES.length;stage++){
   const spec=STAGE_SPECIES[stage].find(isDanger);if(!spec)continue;
   for(const mass of [.1,2,100]){
    g.startTest(stage,2,false,false,false);g.life.biomass=mass;g.life.invulnerable=0;g.birth=g.transition=0;
    g.progress.xp=.5;g.progress.offer=[];
    g.world.stream=g.world.move=g.world.replenish=()=>{};
    const e=journeyEntity(spec,g.life.x,g.life.y,0,'hit');e.requiredMass=mass*10;
    g.world.entities=[e];g.world.projectiles=[];g.update(.001);
    assert.ok(Math.abs(g.life.biomass-mass*.9)<1e-9,STAGES[stage].id+' '+mass);
    assert.ok(Math.abs(g.progress.xp-.45)<1e-9);
    const after=g.life.biomass;g.update(.001);assert.equal(g.life.biomass,after,'escape invulnerability');
   }
  }
 }finally{g.destroy();}
});

test('Real projectiles retain weaker damage and never exceed 10%, even through minimum damage',()=>{
 const {game:g}=makeEngine();
 try{
  for(const mass of [.1,2,100])for(const damage of [.06,.17]){
   g.startTest(3,2,false,false,false);g.life.biomass=mass;g.life.invulnerable=0;g.birth=g.transition=0;
   g.progress.xp=.5;g.progress.offer=[];g.world.entities=[];
   g.world.stream=g.world.move=g.world.replenish=()=>{};
   g.world.projectiles=[{x:g.life.x,y:g.life.y,vx:0,vy:0,r:3,life:2,edibleAt:mass*10,damage}];
   g.update(.001);
   const expected=Math.min(mass*.1,Math.max(.36,mass*damage*.6));
   assert.ok(Math.abs(g.life.biomass-(mass-expected))<1e-9);
   assert.ok(Math.abs(g.progress.xp-.5*(1-expected/mass))<1e-9);
  }
 }finally{g.destroy();}
});

test('Ordinary food earns 10% more adaptation progress in every environment without changing biomass rewards', () => {
  const { game } = makeEngine();
  try {
    for (let stage = 0; stage < STAGES.length; stage++) {
      game.startTest(stage, stageStartMass(stage), false, true, true);
      game.world.entities = [];
      game.world.stream = () => {};
      game.life.digestion = [{ progress: .99, value: 1, r: 1, dx: 0, dy: 0, rotation: 0, kind: 'nutrient' }];
      const mass = game.life.biomass, xp = game.progress.xp, growth = game.life.growthFactor;
      game.update(.1);
      assert.ok(Math.abs(game.progress.xp - xp - 0.68 * 1.1 * adaptationYield(STAGES[stage].id)) < 1e-9, STAGES[stage].id);
      assert.ok(Math.abs(game.life.biomass - mass - growth) < 1e-9);
    }
  } finally { game.destroy(); }
});
