import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const out='design/audio-recovery-0.13.1';await mkdir(out,{recursive:true});
try{
  const page=await browser.newPage({viewport:{width:390,height:844},locale:'es-ES'}),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:5240/?ui=final&lab=cosmos');
  await page.waitForFunction(()=>window.__voroLab);
  await page.evaluate(()=>{const g=window.__voroLab;g.startTest(0,20,false,true,false);g.publish();});
  await page.getByRole('button',{name:/Ocultar pruebas|Hide tests/}).click();
  await page.waitForFunction(()=>{const p=window.__voroLab.music;return p?.unlocked&&p.recovery===null&&p.output.gain.value>.99;},null,{timeout:20000});
  const initial=await page.evaluate(()=>{
    const g=window.__voroLab;return{version:g.audioJournal.current.metadata.version,music:g.music.stats(),events:g.audioJournal.current.events.filter(e=>e.kind.startsWith('stream-recovery'))};
  });
  assert.equal(initial.version,'0.13.1');assert.equal(initial.music.current,'micro');
  assert.deepEqual(initial.events.map(e=>e.kind),['stream-recovery-pause','stream-recovery-resume','stream-recovery-ready']);
  assert.ok(initial.events.every(e=>e.detail.track==='micro'));
  // Exercise native-gate integration with an actual media decoder and context.
  await page.evaluate(async()=>{const g=window.__voroLab;g.setNativeAudioActive(false);await g.audio.suspend();});
  const hidden=await page.evaluate(()=>{const g=window.__voroLab;return {gain:g.music.output.gain.value,paused:g.music.decks.every(d=>d.audio.paused)};});
  assert.deepEqual(hidden,{gain:0,paused:true});
  await page.evaluate(()=>{const g=window.__voroLab;g.setNativeAudioActive(true);});
  await page.waitForFunction(()=>window.__voroLab.audio.state==='running');
  assert.equal(await page.evaluate(()=>window.__voroLab.music.decks.every(d=>d.audio.paused)),true);
  await page.evaluate(()=>{const g=window.__voroLab;g.action('pause');});
  await page.waitForFunction(()=>window.__voroLab.music.recovery===null&&window.__voroLab.music.output.gain.value>.99,null,{timeout:20000});
  const recovered=await page.evaluate(()=>{
    const g=window.__voroLab;return{music:g.music.stats(),events:g.audioJournal.current.events.filter(e=>e.kind.startsWith('stream-recovery'))};
  });
  assert.equal(recovered.events.filter(e=>e.kind==='stream-recovery-ready').length,2);
  assert.equal(recovered.music.current,'micro');
  await page.evaluate(()=>{const g=window.__voroLab;g.sound=false;g.setAudio();});
  await page.waitForFunction(()=>window.__voroLab.music.decks.every(d=>d.audio.paused));
  assert.equal(await page.evaluate(()=>window.__voroLab.music.bus.gain.value),0);
  assert.deepEqual(errors,[]);
  const result={browser:'Edge Windows',realMediaAndAudioContext:true,physicalIOS:false,acousticCrackleNotMeasured:true,initial,hidden,recovered,errors};
  await writeFile(out+'/browser-check.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify({initialRecovery:initial.events.length,foregroundRecovery:recovered.events.length,muted:true,errors}));
}finally{await browser.close();}
