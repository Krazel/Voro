import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/cosmic-candidate-2026-09-28';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const results={browser:'Edge desktop; mobile viewport emulation, not physical iOS',scenes:[],errors:[]};
try{
 const context=await browser.newContext({viewport:{width:390,height:844},locale:'es-ES',deviceScaleFactor:1,hasTouch:true,isMobile:true});
 const page=await context.newPage();page.on('pageerror',e=>results.errors.push(String(e)));
 await page.goto('http://127.0.0.1:5210/?ui=final&lab=cosmos',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Órbita',exact:true}).click();
 await page.waitForFunction(()=>window.__voroLab.assetsReady);
 const save=await page.evaluate(()=>localStorage.getItem('voro-journey-v1'));
 const backup=await page.evaluate(()=>({progress:JSON.stringify(window.__voroLab.testBackup.progress),mass:window.__voroLab.testBackup.life.biomass}));
 for(const label of ['Órbita','Planetas','Estrellas','Galaxias']){
  await page.getByRole('button',{name:label,exact:true}).click();await page.waitForFunction(()=>window.__voroLab.assetsReady);
  // Keep timed movement free of modal choices; adaptation audio is tested below.
  await page.evaluate(()=>{window.__voroLab.progress.xp=-1e9;});
  await page.waitForTimeout(1500);await page.evaluate(()=>window.__voroLab.frameMonitor.reset());
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(4500);await page.keyboard.up('ArrowRight');
  await page.screenshot({path:`${out}/${label}.png`});
  const small=await page.evaluate(()=>{const g=window.__voroLab;return {radius:g.life.radius,zoom:g.zoom,frames:g.frameMonitor.summary(true),sheets:g.animationSheets.stats(),backgroundCache:g.worldGround.cache.size,entities:g.world.entities.length};});
  await page.getByRole('button',{name:'Crecer',exact:true}).click();await page.getByRole('button',{name:'Crecer',exact:true}).click();
  await page.waitForTimeout(3500);await page.evaluate(()=>window.__voroLab.frameMonitor.reset());
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(4500);await page.keyboard.up('ArrowRight');
  const large=await page.evaluate(()=>{const g=window.__voroLab;return {radius:g.life.radius,zoom:g.zoom,frames:g.frameMonitor.summary(true),sheets:g.animationSheets.stats(),backgroundCache:g.worldGround.cache.size,entities:g.world.entities.length};});
  assert.ok(small.frames.frames>80);assert.ok(large.frames.frames>80);
  assert.ok(small.sheets.bytes<=small.sheets.limit);assert.ok(large.sheets.bytes<=large.sheets.limit);
  assert.equal(small.sheets.errors+large.sheets.errors,0);assert.ok(large.backgroundCache<=3);
  results.scenes.push({label,small,large});
  assert.equal(await page.evaluate(()=>localStorage.getItem('voro-journey-v1')),save,'Tests changed campaign save');
 }
 await page.getByRole('button',{name:'Ver agujero negro',exact:true}).click();await page.waitForFunction(()=>window.__voroLab.assetsReady);
 await page.waitForTimeout(1000);await page.screenshot({path:`${out}/agujero-negro.png`});
 await page.getByRole('button',{name:'Órbita',exact:true}).click();await page.waitForFunction(()=>window.__voroLab.assetsReady);
 await page.waitForTimeout(1200);const musicBefore=await page.evaluate(()=>window.__voroLab.music.stats());
 await page.getByRole('button',{name:'Adaptación',exact:true}).click();await page.waitForTimeout(1100);
 const musicDuring=await page.evaluate(()=>window.__voroLab.music.stats());
 assert.equal(musicDuring.active,true);assert.equal(musicDuring.volumeTarget,.126);assert.equal(musicDuring.current,musicBefore.current);
 const deck=musicDuring.decks.find(d=>d.id===musicDuring.current&&!d.paused);assert.ok(deck);
 await page.screenshot({path:`${out}/adaptacion.png`});
 await page.evaluate(()=>{const g=window.__voroLab;g.choose(g.progress.offer[0]);});await page.waitForTimeout(1000);
 const musicAfter=await page.evaluate(()=>window.__voroLab.music.stats());assert.equal(musicAfter.volumeTarget,.42);assert.equal(musicAfter.current,musicDuring.current);
 assert.ok(musicAfter.decks.find(d=>d.id===musicAfter.current&&!d.paused).time>deck.time);
 results.music={before:musicBefore,during:musicDuring,after:musicAfter};
 await page.getByRole('button',{name:'Comer Tierra',exact:true}).click();
 await page.waitForFunction(()=>window.__voroLab.earthAbsorption>.15);
 for(const t of [.18,.45,.8]){
  await page.waitForFunction(t=>window.__voroLab.earthAbsorption>=t,t);
  await page.screenshot({path:`${out}/tierra-${t}.png`});
 }
 await page.waitForFunction(()=>window.__voroLab.progress.earthConsumed);
 await page.waitForTimeout(100);await page.getByRole('button',{name:'Volver a partida',exact:true}).click();
 const restored=await page.evaluate(()=>{const g=window.__voroLab;g.paused=true;return {progress:JSON.stringify(g.progress),mass:g.life.biomass,testMode:g.testMode};});
 assert.equal(restored.testMode,false);assert.equal(restored.progress,backup.progress);assert.equal(restored.mass,backup.mass);
 results.campaignRestored=true;
 const normal=await context.newPage();await normal.goto('http://127.0.0.1:5210/?ui=final',{waitUntil:'networkidle'});
 assert.equal(await normal.locator('.cosmic-lab').count(),0);assert.equal(await normal.evaluate(()=>!!window.__voroLab),false);await normal.close();
 const wide=await browser.newPage({viewport:{width:1440,height:900},locale:'es-ES'});wide.on('pageerror',e=>results.errors.push(String(e)));
 await wide.goto('http://127.0.0.1:5211/?ui=final&lab=cosmos',{waitUntil:'networkidle'});
 await wide.getByRole('button',{name:'Ver agujero negro',exact:true}).click();await wide.waitForFunction(()=>window.__voroLab.assetsReady);
 await wide.waitForTimeout(1200);await wide.screenshot({path:`${out}/pc-galaxias.png`});
 assert.equal(results.errors.length,0,results.errors.join('\n'));
 await writeFile(`${out}/browser.json`,JSON.stringify(results,null,2));console.log(JSON.stringify({scenes:results.scenes.map(s=>({label:s.label,cpuSmall:s.small.frames.cpu,cpuLarge:s.large.frames.cpu,fpsLarge:s.large.frames.fps})),music:true,campaignRestored:true,errors:results.errors},null,2));
}finally{await writeFile(`${out}/partial.json`,JSON.stringify(results,null,2));await browser.close();}
