import test from 'node:test';
import assert from 'node:assert/strict';
import { AnimationSheets } from '../app/animation-sheets.mjs';
import { FrameMonitor } from '../app/frame-monitor.mjs';
import { WorldGround } from '../app/world-ground.mjs';
import { makeEngine } from './engine-fixture.mjs';
import { retainAnimationSpecies, drawInhabitant, clearAnimationCache, animationCacheStats } from '../app/inhabitant-animation.mjs';
import { SPECIES_BY_ID } from '../app/journey-data.mjs';

function sheetsFixture(limit = 300) {
  const images = [];
  const meta = url => ({url,bytes:100,frames:24,cols:6,w:2,h:2,x:0,y:0,size:8,extent:3});
  const manifest = {'water-2':{1:meta('normal'),1.5:meta('reaction')},'water-3':{1:meta('other')}};
  const sheets = new AnimationSheets({limit,manifest,createImage:()=> {
    const i = {complete:false,naturalWidth:12,decode:()=>Promise.resolve()}; images.push(i); return i;
  }});
  sheets.setSpecies([{id:'water-2'},{id:'water-3'}]);
  return {sheets,images,manifest};
}
const c = new Proxy({globalAlpha:1,getTransform:()=>({a:1,b:0})}, {
  get:(o,k)=>k in o ? o[k] : () => {}, set:(o,k,v)=>{o[k]=v;return true;},
});

test('Sheets wait for decode, reuse normal during reaction loading, and cap concurrency/memory', async () => {
  const {sheets,images,manifest} = sheetsFixture();
  const draw = activity => sheets.draw(c,SPECIES_BY_ID['water-2'],20,1,activity);
  assert.equal(draw(1),'pending'); sheets.beginFrame();
  assert.equal(images.length,1); assert.equal(draw(1),'pending');
  images[0].onload(); await Promise.resolve();
  assert.equal(draw(1),'ready'); assert.equal(draw(1.5),'ready');
  sheets.request(manifest['water-3'][1]); sheets.beginFrame();
  assert.equal(sheets.active,2); assert.equal(sheets.bytes,300);
  images[1].onload(); images[2].onload(); await Promise.resolve();
  assert.equal(draw(1.5),'ready'); assert.equal(sheets.stats().errors,0);
  sheets.destroy(); assert.equal(sheets.bytes,0);
});

test('Cancelled decodes retain reservation until settled and failures release memory exactly once', async () => {
  const {sheets,images,manifest} = sheetsFixture(100);
  sheets.request(manifest['water-2'][1]); sheets.beginFrame();
  sheets.setSpecies([{id:'water-3'}]);
  assert.equal(sheets.bytes,100); assert.equal(sheets.request(manifest['water-3'][1]),null);
  images[0].onload(); await Promise.resolve();
  assert.equal(sheets.bytes,0); assert.equal(images[0].src,'');
  sheets.request(manifest['water-3'][1]); sheets.beginFrame();
  const fail = images[1].onerror; fail(); fail();
  assert.equal(sheets.bytes,0); assert.equal(sheets.errors,1); assert.equal(sheets.active,0);
  assert.equal(sheets.draw(c,SPECIES_BY_ID['water-3'],20,0,1),'unavailable');
  sheets.destroy(); assert.equal(sheets.bytes,0);
});

test('Offscreen queued sheets expire while visible cache entries are never evicted to thrash', () => {
  const {sheets,manifest} = sheetsFixture(100);
  sheets.request(manifest['water-2'][1]); sheets.enabled=false;
  for(let i=0;i<5;i++) sheets.beginFrame();
  assert.equal(sheets.entries.size,0); assert.equal(sheets.dropped,1);
  const e=sheets.request(manifest['water-2'][1]); e.state='ready';
  for(let i=0;i<40;i++) {
    sheets.beginFrame(); sheets.request(manifest['water-2'][1]);
    assert.equal(sheets.request(manifest['water-3'][1]),null);
  }
  for(let i=0;i<31;i++) sheets.beginFrame();
  assert.ok(sheets.request(manifest['water-3'][1])); assert.equal(sheets.bytes,100);
  sheets.destroy();
});

test('Crossfade reuses two distinct grounds and bounds retained surfaces', () => {
  const layer = new Proxy({createLinearGradient:()=>({addColorStop(){}})}, {get:(o,k)=>k in o?o[k]:()=>{},set:()=>true});
  const ground = new WorldGround(()=>({width:0,height:0,getContext:()=>layer}));
  const image={complete:true,naturalWidth:100,width:100,height:100};
  for(let i=0;i<20;i++) for(const stage of ['land','water']) ground.draw(c,image,stage,{x:i,y:i},1,850);
  assert.equal(ground.redraws,2); assert.equal(ground.views.size,2);
  const old = ground.views.get('land').surface;
  ground.draw(c,image,'city',{x:0,y:0},1,850);
  assert.equal(ground.views.size,2); assert.equal(old.width,1);
});

test('Shared species retain prepared poses across stages, unwanted ones are released', () => {
  const old=globalThis.OffscreenCanvas;
  globalThis.OffscreenCanvas=class {getContext(){return c;}};
  try {
    clearAnimationCache();
    const image={complete:true,naturalWidth:1536,naturalHeight:1024};
    drawInhabitant(c,image,SPECIES_BY_ID['water-2'],40,0,0);
    drawInhabitant(c,image,SPECIES_BY_ID['water-3'],40,0,0);
    assert.equal(animationCacheStats().entries,2);
    retainAnimationSpecies([SPECIES_BY_ID['water-2']]);
    assert.equal(animationCacheStats().entries,1);
    const hits=animationCacheStats().hits;
    drawInhabitant(c,image,SPECIES_BY_ID['water-2'],40,0,0);
    assert.equal(animationCacheStats().hits,hits+1);
  } finally {clearAnimationCache();globalThis.OffscreenCanvas=old;}
});

test('Diagnostics retain bounded samples, correct session percentiles, section means and worst frames', () => {
  const m=new FrameMonitor();
  for(let i=0;i<3601;i++) {m.beginFrame();m.frameParts.render=4;m.add(i===0?200:1000/60,5,{stage:1});}
  assert.equal(m.samples.length,3600); assert.equal(m.slowFrames,0);
  m.beginFrame();m.frameParts.render=40;m.add(100,45,{stage:2});m.event('save',12,{ok:true});
  const report=m.export({version:'test'});
  assert.equal(report.worstFrames[0].interval,100);assert.equal(report.worstFrames[0].stage,2);
  assert.equal(report.summary.slowFrames,1);assert.equal(report.summary.parts.render,4.01);
  assert.equal(report.session.p95,16.67);assert.equal(report.events[0].name,'save');
  m.reset();assert.equal(m.summary().slowFrames,0);assert.deepEqual(m.summary().parts,{});
});

test('30-second capture excludes pause/hidden time, auto-stops and freezes complete-session results', () => {
  const {game}=makeEngine();game.started=true; game.update=()=>{};game.render=()=>{};
  game.startBenchmark();let stamp=1000;
  for(let i=0;i<11;i++) game.frame(stamp+=100);
  assert.equal(game.frameMonitor.totalFrames,10);
  game.paused=true;game.frame(stamp+=10000);game.paused=false;game.frame(stamp+=100);
  assert.equal(game.frameMonitor.totalFrames,10);
  document.hidden=true;game.frame(stamp+=5000);document.hidden=false;game.frame(stamp+=100);
  assert.equal(game.frameMonitor.totalFrames,10);
  for(let i=0;i<310;i++) game.frame(stamp+=100);
  assert.equal(game.diagnosticsEnabled,false);assert.equal(game.diagnosticCompleted,true);
  assert.equal(game.frameMonitor.elapsed,30000);assert.equal(game.frameMonitor.totalFrames,300);
  assert.equal(game.performanceReport().summary.fps,10);
  game.destroy();
});

test('Autosaves coalesce, flush latest state and a checkpoint cancels the deferred write', () => {
  const oldRequest=window.requestIdleCallback,oldCancel=window.cancelIdleCallback,oldStorage=globalThis.localStorage;
  let callback,writes=0,cancels=0;
  window.requestIdleCallback=(fn,options)=>{callback=fn;assert.equal(options.timeout,1000);return 123;};
  window.cancelIdleCallback=()=>cancels++;
  globalThis.localStorage={getItem:()=>null,setItem:()=>writes++};
  try {
    const {game}=makeEngine();game.started=true;game.setDiagnostics(true);
    game.scheduleSave();game.scheduleSave();assert.equal(writes,0);
    callback();assert.equal(writes,1);assert.equal(game.saveJob,null);
    game.scheduleSave();game.save();assert.equal(writes,2);assert.equal(cancels,1);
    assert.equal(game.frameMonitor.events.filter(e=>e.name==='save').length,2);
    game.destroy();
  } finally {window.requestIdleCallback=oldRequest;window.cancelIdleCallback=oldCancel;globalThis.localStorage=oldStorage;}
});
