import {createRequire} from 'node:module';import {mkdir,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
import {newJourney,journeyLife,saveJourney} from '../app/journey-progress.mjs';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/finale-lifecycle-2026-09-23';await mkdir(out,{recursive:true});const reports=[];
const browser=await chromium.launch({channel:'msedge',headless:true});
const hook=async page=>page.evaluate(async()=>{const url=performance.getEntriesByType('resource').map(e=>e.name).find(u=>u.includes('/app/engine.ts'));const{VoroEngine}=await import(url),init=VoroEngine.prototype.initAudio;VoroEngine.prototype.initAudio=function(){window.g=this;return init.call(this)}});
try{for(const elapsed of [8.5,12.9,15,18.1,26]){
 const p=newJourney(453);p.stage=9;p.completed=true;p.finaleRemaining=31-elapsed;const life=journeyLife(p);life.biomass=230;life.eaten=47;
 const save=saveJourney(p,life,{journal:new Map()},false),context=await browser.newContext({viewport:{width:390,height:844},locale:'es-ES'});
 let page=await context.newPage();await page.goto('http://127.0.0.1:5208/',{waitUntil:'networkidle'});await page.evaluate(save=>localStorage.setItem('voro-journey-v1',save),save);await page.reload({waitUntil:'networkidle'});await hook(page);
 await page.getByRole('button',{name:'Continuar partida',exact:true}).click();await page.waitForFunction(()=>window.g?.started);
 const resumed=await page.evaluate(()=>{const g=window.g;cancelAnimationFrame(g.raf);Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.qaHidden||false});window.qaHidden=true;window.dispatchEvent(new Event('blur'));document.dispatchEvent(new Event('visibilitychange'));const paused=g.paused;window.qaHidden=false;document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));g.save();return{paused,resumed:!g.paused,remaining:g.ending,eaten:g.life.eaten}});
 assert.ok(resumed.paused&&resumed.resumed);assert.equal(resumed.eaten,47);assert.ok(Math.abs(resumed.remaining-(31-elapsed))<.3);
 await page.close();page=await context.newPage();await page.goto('http://127.0.0.1:5208/',{waitUntil:'networkidle'});await hook(page);await page.getByRole('button',{name:'Continuar partida',exact:true}).click();
 const cold=await page.evaluate(()=>{const g=window.g;cancelAnimationFrame(g.raf);const remaining=g.ending;g.time=80;while(g.ending>0){const dt=Math.min(1/60,g.ending);g.time+=dt;g.update(dt)}g.render();g.publish();return{remaining,complete:g.progress.completed,ending:g.ending,eaten:g.life.eaten,saved:JSON.parse(localStorage.getItem('voro-journey-v1')).progress.finaleRemaining}});
 assert.ok(Math.abs(cold.remaining-resumed.remaining)<.3);assert.equal(cold.saved,0);assert.equal(cold.ending,0);assert.equal(cold.eaten,47);assert.equal(await page.locator('.journey-complete-dialog').count(),0);
 await page.screenshot({path:`${out}/survivor-from-${elapsed}.png`});reports.push({elapsed,resumed,cold});await context.close();
}}finally{await browser.close()}
await writeFile(`${out}/web-qa.json`,JSON.stringify(reports,null,2));console.log(reports);
