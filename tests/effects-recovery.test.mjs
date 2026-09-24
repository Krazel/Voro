import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEngine } from './engine-fixture.mjs';
import { EFFECTS_MASTER_GAIN, SfxPlayer } from '../app/sfx.mjs';
import { upgradeStats } from '../app/mutations.mjs';
import { journeyEntity } from '../app/journey-world.mjs';
import { SPECIES_BY_ID } from '../app/journey-data.mjs';

function fixture(){
  const {game}=makeEngine();let starts=0,resumes=0;
  const frequencies=[];
  const param=()=>({value:0,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},setTargetAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(v){this.value=v;}});
  const context={state:'running',currentTime:1,resume:async()=>{resumes++;context.state='running';},close:async()=>{},
    createGain:()=>({gain:param(),connect(){},disconnect(){}}),
    createBufferSource:()=>({playbackRate:{value:1},connect(){},disconnect(){},start(){starts++;},stop(){}}),
    createOscillator:()=>{const frequency=param();const node={frequency,connect(){},disconnect(){},start(){starts++;frequencies.push(frequency.value);},stop(){}};return node;}};
  game.audioStarted=true;game.audio=context;game.master=context.createGain();
  game.sfx=new SfxPlayer(context,game.master);game.sfx.buffers=[{},{},{}];
  game.started=true;game.birth=0;
  return {game,context,frequencies,get starts(){return starts;},get resumes(){return resumes;}};
}
test('Closing settings restores the effects bus before the next bite without toggling sound',()=>{
  const f=fixture(),g=f.game;
  g.settingsOpen=true;g.setAudio();assert.equal(g.master.gain.value,0);
  g.settingsOpen=false;g.slurp();
  assert.equal(g.master.gain.value,EFFECTS_MASTER_GAIN);assert.equal(f.starts,1);g.destroy();
});
test('Pause, adaptation offer, focus loss and mute suppress effects; normal play restores them',()=>{
  for(const reason of ['paused','settingsOpen','offer','focus','mute']){
    const f=fixture(),g=f.game;
    if(reason==='offer')g.progress.offer=['speed'];else if(reason==='focus')g.audioFocus=false;else if(reason==='mute')g.sound=false;else g[reason]=true;
    g.setAudio();g.slurp();g.impact();assert.equal(f.starts,0,reason);assert.equal(g.master.gain.value,0);
    g.paused=g.settingsOpen=false;g.progress.offer=[];g.audioFocus=g.sound=true;
    g.slurp();g.impact();assert.equal(f.starts,2,reason);assert.equal(g.master.gain.value,EFFECTS_MASTER_GAIN);g.destroy();
  }
});
test('An interrupted context recovers on the next effect without a mute cycle',async()=>{
  const f=fixture();f.context.state='interrupted';f.game.slurp();
  await new Promise(r=>setImmediate(r));assert.equal(f.resumes,1);
  assert.equal(f.game.sound,true);assert.equal(f.context.state,'running');
  assert.equal(f.game.master.gain.value,EFFECTS_MASTER_GAIN);assert.equal(f.starts,1);f.game.destroy();
});
test('Actual damage emits an audible midrange effect; invulnerability and mute do not',()=>{
  const f=fixture(),g=f.game;
  g.life.invulnerable=0;
  assert.ok(g.receiveHit({x:g.life.x+50,y:g.life.y},.1,.1)>0);
  assert.equal(g.sfx.stats().damagePlayed,1);assert.equal(f.starts,1);assert.ok(f.frequencies[0]>=100);
  g.receiveHit({x:0,y:0},.1,.1);assert.equal(f.starts,1);
  g.sound=false;g.life.invulnerable=0;g.receiveHit({x:0,y:0},.1,.1);assert.equal(f.starts,1);g.destroy();
});

test('A consumed shield sounds once instead of damage, while effective unshielded damage uses its own sound',()=>{
 const f=fixture(),g=f.game;let now=1000;g.sfx.now=()=>now;
 g.stats=upgradeStats(['shield']);g.life.invulnerable=0;const mass=g.life.biomass;
 assert.equal(g.receiveHit({x:g.life.x+50,y:g.life.y},.2),0);
 assert.equal(g.life.biomass,mass);assert.equal(g.sfx.stats().shieldPlayed,1);assert.equal(g.sfx.stats().damageRequested,0);
 g.receiveHit({x:0,y:0},.2);assert.equal(g.sfx.stats().shieldPlayed,1);assert.equal(g.sfx.stats().damageRequested,0);
 g.sfx.impactVoice.source.onended();now+=1000;g.life.invulnerable=0;
 assert.ok(g.receiveHit({x:0,y:0},.2)>0);assert.equal(g.sfx.stats().damagePlayed,1);assert.equal(g.sfx.stats().shieldPlayed,1);
 assert.notEqual(f.frequencies[0],f.frequencies[1]);g.destroy();
});

test('Harmless or outgrown contacts and projectiles do not emit hit or shield sounds',()=>{
 for(const kind of ['water-2','water-12']){
  const f=fixture(),g=f.game;g.startTest(3,60,false,false,false);g.stats=upgradeStats(['shield']);
  g.world.stream=g.world.move=g.world.replenish=()=>{};g.progress.offer=[];g.life.invulnerable=0;
  const e=journeyEntity(SPECIES_BY_ID[kind],g.life.x,g.life.y,0,'harmless');e.requiredMass=1;
  g.world.entities=[e];g.world.projectiles=[{x:g.life.x,y:g.life.y,vx:0,vy:0,r:3,life:2,edibleAt:1,damage:.2}];
  g.update(.01);assert.equal(g.sfx.stats().damageRequested,0);assert.equal(g.sfx.stats().shieldRequested,0);g.destroy();
 }
});

test('Mute, menus and focus suppress shield audio as well as damage',()=>{
 for(const reason of ['mute','paused','settingsOpen','offer','focus']){
  const f=fixture(),g=f.game;g.stats=upgradeStats(['shield']);g.life.invulnerable=0;
  if(reason==='mute')g.sound=false;else if(reason==='offer')g.progress.offer=['speed'];else if(reason==='focus')g.audioFocus=false;else g[reason]=true;
  g.receiveHit({x:0,y:0},.2);assert.equal(g.sfx.stats().shieldPlayed,0);assert.equal(g.sfx.stats().damagePlayed,0);g.destroy();
 }
});
