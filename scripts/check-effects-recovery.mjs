import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const evidence=process.env.VORO_AUDIO_EVIDENCE || 'design/effects-recovery-2026-09-22';
await mkdir(evidence,{recursive:true});
try{
  const page=await browser.newPage({locale:'es-ES'});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:5206/',{waitUntil:'networkidle'});
  await page.evaluate(async()=>{
    const moduleURL=performance.getEntriesByType('resource').map(e=>e.name).find(url=>url.includes('/app/engine.ts'));
    if(!moduleURL)throw new Error('Engine module not found');
    const {VoroEngine}=await import(moduleURL);
    const init=VoroEngine.prototype.initAudio;
    VoroEngine.prototype.initAudio=function(){window.audioAuditGame=this;return init.call(this);};
  });
  await page.getByRole('button',{name:'Despertar',exact:true}).click();
  try {await page.waitForFunction(()=>window.audioAuditGame?.audio?.state==='running');}
  catch(error){console.log(await page.evaluate(()=>({captured:!!window.audioAuditGame,state:window.audioAuditGame?.audio?.state,started:window.audioAuditGame?.audioStarted})),errors);throw error;}
  await page.waitForTimeout(3000);
  const results=await page.evaluate(async()=>{
    const g=window.audioAuditGame;g.birth=0;
    const analyser=g.audio.createAnalyser();analyser.fftSize=1024;g.master.connect(analyser);
    const silent=g.audio.createGain();silent.gain.value=0;analyser.connect(silent);silent.connect(g.audio.destination);
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    async function rms(ms=320){let peak=0;const data=new Float32Array(1024),end=performance.now()+ms;while(performance.now()<end){analyser.getFloatTimeDomainData(data);peak=Math.max(peak,Math.sqrt(data.reduce((s,v)=>s+v*v,0)/data.length));await sleep(10);}return peak;}
    await g.sfx.unlock();
    g.slurp();const bite=await rms();
    g.settingsOpen=true;g.setAudio();await sleep(350);const menuGain=g.master.gain.value;
    const menuTarget=g.effectsGainTarget;const menuSignal=await rms(120);
    g.settingsOpen=false;await sleep(200);g.slurp();const afterMenu=await rms();
    await g.audio.suspend();await sleep(1300);const recovered=g.audio.state;
    g.slurp();const afterInterruption=await rms();
    g.life.invulnerable=0;const damageBefore=g.sfx.stats().damagePlayed;
    g.receiveHit({x:g.life.x+50,y:g.life.y},.05,.01);const damage=await rms();
    const damageCount=g.sfx.stats().damagePlayed-damageBefore;
    g.sound=false;g.setAudio();await sleep(350);
    const beforeMute=g.sfx.stats();g.slurp();g.impact();const muted=await rms();const afterMute=g.sfx.stats();
    g.sound=true;g.setAudio();await sleep(200);g.slurp();const unmuted=await rms();
    analyser.disconnect();silent.disconnect();
    return {bite,menuGain,menuTarget,menuSignal,afterMenu,recovered,afterInterruption,damage,damageCount,muted,unmuted,
      muteBlocked:beforeMute.played===afterMute.played&&beforeMute.damagePlayed===afterMute.damagePlayed,
      diagnostics:g.sfx.stats()};
  });
  console.log(JSON.stringify(results));
  for(const key of ['bite','afterMenu','afterInterruption','damage','unmuted'])assert.ok(results[key]>.00001,`${key}: ${results[key]}`);
  assert.equal(results.menuTarget,0);assert.ok(results.menuSignal<.00001);assert.ok(results.muted<.00001);
  assert.equal(results.recovered,'running');assert.equal(results.damageCount,1);assert.equal(results.muteBlocked,true);assert.deepEqual(errors,[]);
  await writeFile(`${evidence}/browser-audio.json`,JSON.stringify({results,errors,success:true},null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}
