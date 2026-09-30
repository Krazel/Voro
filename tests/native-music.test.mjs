import test from 'node:test';
import assert from 'node:assert/strict';
import {NativeMusicPlayer} from '../app/native-music.mjs';
const settle=()=>new Promise(setImmediate);
function fixture(){
  const commands=[],pending=[];let listener,removed=0;
  const bridge={addListener:async(_event,fn)=>{listener=fn;return{remove(){removed++;}};},
    setState:state=>{commands.push(state);return new Promise(resolve=>pending.push(resolve));}};
  const music=new NativeMusicPlayer(null,{bridge});
  return {music,commands,pending,event:state=>listener(state),get removed(){return removed;}};
}
test('native music sends state changes only, preserves level and immediately pauses on focus loss',async()=>{
  const f=fixture(),m=f.music;m.setState('micro',true);m.unlock();
  for(let i=0;i<100;i++){m.setState('micro',true);m.tick();m.unlock();}
  assert.equal(f.commands.length,1);assert.equal(f.commands[0].volume,.42);assert.deepEqual(m.decks,[]);
  m.setState('micro',true,false,.45,.3);assert.equal(f.commands.at(-1).volume,.126);
  m.setState('micro',false,true);assert.equal(f.commands.at(-1).active,false);assert.equal(f.commands.at(-1).immediate,true);
  m.setState('pond',false,true);assert.equal(f.commands.at(-1).track,'pond');
  m.setState('pond',true);assert.equal(f.commands.at(-1).track,'pond');
  m.destroy();await settle();assert.equal(f.removed,1);assert.equal(f.commands.at(-1).active,false);
});
test('old native replies cannot replace newer playback diagnostics or revive a disposed player',async()=>{
  const f=fixture();f.music.setState('menu',true);f.music.setState('micro',true);
  f.pending[1]({revision:2,track:'micro',playing:true});await settle();
  f.pending[0]({revision:1,track:'menu',playing:true});await settle();assert.equal(f.music.stats().track,'micro');
  f.music.destroy();f.event({revision:3,track:'menu',playing:true});assert.equal(f.music.stats().track,'micro');
});
