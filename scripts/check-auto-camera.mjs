import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/pond-auto-camera-2026-09-30';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});const results=[];
try{
 for(const ui of ['final','development']){
  const page=await browser.newPage({viewport:{width:390,height:844},locale:'es-ES'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5226/?ui='+ui+'&lab=cosmos');
  await page.waitForFunction(()=>!!window.__voroLab);
  await page.evaluate(()=>{const g=window.__voroLab;g.sound=false;g.startTest(1,.45,false,true,false);g.progress.offer=[];g.birth=0;g.transition=0;});
  await page.waitForFunction(()=>window.__voroLab.assetsReady);
  await page.waitForFunction(()=>{window.__voroLab.render();return window.__voroLab.backgroundStatus().prepared;});
  const measured=await page.evaluate(()=>{
   const g=window.__voroLab,before=g.zoom;
   // Browser-dispatched synthetic pointers cannot be captured; compare wheel
   // here and use real engine event fixtures for multi-pointer regression.
   g.canvas.dispatchEvent(new WheelEvent('wheel',{deltaY:-120,ctrlKey:true,bubbles:true,cancelable:true}));
   return {before,after:g.zoom,factor:g.zoomFactor,background:g.backgroundStatus()};
  });
  assert.equal(measured.before,measured.after);assert.equal(measured.factor,1);
  await page.screenshot({path:out+'/game-'+ui+'.png'});
  await page.getByRole('button',{name:'Configuración',exact:true}).first().click();
  assert.equal(await page.locator('#camera-zoom,.zoom-controls,.camera-details').count(),0);
  await page.screenshot({path:out+'/settings-'+ui+'.png'});
  assert.deepEqual(errors,[]);results.push({ui,...measured,manualZoomControls:0,errors});
  await page.close();
 }
}finally{await browser.close();}
await writeFile(out+'/browser.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
