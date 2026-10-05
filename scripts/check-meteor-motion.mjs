import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out=process.env.VORO_METEOR_QA_OUT||'design/tester-feedback-2026-10-05/tall-fences-fast-meteors';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext({viewport:{width:900,height:740}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5235/@fs/C:/Users/dmkra/Documents/Codex%20Apps/Voro-camera/design/tester-feedback-2026-10-05/index.html');
 await page.waitForFunction(()=>window.preview?.assetsReady);
 await page.evaluate(()=>{
  const g=window.preview;g.world.entities=[];g.world.stream=()=>{};g.world.replenish=()=>{};g.world.move=()=>{};
  g.life.invulnerable=999;g.world.meteorField.clock=0;g.world.meteorField.rng=()=>.42;
  window.qaVideo=[];window.qaRecorder=new MediaRecorder(g.canvas.captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:1800000});
  window.qaRecorder.ondataavailable=e=>window.qaVideo.push(e.data);window.qaRecorder.start();
 });
 await page.waitForFunction(()=>window.preview.world.projectiles.some(b=>b.meteor&&b.warning===0));
 const before=await page.evaluate(()=>{const g=window.preview,b=g.world.projectiles.find(b=>b.meteor&&b.warning===0);window.testMeteor=b;return{x:b.x,y:b.y,time:g.life.elapsed,zoom:g.zoom,speed:Math.hypot(b.vx,b.vy)};});
 await page.waitForTimeout(180);
 const after=await page.evaluate(()=>{const g=window.preview,b=window.testMeteor;return{x:b.x,y:b.y,time:g.life.elapsed};});
 const distance=Math.hypot(after.x-before.x,after.y-before.y)*before.zoom;
 const expected=before.speed*(after.time-before.time)*before.zoom;
 assert.ok(distance>5&&Math.abs(distance-expected)<1,`meteor movement ${distance}, expected ${expected}`);
 await page.waitForTimeout(2200);await page.click('[data-stage="4"]');await page.waitForFunction(()=>window.preview.assetsReady);
 await page.waitForTimeout(1700);await page.screenshot({path:out+'/city-tall.png'});
 await page.evaluate(async()=>{
  const {cityBarriers}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/city-barriers.mjs');
  const g=window.preview;let b;
  for(let y=0;y<8&&!b;y++)for(let x=0;x<8&&!b;x++)b=cityBarriers(x,y,g.world.seed).find(b=>b.vertical);
  g.life.x=b.x+100;g.life.y=b.y+b.h/2;g.camera.x=g.life.x;g.camera.y=g.life.y;
  g.world.stream(g.life.x,g.life.y,g.life.elapsed,true,3);g.food=g.world.entities;
 });await page.waitForTimeout(700);await page.screenshot({path:out+'/city-second-direction.png'});
 const video=await page.evaluate(()=>new Promise(resolve=>{window.qaRecorder.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(new Blob(window.qaVideo,{type:'video/webm'}));};window.qaRecorder.stop();}));
 await writeFile(out+'/motion.webm',Buffer.from(video.split(',')[1],'base64'));await page.close();await context.close();
 const result={errors,movementScreenUnits:distance,simulationSeconds:after.time-before.time,video:'motion.webm'};
 await writeFile(out+'/browser-motion.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));assert.equal(errors.length,0);
}finally{await browser.close();}
