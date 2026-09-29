import test from 'node:test';
import assert from 'node:assert/strict';
import {AudioComparison,AUDIO_COMPARISON} from '../app/audio-comparison.mjs';
import {AudioJournal} from '../app/audio-journal.mjs';
const settle=()=>new Promise(r=>setImmediate(r));
function fixture(){
  const timers=new Map(),events=[],ramps=[],nodes=[];let id=0,allowed=true,decodes=0;
  const gain={value:0,cancelScheduledValues(){},setValueAtTime(v,at){ramps.push([v,at]);},linearRampToValueAtTime(v,at){ramps.push([v,at]);}};
  const context=Object.assign(new EventTarget(),{state:'running',currentTime:1,sampleRate:48000,destination:{},
    createGain:()=>({gain,connect(){},disconnect(){}}),createMediaElementSource:()=>({connect(){},disconnect(){}}),
    decodeAudioData:async()=>{decodes++;return{duration:14,length:672000,numberOfChannels:2};},
    createBufferSource:()=>{const node={buffer:null,connect(){},disconnect(){},start(...args){node.startArgs=args;},stop(){node.stopped=true;}};nodes.push(node);return node;}});
  const audio=Object.assign(new EventTarget(),{paused:true,currentTime:0,setAttribute(){},removeAttribute(){},load(){},
    play(){audio.paused=false;return Promise.resolve();},pause(){audio.paused=true;}});
  const player=new AudioComparison(context,{allowed:()=>allowed,record:(...a)=>events.push(a),createAudio:()=>audio,
    fetcher:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(12)}),schedule:fn=>{timers.set(++id,fn);return id;},cancel:n=>timers.delete(n)});
  return{player,context,audio,timers,events,ramps,nodes,get decodes(){return decodes;},set allowed(v){allowed=v;}};
}
test('A and B share asset, context, level and bounded excerpt; repeated A resets position without extra decoding',async()=>{
  const f=fixture(),p=f.player;await p.prepare();assert.equal(f.decodes,1);assert.equal(f.audio.src,AUDIO_COMPARISON.url);
  await p.play('A');assert.equal(f.audio.paused,false);assert.equal(f.audio.currentTime,0);assert.equal(p.phase,'playing');
  p.answer(1,'crackle');f.context.currentTime=5;await p.play('B');assert.equal(f.audio.paused,true);
  assert.deepEqual(f.nodes[0].startArgs,[5,0,12]);assert.ok(f.ramps.some(([v])=>v===.42));p.answer(2,'good');
  f.audio.currentTime=9;await p.play('A');assert.equal(f.audio.currentTime,0);assert.equal(f.nodes[0].stopped,true);assert.equal(f.decodes,1);
  assert.deepEqual(p.report().trials.slice(0,2).map(t=>t.heard),['crackle','good']);p.destroy();assert.equal(f.timers.size,0);
});
test('Automatic end stops output; interruption and inactive gate prevent playback and never auto-restart',async()=>{
  const f=fixture(),p=f.player;await p.prepare();await p.play('B');f.context.currentTime=13;
  [...f.timers.values()][0]();assert.equal(p.phase,'complete');assert.equal(f.nodes[0].stopped,true);assert.equal(p.trials[0].seconds,12);
  await p.play('A');f.context.state='interrupted';f.context.dispatchEvent(new Event('statechange'));assert.equal(f.audio.paused,true);assert.equal(p.phase,'stopped');
  f.context.state='running';f.context.dispatchEvent(new Event('statechange'));assert.equal(f.audio.paused,true);
  f.allowed=false;await p.play('B');assert.equal(p.phase,'error');assert.equal(f.nodes.length,1);p.destroy();
});
test('A delayed play completion cannot restart output after stop or replace the newer B trial',async()=>{
  for(const next of [null,'B']){
    const f=fixture(),p=f.player;await p.prepare();let finish;
    f.audio.play=()=>new Promise(r=>finish=()=>{f.audio.paused=false;r();});
    const a=p.play('A');p.stop('user');if(next)await p.play(next);finish();await a;
    assert.equal(f.audio.paused,true);assert.equal(p.phase,next?'playing':'stopped');assert.equal(p.trials[0].startedAt,null);p.destroy();
  }
});
test('Playback rejection and timeout are failures, not successful acoustic tests',async()=>{
  for(const mode of ['reject','timeout']){
    const f=fixture(),p=f.player;await p.prepare();f.audio.play=()=>mode==='reject'?Promise.reject(new Error('denied')):new Promise(()=>{});
    const attempt=p.play('A');if(mode==='reject')await attempt;else [...f.timers.values()][0]();
    assert.equal(p.phase,'error');p.answer(1,'good');assert.equal(p.trials[0].heard,null);assert.equal(f.audio.paused,true);p.destroy();
  }
});
test('Failed preparation can retry and a disposed late decode never creates a player',async()=>{
  const f=fixture(),p=f.player;let finish;f.context.decodeAudioData=()=>new Promise(r=>finish=r);
  const prep=p.prepare();await settle();p.destroy();finish({duration:14});await prep;assert.equal(p.audio,null);assert.equal(p.buffer,null);
  const g=fixture();g.player.fetcher=async()=>({ok:false});await g.player.prepare();assert.equal(g.player.phase,'error');
  g.player.fetcher=async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(4)});await g.player.prepare();assert.equal(g.player.phase,'ready');g.player.destroy();
});
test('Trial history is bounded; observations survive export and the next journal session',async()=>{
  const f=fixture(),p=f.player;let saved;
  const storage={setItem:(_k,v)=>saved=v,getItem:()=>saved};const journal=new AudioJournal({storage});
  p.record=(kind,detail,report)=>{journal.event(kind,detail);journal.setComparison(report);};await p.prepare();
  for(let i=0;i<16;i++){await p.play(i%2?'B':'A');p.answer(p.trials.at(-1).id,i%2?'good':'crackle');}
  p.stop('share');const exported=journal.report('crackle');assert.equal(exported.current.comparison.trials.length,12);
  const previous=new AudioJournal({storage}).previous;assert.deepEqual(previous.comparison,exported.current.comparison);
  const copy=p.report();copy.trials[0].heard='changed';assert.notEqual(p.trials[0].heard,'changed');p.destroy();journal.destroy();
});
