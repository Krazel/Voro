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
test('The universe contracts fully into the cell, then only the softly lit survivor remains',()=>{
  assert.ok(finaleState(6).growth>10);
  const images=[], survivors=[],fills=[];
  const c=new Proxy({fillStyle:'',fillRect(...args){fills.push([this.fillStyle,...args]);},
    drawImage(...args){images.push(args);},createRadialGradient(){return {addColorStop(){}}}},
    {get:(o,k)=>k in o?o[k]:()=>{}});
  const frame={width:1000,height:1800},scene=new UniverseFinale(frame);
  scene.draw(c,480,850,3.84,false,()=>{},0);
  assert.ok(images[0][3]<1,'Captured matter reaches the centre, not a faded large square');
  images.length=0;
  scene.draw(c,480,850,2.4,false,()=>assert.fail('A short completely dark pause'),0);
  assert.equal(images.length,0);
  for(const remaining of [1,0,-100]) {
    scene.draw(c,480,850,remaining,false,(size,solitary)=>survivors.push([size,solitary]),4);
    assert.equal(finaleState(remaining).caption,'');
  }
  assert.equal(survivors.length,3);assert.ok(survivors.every(s=>s[1]===true));
  assert.equal(images.length,0,'No background, galaxies or particles after absorption');
  assert.equal(fills[0][0],'#000');
  scene.destroy();assert.equal(frame.width,1);assert.equal(frame.height,1);
});
test('The completed survivor breathes at most 20 fps without running gameplay; reduced motion stays still',()=>{
  const f=makeEngine(),{game}=f;
  game.startTest(last,230,false,true,true);isolate(game);game.update(1/60);game.update(12);
  let renders=0,simulations=0;game.render=()=>renders++;game.update=()=>simulations++;
  game.renderDirty=true;game.frame(1000);renders=0;
  for(let i=1;i<=60;i++)game.frame(1000+i*1000/60);
  assert.ok(renders>10&&renders<=20);assert.equal(simulations,0);
  game.reduced=true;const before=renders;
  for(let i=1;i<=60;i++)game.frame(2100+i*1000/60);
  assert.equal(renders,before);game.resize();game.frame(3200);assert.ok(renders>before);
  game.destroy();
});
