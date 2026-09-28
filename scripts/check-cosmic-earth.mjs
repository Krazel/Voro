import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/cosmic-candidate-2026-09-28',browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},locale:'es-ES'});
 await page.goto('http://127.0.0.1:5210/?ui=final&lab=cosmos',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Órbita',exact:true}).click();
 await page.evaluate(()=>{const g=window.__voroLab;g.startTest(4,300,false,true,true);g.progress.xp=-1e9;});
 await page.waitForFunction(()=>window.__voroLab.progress.stage===5&&window.__voroLab.transition===0,{},{timeout:20000});
 await page.screenshot({path:`${out}/ciudad-a-orbita.png`});
 const arrival=await page.evaluate(async()=>{const g=window.__voroLab;const {ORBITAL_EARTH}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/earth-landmark.mjs');return {stage:g.progress.stage,entryRadius:g.cameraEntryRadius,zoom:g.zoom,earthScreenRadius:ORBITAL_EARTH.radius*g.zoom,bodyScreenRadius:g.life.radius*g.zoom,earthRadius:ORBITAL_EARTH.radius};});
 assert.ok(arrival.earthScreenRadius>580&&arrival.earthScreenRadius<720);
 assert.ok(Math.abs(arrival.bodyScreenRadius-26.88)<.01);
 await page.evaluate(()=>window.__voroLab.frameMonitor.reset());
 await page.getByRole('button',{name:'Comer Tierra',exact:true}).click();
 for(const t of [.18,.45,.8]){
  await page.waitForFunction(t=>window.__voroLab.earthAbsorption>=t,t);
  await page.screenshot({path:`${out}/tierra-${t}.png`});
 }
 await page.waitForFunction(()=>window.__voroLab.progress.earthConsumed);
 const cinematic=await page.evaluate(()=>window.__voroLab.frameMonitor.summary(true));
 await page.evaluate(()=>window.__voroLab.frameMonitor.reset());
 await page.getByRole('button',{name:'Comer Tierra',exact:true}).click();
 await page.waitForFunction(()=>window.__voroLab.progress.earthConsumed);
 const withoutScreenshots=await page.evaluate(()=>window.__voroLab.frameMonitor.summary(true));
 const result={arrival,cinematic,withoutScreenshots,physicalIOS:false};await writeFile(`${out}/earth.json`,JSON.stringify(result,null,2));console.log(result);
}finally{await browser.close();}
