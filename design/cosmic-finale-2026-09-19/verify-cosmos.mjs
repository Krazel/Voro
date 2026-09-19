import {chromium} from 'file:///C:/Users/dmkra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';
const dir='design/cosmic-finale-2026-09-19';
const browser=await chromium.launch({channel:'chrome',headless:true});
const ctx=await browser.newContext({viewport:{width:1000,height:900},recordVideo:{dir:'work/cosmic-finale-2026-09-19/transitions',size:{width:1000,height:900}}});
const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/cosmos-qa',r=>r.fulfill({contentType:'text/html',body:'<html><body></body></html>'}));await page.goto('http://127.0.0.1:5191/cosmos-qa');
await page.evaluate(async()=>{
 const root='/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/';
 const {VoroEngine}=await import(root+'engine.ts');const {drawJourneySprite}=await import(root+'journey-sprites.mjs');const {SPECIES_BY_ID:S,STAGES}=await import(root+'journey-data.mjs');
 document.body.innerHTML='<h1>VORO · variedad cósmica</h1><p>Atlas y animación reales · escala común en cada fila</p><canvas id="game"></canvas><canvas id="sheet" width="960" height="730"></canvas>';
 const style=document.createElement('style');style.textContent='body{background:#041423;color:#d5e8e8;font:16px Arial;margin:20px}h1{margin:0 0 8px}p{margin:0 0 12px}#game{width:390px;height:780px;display:none}';document.head.append(style);
 const canvas=document.querySelector('#game');canvas.getBoundingClientRect=()=>({width:390,height:780,left:0,top:0});
 const raf=requestAnimationFrame;window.requestAnimationFrame=()=>0;const g=new VoroEngine(canvas,()=>{});window.requestAnimationFrame=raf;
 window.qa={g,STAGES};window.ready=async()=>{const limit=Date.now()+20000;while(!g.assetsReady&&Date.now()<limit)await new Promise(r=>setTimeout(r,30));assertReady();};function assertReady(){if(!g.assetsReady)throw Error('assets timeout');}
 const c=document.querySelector('#sheet').getContext('2d');c.fillStyle='#041423';c.fillRect(0,0,960,730);c.font='17px Arial';
 for(const [stage,id,y,label] of [[6,'planets-ice-giant',120,'Planetas: pequeño / grande'],[7,'stars-Agujero negro estelar',370,'Estrellas: disco de acreción existente'],[8,'galaxies-2',620,'Galaxias: brazos completos y tamaños variados']]) {
  g.startTest(stage,2,false,true,false);await window.ready();c.fillStyle='#d5e8e8';c.fillText(label,10,y-100);
  const s=S[id];for(const [i,factor] of s.sizeFactors.entries()) {const r=s.r*factor*.43;c.save();c.translate(i?640:230,y);drawJourneySprite(c,g.atlasImages,id,r,.32,2,1,0,g.animationSheets);c.restore();c.fillText('radio '+(s.r*factor).toFixed(0),i?600:190,y+100);}
 }
});
await page.screenshot({path:dir+'/cosmic-variety.png'});
const results=[];
for(const stage of [0,3,7]) {
 await page.evaluate(async(stage)=>{const {g,STAGES}=window.qa;document.querySelector('#sheet').style.display='none';document.querySelector('#game').style.display='block';document.querySelector('h1').textContent=STAGES[stage].short+' → '+STAGES[stage+1].short;document.querySelector('p').textContent='Transición del motor real · 7,2 segundos';g.startTest(stage,STAGES[stage].goal,false,true,true);await window.ready();g.render();g.beginEvolution();},stage);
 for(let i=0;i<225;i++){await page.evaluate(()=>{const g=window.qa.g;g.time+=1/30;g.update(1/30);g.render();});if([60,120,210].includes(i))await page.screenshot({path:`${dir}/transition-${stage}-${i}.png`});await page.waitForTimeout(33);}
 results.push(await page.evaluate(()=>({stage:window.qa.g.progress.stage,remaining:window.qa.g.transition})));
}
assert.deepEqual(results.map(r=>r.stage),[1,4,8]);assert.ok(results.every(r=>r.remaining===0));
const video=page.video();await ctx.close();await video.saveAs(dir+'/cosmos-transitions.webm');await browser.close();fs.writeFileSync(dir+'/cosmos-checks.json',JSON.stringify({results,errors},null,2));assert.deepEqual(errors,[]);console.log('Cosmic sprites and three environment transitions passed.');
