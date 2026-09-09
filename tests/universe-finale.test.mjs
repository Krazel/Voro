import test from 'node:test';
import assert from 'node:assert/strict';
import { UniverseFinale, finaleState, FINALE_SECONDS } from '../app/universe-finale.mjs';
import { makeEngine } from './engine-fixture.mjs';
import { loadJourney, saveJourney } from '../app/journey-progress.mjs';
import { STAGES } from '../app/journey-data.mjs';
const last=STAGES.length-1;
function isolate(game) { game.world.entities=[];game.world.stream=()=>{};game.world.move=()=>{};game.world.replenish=()=>{}; }
test('Final biomass starts the universe ending without searching for another object, and saves a completed run',()=>{
  const {game}=makeEngine();game.startTest(last,STAGES[last].goal,false,true,true);isolate(game);
  game.update(1/60);
  assert.equal(game.ending,FINALE_SECONDS);assert.equal(game.progress.completed,true);
  assert.equal(game.progress.offer.length,0);assert.equal(game.life.finalEaten,true);
  const loaded=loadJourney(saveJourney(game.progress,game.life,game.world,true));
  assert.equal(loaded.progress.completed,true);
  const x=game.life.x,y=game.life.y; game.action('dash');
  for(let i=0;i<730;i++) { game.time+=1/60;game.update(1/60); }
  assert.equal(game.ending,0);assert.equal(game.universeFinale,null);
  assert.equal(game.life.x,x);assert.equal(game.life.y,y);
  game.exitTest();assert.equal(game.progress.completed,false);game.destroy();
});
test('Ending respects the final stage, biomass threshold and fixed-biome testing',()=>{
  const {game}=makeEngine();
  for(const [stage,mass,allow] of [[0,150,true],[last,20,true],[last,230,false]]) {
    game.startTest(stage,mass,false,true,allow);assert.equal(game.beginUniverseFinale(),false);
    assert.equal(game.progress.completed,false);
  }
  game.destroy();
});
test('The finale grows the protagonist, then remains exact black with no paths, image or captions',()=>{
  assert.ok(finaleState(6).growth>10);
  for(const remaining of [2.4,1,0,-100]) {
    const calls=[],c={fillStyle:'',fillRect(...args){calls.push([this.fillStyle,...args]);}};
    new UniverseFinale().draw(c,480,850,remaining,false,()=>assert.fail('No protagonist in the darkness'));
    assert.deepEqual(calls,[['#000',0,0,480,850]]);
    assert.equal(finaleState(remaining).caption,'');
  }
  const frame={width:1000,height:1800},scene=new UniverseFinale(frame);
  scene.destroy();assert.equal(frame.width,1);assert.equal(frame.height,1);assert.equal(scene.frame,null);
});
test('Completed black screen stops scheduling scene work, including after resuming a saved final',()=>{
  const f=makeEngine(),{game}=f;
  game.startTest(last,230,false,true,true);isolate(game);game.update(1/60);
  game.update(12);game.renderDirty=true;game.frame(1000);const before=f.draws;
  for(let i=1;i<60;i++)game.frame(1000+i*16.67);
  assert.equal(f.draws,before);game.resize();game.frame(2100);assert.ok(f.draws>before);game.destroy();
});
