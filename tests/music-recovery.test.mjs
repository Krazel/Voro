import test from 'node:test';
import assert from 'node:assert/strict';
import {MusicPlayer} from '../app/music.mjs';

const settle=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(){
  const events=[],media=[];
  const param=()=>({value:0,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;}});
  const c=Object.assign(new EventTarget(),{state:'suspended',currentTime:0,destination:{},
    createGain:()=>({gain:param(),connect(){},disconnect(){}}),createMediaElementSource:()=>({connect(){},disconnect(){}})});
  const p=new MusicPlayer(c,{stabilizePlayback:true,ownsContextResume:false,schedule:()=>1,cancel(){},onDiagnostic:(kind,detail)=>events.push({kind,...detail}),
    createAudio:()=>{const a={paused:true,currentTime:0,duration:300,readyState:4,plays:0,pauses:0,
      setAttribute(){},removeAttribute(){},load(){},pause(){this.paused=true;this.pauses++;},
      play(){this.paused=false;this.plays++;return Promise.resolve();}};media.push(a);return a;}});
  const state=s=>{c.state=s;c.dispatchEvent(new Event('statechange'));};
  const step=async(seconds=.2)=>{c.currentTime+=seconds;for(const a of media)if(!a.paused&&c.state==='running')a.currentTime+=seconds;p.tick();await settle();};
  const start=async()=>{p.setState('micro',true);p.unlock();await settle();state('running');await step();await step();};
  return {p,c,media,events,state,step,start};
}

test('Cold start stays muted until real stream progress, pause and confirmed resume; position is preserved',async()=>{
  const f=fixture(),{p,c,media}=f;
  try{
    p.setState('micro',true);assert.ok(media.every(a=>a.paused));p.unlock();await settle();
    await f.step();assert.equal(p.output.gain.value,0);assert.equal(p.recovery.phase,'warmup');
    f.state('running');p.tick();await f.step();
    assert.equal(p.recovery.phase,'paused');assert.ok(media.every(a=>a.paused));assert.equal(p.output.gain.value,0);
    const pos=p.current.audio.currentTime;const play=p.current.audio.play;let resolve;
    p.current.audio.play=function(){this.paused=false;this.plays++;return new Promise(r=>resolve=r);};
    await f.step();assert.equal(p.recovery.phase,'resuming');assert.equal(p.output.gain.value,0);assert.equal(p.current.audio.currentTime,pos);
    resolve();await settle();assert.equal(p.recovery,null);assert.equal(p.output.gain.value,1);assert.equal(p.bus.gain.value,.42);
    p.current.audio.play=play;
    const plays=media.reduce((n,a)=>n+a.plays,0);
    for(let i=0;i<40;i++){p.unlock();p.setState('micro',true);await f.step();}
    assert.equal(media.reduce((n,a)=>n+a.plays,0),plays,'No repeated recovery while playing');
    assert.equal(f.events.filter(e=>e.kind==='stream-recovery-ready').length,1);
    assert.ok(c.currentTime>0);
  }finally{p.destroy();}
});

test('Selecting Continue during startup exposes only the selected biome, with no audible menu crossfade',async()=>{
  const f=fixture(),{p}=f;
  try{
    p.setState('menu',true);p.unlock();p.setState('micro',true);await settle();f.state('running');
    await f.step();await f.step();assert.equal(p.current.id,'micro');assert.equal(p.output.gain.value,0);assert.equal(p.transition,null);
    await f.step();assert.equal(p.output.gain.value,1);
    const other=p.decks.find(d=>d!==p.current);assert.equal(other.audio.paused,true);assert.equal(other.gain.gain.value,0);
  }finally{p.destroy();}
});

test('Foreground recovery runs once after native permission; ordinary pause and ducking do not repeat it',async()=>{
  const f=fixture(),{p,media}=f;
  try{
    await f.start();await f.step();assert.equal(p.recovery,null);
    p.setState('micro',false,true);f.state('interrupted');const plays=media.reduce((n,a)=>n+a.plays,0);
    await f.step();await f.step();assert.equal(media.reduce((n,a)=>n+a.plays,0),plays);assert.equal(p.output.gain.value,0);
    f.state('running');p.setState('micro',true);await settle();await f.step();await f.step();await f.step();
    assert.equal(p.recovery,null);assert.equal(f.events.filter(e=>e.kind==='stream-recovery-ready').length,2);
    p.setState('micro',true,false,.45,.3);assert.equal(p.bus.gain.value,.126);assert.equal(p.recovery,null);
    p.setState('micro',false);await f.step();p.setState('micro',true);await settle();assert.equal(p.recovery,null);
  }finally{p.destroy();}
});

test('Mute, background and destruction cancel the recovery pause without a delayed restart',async()=>{
  for(const action of ['mute','background','destroy']){
    const f=fixture(),{p,media}=f;await f.start();assert.equal(p.recovery.phase,'paused');
    const plays=media.reduce((n,a)=>n+a.plays,0);
    if(action==='destroy')p.destroy();else p.setState('micro',false,action==='background');
    for(let i=0;i<5;i++)await f.step();
    assert.equal(media.reduce((n,a)=>n+a.plays,0),plays,action);assert.ok(media.every(a=>a.paused),action);
    if(action!=='destroy')p.destroy();
  }
});

test('Late recovery completion cannot unmute after cancellation or a newer scene request',async()=>{
  const f=fixture(),{p}=f;try{
    await f.start();let resolve;
    p.current.audio.play=function(){this.paused=false;return new Promise(r=>resolve=r);};
    await f.step();assert.equal(p.recovery.phase,'resuming');
    p.setState('water',true);await settle();resolve();await settle();
    assert.equal(p.output.gain.value,0);assert.equal(p.recovery.phase,'warmup');assert.equal(p.current.id,'water');
    await f.step();await f.step();await f.step();assert.equal(p.output.gain.value,1);assert.equal(p.current.id,'water');
  }finally{p.destroy();}
});

test('Rejected or stuck recovery stays muted and waits for a fresh gesture; stale success cannot open output',async()=>{
  for(const timeout of [false,true]){
    const f=fixture(),{p}=f;try{
      await f.start();const a=p.current.audio,original=a.play;let resolve;
      a.play=function(){this.paused=false;return timeout?new Promise(r=>resolve=r):Promise.reject(Object.assign(new Error('blocked'),{name:'NotAllowedError'}));};
      await f.step();if(timeout)await f.step(9);
      assert.equal(p.blocked,true);assert.equal(p.output.gain.value,0);
      if(resolve){resolve();await settle();assert.equal(p.output.gain.value,0);}
      a.play=original;p.unlock();await settle();await f.step();await f.step();await f.step();
      assert.equal(p.blocked,false);assert.equal(p.recovery,null);assert.equal(p.output.gain.value,1);
    }finally{p.destroy();}
  }
});

test('A transition to another scene during the quiet pause cancels recovery of the old song',async()=>{
  const f=fixture(),{p}=f;try{
    await f.start();const old=p.current;p.setState('water',true);await settle();
    await f.step();await f.step();await f.step();
    assert.equal(p.current.id,'water');assert.equal(old.audio.paused,true);assert.equal(p.output.gain.value,1);
    assert.equal(f.events.filter(e=>e.kind==='stream-recovery-ready'&&e.track==='micro').length,0);
  }finally{p.destroy();}
});
