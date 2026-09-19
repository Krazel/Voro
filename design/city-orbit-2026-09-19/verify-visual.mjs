import {chromium} from 'file:///C:/Users/dmkra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';
const dir='design/city-orbit-2026-09-19';
const browser=await chromium.launch({channel:'chrome',headless:true});
const ctx=await browser.newContext({viewport:{width:430,height:932},deviceScaleFactor:1,recordVideo:{dir:'work/city-orbit-2026-09-19/videos',size:{width:430,height:932}}});
const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('http://127.0.0.1:5191/encounter-qa',r=>r.fulfill({contentType:'text/html',body:'<html><body></body></html>'}));await page.goto('http://127.0.0.1:5191/encounter-qa');
await page.evaluate(async()=>{
 const root='/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/';
 const {VoroEngine}=await import(root+'engine.ts');const {SPECIES_BY_ID}=await import(root+'journey-data.mjs');const {JourneyWorld,journeyEntity}=await import(root+'journey-world.mjs');
 document.body.innerHTML='<h1 id="title">Ciudad · población real</h1><p id="caption">Motor real · Chromium · prueba local</p><canvas></canvas>';
 const style=document.createElement('style');style.textContent='body{margin:0;background:#07181e;color:#e3eded;font:14px Arial}h1{font-size:20px;margin:12px 20px 8px}p{height:24px;margin:0 20px 8px}canvas{width:390px;height:844px;margin:0 20px}';document.head.append(style);
 const raf=window.requestAnimationFrame;window.requestAnimationFrame=()=>0;const game=new VoroEngine(document.querySelector('canvas'),()=>{});window.requestAnimationFrame=raf;
 window.qa={game,SPECIES_BY_ID,journeyEntity,JourneyWorld};
 window.ready=async()=>{const deadline=Date.now()+20000;while(!game.assetsReady&&Date.now()<deadline)await new Promise(r=>setTimeout(r,30));if(!game.assetsReady)throw Error('assets');};
 window.step=(dt)=>{game.time+=dt;game.update(dt);game.render();};
 game.progress.seed=834;game.startTest(4,2,false,true,false);game.hint='';game.life.x=600;game.life.y=600;game.camera={x:600,y:600};await window.ready();game.render();
});
await page.screenshot({path:dir+'/city.png'});await page.waitForTimeout(900);
const checks=[];
for(const [id,mass,label] of [['city-1',2,'Soldado armado'],['city-7',5,'Blindado pequeño'],['city-5',2,'Automóvil sin armas']]){
 await page.evaluate(async({id,mass,label})=>{
  const {game:g,SPECIES_BY_ID:S,journeyEntity}=window.qa;g.startTest(4,mass,false,true,false);g.hint='';g.world.stream=()=>{};g.world.move=()=>{};g.world.replenish=()=>{};
  g.world.entities=[journeyEntity(S[id],g.life.x+100,g.life.y,0,'qa-target')];g.world.projectiles=[];g.food=g.world.entities;g.camera={x:g.life.x,y:g.life.y};
  document.querySelector('#title').textContent='Ciudad · '+label;document.querySelector('#caption').textContent='Absorción real · objetivo inmóvil en esta prueba';await window.ready();g.render();g.keys.add('ArrowRight');
 },{id,mass,label});
 await page.screenshot({path:dir+'/'+id+'-before.png'});
 for(let i=0;i<105;i++){await page.evaluate(()=>window.step(1/30));if(i===30)await page.screenshot({path:dir+'/'+id+'-absorbing.png'});await page.waitForTimeout(33);}
 const result=await page.evaluate(()=>{const g=window.qa.game;g.keys.clear();return {eaten:g.world.entities[0].eaten,digested:g.life.eaten,mass:g.life.biomass};});assert.ok(result.eaten&&result.digested>0);checks.push({id,...result});await page.screenshot({path:dir+'/'+id+'-after.png'});
}
await page.evaluate(async()=>{
 const {game:g,JourneyWorld}=window.qa;g.startTest(5,180,false,true,true);g.hint='';g.life.x=700;g.life.y=1500;g.life.invulnerable=20;g.camera={x:700,y:1500};g.world=new JourneyWorld(834,[],5);g.seed();g.food=g.world.entities;await window.ready();
 document.querySelector('#title').textContent='Órbita · objetos sobre la Tierra';document.querySelector('#caption').textContent='Población real, también sobre el disco terrestre';g.render();
});
await page.screenshot({path:dir+'/orbit-over-earth.png'});await page.waitForTimeout(1200);
const capture=await page.evaluate(()=>{const g=window.qa.game;g.beginEvolution();document.querySelector('#title').textContent='Órbita · absorción final';document.querySelector('#caption').textContent='La Tierra y los restos convergen antes de avanzar';return {items:g.progress.orbitSweep.items.length,shots:g.progress.orbitSweep.shots.length};});
for(let i=0;i<105;i++){await page.evaluate(()=>window.step(1/30));if([20,55,85,97].includes(i))await page.screenshot({path:dir+'/orbit-absorption-'+i+'.png'});await page.waitForTimeout(33);}
const outcome=await page.evaluate(()=>{const g=window.qa.game;return {earthConsumed:g.progress.earthConsumed,sweep:g.progress.orbitSweep,remaining:g.food.length,transition:g.transition};});assert.ok(outcome.earthConsumed&&outcome.remaining===0&&outcome.transition>0);checks.push({capture,outcome});
await page.waitForTimeout(700);const video=page.video();await ctx.close();await video.saveAs(dir+'/city-orbit-evidence.webm');await browser.close();fs.writeFileSync(dir+'/browser-checks.json',JSON.stringify({checks,errors},null,2));assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,errors}));
