import test from 'node:test';
import assert from 'node:assert/strict';
import {AudioJournal,audioSnapshot,AUDIO_JOURNAL_KEY,JOURNAL_LIMITS} from '../app/audio-journal.mjs';
import {deliverReportFile} from '../app/performance-report.mjs';
import {SfxPlayer} from '../app/sfx.mjs';
const memory=()=>{const data=new Map();return{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};

test('Automatic history preserves wall-clock interruptions even when the audio clock stops',()=>{
  let wall=1000,mono=0;const game={audio:{state:'running',currentTime:2},sound:true};
  const p=new AudioJournal({snapshot:()=>audioSnapshot(game),now:()=>wall,clock:()=>mono});
  game.audio.state='interrupted';p.event('statechange');
  wall+=9000;mono+=9000;p.sample();game.audio.state='running';p.event('statechange');
  const r=p.report('silent');assert.equal(r.current.events[0].state.context.time,2);
  assert.equal(r.current.events[1].wallMs-r.current.events[0].wallMs,9000);
  assert.equal(r.current.events[1].state.context.time,2);assert.equal(r.current.events.at(-1).detail.observation,'silent');
  assert.equal(r.current.initial.kind,'launch');assert.equal(r.current.initial.state.context.playback,null);
});
test('Bounded rolling samples keep launch and previous session after a relaunch',()=>{
  const storage=memory();let now=0;
  const a=new AudioJournal({storage,now:()=>now,clock:()=>now,metadata:{version:'test'}});
  for(let i=0;i<600;i++){now+=2000;a.sample();a.event('focus');}
  a.destroy();const stored=JSON.parse(storage.getItem(AUDIO_JOURNAL_KEY));
  assert.equal(stored.current.samples.length,JOURNAL_LIMITS.samples);assert.equal(stored.current.events.length,JOURNAL_LIMITS.events);
  assert.equal(stored.current.initial.wallMs,0);
  const b=new AudioJournal({storage,now:()=>now});const report=b.report('good');
  assert.equal(report.previous.initial.wallMs,0);assert.equal(report.previous.metadata.version,'test');
  assert.equal(report.current.events.at(-1).detail.observation,'good');
  b.destroy();const c=new AudioJournal({storage});assert.equal(c.previous.startedAt,now);assert.equal(c.previous.previous,undefined);
});
test('Read errors, malformed storage and quota errors never interrupt playback/reporting',()=>{
  for(const storage of [{getItem(){throw Error('denied');},setItem(){throw Error('denied');}},
    {getItem(){return '{bad json';},setItem(){throw Error('quota');}}]){
    const p=new AudioJournal({storage});p.sample();const r=p.report();
    assert.equal(r.storage,'write-error');assert.equal(r.previous,null);assert.doesNotThrow(()=>p.destroy());
  }
});
test('Snapshots expose audibility gates and paused decks without calling playback methods',()=>{
  let calls=0;const game={sound:false,audioFocus:false,paused:true,settingsOpen:true,reviewHold:true,
    audio:{state:'suspended',currentTime:4,resume(){calls++;}},audioStarted:true,
    music:{active:false,blocked:true,bus:{gain:{value:0}},decks:[{id:'micro',audio:{paused:true,currentTime:5,play(){calls++;}},gain:{gain:{value:0}}}]}};
  const s=audioSnapshot(game);assert.equal(calls,0);assert.equal(s.gates.sound,false);assert.equal(s.gates.paused,true);
  assert.equal(s.music.decks[0].paused,true);assert.equal(s.context.state,'suspended');
});
test('Media/context listeners record and detach; destroyed journals stop receiving data',()=>{
  const c=Object.assign(new EventTarget(),{state:'running'}),a=Object.assign(new EventTarget(),{error:null});
  const p=new AudioJournal();p.attach(c,[{id:'micro',audio:a}]);
  a.dispatchEvent(new Event('waiting'));c.state='interrupted';c.dispatchEvent(new Event('statechange'));
  assert.equal(p.current.events.at(-1).detail.state,'interrupted');p.destroy();const count=p.current.events.length;
  a.dispatchEvent(new Event('waiting'));p.sample();p.event('ignored');assert.equal(p.current.events.length,count);
});
test('Saving is periodic, not on every sample, and exports are immutable snapshots',()=>{
  let wall=0,writes=0;const storage={getItem:()=>null,setItem(){writes++;}};
  const p=new AudioJournal({storage,now:()=>wall});
  for(let i=0;i<14;i++){wall+=2000;p.sample();}assert.equal(writes,0);
  wall=30000;p.sample();assert.equal(writes,1);const r=p.report('crackle');
  p.event('later');assert.equal(r.current.events.at(-1).kind,'export');assert.equal(writes,2);
});
test('The native sharing adapter receives the complete automatic journal as a separate file',async()=>{
  const p=new AudioJournal();const data=JSON.stringify(p.report('good'));let filename,body,uri;
  const status=await deliverReportFile(data,{native:true,write:async(name,text)=>{filename=name;body=text;return{uri:'cache://report'};},shareNative:async value=>{uri=value;}});
  assert.equal(filename,'Voro-diagnostico-audio.txt');assert.equal(body,data);assert.equal(uri,'cache://report');assert.equal(status,'prepared');
});
test('Resume outcomes are observable and a broken diagnostic callback does not change resume',async()=>{
  let resumes=0;const events=[],context={state:'suspended',resume(){resumes++;this.state='running';return Promise.resolve();}};
  const p=new SfxPlayer(context,{}, {onDiagnostic:(kind,detail)=>{events.push({kind,detail});throw Error('logger failure');}});
  p.buffers=[1,1,1,1,1];await p.unlock(true);await Promise.resolve();assert.equal(resumes,1);
  assert.deepEqual(events.map(e=>e.kind),['resume-request','resume-resolved']);assert.equal(p.diagnostics.resumeErrors,0);
});
