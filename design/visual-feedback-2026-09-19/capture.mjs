import { chromium } from 'file:///C:/Users/dmkra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const mode=process.argv[2]||'before'; const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:430,height:932},deviceScaleFactor:3,isMobile:true,hasTouch:true});
await page.goto('http://127.0.0.1:5191/');
await page.evaluate(async()=>{const {VoroEngine}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/engine.ts');document.body.innerHTML='<canvas style="width:430px;height:932px"></canvas>';window.g=new VoroEngine(document.querySelector('canvas'),()=>{});});
const report=[];
for(const stage of [0,1,3,4,5]){
 const result=await page.evaluate(async stage=>{const {stageStartMass}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/journey-data.mjs');g.startTest(stage,stageStartMass(stage),false,true,false);g.paused=true;g.sound=false;g.life.invulnerable=0;g.time=2;for(let i=0;i<60;i++)g.animateMembrane(1/60);await new Promise(resolve=>{const t=setInterval(()=>{if(g.assetsReady){clearInterval(t);resolve()}},50)});g.render();return{stage,radius:g.life.radius,zoom:g.zoom,pixelRatio:g.pixelRatio,width:g.canvas.width,height:g.canvas.height};},stage);
 await page.waitForTimeout(300);await page.screenshot({path:`design/visual-feedback-2026-09-19/${mode}-stage-${stage}.png`});report.push(result);
}
fs.writeFileSync(`design/visual-feedback-2026-09-19/${mode}-render.json`,JSON.stringify(report,null,2));
await browser.close();console.log(report);
