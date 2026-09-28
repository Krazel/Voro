import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const out=process.env.VORO_DECOY_OUT||'design/organic-decoy-2026-09-28';await mkdir(out,{recursive:true});
try {
 const page=await browser.newPage({viewport:{width:780,height:844},locale:'es-ES'}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:5211/?ui=final&lab=cosmos');
 await page.waitForFunction(()=>window.__voroLab?.assetsReady);
 const frames=[];
 await page.evaluate(async()=>{
  const g=window.__voroLab;g.startTest(0,2,false,false,false);g.birth=0;g.paused=false;
  g.progress.offer=[];g.progress.xp=0;g.progress.mutations=['decoy'];g.progress.level=1;
  const {journeyEntity}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/journey-world.mjs');
  const {SPECIES_BY_ID}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/journey-data.mjs');
  const e=journeyEntity(SPECIES_BY_ID.hunter,g.life.x-150,g.life.y,1,'decoy-pursuer');
  e.requiredMass=100;e.aiEngaged=true;g.world.entities=[e];g.food=[e];
  g.world.stream=()=>{};g.world.replenish=()=>{};
  g.padInput={x:1,y:0};g.action('dash');g.paused=true;
 });
 for(const [label,steps]of [['departure',12],['separation',24],['fade',65],['gone',30]]) {
  const state=await page.evaluate(steps=>{
   const g=window.__voroLab;g.paused=false;
   for(let i=0;i<steps;i++){g.time+=1/60;g.update(1/60);}
   g.paused=true;g.render();
   return {playerX:g.life.x,decoy:g.life.decoy?{x:g.life.decoy.x,remaining:g.life.decoy.remaining}:null,
    imageSize:g.decoyImage?.width,hunterX:g.world.entities[0].x};
  },steps);
  frames.push({label,...state});await page.screenshot({path:`${out}/${label}.png`});
 }
 assert.equal(frames[0].imageSize,512);assert.ok(frames[1].playerX>frames[1].decoy.x+30);
 assert.ok(frames[2].decoy.remaining<.65);assert.equal(frames[3].decoy,null);assert.deepEqual(errors,[]);
 await page.goto('http://127.0.0.1:5211/@fs/C:/Users/dmkra/Documents/Codex%20Apps/Voro-camera/design/adaptations-candidate/index.html');
 assert.equal(await page.locator('article').count(),14);
 await page.getByRole('button',{name:'Rara',exact:true}).click();assert.equal(await page.locator('article:visible').count(),2);
 await page.screenshot({path:`${out}/rare-cards.png`,fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:5211/?ui=final&lab=cosmos');
 await page.waitForFunction(()=>window.__voroLab?.assetsReady);
 await page.getByText(/Ocultar pruebas/).click();
 await page.evaluate(()=>{const g=window.__voroLab;g.startTest(0,2,false,false,false);g.birth=0;
  g.progress.offer=['decoy','dash','pull'];g.publish();});
 await page.getByText('Señuelo orgánico',{exact:true}).waitFor();
 await page.screenshot({path:`${out}/mobile-offer.png`});
 assert.deepEqual(errors,[]);
 await writeFile(`${out}/browser-check.json`,JSON.stringify({frames,errors,passed:true},null,2));
 console.log(JSON.stringify({frames,errors,passed:true}));
}finally{await browser.close();}

