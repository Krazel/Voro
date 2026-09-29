import test from 'node:test';
import assert from 'node:assert/strict';
import { audioPlaybackStats, EFFECT_LEAD_SECONDS } from '../app/audio-health.mjs';
import { SfxPlayer } from '../app/sfx.mjs';
import { MusicPlayer } from '../app/music.mjs';

test('Unavailable audio metrics stay unknown; supported underruns retain their real values',()=>{
  assert.equal(audioPlaybackStats(null),null);
  assert.equal(audioPlaybackStats({sampleRate:48000}).playback,null);
  assert.equal(audioPlaybackStats({sampleRate:48000}).outputLatency,null);
  const result=audioPlaybackStats({playbackStats:{underrunEvents:3,underrunDuration:.05,totalDuration:30}});
  assert.equal(result.playback.underrunEvents,3);assert.equal(result.playback.underrunDuration,.05);
  assert.equal(result.playback.averageLatency,null);
  assert.equal(audioPlaybackStats({get playbackStats(){throw new Error('unsupported')}}).playback,null);
});

test('A bite and its fade start on the same future audio-clock boundary',()=>{
  let start;const envelope=[];
  const c={state:'running',currentTime:12,
    createGain:()=>({gain:{value:0,setValueAtTime:(v,t)=>envelope.push([v,t]),linearRampToValueAtTime:(v,t)=>envelope.push([v,t])},connect(){},disconnect(){}}),
    createBufferSource:()=>({playbackRate:{value:1},connect(){},disconnect(){},start(t){start=t},stop(){}})};
  const p=new SfxPlayer(c,{});p.buffers=[{duration:.5}];p.playIngest();
  assert.equal(start,12+EFFECT_LEAD_SECONDS);assert.deepEqual(envelope[0],[0,start]);
  assert.ok(envelope.at(-1)[1]>start);p.destroy();
});

test('Music interruption evidence is bounded and event listeners are removed on destruction',()=>{
  const c=new EventTarget();Object.assign(c,{currentTime:5,state:'running',destination:{},
    createGain:()=>({gain:{value:0},connect(){},disconnect(){}}),createMediaElementSource:()=>({connect(){},disconnect(){}})});
  const media=[];const p=new MusicPlayer(c,{schedule:()=>0,cancel(){},createAudio(){const a=new EventTarget();Object.assign(a,{currentTime:20,src:'solace.mp3',readyState:3,setAttribute(){},pause(){},removeAttribute(){},load(){}});media.push(a);return a;}});
  for(let i=0;i<40;i++)media[0].dispatchEvent(new Event('waiting'));
  c.state='interrupted';c.dispatchEvent(new Event('statechange'));
  assert.equal(p.stats().waiting,40);assert.equal(p.stats().events.length,24);
  assert.equal(p.stats().events.at(-1).detail,'interrupted');
  p.destroy();media[0].dispatchEvent(new Event('waiting'));assert.equal(p.stats().waiting,40);
});
