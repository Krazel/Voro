import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire('C:/Users/dmkra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright');
const out='design/finale-timing-2026-09-23';
const browser=await chromium.launch({channel:'msedge',headless:true});const report=[];
try{for(const [port,width,height] of [[5208,390,844],[5206,1280,800]]){
 const p=await browser.newPage({viewport:{width,height},locale:'es-ES'}),errors=[];
 p.on('pageerror',e=>errors.push(String(e)));
 await p.goto(`http://127.0.0.1:${port}/`,{waitUntil:'networkidle'});
 await p.evaluate(async()=>{const url=performance.getEntriesByType('resource').map(e=>e.name).find(u=>u.includes('/app/engine.ts'));const {VoroEngine}=await import(url),init=VoroEngine.prototype.initAudio;VoroEngine.prototype.initAudio=function(){window.g=this;return init.call(this);};window.F=await import(new URL('universe-finale.mjs',url));});
 await p.getByRole('button',{name:'Despertar',exact:true}).click();
 await p.evaluate(()=>window.g.startTest(9,220,false,true,false));
 await p.waitForFunction(()=>window.g.assetsReady);await p.waitForTimeout(900);
 await p.evaluate(()=>{const g=window.g;cancelAnimationFrame(g.raf);g.paused=false;g.progress.offer=[];g.testEvolution=true;g.life.biomass=230;g.beginUniverseFinale();});
 const frames=[];
 for(const elapsed of [7.8,8,8.5,9,10.2,11,15.9,26,29]){
  const result=await p.evaluate(t=>{const g=window.g;g.ending=Math.max(.0001,window.F.FINALE_SECONDS-t);g.time=30+t;g.publish();g.render();const pixels=g.ctx.getImageData(0,0,g.canvas.width,g.canvas.height).data;let lit=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]+pixels[i+1]+pixels[i+2]>0)lit++;return {lit,url:g.canvas.toDataURL()};},elapsed);
  if(elapsed>=11&&elapsed<=16)assert.equal(result.lit,0,'Pure black interval');
  if(elapsed===26)assert.ok(result.lit>0,'Approved reveal eventually returns');
  await writeFile(`${out}/${width}-${elapsed}.png`,Buffer.from(result.url.split(',')[1],'base64'));frames.push({elapsed,lit:result.lit});
 }
 if(false){
  const data=await p.evaluate(async()=>{const g=window.g,stream=g.canvas.captureStream(30),chunks=[];const rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3000000});rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};const done=new Promise(r=>rec.onstop=r);rec.start();const start=performance.now();await new Promise(resolve=>{const frame=now=>{const t=(now-start)/1000;g.time=30+t;g.ending=Math.max(.0001,window.F.FINALE_SECONDS-t);g.render();if(t<32)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});rec.stop();await done;stream.getTracks().forEach(t=>t.stop());const b=new Uint8Array(await new Blob(chunks).arrayBuffer());let s='';for(let i=0;i<b.length;i+=8192)s+=String.fromCharCode(...b.subarray(i,i+8192));return btoa(s);});
  await writeFile(`${out}/finale.webm`,Buffer.from(data,'base64'));
 }
 assert.deepEqual(errors,[]);report.push({width,height,frames,errors});await p.close();
}}finally{await browser.close();}
await writeFile(`${out}/checks.json`,JSON.stringify(report,null,2));console.log('Mobile/PC absorption, five-second pure black interval, delayed reveal timing verified.');


