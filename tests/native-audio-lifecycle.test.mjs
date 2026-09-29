import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEngine} from './engine-fixture.mjs';
import {observeAudioSession} from '../app/native-audio-observer.mjs';

const settle=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(){
  let resumes=0,plays=0;const media=[];
  const oldContext=globalThis.AudioContext,oldAudio=globalThis.Audio;
  const param=()=>({value:0,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},setTargetAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;}});
  const context=Object.assign(new EventTarget(),{state:'running',currentTime:1,destination:{},
    resume(){resumes++;return Promise.resolve().then(()=>{context.state='running';context.dispatchEvent(new Event('statechange'));});},
    close:async()=>{},createGain:()=>({gain:param(),connect(){},disconnect(){}}),createMediaElementSource:()=>({connect(){},disconnect(){}})});
  globalThis.AudioContext=function(){return context;};
  globalThis.Audio=function(){const a=Object.assign(new EventTarget(),{paused:true,ended:false,currentTime:12,duration:300,
    setAttribute(){},removeAttribute(){},load(){},play(){plays++;a.paused=false;return Promise.resolve();},pause(){a.paused=true;}});media.push(a);return a;};
  document.hidden=false;const {game:g}=makeEngine();g.started=true;g.birth=0;g.initAudio();
  g.sfx.buffers=[{},{},{},{},{}];g.music.unlock();
  return{g,context,media,get resumes(){return resumes;},get plays(){return plays;},
    destroy(){g.destroy();document.hidden=false;if(oldContext===undefined)delete globalThis.AudioContext;else globalThis.AudioContext=oldContext;if(oldAudio===undefined)delete globalThis.Audio;else globalThis.Audio=oldAudio;}};
}

test('Native inactivity before web visibility prevents premature resume',async()=>{
  const f=fixture(),{g,context}=f;
  try{
    await settle();const plays=f.plays;
    g.setNativeAudioActive(false); // willResignActive, while the document still looks visible
    assert.equal(document.hidden,false);assert.equal(g.paused,true);assert.equal(g.audioFocus,false);
    assert.ok(f.media.every(a=>a.paused));assert.equal(g.music.volumeTarget,0);assert.equal(g.master.gain.value,0);
    context.state='interrupted';context.dispatchEvent(new Event('statechange'));await settle();
    g.initAudio(true);window.dispatchEvent(new Event('pointerdown'));g.restoreForegroundAudio();
    assert.equal(f.resumes,0);assert.equal(f.plays,plays);
    document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));
    document.hidden=false;document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));
    assert.equal(f.resumes,0,'Web focus cannot override inactive native state');
    g.setNativeAudioActive(true); // native WebKit unblock has completed
    window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));
    await settle();assert.equal(f.resumes,1,'One context recovery owner despite repeated foreground events');
    assert.equal(g.paused,true);assert.ok(f.media.every(a=>a.paused));
    g.action('pause');await settle();assert.equal(g.paused,false);assert.ok(f.media.some(a=>!a.paused));
    assert.equal(g.music.volumeTarget,.42);
  }finally{f.destroy();}
});

test('Integrated comparison shares the game context and stops on mute, settings close and native inactivity',async()=>{
  const f=fixture(),{g,context}=f;
  try{
    await settle();assert.equal(g.getAudioComparison(),null,'Available only in Settings');
    g.settingsOpen=true;g.setAudio();
    context.decodeAudioData=async()=>({duration:14,length:672000,numberOfChannels:2});
    context.createBufferSource=()=>({connect(){},disconnect(){},start(){},stop(){}});
    const c=g.getAudioComparison();c.fetcher=async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(4)});
    assert.equal(c.context,context);await c.prepare();await c.play('A');
    assert.equal(c.phase,'playing');assert.ok(g.music.decks.every(d=>d.audio.paused));assert.equal(g.effectsAudible(),false);
    g.sound=false;g.setAudio();assert.equal(c.phase,'stopped');assert.equal(c.audio.paused,true);assert.equal(g.getAudioComparison(),null);
    g.sound=true;await c.play('B');g.settingsOpen=false;g.setAudio();assert.equal(c.phase,'stopped');
    g.settingsOpen=true;g.setAudio();await c.play('A');g.setNativeAudioActive(false);assert.equal(c.phase,'stopped');assert.equal(c.audio.paused,true);
    g.setNativeAudioActive(true);await settle();assert.equal(c.phase,'stopped');assert.equal(c.audio.paused,true);
  }finally{f.destroy();}
});

test('0.12.1 recorded order: interruption before native inactivity blocks every resume path until fresh confirmation',async()=>{
  const f=fixture(),{g,context}=f,pending=[];let listener;
  const stop=observeAudioSession({addListener:async(_name,fn)=>{listener=fn;return{remove(){}};},
    snapshot:()=>new Promise(resolve=>pending.push(resolve))},()=>{},active=>g.setNativeAudioActive(active));
  g.recheckNativeAudio=stop.recheck;
  try{
    await settle();pending.shift()({activity:{sequence:1,allowed:true}});await settle();
    g.action('pause');assert.equal(g.paused,false);
    for(let i=0;i<3;i++){
      const before=f.resumes,seq=2+i*2;
      context.state='interrupted';context.dispatchEvent(new Event('statechange'));
      assert.equal(g.nativeAudioActive,false,'Interruption closes the gate before native notification');
      g.initAudio(true);g.sfx.unlock(true);g.prepareEffects();g.restoreForegroundAudio();window.dispatchEvent(new Event('pointerdown'));
      context.state='suspended';context.dispatchEvent(new Event('statechange'));await settle();
      assert.equal(f.resumes,before);assert.ok(f.media.every(a=>a.paused));
      listener({sequence:seq,activity:{sequence:seq,allowed:false}});
      // A stale active snapshot must not defeat the newer inactive notification.
      pending.shift()({activity:{sequence:seq-1,allowed:true}});await settle();
      assert.equal(f.resumes,before);assert.equal(g.nativeAudioActive,false);
      listener({sequence:seq+1,activity:{sequence:seq+1,allowed:true}});await settle();
      assert.equal(f.resumes,before+1);assert.equal(g.paused,true);
      assert.ok(f.media.every(a=>a.paused));g.action('pause');await settle();
      assert.equal(g.paused,false);assert.ok(f.media.some(a=>!a.paused));
    }
  }finally{stop();f.destroy();}
});

test('An interrupted native context can recover in foreground with an unchanged, freshly confirmed activity sequence',async()=>{
  const f=fixture(),{g,context}=f,pending=[];
  const stop=observeAudioSession({addListener:async()=>({remove(){}}),snapshot:()=>new Promise(resolve=>pending.push(resolve))},()=>{},active=>g.setNativeAudioActive(active));
  g.recheckNativeAudio=stop.recheck;
  try{
    await settle();pending.shift()({activity:{sequence:7,allowed:true}});await settle();g.action('pause');
    // Exercise the effect/health path before statechange is delivered too.
    context.state='interrupted';g.initAudio();await settle();
    assert.equal(f.resumes,0);assert.equal(g.nativeAudioActive,false);
    pending.shift()({activity:{sequence:7,allowed:true}});await settle();
    assert.equal(f.resumes,1);assert.equal(context.state,'running');assert.equal(g.paused,true);
  }finally{stop();f.destroy();}
});

test('Rechecks hold early active events, preserve mute, and ignore replies after teardown',async()=>{
  for(const dispose of [false,true]){
    const f=fixture(),{g,context}=f,pending=[];let listener;
    const stop=observeAudioSession({addListener:async(_name,fn)=>{listener=fn;return{remove(){}};},snapshot:()=>new Promise(resolve=>pending.push(resolve))},()=>{},active=>g.setNativeAudioActive(active));
    g.recheckNativeAudio=stop.recheck;
    try{
      await settle();pending.shift()({activity:{sequence:1,allowed:true}});await settle();
      g.sound=false;context.state='interrupted';context.dispatchEvent(new Event('statechange'));await settle();
      listener({sequence:2,activity:{sequence:2,allowed:true}});assert.equal(g.nativeAudioActive,false);
      if(dispose)stop();pending.shift()({activity:{sequence:2,allowed:true}});await settle();
      assert.equal(f.resumes,0);assert.equal(g.sound,false);assert.equal(g.nativeAudioActive,!dispose);
    }finally{stop();f.destroy();}
  }
});

test('A failed interruption check stays closed and retries when the page returns',async()=>{
  const doc=Object.assign(new EventTarget(),{hidden:false}),states=[],pending=[];
  const stop=observeAudioSession({addListener:async()=>({remove(){}}),snapshot:()=>new Promise((resolve,reject)=>pending.push({resolve,reject}))},()=>{},active=>states.push(active),doc);
  await settle();pending.shift().resolve({activity:{sequence:1,allowed:true}});await settle();
  stop.recheck();await settle();pending.shift().reject(Error('bridge'));await settle();assert.equal(states.at(-1),false);
  doc.dispatchEvent(new Event('visibilitychange'));await settle();
  pending.shift().resolve({activity:{sequence:1,allowed:true}});await settle();assert.equal(states.at(-1),true);stop();
});

test('A transient initial snapshot failure does not disable rechecks once live native activity is available',async()=>{
  const doc=Object.assign(new EventTarget(),{hidden:false}),states=[];let listener,calls=0;
  const stop=observeAudioSession({addListener:async(_name,fn)=>{listener=fn;return{remove(){}};},
    snapshot:async()=>{if(++calls===1)throw Error('transient');return{activity:{sequence:1,allowed:false}};}},()=>{},active=>states.push(active),doc);
  await settle();assert.equal(states.at(-1),true);
  listener({sequence:1,activity:{sequence:1,allowed:false}});
  assert.equal(stop.recheck(),true);await settle();assert.equal(calls,2);assert.equal(states.at(-1),false);stop();
});

test('Native active before visibility waits for the page; muted foreground never starts audio',async()=>{
  for(const muted of [false,true]){
    const f=fixture(),{g,context}=f;
    try{
      await settle();g.sound=!muted;g.setNativeAudioActive(false);document.hidden=true;context.state='interrupted';
      g.setNativeAudioActive(true);assert.equal(f.resumes,0);
      document.hidden=false;document.dispatchEvent(new Event('visibilitychange'));await settle();
      assert.equal(f.resumes,muted?0:1);assert.equal(g.sound,!muted);assert.equal(g.paused,true);
      assert.ok(f.media.every(a=>a.paused));
    }finally{f.destroy();}
  }
});

test('A native pause during an in-flight recovery keeps music blocked after the promise completes',async()=>{
  const f=fixture(),{g,context}=f;
  try{
    await settle();g.setNativeAudioActive(false);context.state='interrupted';
    g.setNativeAudioActive(true);g.setNativeAudioActive(false);await settle();
    assert.equal(g.nativeAudioActive,false);assert.equal(g.audioFocus,false);assert.equal(g.music.active,false);
    assert.ok(f.media.every(a=>a.paused));assert.equal(f.resumes,1);
  }finally{f.destroy();}
});

test('Delayed snapshots and historical events cannot override newer native activity',async()=>{
  const doc=Object.assign(new EventTarget(),{hidden:false}),states=[],logs=[],pending=[];let listener;
  const plugin={addListener:async(_name,fn)=>{listener=fn;return{remove(){}};},snapshot:()=>new Promise(resolve=>pending.push(resolve))};
  const stop=observeAudioSession(plugin,(...x)=>logs.push(x),x=>states.push(x),doc);
  await settle();
  listener({sequence:8,activity:{sequence:8,allowed:false}});
  pending.shift()({activity:{sequence:5,allowed:true},events:[{sequence:4,activity:{sequence:4,allowed:true}}]});await settle();
  assert.deepEqual(states,[false,false]);
  listener({sequence:9,activity:{sequence:9,allowed:true}});
  listener({sequence:8,activity:{sequence:8,allowed:false}});
  doc.dispatchEvent(new Event('visibilitychange'));
  pending.shift()({activity:{sequence:9,allowed:true},events:[{sequence:6,activity:{sequence:6,allowed:false}}]});await settle();
  assert.deepEqual(states,[false,false,true]);assert.ok(logs.some(x=>x[0]==='native-event'&&x[1].sequence===6));
  stop();listener({sequence:10,activity:{sequence:10,allowed:false}});assert.deepEqual(states,[false,false,true]);
});

test('Unavailable native plugin falls back to web lifecycle, and disposed replies cannot reactivate audio',async()=>{
  const doc=Object.assign(new EventTarget(),{hidden:false}),states=[];
  let resolve,removed=0;
  const stop=observeAudioSession({addListener:async()=>({remove(){removed++;}}),snapshot:()=>new Promise(r=>resolve=r)},()=>{},x=>states.push(x),doc);
  await settle();stop();resolve({activity:{sequence:1,allowed:true}});await settle();assert.deepEqual(states,[false]);assert.equal(removed,1);
  const stopFallback=observeAudioSession({addListener:async()=>{throw Error('missing');},snapshot:async()=>{throw Error('missing');}},()=>{},x=>states.push(x),doc);
  await settle();assert.deepEqual(states,[false,false,true]);stopFallback();
});

test('A failed event subscription never latches a snapshot permission with no live way to release it',async()=>{
  const doc=Object.assign(new EventTarget(),{hidden:false}),states=[];
  const stop=observeAudioSession({addListener:async()=>{throw Error('listener unavailable');},
    snapshot:async()=>({activity:{sequence:4,allowed:false},events:[]})},()=>{},active=>states.push(active),doc);
  await settle();assert.equal(states.at(-1),true);stop();
});
