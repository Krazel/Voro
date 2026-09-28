import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage({viewport:{width:780,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:5211/?ui=final&lab=cosmos');
 await page.waitForFunction(()=>window.__voroLab?.assetsReady);
 const before=await page.evaluate(()=>JSON.stringify(window.__voroLab.progress));
 const button=page.getByRole('button',{name:'Probar señuelo',exact:true});
 await button.click();await button.click();
 const granted=await page.evaluate(()=>{
  const g=window.__voroLab;
  const state={test:g.testMode,count:g.progress.mutations.filter(x=>x==='decoy').length,cooldown:g.life.cooldown,offer:g.progress.offer.length};
  g.action('dash');state.visible=!!g.life.decoy&&!!g.decoyImage;
  return state;
 });
 assert.deepEqual(granted,{test:true,count:1,cooldown:0,offer:0,visible:true});
 await page.screenshot({path:'design/organic-decoy-soft-2026-09-28/test-control.png'});
 const restored=await page.evaluate(()=>{const g=window.__voroLab;g.exitTest();g.paused=true;return JSON.stringify(g.progress);});
 assert.equal(restored,before);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({passed:true,granted,campaignRestored:true,errors}));
} finally {await browser.close();}
