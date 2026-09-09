import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEngine } from './engine-fixture.mjs';
import { ORBITAL_EARTH as earth, constrainOrbit } from '../app/earth-landmark.mjs';
import { STAGES } from '../app/journey-data.mjs';
import { integrate, impulse } from '../app/simulation.mjs';
import { journeyAdaptation } from '../app/mutations.mjs';
import { saveJourney, loadJourney } from '../app/journey-progress.mjs';

const orbit = STAGES.findIndex(s => s.id === 'orbit');
function isolated(game) {
  game.world.entities = []; game.world.projectiles = []; game.world.stream = () => {};
  game.world.move = () => {}; game.world.replenish = () => {};
}
test('Orbital graduation requires approaching and finishing the Earth absorption, then never respawns Earth', () => {
  const {game} = makeEngine();
  game.startTest(orbit, STAGES[orbit].goal, false, true, true); isolated(game);
  game.life.x = earth.x + 1400; game.life.y = earth.y;
  game.update(1/60);
  assert.equal(game.transition, 0); assert.equal(game.earthAbsorption, 0);
  game.life.x = earth.x; game.life.y = earth.y - earth.radius - 20;
  game.update(1/60);
  assert.ok(game.earthAbsorption > 0); assert.equal(game.transition, 0);
  for(let i=0;i<210;i++) game.update(1/60);
  assert.equal(game.progress.earthConsumed, true); assert.ok(game.transition > 0);
  const loaded = loadJourney(saveJourney(game.progress, game.life, game.world, true));
  assert.equal(loaded.progress.earthConsumed, true);
  assert.equal(loaded.progress.pendingEvolution, true);
  for(let i=0;i<240;i++) game.update(1/60);
  assert.equal(game.progress.stage, orbit+1);
  assert.equal(game.world.entities.some(e=>e.kind==='earth'), false);
  assert.equal(game.world.journal.get('landmark:earth'), Number.MAX_SAFE_INTEGER);
  game.exitTest(); assert.equal(game.progress.earthConsumed, false); game.destroy();
});
test('Below the goal Earth stays inedible; fixed environment tests never graduate', () => {
  const {game}=makeEngine(); game.startTest(orbit, 5, false, true, true); isolated(game);
  game.life.y=earth.y-earth.radius-20; game.update(1/60);
  assert.equal(game.earthAbsorption,0); assert.equal(game.transition,0);
  game.startTest(orbit,STAGES[orbit].goal,false,true,false); isolated(game);
  game.life.y=earth.y-earth.radius-20; game.update(1/60);
  assert.equal(game.earthAbsorption,0); assert.equal(game.transition,0); game.destroy();
});
test('Orbital gravity contains prolonged fully upgraded outward movement and dash at different frame rates',()=>{
  for(const fps of [30,60,120]) {
    const {game}=makeEngine(); game.startTest(orbit,120);
    const p=game.life; p.speedFactor=8; p.boostStrength=8; p.cooldownSeconds=.1;
    for(let i=0;i<fps*30;i++) {
      impulse(p); integrate(p,1/fps,{x:1,y:0}); constrainOrbit(p,1/fps);
      assert.ok(Math.hypot(p.x-earth.x,p.y-earth.y)<=earth.limit+.00001);
      assert.ok(Math.hypot(p.x-earth.x,p.y-earth.y)>=earth.radius);
    }
    p.x=1e7;constrainOrbit(p,1/fps);
    assert.ok(Math.hypot(p.x-earth.x,p.y-earth.y)<=earth.limit+.00001); game.destroy();
  }
});
test('Quick controls add independent biomass and real selectable adaptations only inside a disposable test',()=>{
  const {game}=makeEngine(), original=game.progress, life=game.life;
  assert.equal(game.boostTest('goal'),false);
  game.startTest(0,2,false,true,true); isolated(game);
  game.boostTest('biomass'); assert.equal(game.life.biomass,39.5); assert.equal(game.progress.xp,0);
  game.boostTest('adaptation'); assert.equal(game.progress.xp,journeyAdaptation(0));
  assert.ok(game.progress.offer.length); game.choose(game.progress.offer[0]); assert.equal(game.progress.level,1);
  game.boostTest('adaptation'); assert.equal(game.progress.xp,journeyAdaptation(1));
  game.choose(game.progress.offer[0]);
  game.boostTest('goal'); assert.equal(game.life.biomass,150);
  game.update(1/60); assert.ok(game.transition>0);
  game.exitTest();assert.equal(game.progress,original);assert.equal(game.life,life);
  assert.equal(game.progress.level,0);assert.equal(game.transition,0);game.destroy();
});
test('Microscope background follows sustained movement using cached surfaces',()=>{
  const {game}=makeEngine(); game.drawBackground(0);
  const initial=game.worldGround.view.px;
  const before=game.worldGround.redraws;
  for(let i=0;i<360;i++) { game.camera.x+=3;game.drawBackground(0); }
  assert.ok(game.worldGround.view.px>initial+200);
  assert.ok(game.worldGround.redraws-before<8,'No per-frame background rebake');
  assert.equal(game.worldGround.views.size,1);game.destroy();
});
