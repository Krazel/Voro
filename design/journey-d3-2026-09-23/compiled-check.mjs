import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire('C:/Users/dmkra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true}),reports=[];
try {for(const [width,height,lang] of [[390,844,'es'],[1032,1376,'en'],[1376,1032,'es']]){
 const p=await browser.newPage({viewport:{width,height},locale:lang==='es'?'es-ES':'en-US'});
 const errors=[];p.on('pageerror',e=>errors.push(String(e)));
 await p.goto('http://127.0.0.1:5210/',{waitUntil:'networkidle'});
 assert.equal(await p.locator('.journey-complete-dialog').count(),0);
 await p.locator('.universe-survivor-control').click();
 const dialog=p.locator('.journey-complete-dialog');await dialog.waitFor();
 await p.waitForFunction(()=>[...document.images].every(x=>x.complete&&x.naturalWidth>0));
 const bounds=await dialog.boundingBox();
 assert.equal(bounds.x,0);assert.equal(bounds.y,0);assert.equal(bounds.width,width);assert.equal(bounds.height,height);
 assert.equal(await dialog.evaluate(e=>e.scrollTop),0);
 assert.equal(await p.locator('.journey-horizons li').count(),10);
 const title=await p.locator('.journey-complete-heading h2').boundingBox(),first=await p.locator('.journey-horizons li').first().boundingBox();
 if(width<height)assert.ok(title.y+title.height<=first.y+1,'Title must not overlap the first band');
 await p.screenshot({path:`design/journey-d3-2026-09-23/compiled-${width}-${lang}.png`});
 await p.locator('.journey-rebirth-control').click();
 await p.locator('.journey-reset-confirm').getByRole('button',{name:lang==='es'?'Cancelar':'Cancel',exact:true}).click();
 await p.locator('.journey-silence-control').click();
 assert.equal(await dialog.count(),0);await p.locator('.universe-survivor-control').waitFor();
 assert.deepEqual(errors,[]);reports.push({width,height,lang,bounds,manual:true,cancelAndSilence:true,errors});await p.close();
}}finally{await browser.close();}
await writeFile('design/journey-d3-2026-09-23/compiled-checks.json',JSON.stringify(reports,null,2));
console.log('Compiled mobile bundle: dialog fills viewport, title and actions visible, 10 loaded images, manual entry, cancel and silence passed.');
