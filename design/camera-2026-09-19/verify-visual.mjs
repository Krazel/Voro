import {chromium} from 'file:///C:/Users/dmkra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1200,height:1420},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('http://127.0.0.1:5191/camera-qa',r=>r.fulfill({contentType:'text/html',body:'<html><body></body></html>'}));
await page.goto('http://127.0.0.1:5191/camera-qa');
const result=await page.evaluate(async()=>{
 const {VoroEngine}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/engine.ts');
 const {STAGES,stageStartMass}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/journey-data.mjs');
 const {journeyLife,newJourney,advanceJourney}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/journey-progress.mjs');
 const {gameplayZoom}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/camera.mjs');
 document.body.innerHTML='<h1>VORO · Encuadre inicial por entorno</h1><p>Motor real en Chromium · 390 × 560 · zoom manual 100 % · izquierda antes / derecha corregido</p><div id="grid"></div>';
 const style=document.createElement('style');style.textContent='body{margin:0;padding:20px;background:#081418;color:#d5e8e8;font:16px Arial}h1{font-size:25px;margin:0 0 10px}#grid{display:grid;grid-template-columns:repeat(3,380px);gap:12px}section{background:#102329;padding:8px}h2{font:17px Arial;margin:0 0 6px}canvas{width:178px;height:256px}small{display:block;font-size:12px}';document.head.append(style);
 const results=[];
 for(let stage=0;stage<STAGES.length;stage++){
  const section=document.createElement('section');section.innerHTML='<h2>'+STAGES[stage].short+'</h2>';document.querySelector('#grid').append(section);
  for(const before of [true,false]){
   const canvas=document.createElement('canvas');section.append(canvas);
   canvas.getBoundingClientRect=()=>({width:390,height:560,left:0,top:0});
   const raf=window.requestAnimationFrame;window.requestAnimationFrame=()=>0;
   const game=new VoroEngine(canvas,()=>{});window.requestAnimationFrame=raf;
   game.progress.seed=834;
   game.startTest(stage,stageStartMass(stage),false,true,false);
   if(stage>0){let p=newJourney(834);p.stage=stage-1;let l=journeyLife(p);l.biomass=STAGES[stage-1].goal;game.life=advanceJourney(p,l);game.progress=p;game.camera={x:game.life.x,y:game.life.y};}
   game.zoom=gameplayZoom(game.life.radius,before?24:game.cameraEntryRadius);
   game.time=2;game.hint='';game.life.invulnerable=0;game.particles=[];
   game.syncStageAssets();
   const deadline=Date.now()+20000;while(!game.assetsReady && Date.now()<deadline)await new Promise(r=>setTimeout(r,50));
   if(!game.assetsReady)throw Error('Assets not ready '+stage);
   game.render();results.push({stage:STAGES[stage].id,before,radius:game.life.radius,zoom:game.zoom,screenDiameter:2*game.life.radius*game.zoom*390/480});
  }
  const last=results.slice(-2);const line=document.createElement('small');line.textContent=last.map(v=>(v.before?'Antes: ':'Ahora: ')+v.screenDiameter.toFixed(1)+' px').join(' / ');section.append(line);
 }
 return results;
});
for(const row of result.filter(r=>!r.before))assert.ok(Math.abs(row.screenDiameter-43.68)<1e-6);
await page.screenshot({path:'design/camera-2026-09-19/comparison.png',fullPage:true});
fs.writeFileSync('design/camera-2026-09-19/measurements.json',JSON.stringify({result,errors},null,2));
assert.deepEqual(errors,[]);await browser.close();console.log('20 renders checked; all 10 entries = 43.68 CSS pixels at 390px viewport');
