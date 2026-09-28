import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/quality-pacing-2026-09-28',root='/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/';
const browser=await chromium.launch({channel:'msedge',headless:true});
const result={browser:'Edge desktop; touch emulation is not physical iPhone/iPad',scenes:[],errors:[]};
try {
 for(const touch of [false,true]) {
  const context=await browser.newContext({viewport:touch?{width:390,height:844}:{width:1440,height:900},hasTouch:touch,isMobile:touch,deviceScaleFactor:touch?3:1,locale:'es-ES'});
  const page=await context.newPage();page.on('pageerror',e=>result.errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${touch?5210:5211}/?ui=final&lab=cosmos`,{waitUntil:'networkidle'});
  const key=touch?'voro-journey-v1':'voro-pc-demo-journey-v1',saved=await page.evaluate(k=>localStorage.getItem(k),key);
  for(const [stage,id]of [[0,'Microscopio'],[6,'Planetas'],[9,'Universo']]) {
   await page.getByRole('button',{name:id,exact:true}).click();await page.waitForFunction(()=>window.__voroLab.assetsReady);
   await page.evaluate(()=>{const g=window.__voroLab;g.progress.xp=-1e9;g.life.invulnerable=1e9;g.birth=0;});
   await page.waitForTimeout(2400);await page.evaluate(()=>window.__voroLab.frameMonitor.reset());
   await page.keyboard.down('ArrowRight');await page.waitForTimeout(4500);await page.keyboard.up('ArrowRight');
   const stats=await page.evaluate(()=>{const g=window.__voroLab;return {frames:g.frameMonitor.summary(true),sheets:g.animationSheets.stats(),cache:g.worldGround.cache.size,assets:g.assets.stats(),zoom:g.zoom};});
   assert.ok(stats.frames.frames>80);assert.ok(stats.sheets.bytes<=stats.sheets.limit);assert.equal(stats.sheets.errors,0);assert.ok(stats.cache<=3);
   assert.equal(stats.sheets.quality,touch?'standard':'optional-close-up');
   assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),saved);
   await page.screenshot({path:`${out}/moving-${touch?'touch':'pc'}-${stage}.png`});
   result.scenes.push({touch,stage,id,...stats});
  }
  if(!touch) {
   // Inspect all four recovered approved masters at their largest population size.
   for(const id of ['universe-cosmic-wall','universe-lensed-crown','universe-cosmic-confluence','universe-cosmic-tide']) {
    await page.evaluate(async({id,root})=>{
     const {SPECIES_BY_ID}=await import(root+'journey-data.mjs'),{sizeRange}=await import(root+'entity-sizes.mjs'),{journeyEntity}=await import(root+'journey-world.mjs');
     const g=window.__voroLab;g.startTest(9,2,false,true,false);g.progress.xp=-1e9;g.birth=0;
     g.world.stream=g.world.replenish=g.world.move=()=>{};g.life.x=g.life.y=0;g.camera={x:0,y:0};
     const s=SPECIES_BY_ID[id],e=journeyEntity(s,0,0,0,'native-master-test');e.r=sizeRange(s).max;e.requiredMass=1e9;g.world.entities=[e];g.food=[e];g.setZoom(1.75);
    },{id,root});
    await page.waitForFunction(()=>window.__voroLab.assetsReady);await page.waitForTimeout(600);
    await page.screenshot({path:`${out}/maximum-${id}.png`});
   }
  }
  await context.close();
 }
 assert.deepEqual(result.errors,[]);
 await writeFile(`${out}/quality-memory.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result.scenes.map(s=>({touch:s.touch,stage:s.id,fps:s.frames.fps,cpu:s.frames.cpu,MB:s.sheets.bytes/1048576,cycles:s.sheets.visibleCycles}))));
} finally {await browser.close();}
