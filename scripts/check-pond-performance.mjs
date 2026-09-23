import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const label=process.argv[2]||'after',out='design/pond-camera-audio-2026-09-23';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const results=[];
try {for(const viewport of [{width:390,height:844},{width:1194,height:834}]){
 const page=await browser.newPage({viewport,locale:'es-ES'});
 await page.goto('http://127.0.0.1:5206/',{waitUntil:'networkidle'});
 await page.evaluate(async label=>{const url=performance.getEntriesByType('resource').map(e=>e.name).find(u=>u.includes('/app/engine.ts'));
  const {VoroEngine}=await import(url),init=VoroEngine.prototype.initAudio;VoroEngine.prototype.initAudio=function(){window.g=this;return init.call(this);};
  const data=await import(new URL('journey-data.mjs',url));window.qaData=data;
  window.qaRadius=(await import(new URL('simulation.mjs',url))).radiusForMass;
  if(label==='baseline'){
   const moduleURL=name=>performance.getEntriesByType('resource').map(e=>e.name).find(u=>u.includes('/app/'+name))||new URL(name,url).href;
   (await import(moduleURL('population.mjs'))).POPULATION_PLANS.pond.slots=[7,5,1];
   const W=(await import(moduleURL('journey-world.mjs'))).JourneyWorld,move=W.prototype.move;
   W.prototype.move=function(dt,time,p,stats,trail,view){return move.call(this,dt,time,p,stats,trail,this.stage===1?null:view);};
  }
 },label);
 await page.getByRole('button',{name:'Despertar',exact:true}).click();
 const update=await page.evaluate(()=>{window.qaUpdate=window.g.update.bind(window.g);return true;});
 for(const [stage,mass] of [[1,.45],[1,120],[2,8]]){
  await page.evaluate(({stage,mass,label})=>{const g=window.g;g.progress.seed=1834;g.startTest(stage,mass,false,true,false);g.progress.offer=[];g.input=()=>({x:.7,y:.7});g.diagnosticsEnabled=true;
   const radius=window.qaRadius(mass),scale=24/g.cameraEntryRadius,n=radius*scale;
   const oldZoom=(n<=34?1.12:Math.max(.74,1.12*(34/n)**.24))*scale;
   if(label==='baseline')g.zoom=oldZoom;
   g.update=dt=>{g.progress.xp=0;g.progress.offer=[];window.qaUpdate(dt);g.life.biomass=mass;g.life.radius=radius;if(label==='baseline')g.zoom=oldZoom;};
  },{stage,mass,label});
  await page.waitForTimeout(3500);
  await page.evaluate(()=>window.g.frameMonitor.reset());await page.waitForTimeout(6000);
  results.push(await page.evaluate(({stage,mass,viewport})=>{const g=window.g,ss=g.frameMonitor.samples,cpu=ss.map(s=>s.cpu).sort((a,b)=>a-b),cad=ss.map(s=>s.interval).sort((a,b)=>a-b);
   return {stage,mass,viewport,frames:ss.length,cpuP50:cpu[Math.floor(cpu.length*.5)],cpuP95:cpu[Math.floor(cpu.length*.95)],intervalP95:cad[Math.floor(cad.length*.95)],slow:cad.filter(t=>t>33.34).length,entities:g.world.entities.length,zoom:g.zoom,screenRadius:g.life.radius*g.zoom};},{stage,mass,viewport}));
  if(stage===1)await page.screenshot({path:`${out}/pond-${label}-${viewport.width}-${mass}.png`});
 }
 await page.close();
}}finally{await browser.close();}
await writeFile(`${out}/performance-${label}.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results));
