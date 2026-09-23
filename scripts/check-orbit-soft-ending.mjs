import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/orbit-soft-ending-2026-09-23';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true}),reports=[];
const views=process.env.VORO_QA_TABLET_ONLY ? [[5208,1194,834]] : [[5208,390,844],[5208,1194,834],[5206,1280,800]];
try{for(const [port,width,height] of views){
 const page=await browser.newPage({viewport:{width,height},locale:'es-ES',...(width===1194?{userAgent:'Mozilla/5.0 (iPad; CPU OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',hasTouch:true}: {})}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(`http://127.0.0.1:${port}/?ui=final`,{waitUntil:'networkidle'});
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').map(e=>e.name).find(u=>u.includes('/app/engine.ts'));
  const {VoroEngine}=await import(url),init=VoroEngine.prototype.initAudio;
  VoroEngine.prototype.initAudio=function(){window.g=this;return init.call(this);};
  window.F=await import(new URL('universe-finale.mjs',url));
  window.E=await import(new URL('earth-landmark.mjs',url));
 });
 await page.getByRole('button',{name:'Despertar',exact:true}).click();
 await page.evaluate(()=>window.g.startTest(5,120,false,true,false));
 await page.waitForFunction(()=>window.g.atlasImages.earth?.naturalWidth>0);
 await page.waitForTimeout(1000);
 const orbit=await page.evaluate(()=>{
  const g=window.g,e=window.E.ORBITAL_EARTH;cancelAnimationFrame(g.raf);
  g.progress.offer=[];g.paused=false;g.life.x=e.x;g.life.y=e.y-e.radius+140;
  g.camera={x:g.life.x,y:g.life.y};g.life.elapsed=0;g.render();
  return {earth:e,zoom:g.zoom,viewport:[g.width,g.height]};
 });
 const capture=async name=>{const png=await page.evaluate(()=>window.g.canvas.toDataURL());await writeFile(`${out}/${name}-${width}.png`,Buffer.from(png.split(',')[1],'base64'));};
 await capture('orbit-intro');
 await page.evaluate(()=>{window.g.life.elapsed=10;window.g.render();});await capture('orbit-no-header');
 // A fixed-seed comparison uses the actual sprite renderer and size range.
 await page.evaluate(async()=>{
  const g=window.g,url=performance.getEntriesByType('resource').map(e=>e.name).find(u=>u.includes('/app/engine.ts'));
  const {journeyEntity}=await import(new URL('journey-world.mjs',url));
  const {SPECIES_BY_ID:S}=await import(new URL('journey-data.mjs',url));
  g.food=[.55,1,1.8,3.2].map((factor,i)=>({...journeyEntity(S['orbit-2'],g.life.x+(i-1.5)*160,g.life.y+250,i,'qa'+i),r:30*factor}));
  g.zoom=.55;g.render();
 });await capture('satellite-range');
 await page.evaluate(()=>window.g.startTest(9,230,false,true,false));await page.waitForTimeout(1600);
 await page.evaluate(()=>{const g=window.g;cancelAnimationFrame(g.raf);g.progress.offer=[];g.paused=false;g.testEvolution=true;g.render();g.beginUniverseFinale();});
 for(const elapsed of [8,9,10,11,12,12.6,13,18,30.5]){
  await page.evaluate(t=>{const g=window.g;g.ending=window.F.FINALE_SECONDS-t;g.time=50+t;g.render();},elapsed);
  await capture(`finale-${elapsed}`);
 }
 if(width===390){
  const video=await page.evaluate(async()=>{
   const g=window.g,stream=g.canvas.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:2500000}),chunks=[];
   rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};const done=new Promise(r=>rec.onstop=r);
   rec.start();const start=performance.now();
   await new Promise(resolve=>{const frame=now=>{const t=7+(now-start)/1000;g.time=50+t;g.ending=window.F.FINALE_SECONDS-t;g.render();if(t<14)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
   rec.stop();await done;stream.getTracks().forEach(t=>t.stop());const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());
   let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);
  });await writeFile(`${out}/continuous-fade.webm`,Buffer.from(video,'base64'));
 }
 assert.deepEqual(errors,[]);reports.push({width,height,orbit,errors});await page.close();
}}finally{await browser.close();}
await writeFile(`${out}/${process.env.VORO_QA_TABLET_ONLY?'tablet-qa':'web-qa'}.json`,JSON.stringify(reports,null,2));
console.log(JSON.stringify(reports));
