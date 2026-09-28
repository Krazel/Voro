import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const label=process.argv[2]||'after',out='design/quality-pacing-2026-09-28';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const result={label,browser:'Edge PC; phone viewport is not physical iOS',scenes:[],errors:[]};
try {
 const page=await browser.newPage({viewport:{width:1440,height:900},locale:'es-ES'});
 page.on('pageerror',e=>result.errors.push(String(e)));
 await page.goto('http://127.0.0.1:5211/?ui=final&lab=cosmos',{waitUntil:'networkidle'});
 const saved=await page.evaluate(()=>localStorage.getItem('voro-pc-demo-journey-v1'));
 for(const [stage,id] of [[0,'giant'],[0,'spiny'],[0,'hunter'],[6,'planets-Nube protoplanetaria'],[7,'stars-Agujero negro estelar'],[8,'galaxies-1']]) {
  await page.evaluate(async({stage,id})=>{
   const {SPECIES_BY_ID}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/journey-data.mjs');
   const {journeyEntity}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/journey-world.mjs');
   const {sizeRange}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/entity-sizes.mjs');
   const g=window.__voroLab;g.startTest(stage,2,false,true,false);g.setDiagnostics(true);
   g.progress.xp=-1e9;g.life.invulnerable=1e9;g.life.x=g.life.y=0;g.camera={x:0,y:0};
   g.world.stream=()=>{};g.world.replenish=()=>{};g.world.move=()=>{};
   const s=SPECIES_BY_ID[id],r=sizeRange(s).max;
   const e=journeyEntity(s,stage===0?180:0,stage===0?-100:0,0,'quality-specimen');e.r=r;
   e.requiredMass=1e9;e.seed=0;e.heading=0;g.world.entities=[e];g.food=[e];
   g.pointer=null;g.padInput={x:0,y:0};g.keys.clear();g.birth=0;g.testQualitySpecimen={id,r};
  },{stage,id});
  await page.waitForFunction(()=>window.__voroLab.assetsReady);await page.waitForTimeout(1800);
  await page.evaluate(()=>window.__voroLab.frameMonitor.reset());await page.waitForTimeout(2600);
  const measured=await page.evaluate(async()=>{const g=window.__voroLab;const {ANIMATIONS}=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/animation-catalog.mjs');return {...g.testQualitySpecimen,zoom:g.zoom,pixelRatio:g.pixelRatio,canvas:{w:g.canvas.width,h:g.canvas.height},frames:g.frameMonitor.summary(true),sheets:g.animationSheets.stats(),profile:ANIMATIONS[g.testQualitySpecimen.id]};});
  assert.ok(measured.frames.frames>60);assert.ok(measured.sheets.bytes<=measured.sheets.limit);
  await page.evaluate(()=>{const g=window.__voroLab;g.paused=true;g.time=1.91;g.render();});
  await page.screenshot({path:`${out}/${label}-${id.replaceAll(/[^a-z0-9-]/gi,'_')}.png`});
  result.scenes.push(measured);
  if(id==='giant') {
   // Canvas capture is native 60Hz; count actual recorder frames separately later.
   const video=await page.evaluate(async()=>{const g=window.__voroLab;g.paused=false;
    const stream=g.canvas.captureStream(60),chunks=[];
    const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:8000000});
    const ended=new Promise(r=>recorder.onstop=r);recorder.ondataavailable=e=>chunks.push(e.data);recorder.start();
    await new Promise(r=>setTimeout(r,5000));recorder.stop();await ended;stream.getTracks().forEach(t=>t.stop());
    return [...new Uint8Array(await new Blob(chunks).arrayBuffer())];});
   await writeFile(`${out}/${label}-micro.webm`,Buffer.from(video));
  }
  assert.equal(await page.evaluate(()=>localStorage.getItem('voro-pc-demo-journey-v1')),saved);
 }
 assert.equal(result.errors.length,0,result.errors.join('\n'));
 await writeFile(`${out}/${label}.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result.scenes.map(s=>({id:s.id,r:s.r,zoom:s.zoom,fps:s.frames.fps,cpu:s.frames.cpu,mb:s.sheets.bytes/1048576}))));
}finally{await browser.close();}
