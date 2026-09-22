import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEngine } from './engine-fixture.mjs';
import { SfxPlayer } from '../app/sfx.mjs';

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
  assert.equal(g.master.gain.value,.055);assert.equal(f.starts,1);g.destroy();
});
test('Pause, adaptation offer, focus loss and mute suppress effects; normal play restores them',()=>{
  for(const reason of ['paused','settingsOpen','offer','focus','mute']){
    const f=fixture(),g=f.game;
    if(reason==='offer')g.progress.offer=['speed'];else if(reason==='focus')g.audioFocus=false;else if(reason==='mute')g.sound=false;else g[reason]=true;
    g.setAudio();g.slurp();g.impact();assert.equal(f.starts,0,reason);assert.equal(g.master.gain.value,0);
    g.paused=g.settingsOpen=false;g.progress.offer=[];g.audioFocus=g.sound=true;
    g.slurp();g.impact();assert.equal(f.starts,2,reason);assert.equal(g.master.gain.value,.055);g.destroy();
  }
});
test('An interrupted context recovers on the next effect without a mute cycle',async()=>{
  const f=fixture();f.context.state='interrupted';f.game.slurp();
  await new Promise(r=>setImmediate(r));assert.equal(f.resumes,1);
  assert.equal(f.game.sound,true);assert.equal(f.context.state,'running');
  assert.equal(f.game.master.gain.value,.055);assert.equal(f.starts,1);f.game.destroy();
});
test('Actual damage emits an audible midrange effect; invulnerability and mute do not',()=>{
  const f=fixture(),g=f.game;
  g.life.invulnerable=0;
  assert.ok(g.receiveHit({x:g.life.x+50,y:g.life.y},.1,.1)>0);
  assert.equal(g.sfx.stats().damagePlayed,1);assert.equal(f.starts,1);assert.ok(f.frequencies[0]>=100);
  g.receiveHit({x:0,y:0},.1,.1);assert.equal(f.starts,1);
  g.sound=false;g.life.invulnerable=0;g.receiveHit({x:0,y:0},.1,.1);assert.equal(f.starts,1);g.destroy();
});
