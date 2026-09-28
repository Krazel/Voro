import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/orbit-recovery-2026-09-28/browser';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});const results=[];
try{
 for(const [label,url,viewport]of [['pc','http://127.0.0.1:5211/',{width:1440,height:900}],['phone','http://127.0.0.1:5210/',{width:390,height:844}]]){
  const page=await browser.newPage({viewport,locale:'es-ES'}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(url+'?ui=final&lab=cosmos',{waitUntil:'networkidle'});
  assert.equal(await page.getByLabel('Invulnerabilidad',{exact:true}).isChecked(),false);
  assert.equal(await page.getByLabel('Cambiar de entorno al crecer',{exact:true}).isChecked(),true);
  await page.getByRole('button',{name:'Órbita',exact:true}).click();await page.waitForFunction(()=>window.__voroLab.assetsReady);
  await page.evaluate(()=>{const g=window.__voroLab;g.life.x=700;g.life.y=800;g.camera={x:700,y:800};g.progress.xp=-1e9;g.testInvulnerable=true;});
  await page.waitForTimeout(1000);await page.evaluate(()=>window.__voroLab.frameMonitor.reset());await page.waitForTimeout(3500);
  const metrics=await page.evaluate(()=>{const g=window.__voroLab;return {frames:g.frameMonitor.summary(true),sheets:g.animationSheets.stats()};});
  await page.screenshot({path:`${out}/${label}-earth.png`});
  await page.getByRole('button',{name:'Comer Tierra',exact:true}).click();await page.waitForFunction(()=>window.__voroLab.assetsReady);
  await page.evaluate(()=>window.__voroLab.paused=true);
  for(const t of [.3,.65,.9,.99]){
   await page.evaluate(t=>{const g=window.__voroLab;g.earthAbsorption=t;g.render();},t);
   await page.screenshot({path:`${out}/${label}-meal-${t}.png`});
  }
  await page.evaluate(async()=>{const base='/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/';const {SPECIES_BY_ID}=await import(base+'journey-data.mjs');const {journeyEntity}=await import(base+'journey-world.mjs');const g=window.__voroLab;g.startTest(7,2,false,true,false);g.paused=true;g.life.x=g.life.y=0;g.camera={x:0,y:0};g.world.entities=[journeyEntity(SPECIES_BY_ID['stars-5'],0,0,0,'qa-pulsar')];g.world.entities[0].r=203;g.world.entities[0].requiredMass=1e9;g.food=g.world.entities;g.world.stream=()=>{};g.world.move=()=>{};});
  await page.waitForFunction(()=>window.__voroLab.assetsReady);await page.evaluate(()=>window.__voroLab.render());
  await page.screenshot({path:`${out}/${label}-pulsar.png`});
  assert.deepEqual(errors,[]);results.push({label,metrics,errors});await page.close();
 }
 await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(r=>({label:r.label,fps:r.metrics.frames.fps,cpu:r.metrics.frames.cpu,errors:r.errors}))));
}finally{await browser.close();}
