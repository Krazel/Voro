import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const p=await browser.newPage({viewport:{width:390,height:844},locale:'es-ES'});
 await p.goto('http://127.0.0.1:5208/',{waitUntil:'networkidle'});
 await p.evaluate(async()=>{const url=performance.getEntriesByType('resource').map(e=>e.name).find(u=>u.includes('/app/engine.ts'));const {VoroEngine}=await import(url),init=VoroEngine.prototype.initAudio;VoroEngine.prototype.initAudio=function(){window.g=this;return init.call(this);};window.F=await import(new URL('universe-finale.mjs',url));});
 await p.getByRole('button',{name:'Despertar',exact:true}).click();
 await p.evaluate(()=>window.g.startTest(9,200,false,true,false));await p.waitForTimeout(2500);
 const data=await p.evaluate(async()=>{
  const g=window.g;cancelAnimationFrame(g.raf);g.paused=false;g.progress.offer=[];g.testEvolution=true;
  g.life.biomass=230;g.beginUniverseFinale();
  const stream=g.canvas.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3000000}),chunks=[];
  rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};const done=new Promise(r=>rec.onstop=r);rec.start();const start=performance.now(),base=g.time;
  await new Promise(resolve=>{const frame=now=>{const elapsed=(now-start)/1000;g.time=base+elapsed;g.ending=Math.max(.0001,window.F.FINALE_SECONDS-elapsed);g.render();if(elapsed<25.5)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
  rec.stop();await done;stream.getTracks().forEach(t=>t.stop());
  const b=new Uint8Array(await new Blob(chunks).arrayBuffer());let s='';for(let i=0;i<b.length;i+=8192)s+=String.fromCharCode(...b.subarray(i,i+8192));return btoa(s);
 });
 await writeFile('design/pond-camera-audio-2026-09-23/final-reveal.webm',Buffer.from(data,'base64'));
}finally{await browser.close();}
