import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium,webkit}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/pause-frame-parity-2026-09-28/'+(process.env.VORO_QA_PHASE||'before');await mkdir(out,{recursive:true});
const results=[];
for(const [engine,type,options]of [['chrome',chromium,{channel:'msedge'}],['webkit',webkit,{}]]) {
 const browser=await type.launch({headless:true,...options});
 try {
  for(const [device,width,height,port]of [['pc',1280,800,process.env.VORO_QA_BUILD?5213:5211],['iphone',390,844,process.env.VORO_QA_BUILD?5212:5210],['ipad-landscape',1194,834,process.env.VORO_QA_BUILD?5212:5210]]) {
   const page=await browser.newPage({viewport:{width,height},locale:'es-ES',reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',e=>errors.push(String(e)));
   await page.goto(`http://127.0.0.1:${port}/?ui=final&lab=cosmos`);
   await page.waitForFunction(()=>window.__voroLab?.assetsReady);
   await page.evaluate(()=>{const g=window.__voroLab;g.startTest(0,20,false,true,false);g.paused=true;g.toast('Has perdido biomasa. Recupera tus fragmentos.',999);g.publish();});
   await page.locator('.pause-panel').waitFor();
   await page.addStyleTag({content:'.cosmic-lab{display:none !important}'});
   if(process.env.VORO_QA_PHASE?.startsWith('after')) await page.waitForFunction(()=>document.querySelectorAll('.membrane-rim[data-ready=true]').length===4);
   await page.screenshot({path:`${out}/${engine}-${device}.png`});
   const controls=await page.evaluate(()=>[...document.querySelectorAll('.pause-panel .membrane-control,.cristal-toast')].map(e=>{
    const s=getComputedStyle(e,'::before'),base=getComputedStyle(e),r=e.getBoundingClientRect();
    const canvas=e.querySelector('canvas'),rim=canvas?getComputedStyle(canvas):s;
    const pixels=canvas?.getContext('2d')?.getImageData(0,0,canvas.width,canvas.height).data;
    return {text:e.textContent,legacyBorder:base.borderColor,pseudoDisplay:s.display,image:s.borderImageSource,slice:s.borderImageSlice,width:s.borderImageWidth,opacity:rim.opacity,animation:rim.animationName,inset:rim.top,painted:!!pixels?.some((v,i)=>i%4===3&&v>0),box:{width:r.width,height:r.height}};
   }));
   if(process.env.VORO_QA_PHASE?.startsWith('after')) {
    assert.equal(controls.length,4);
    for(const control of controls){assert.equal(control.legacyBorder,'rgba(0, 0, 0, 0)');assert.equal(control.pseudoDisplay,'none');assert.ok(control.painted);assert.equal(control.inset,'-4px');assert.ok(control.image.includes('/ui/cristal/membrane-frame.png'));assert.equal(control.opacity,'0.58');assert.equal(control.width,'28px');assert.ok(control.box.height>=64);}
    await page.emulateMedia({reducedMotion:'no-preference'});
    const animation=await page.evaluate(()=>[...document.querySelectorAll('.pause-panel .membrane-rim,.cristal-toast .membrane-rim')].map(e=>getComputedStyle(e).animationName));
    assert.deepEqual(animation,Array(4).fill('cristal-breathe'));
    assert.deepEqual(errors,[]);
   }
   results.push({engine,device,controls,errors});await page.close();
  }
 }finally{await browser.close();}
}
await writeFile(`${out}/report.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results));
