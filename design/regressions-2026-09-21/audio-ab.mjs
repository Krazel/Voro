import {chromium} from 'file:///C:/Users/dmkra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try {for(const mode of ['silent','music','sfx','both']) {
 const context=await browser.newContext({viewport:{width:390,height:844},locale:'en-US'});
 const p=await context.newPage();
 await p.addInitScript(()=>{
  window.audioCounts={play:0,resume:0,decode:0,sources:0,gains:0};
  for(const [proto,key,count] of [[HTMLMediaElement.prototype,'play','play'],[AudioContext.prototype,'resume','resume'],[AudioContext.prototype,'decodeAudioData','decode'],[AudioContext.prototype,'createBufferSource','sources'],[AudioContext.prototype,'createGain','gains']]) {
   const old=proto[key];proto[key]=function(...args){window.audioCounts[count]++;return old.apply(this,args);};
  }
 });
 await p.route('**/*engine.ts*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('this.registerTools();','window.__qaEngine=this; this.registerTools();')});});
 await p.goto('http://127.0.0.1:5196/');await p.waitForFunction(()=>window.__qaEngine?.assetsReady);
 await p.getByRole('button',{name:'Awaken',exact:true}).click();
 await p.evaluate(mode=>{
  const e=window.__qaEngine;e.startTest(0,20,false,true,false);e.sound=mode!=='silent';e.initAudio();
  if(mode==='silent'||mode==='sfx'){e.music.destroy();e.music=null;}
  if(mode==='silent'||mode==='music'){e.sfx.destroy();e.sfx=null;}
  e.setAudio();e.music?.unlock();
  window.bite=setInterval(()=>e.sfx?.playIngest(),350);
 },mode);
 await p.waitForTimeout(2000);
 await p.evaluate(()=>{window.intervals=[];let last=performance.now();window.frame=requestAnimationFrame(function tick(now){window.intervals.push(now-last);last=now;window.frame=requestAnimationFrame(tick);});window.initialCounts={...window.audioCounts};});
 // Identical repeated movement input exercises the actual global gesture handler.
 for(let i=0;i<30;i++){await p.keyboard.press(i%2?'ArrowLeft':'ArrowRight');await p.waitForTimeout(150);}
 results.push(await p.evaluate(mode=>{clearInterval(window.bite);cancelAnimationFrame(window.frame);const a=window.intervals.sort((a,b)=>a-b);return {mode,frames:a.length,p50:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],over33:a.filter(x=>x>33.4).length,counts:window.audioCounts,initial:window.initialCounts,context:__qaEngine.audio?.state,decks:__qaEngine.music?.decks.map(d=>({paused:d.audio.paused,time:d.audio.currentTime}))};},mode));
 await context.close();
}}finally{await browser.close();}
const output=process.argv[2]||'before';fs.writeFileSync(`design/regressions-2026-09-21/audio-${output}.json`,JSON.stringify(results,null,2));console.log(results);
