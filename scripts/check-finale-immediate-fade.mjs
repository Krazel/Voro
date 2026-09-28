import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/finale-immediate-fade-2026-09-28';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},locale:'es-ES'}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:5211/?ui=final&lab=cosmos');
 await page.waitForFunction(()=>window.__voroLab?.assetsReady);
 await page.evaluate(()=>{const g=window.__voroLab;g.startTest(9,230,false,true,false);});
 await page.waitForFunction(()=>window.__voroLab.assetsReady);
 await page.evaluate(()=>{const g=window.__voroLab;cancelAnimationFrame(g.raf);g.testEvolution=true;g.render();g.beginUniverseFinale();});
 const frames=[];
 for(const elapsed of [8,8.1,8.6,9.2,10,11.6,13,18,25]) {
  const data=await page.evaluate(elapsed=>{const g=window.__voroLab;g.ending=31-elapsed;g.render();return g.canvas.toDataURL();},elapsed);
  await writeFile(`${out}/at-${elapsed}.png`,Buffer.from(data.split(',')[1],'base64'));frames.push(elapsed);
 }
 assert.deepEqual(errors,[]);
 await writeFile(`${out}/browser-check.json`,JSON.stringify({frames,errors,passed:true},null,2));
 console.log(JSON.stringify({frames,errors,passed:true}));
}finally{await browser.close();}
