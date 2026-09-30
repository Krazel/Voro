import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/pond-auto-camera-2026-09-30',base=process.env.VORO_QA_URL||'http://127.0.0.1:5226';
await mkdir(out,{recursive:true});
await writeFile(out+'/probe.html','<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;background:#102c29}canvas{display:block}</style><canvas></canvas>');
const files=base+'/@fs/'+process.cwd().replaceAll('\\','/')+'/';
const baseline=execFileSync('git',['show','3136c88:app/world-ground.mjs'],{encoding:'utf8'})
 .replaceAll("'./coast-preview.mjs'",JSON.stringify(files+'app/coast-preview.mjs'))
 .replaceAll("'./city-layout.mjs'",JSON.stringify(files+'app/city-layout.mjs'));
const browser=await chromium.launch({channel:'msedge',headless:true});
const results=[];
try{
 for(const viewport of [{width:390,height:844},{width:1194,height:834}]){
  const page=await browser.newPage({viewport,deviceScaleFactor:1.5});
  await page.goto(files+out+'/probe.html');
  for(const label of ['before','after']){
   const measured=await page.evaluate(async({label,baseline,base,files,viewport})=>{
    const {WorldGround}=await import(label==='before'?'data:text/javascript;base64,'+btoa(baseline):files+'app/world-ground.mjs');
    const {gameplayZoom}=await import(files+'app/camera.mjs');
    const {stageStartMass}=await import(files+'app/journey-data.mjs');
    const {radiusForMass}=await import(files+'app/simulation.mjs');
    const texture=new Image();texture.src=base+'/backgrounds/'+(label==='before'?'pond-variants.webp':'pond-variants-lossless.png');await texture.decode();
    const canvas=document.querySelector('canvas');canvas.width=viewport.width*1.5;canvas.height=viewport.height*1.5;canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';
    const c=canvas.getContext('2d');c.setTransform(1.5,0,0,1.5,0,0);
    const ground=new WorldGround(),radius=radiusForMass(stageStartMass(1)),zoom=gameplayZoom(radius,radius);
    const begin=performance.now();ground.prepare(texture,'pond');const prepareMs=performance.now()-begin;
    const cached=[],rebuilt=[];
    for(let i=0;i<240;i++){
     const prior=ground.redraws,start=performance.now();
     ground.draw(c,texture,'pond',{x:-1234+i*.5,y:-1777},zoom,viewport.height,834,0,false,viewport.width);
     (ground.redraws===prior?cached:rebuilt).push(performance.now()-start);
    }
    const stats=a=>{a.sort((a,b)=>a-b);return {n:a.length,p50:a[Math.floor(a.length*.5)]??null,p95:a[Math.floor(a.length*.95)]??null};};
    ground.draw(c,texture,'pond',{x:-1234,y:-1777},zoom,viewport.height,834,0,false,viewport.width);
    return {label,viewport,zoom,prepareMs,source:{w:texture.width,h:texture.height},textureBytes:ground.prepare(texture,'pond').reduce((n,p)=>n+p.width*p.height*4,0),surfaceBytes:ground.surface.width*ground.surface.height*4,cached:stats(cached),rebuilt:stats(rebuilt),note:'Desktop Chromium CPU submissions, not physical iPhone FPS or GPU timings.'};
   },{label,baseline,base,files,viewport});
   await page.screenshot({path:out+'/'+label+'-'+viewport.width+'.png'});results.push(measured);
  }
  await page.close();
 }
}finally{await browser.close();}
await writeFile(out+'/comparison.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
