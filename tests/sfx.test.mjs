import test from 'node:test';
import assert from 'node:assert/strict';
import { INGEST_SOUNDS, INGEST_GAIN, SfxPlayer } from '../app/sfx.mjs';

test('iOS local media without HTTP status decodes; remote/opaque/HTTP failures stay rejected',async()=>{
  for(const [baseURL,status,type,allowed] of [
    ['capacitor://localhost/',0,'basic',true],['https://example.com/',0,'basic',false],
    ['capacitor://localhost/',0,'opaque',false],['capacitor://localhost/',404,'basic',false],
  ]) {
    let decoded=0;
    const p=new SfxPlayer({state:'running',decodeAudioData:async()=>{decoded++;return {};}},{},{
      baseURL:()=>baseURL,fetcher:async()=>({ok:false,status,type,arrayBuffer:async()=>new ArrayBuffer(44)})});
    await p.unlock();assert.equal(decoded,allowed?INGEST_SOUNDS.length:0);assert.equal(p.stats().readErrors,allowed?0:INGEST_SOUNDS.length);
    p.destroy();
  }
});

test('Sound diagnostics distinguish local read failures from unsupported/corrupt decoded data',async()=>{
  for(const phase of ['read','decode']){
    const p=new SfxPlayer({state:'running',decodeAudioData:async()=>{throw new Error('Invalid PCM');}},{},{
      baseURL:()=> 'capacitor://localhost/',fetcher:async()=>({ok:false,status:0,type:'basic',arrayBuffer:async()=>new ArrayBuffer(phase==='read'?0:44)})});
    await p.unlock();assert.equal(p.stats().lastLoadError.phase,phase);
    assert.equal(p.stats().decodeErrors,phase==='decode'?INGEST_SOUNDS.length:0);assert.equal(p.stats().loadErrors,INGEST_SOUNDS.length);p.destroy();
  }
});

test('Approved ingest variants decode, rate-limit and never repeat consecutively', async () => {
  let time = 1000, random = 0, starts = 0;
  const decoded = [];
  const context = {
    resume: async () => {},
    createGain: () => ({ gain: { value: 1 }, connect() {}, disconnect() {} }),
    decodeAudioData: async data => { decoded.push(data.byteLength); return { id: decoded.length }; },
    createBufferSource: () => ({
      buffer: null, playbackRate: { value: 1 },
      connect() {},
      disconnect() {},
      start() { starts++; },
    }),
  };
  const requested = [];
  const player = new SfxPlayer(context, {}, {
    fetcher: async url => { requested.push(url); return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) }; },
    random: () => random,
    now: () => time,
  });
  await player.unlock();
  assert.deepEqual(requested, INGEST_SOUNDS);
  assert.equal(player.playIngest(), true);
  assert.equal(player.last, 0);
  time += 100;
  assert.equal(player.playIngest(), false);
  time += 300; random = 0;
  assert.equal(player.playIngest(), true);
  assert.equal(player.last, 1);
  assert.equal(starts, 2);
  player.destroy();
  time += 400;
  assert.equal(player.playIngest(), false);
});

test('Digest completion no longer calls the legacy chime', async () => {
  const source = await import('node:fs/promises').then(fs => fs.readFile(new URL('../app/engine.ts', import.meta.url), 'utf8'));
  const finished = source.slice(source.indexOf('if (finished) {'), source.indexOf('if (p.eaten === 1)'));
  assert.doesNotMatch(finished, /this\.chime\(\)/);
});

test('Ingest pitch varies over a broad range and changes the full sample duration', () => {
  const sources = [];
  let time = 0, roll = 0;
  const player = new SfxPlayer({ createGain: () => ({ gain: { value: 1 }, connect() {}, disconnect() {} }), createBufferSource() {
    const source = { playbackRate: { value: 1 }, connect() {}, disconnect() {}, start() {} };
    sources.push(source); return source;
  } }, {}, { now: () => time, random: () => roll });
  player.buffers = [{ duration: 1 }, { duration: 1 }, { duration: 1 }];
  player.playIngest();
  time += 400; roll = .999999;
  player.playIngest();
  assert.ok(sources[0].playbackRate.value < .75);
  assert.ok(sources[1].playbackRate.value > 1.4);
  for (const source of sources) {
    const duration = source.buffer.duration / source.playbackRate.value;
    assert.ok(duration > .62 && duration < 1.50);
  }
});

test('A failed variant does not silence decoded bites and retries only the missing sample on a later gesture', async () => {
  let time=0, fail=true;const requests=[];
  const context={state:'running',decodeAudioData:async()=>({duration:.5}),
    createGain:()=>({gain:{value:0},connect(){},disconnect(){}}),
    createBufferSource:()=>({playbackRate:{value:1},connect(){},disconnect(){},start(){},stop(){}})};
  const player=new SfxPlayer(context,{}, {now:()=>time,random:()=>0,fetcher:async url=>{
    requests.push(url);return {ok:!(fail&&url===INGEST_SOUNDS[0]),status:503,arrayBuffer:async()=>new ArrayBuffer(8)};
  }});
  await player.unlock();assert.equal(player.stats().decoded,INGEST_SOUNDS.length-1);assert.equal(player.stats().loadErrors,1);
  assert.equal(player.playIngest(),true);
  await player.unlock();assert.equal(requests.length,INGEST_SOUNDS.length);
  time=5001;fail=false;await player.unlock();
  assert.equal(requests.length,INGEST_SOUNDS.length+1);assert.equal(requests[INGEST_SOUNDS.length],INGEST_SOUNDS[0]);assert.equal(player.stats().decoded,INGEST_SOUNDS.length);
  await player.unlock();assert.equal(requests.length,INGEST_SOUNDS.length+1);player.destroy();
});

test('Interrupted iOS audio is counted and never queues stale bites until a gesture resumes it', async () => {
  let resumes=0,starts=0;
  const context={state:'interrupted',resume:async()=>{resumes++;context.state='running';},
    createGain:()=>({gain:{value:0},connect(){},disconnect(){}}),
    createBufferSource:()=>({playbackRate:{value:1},connect(){},disconnect(){},start(){starts++;},stop(){}})};
  const player=new SfxPlayer(context,{});player.buffers=INGEST_SOUNDS.map(()=>({}));
  assert.equal(player.playIngest(),false);assert.equal(starts,0);assert.equal(player.stats().notRunning,1);
  await player.unlock();assert.equal(resumes,1);assert.equal(player.playIngest(),true);
  await player.unlock();assert.equal(resumes,1);assert.equal(starts,1);player.destroy();
});

test('Bite gain compensates the quiet sample without pushing the shared master near clipping', () => {
  assert.ok(INGEST_GAIN*.055>.1);assert.ok(INGEST_GAIN*.055<.15);
});

test('Pitch-shifted bites fade at both sample boundaries without affecting the wall-clock rate limit', () => {
  let time=1000,source;const envelope=[];
  const player=new SfxPlayer({currentTime:20,state:'running',
    createGain:()=>({gain:{value:0,setValueAtTime:(v,t)=>envelope.push([v,t]),linearRampToValueAtTime:(v,t)=>envelope.push([v,t])},connect(){},disconnect(){}}),
    createBufferSource:()=>source={playbackRate:{value:1},connect(){},disconnect(){},start(){}}
  },{}, {now:()=>time,random:()=>0});
  player.buffers=[{duration:.5}];assert.equal(player.playIngest(),true);
  const end=20+.5/source.playbackRate.value;
  const expected=[[0,20],[INGEST_GAIN,20.006],[INGEST_GAIN,end-.02],[0,end]];
  assert.equal(envelope.length,4);
  envelope.forEach(([gain,at],i)=>{assert.equal(gain,expected[i][0]);assert.ok(Math.abs(at-expected[i][1])<1e-9);});
  time+=100;assert.equal(player.playIngest(),false);
  time+=300;assert.equal(player.playIngest(),true);
});

test('Repeated recovery attempts are bounded, recover without mute toggles and do not replay stale effects',async()=>{
  let time=0,resumes=0,resolve;
  const context={state:'interrupted',resume:()=>{resumes++;return new Promise(r=>resolve=r);}};
  const p=new SfxPlayer(context,{}, {now:()=>time});p.buffers=[{},{},{}];
  await p.unlock();await p.unlock();assert.equal(resumes,1);
  assert.equal(p.playIngest(),false);assert.equal(p.stats().played,0);
  resolve();await new Promise(r=>setImmediate(r));
  time=500;await p.unlock();assert.equal(resumes,1);
  time=1001;await p.unlock();assert.equal(resumes,2);
  context.state='running';resolve();await new Promise(r=>setImmediate(r));
  await p.unlock();assert.equal(resumes,2);assert.equal(p.stats().played,0);p.destroy();
});

test('Random rounds cover every distinct gesture and do not repeat at round boundaries', () => {
  let time=0, seed=17;
  const sources=[];
  const player=new SfxPlayer({state:'running',
    createGain:()=>({gain:{value:0},connect(){},disconnect(){}}),
    createBufferSource:()=>{const source={playbackRate:{value:1},connect(){},disconnect(){},start(){},stop(){}};sources.push(source);return source;}
  },{}, {now:()=>time,random:()=>((seed=(seed*1664525+1013904223)>>>0)/2**32)});
  player.buffers=INGEST_SOUNDS.map((_,id)=>({id,duration:.5}));
  for(let i=0;i<100;i++){time+=400;assert.equal(player.playIngest(),true);}
  const ids=sources.map(s=>s.buffer.id);
  for(let i=0;i<ids.length;i+=INGEST_SOUNDS.length)
    assert.equal(new Set(ids.slice(i,i+INGEST_SOUNDS.length)).size,INGEST_SOUNDS.length);
  for(let i=1;i<ids.length;i++)assert.notEqual(ids[i],ids[i-1]);
  for(const id of new Set(ids))assert.ok(new Set(sources.filter(s=>s.buffer.id===id).map(s=>s.playbackRate.value)).size>1);
  player.destroy();
});
