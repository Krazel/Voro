import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/asset-improvements-2026-09-28/scenes';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const result={method:'Edge on PC, mobile viewport/touch emulation. Not physical iPhone FPS.',errors:[],scenes:[]};
try{
 const context=await browser.newContext({viewport:{width:390,height:844},locale:'es-ES',hasTouch:true,isMobile:true});
 const page=await context.newPage();page.on('pageerror',e=>result.errors.push(String(e)));
 await page.goto('http://127.0.0.1:5210/?ui=final&lab=cosmos',{waitUntil:'networkidle'});
 const save=await page.evaluate(()=>localStorage.getItem('voro-journey-v1'));
 for(let stage=0;stage<10;stage++){
  await page.evaluate(async stage=>{const {stageStartMass}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/journey-data.mjs');const g=window.__voroLab;g.startTest(stage,stageStartMass(stage),false,true,false);g.setDiagnostics(true);g.progress.xp=-1e9;g.paused=false;g.birth=0;},stage);
  await page.waitForFunction(()=>window.__voroLab.assetsReady);
  await page.waitForTimeout(1300);
  await page.evaluate(()=>window.__voroLab.frameMonitor.reset());
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(2200);await page.keyboard.up('ArrowRight');
  const stats=await page.evaluate(()=>{const g=window.__voroLab;return{stage:g.progress.stage,frames:g.frameMonitor.summary(true),sheets:g.animationSheets.stats(),zoom:g.zoom,entities:g.world.entities.length,quality:g.animationSheets.highDetail};});
  assert.ok(stats.quality);assert.equal(stats.sheets.limit,64*1048576);assert.ok(stats.sheets.bytes<=stats.sheets.limit);assert.equal(stats.sheets.errors,0);assert.ok(stats.frames.frames>35);
  await page.screenshot({path:`${out}/${stage}.png`});result.scenes.push(stats);
  assert.equal(await page.evaluate(()=>localStorage.getItem('voro-journey-v1')),save);
 }
 assert.deepEqual(result.errors,[]);
 await writeFile(out+'/results.json',JSON.stringify(result,null,2));
 console.log(result.scenes.map(s=>({stage:s.stage,fps:s.frames.fps,cpu:s.frames.cpu,mb:+(s.sheets.bytes/1048576).toFixed(2),errors:s.sheets.errors,cycles:s.sheets.visibleCycles})));
}finally{await browser.close();}
