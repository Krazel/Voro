import test from 'node:test';
import assert from 'node:assert/strict';
import { UniverseFinale, finaleState, fallingLight, dyingCore, FINALE_SECONDS, FINALE_BLACK_AT, FINALE_REVEAL_AT, FINALE_ABSORBED_AT } from '../app/universe-finale.mjs';
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
  for(let i=0;i<FINALE_SECONDS*60+10;i++) { game.time+=1/60;game.update(1/60); }
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
test('The universe contracts into the cell, then stays completely black for five seconds before the original reveal',()=>{
  assert.ok(finaleState(FINALE_SECONDS-8).contraction<.3);
  const images=[], survivors=[],fills=[];
  const c=new Proxy({fillStyle:'',fillRect(...args){fills.push([this.fillStyle,...args]);},
    drawImage(...args){images.push(args);},createRadialGradient(){return {addColorStop(){}}}},
    {get:(o,k)=>k in o?o[k]:()=>{}});
  const frame={width:1000,height:1800},scene=new UniverseFinale(frame);
  scene.draw(c,480,850,FINALE_SECONDS-8.16,false,()=>{},0);
  assert.equal(images[0][3],480,'One captured scene is transformed, without per-frame texture creation');
  assert.equal(images[0][4],850);
  images.length=0;
  for(let t=FINALE_BLACK_AT;t<=FINALE_REVEAL_AT;t+=.25){
    scene.draw(c,480,850,FINALE_SECONDS-t,false,()=>assert.fail('Five seconds of complete darkness'),0);
    assert.equal(finaleState(FINALE_SECONDS-t).survivor,0);
  }
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

test('Universe lights converge, then the cell fades leaving only its own contracting nucleus',()=>{
 for(const reduced of [false,true])for(let index=0;index<48;index++){
  let distance=Infinity;
  for(let elapsed=0;elapsed<=13;elapsed+=.25){
   const p=fallingLight(index,elapsed,480,850,reduced);
   const next=Math.hypot((p.x-240)/480,(p.y-408)/850);
   assert.ok(next<=distance+1e-10,'Every point moves inward, never away');distance=next;
  }
  assert.ok(distance<1e-9);assert.equal(fallingLight(index,13,480,850,reduced).light,0);
 }
 assert.ok(Array.from({length:48},(_,i)=>fallingLight(i,12,480,850)).every(p=>p.done));
 assert.ok(finaleState(FINALE_SECONDS-10.2).bodyLight>0,'The body fades gradually while the original nucleus contracts');
 assert.ok(dyingCore(10.2).light>0);assert.ok(dyingCore(10.8).radius<dyingCore(10.2).radius);
 assert.deepEqual(dyingCore(FINALE_BLACK_AT),{radius:0,light:0});
 const layers=[];
 const c=new Proxy({createRadialGradient(){return {addColorStop(){}};}},{get:(o,k)=>k in o?o[k]:()=>{}});
 new UniverseFinale().draw(c,480,850,FINALE_SECONDS-10.5,false,(_growth,_survivor,fade)=>layers.push(fade));
 assert.ok(layers[0].bodyLight>0&&layers[0].coreScale>0&&layers[0].coreScale<1);
 assert.equal(layers[0].bodyLight,1,'The shared outer mask removes the whole painted cell, including strokes with their own alpha');
 const {game}=makeEngine();game.progress.completed=true;game.ending=FINALE_SECONDS-10;
 const calls=[];game.music={setState:(...a)=>calls.push(a),destroy(){}};game.syncMusic();
 assert.equal(calls[0][1],false);assert.equal(calls[0][3],FINALE_BLACK_AT-FINALE_ABSORBED_AT,'Music fades with the nucleus, then remains silent');game.destroy();
});

test('The reverse reveal masks every cell layer after drawing, even strokes overriding alpha',()=>{
 const calls=[];
 const c=new Proxy({globalAlpha:1,fillRect(...rect){calls.push({type:'fill',rect,alpha:this.globalAlpha})},createRadialGradient(){return {addColorStop(){}}}}, {get:(o,k)=>k in o?o[k]:()=>{}});
 new UniverseFinale().draw(c,390,844,FINALE_SECONDS-11,false,()=>{c.globalAlpha=.9;calls.push({type:'cell'});return{x:195,y:405,radius:100}});
 const last=calls.at(-1);assert.equal(last.type,'fill');assert.deepEqual(last.rect,[0,0,390,844]);assert.equal(last.alpha,1);
 assert.equal(calls.at(-2).type,'cell','No cell layer may be drawn over the final inward mask');
});

test('Body and nucleus fade continuously without a second light appearing or a pause in contraction',()=>{
 let previous={body:1,radius:6,light:1};
 for(let t=FINALE_ABSORBED_AT;t<=FINALE_BLACK_AT+.01;t+=1/60){
  const body=finaleState(FINALE_SECONDS-t).bodyLight,core=dyingCore(t);
  assert.ok(body<=previous.body+1e-9&&core.radius<=previous.radius+1e-9&&core.light<=previous.light+1e-9);
  assert.ok(previous.body-body<.012&&previous.radius-core.radius<.031&&previous.light-core.light<.009,'No visible jump between consecutive frames');
  previous={body,radius:core.radius,light:core.light};
 }
 assert.equal(finaleState(FINALE_SECONDS-FINALE_BLACK_AT).bodyLight,0);
 assert.ok(dyingCore(FINALE_BLACK_AT-.2).radius<.03,'The same nucleus reaches a tiny point before darkness');
});

test('The cell begins fading immediately when the last universe material is swallowed',()=>{
 const end=FINALE_ABSORBED_AT;
 assert.equal(finaleState(FINALE_SECONDS-end).sceneLight,0);
 assert.ok(Array.from({length:48},(_,i)=>fallingLight(i,end,480,850)).every(p=>p.done));
 assert.equal(finaleState(FINALE_SECONDS-end).bodyLight,1);
 assert.ok(finaleState(FINALE_SECONDS-end-.1).bodyLight<1);
 assert.equal(FINALE_REVEAL_AT-FINALE_BLACK_AT,5,'Approved empty pause remains five seconds');
});

test('Completed movement stays unbounded for sustained motion in every direction',()=>{
 const {game:g}=makeEngine();g.progress.completed=true;g.started=true;g.ending=0;
 for(const direction of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]){
  g.input=()=>direction;const x=g.life.x,y=g.life.y;
  for(let i=0;i<60*120;i++)g.updateSurvivor(1/60);
  assert.ok(Math.hypot(g.life.x-x,g.life.y-y)>11000);
  assert.ok(Math.hypot(g.life.x-g.camera.x,g.life.y-g.camera.y)<60,'camera follows the survivor');
 }
 g.destroy();
});
test('The completed survivor breathes at most 20 fps without running gameplay; reduced motion stays still',()=>{
  const f=makeEngine(),{game}=f;
  game.startTest(last,230,false,true,true);isolate(game);game.update(1/60);game.update(FINALE_SECONDS);
  let renders=0,simulations=0;game.render=()=>renders++;game.update=()=>simulations++;
  game.renderDirty=true;game.frame(1000);renders=0;
  for(let i=1;i<=60;i++)game.frame(1000+i*1000/60);
  assert.ok(renders>10&&renders<=20);assert.equal(simulations,0);
  game.reduced=true;const before=renders;
  for(let i=1;i<=60;i++)game.frame(2100+i*1000/60);
  assert.equal(renders,before);game.resize();game.frame(3200);assert.ok(renders>before);
  game.destroy();
});
