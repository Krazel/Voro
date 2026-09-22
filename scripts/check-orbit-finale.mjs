import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/orbit-audio-finale-2026-09-22';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage({viewport:{width:430,height:860},locale:'es-ES'});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:5206/',{waitUntil:'networkidle'});
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').map(e=>e.name).find(u=>u.includes('/app/engine.ts'));
  const {VoroEngine}=await import(url),init=VoroEngine.prototype.initAudio;
  window.qaStages=(await import(new URL('journey-data.mjs',url).href)).STAGES;
  VoroEngine.prototype.initAudio=function(){window.qaGame=this;return init.call(this);};
 });
 await page.getByRole('button',{name:'Despertar',exact:true}).click();
 await page.waitForFunction(()=>window.qaGame?.started);
 await page.evaluate(()=>{const g=window.qaGame;g.startTest(window.qaStages.findIndex(s=>s.id==='orbit'),10,false,true,false);});
 await page.waitForTimeout(3000);
 await page.evaluate(()=>cancelAnimationFrame(window.qaGame.raf));
 const capture=async name=>{const png=await page.evaluate(()=>window.qaGame.canvas.toDataURL());await writeFile(`${out}/${name}.png`,Buffer.from(png.split(',')[1],'base64'));};
 const orbit=[];
 for(const [name,x,y] of [['orbit-north',700,970],['orbit-south',700,2450],['orbit-east',1400,1750]]){
  orbit.push(await page.evaluate(({x,y})=>{const g=window.qaGame;g.life.x=x;g.life.y=y;g.camera={x,y};g.life.vx=g.life.vy=0;g.render();return {x,y,zoom:g.zoom,canvas:[g.canvas.width,g.canvas.height],earthLoaded:!!g.atlasImages.earth?.naturalWidth};},{x,y}));
  await capture(name);
 }
 await page.evaluate(()=>{const g=window.qaGame,s=window.qaStages;g.startTest(s.length-1,s.at(-1).goal,false,true,false);});
 await page.waitForTimeout(3000);
 await page.evaluate(()=>{const g=window.qaGame;g.render();g.testEvolution=true;g.beginUniverseFinale();});
 for(const elapsed of [0,4,8,11,17]){
  await page.evaluate(elapsed=>{const g=window.qaGame;g.ending=17-elapsed;g.render();},elapsed);
  await capture(`finale-${elapsed}s`);
 }
 const motion=await page.evaluate(()=>{const g=window.qaGame,x=g.life.x;g.input=()=>({x:1,y:0});for(let i=0;i<7200;i++)g.updateSurvivor(1/60);g.render();return {distance:g.life.x-x,cameraGap:Math.abs(g.life.x-g.camera.x)};});
 await capture('survivor-after-travel');
 assert.ok(orbit.every(o=>o.earthLoaded));assert.ok(motion.distance>11000);assert.ok(motion.cameraGap<60);assert.deepEqual(errors,[]);
 await writeFile(`${out}/visual-check.json`,JSON.stringify({orbit,motion,errors},null,2));
 console.log(JSON.stringify({orbit,motion,errors}));
}finally{await browser.close();}
