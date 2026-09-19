import {chromium} from 'file:///C:/Users/dmkra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
await p.goto('http://127.0.0.1:5191/');
await p.evaluate(async()=>{const{VoroEngine}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/engine.ts');document.body.innerHTML='<canvas style="width:390px;height:844px"></canvas>';window.g=new VoroEngine(document.querySelector('canvas'),()=>{});g.startTest(5,6.4,false,true,false);g.progress.cameraEntryRadius=g.life.radius;g.setZoom(1);g.paused=true;g.sound=false;});
await p.waitForTimeout(3000);
const data=await p.evaluate(async()=>{g.setDiagnostics(true);const frames=[];for(let i=0;i<360;i++){await new Promise(requestAnimationFrame);g.time+=1/60;const t=performance.now();g.render();frames.push(performance.now()-t)}frames.sort((a,b)=>a-b);return{mean:frames.reduce((a,b)=>a+b)/frames.length,p95:frames[Math.floor(frames.length*.95)],zoom:g.zoom,r:g.life.radius,entities:g.food.length,pixels:g.canvas.width*g.canvas.height,parts:g.frameMonitor.frameParts,animation:g.animationSheets.stats()};});
console.log(data);fs.writeFileSync('design/visual-feedback-2026-09-19/orbit-render-profile.json',JSON.stringify(data,null,2));await p.screenshot({path:'design/visual-feedback-2026-09-19/orbit-natural-entry.png'});await b.close();

