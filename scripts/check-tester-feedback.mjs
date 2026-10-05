import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/tester-feedback-2026-10-05';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1100,height:820},deviceScaleFactor:1});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5235/@fs/C:/Users/dmkra/Documents/Codex%20Apps/Voro-camera/design/tester-feedback-2026-10-05/index.html');
 await page.waitForFunction(()=>window.preview?.assetsReady,{timeout:60000});
 for(const [label,stage] of [['city',4],['planets',6],['ray',3]]){
  await page.evaluate(stage=>window.scene(stage),stage);await page.waitForFunction(()=>window.preview.assetsReady);
  await page.evaluate(async stage=>{
   const g=window.preview;g.reviewHold=true;g.zoom=.85;
   if(stage===6){
    const {journeyEntity}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/journey-world.mjs');
    const {SPECIES_BY_ID}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/journey-data.mjs');
    const e=journeyEntity(SPECIES_BY_ID['planets-3'],g.life.x+150,g.life.y-40,0,'ice');e.r=190;g.food=[e];
    g.world.projectiles=[{meteor:true,x:g.life.x-170,y:g.life.y-110,r:28,vx:420,vy:130,life:6,warning:0,seed:1}];
   }
   g.renderScene();
  },stage);
  await page.screenshot({path:`${out}/${label}.png`});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.scene(6));await page.waitForFunction(()=>window.preview.assetsReady);
 await page.waitForTimeout(8500);await page.screenshot({path:`${out}/planets-mobile.png`});
 await writeFile(`${out}/browser.json`,JSON.stringify({errors},null,2));console.log(JSON.stringify({errors}));if(errors.length)process.exitCode=1;
}finally{await browser.close();}
