import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/universe-options-2026-09-23/integration';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});const report=[];
try{for(const [port,width,height] of [[5208,390,844],[5206,1280,800]]){
 const page=await browser.newPage({viewport:{width,height},locale:'es-ES'}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(`http://127.0.0.1:${port}/`,{waitUntil:'networkidle'});
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').map(e=>e.name).find(u=>u.includes('/app/engine.ts'));
  const {VoroEngine}=await import(url),init=VoroEngine.prototype.initAudio;
  VoroEngine.prototype.initAudio=function(){window.g=this;return init.call(this);};
  window.data=await import(new URL('journey-data.mjs',url));window.world=await import(new URL('journey-world.mjs',url));
  window.sim=await import(new URL('simulation.mjs',url));
 });
 await page.getByRole('button',{name:'Despertar',exact:true}).click();
 await page.evaluate(()=>window.g.startTest(9,180,false,true,false));
 await page.waitForFunction(()=>window.g.assetsReady);await page.waitForTimeout(700);
 const result=await page.evaluate(()=>{
  const g=window.g;cancelAnimationFrame(g.raf);g.progress.offer=[];
  const ids=['cosmic-wall','lensed-crown','cosmic-confluence','cosmic-tide'];
  const specimens=ids.map((key,i)=>{const s=window.data.SPECIES_BY_ID['universe-'+key],e=window.world.journeyEntity(s,g.life.x+(i%2?230:-230),g.life.y+(i<2?-225:225),0,'qa:'+key);
   e.heading=0;const im=g.atlasImages[key];return {s,e,image:{loaded:im.complete&&im.naturalWidth===512,url:im.src}};});
  // Fixed placements only for a readable QA screenshot. Natural generation is
  // checked separately over800 regions; this does not change population code.
  g.world.entities=specimens.map(x=>x.e);g.food=g.world.entities;g.zoom=Math.min(g.width/1050,g.height/1200);g.camera={x:g.life.x,y:g.life.y};g.render();
  const screenshot=g.canvas.toDataURL();
  return {screenshot,items:specimens.map(({s,e,image})=>{
   const life=window.sim.createLife?window.sim.createLife():{...g.life,digestion:[]};
   Object.assign(life,{x:e.x,y:e.y,biomass:e.requiredMass*.99,radius:window.sim.radiusForMass(e.requiredMass*.99),digestion:[]});
   const below=window.sim.beginAbsorb(life,{...e});life.biomass=e.requiredMass;life.radius=window.sim.radiusForMass(life.biomass);
   const at=window.sim.beginAbsorb(life,{...e});return {name:s.name,requiredMass:e.requiredMass,below,at,image};
  })};
 });
 await writeFile(`${out}/universe-${width}.png`,Buffer.from(result.screenshot.split(',')[1],'base64'));delete result.screenshot;
 for(const item of result.items){assert.equal(item.image.loaded,true);assert.equal(item.below,false);assert.equal(item.at,true);}
 assert.deepEqual(errors,[]);report.push({width,height,...result,errors});await page.close();
}}finally{await browser.close();}
await writeFile(`${out}/checks.json`,JSON.stringify(report,null,2));console.log('Four selected structures loaded, rendered and edible at their size thresholds in mobile and PC.');
