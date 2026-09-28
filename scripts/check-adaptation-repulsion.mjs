import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const out='design/adaptation-balance-2026-09-28';
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:800},locale:'es-ES'});
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:5211/?ui=final&lab=cosmos');
 await page.waitForFunction(()=>window.__voroLab?.assetsReady);
 await page.evaluate(async()=>{
  const g=window.__voroLab;
  g.startTest(0,2,false,false,false);g.paused=true;g.birth=0;g.progress.xp=0;g.progress.offer=[];
  g.progress.mutations=Array(3).fill('spikes');
  const {journeyEntity}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/journey-world.mjs');
  const {SPECIES_BY_ID}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/journey-data.mjs');
  const e=journeyEntity(SPECIES_BY_ID.hunter,g.life.x+g.life.radius*.85+50*.76-3,g.life.y,1,'repulsion-demo');
  e.r=50;e.homeX=e.x;e.homeY=e.y;
  g.world.entities=[e];g.food=[e];g.world.stream=()=>{};g.world.replenish=()=>{};
  g.life.invulnerable=0;g.render();
 });
 const positions=[];
 for(const [name,frames]of [['before',0],['push',7],['after',20]]){
  positions.push(await page.evaluate(frames=>{const g=window.__voroLab;g.paused=false;for(let i=0;i<frames;i++){g.time+=1/60;g.update(1/60);}g.paused=true;g.render();const e=g.world.entities[0];return{x:e.x,y:e.y,wound:e.wound,requiredMass:e.requiredMass,mass:g.life.biomass};},frames));
  await page.screenshot({path:`${out}/repulsion-${name}.png`});
 }
 assert.ok(positions[1].x>positions[0].x&&positions[2].x>positions[1].x);
 assert.ok(positions.every(p=>p.wound===0&&p.requiredMass===positions[0].requiredMass));
 assert.deepEqual(errors,[]);
 await page.goto('http://127.0.0.1:5211/@fs/C:/Users/dmkra/Documents/Codex%20Apps/Voro-camera/design/adaptations-candidate/index.html');
 assert.equal(await page.locator('article').count(),14);
 await page.getByRole('button',{name:'Defenderse',exact:true}).click();assert.equal(await page.locator('article:visible').count(),3);
 await page.getByRole('button',{name:'Todas',exact:true}).click();
 await page.screenshot({path:`${out}/catalogue.png`,fullPage:true});
 await writeFile(`${out}/browser-check.json`,JSON.stringify({positions,errors,passed:true,method:'Real local PC browser; isolated test-mode scene, no player save.'},null,2));
 console.log(JSON.stringify({positions,errors,passed:true}));
}finally{await browser.close();}
