import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {JourneyWorld} from '../app/journey-world.mjs';
const phase=process.argv[2]||'after',out=`design/orbit-reverse-fade-2026-09-23/${phase}`;
await mkdir(out,{recursive:true});
const world=new JourneyWorld(453,[],5),regions=[];const start=performance.now();
for(let y=-5;y<5;y++)for(let x=-5;x<5;x++)regions.push(world.generate(x,y,0).entities.map(e=>({id:e.id,kind:e.kind,x:e.x,y:e.y,r:e.r,requiredMass:e.requiredMass})));
await writeFile(`${out}/population.json`,JSON.stringify({milliseconds:performance.now()-start,regions},null,2));
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},locale:'es-ES'});
 await page.goto('http://127.0.0.1:5208/?ui=final',{waitUntil:'networkidle'});
 await page.evaluate(async()=>{const url=performance.getEntriesByType('resource').map(e=>e.name).find(u=>u.includes('/app/engine.ts'));const{VoroEngine}=await import(url),init=VoroEngine.prototype.initAudio;VoroEngine.prototype.initAudio=function(){window.g=this;return init.call(this)};window.F=await import(new URL('universe-finale.mjs',url));});
 await page.getByRole('button',{name:'Despertar',exact:true}).click();
 await page.evaluate(()=>{window.g.progress.seed=453;window.g.startTest(5,2,false,true,false)});
 await page.waitForTimeout(1500);
 const capture=async name=>{const data=await page.evaluate(()=>window.g.canvas.toDataURL());const bytes=Buffer.from(data.split(',')[1],'base64');await writeFile(`${out}/${name}.png`,bytes);return createHash('sha256').update(bytes).digest('hex')};
 await page.evaluate(()=>{const g=window.g;cancelAnimationFrame(g.raf);g.paused=false;g.time=50;g.life.elapsed=10;g.render()});await capture('orbit');
 await page.evaluate(()=>window.g.startTest(9,230,false,true,false));await page.waitForTimeout(1800);
 await page.evaluate(()=>{const g=window.g;cancelAnimationFrame(g.raf);g.progress.offer=[];g.paused=false;g.testEvolution=true;g.time=50;g.render();g.beginUniverseFinale()});
 const hashes={};
 for(const t of [8,9,10,11,12,12.6,12.9,13,18,19,20,23,27,30.5]){
  await page.evaluate(t=>{const g=window.g;g.time=50+t;g.ending=window.F.FINALE_SECONDS-t;g.render()},t);
  hashes[t]=await capture(`finale-${t}`);
 }
 await writeFile(`${out}/hashes.json`,JSON.stringify(hashes,null,2));
 if(phase==='after'){
  const data=await page.evaluate(async()=>{
   const g=window.g,stream=g.canvas.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3000000}),chunks=[];
   rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};const done=new Promise(r=>rec.onstop=r);rec.start();const begin=performance.now();
   await new Promise(resolve=>{const frame=now=>{const t=(now-begin)/1000;g.time=50+t;g.ending=Math.max(.001,window.F.FINALE_SECONDS-t);g.render();if(t<31)requestAnimationFrame(frame);else resolve()};requestAnimationFrame(frame)});
   rec.stop();await done;stream.getTracks().forEach(t=>t.stop());const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);
  });await writeFile(`${out}/sequence.webm`,Buffer.from(data,'base64'));
 }
}finally{await browser.close()}
