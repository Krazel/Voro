import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/pond-camera-audio-2026-09-23';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true}),report=[];
try{for(const [port,width,height] of [[5208,375,667],[5208,390,844],[5208,1194,834],[5206,1280,800]]){
 const page=await browser.newPage({viewport:{width,height},locale:'es-ES'}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(`http://127.0.0.1:${port}/`,{waitUntil:'networkidle'});
 await page.evaluate(async()=>{const url=performance.getEntriesByType('resource').map(e=>e.name).find(u=>u.includes('/app/engine.ts'));
  const {VoroEngine}=await import(url),init=VoroEngine.prototype.initAudio;
  VoroEngine.prototype.initAudio=function(){window.g=this;return init.call(this);};
  window.qaFinal=await import(new URL('universe-finale.mjs',url));
 });
 await page.getByRole('button',{name:'Despertar',exact:true}).click();
 await page.evaluate(()=>window.g.startTest(1,120,false,true,false));await page.waitForTimeout(2500);
 await page.evaluate(()=>{const g=window.g;cancelAnimationFrame(g.raf);g.progress.offer=[];g.life.invulnerable=3;g.stats.shieldCooldown=40;g.stats.shieldCapacity=1;g.progress.shieldRecharge=0;g.stats.comboCapacity=4;g.comboClock=3;g.comboMeals=3;g.publish();g.render();});
 await page.waitForTimeout(100);await page.screenshot({path:`${out}/candidate-hud-${width}.png`});
 const boxes=await page.evaluate(()=>{const r=s=>{const a=document.querySelector(s)?.getBoundingClientRect();return a?{x:a.x,y:a.y,w:a.width,h:a.height}:null;};return {buff:r('.micro-buffs'),dash:r('.dash-button')};});
 assert.ok(boxes.buff&&boxes.dash);assert.ok(boxes.buff.y>height/2);assert.ok(boxes.buff.x+boxes.buff.w<=boxes.dash.x || boxes.buff.y+boxes.buff.h<=boxes.dash.y);
 await page.evaluate(()=>window.g.action('pause'));await page.waitForTimeout(950);
 await page.getByRole('heading',{name:'Respira.',exact:true}).waitFor();await page.screenshot({path:`${out}/pause-respira-${width}.png`});
 await page.locator('.pause-panel').getByRole('button',{name:'Configuración',exact:true}).click();await page.locator('.voro-settings').waitFor();
 await page.screenshot({path:`${out}/settings-${width}.png`});
 await page.getByRole('button',{name:'Modo zurdo',exact:true}).click();
 await page.getByRole('button',{name:'Volver al juego',exact:true}).first().click();
 await page.waitForTimeout(100);
 const left=await page.evaluate(()=>{const b=document.querySelector('.micro-buffs').getBoundingClientRect(),d=document.querySelector('.dash-button').getBoundingClientRect();return {buffX:b.x,dashRight:d.right};});
 assert.ok(left.buffX>=left.dashRight);await page.screenshot({path:`${out}/candidate-left-${width}.png`});
 // Isolated real renderer replay, no progress overwritten outside this fresh QA profile.
 await page.evaluate(()=>{const g=window.g;g.settingsOpen=false;g.paused=false;g.startTest(9,230,false,true,true);});await page.waitForTimeout(1800);
 await page.evaluate(()=>{const g=window.g;cancelAnimationFrame(g.raf);g.beginUniverseFinale();});
 for(const elapsed of [9.9,11.5,14,18,23]){
  const png=await page.evaluate(elapsed=>{const g=window.g;g.ending=window.qaFinal.FINALE_SECONDS-elapsed;g.time=50;g.render();return g.canvas.toDataURL();},elapsed);
  if(width===390)await writeFile(`${out}/final-reveal-${elapsed}.png`,Buffer.from(png.split(',')[1],'base64'));
 }
 const final=await page.evaluate(()=>{const g=window.g;g.ending=0;let x=g.life.x;g.input=()=>({x:1,y:0});for(let i=0;i<1800;i++)g.updateSurvivor(1/60);return {distance:g.life.x-x,completed:g.progress.completed,music:g.music?.stats()};});
 assert.ok(final.distance>2000);assert.equal(final.completed,true);assert.deepEqual(errors,[]);
 report.push({port,width,height,boxes,left,final,errors});await page.close();
}}finally{await browser.close();}
await writeFile(`${out}/final-candidate-browser.json`,JSON.stringify(report,null,2));console.log('Phone, iPad, PC: HUD, Respira, settings, outward reveal and unbounded movement verified.');
