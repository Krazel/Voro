import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const root='design/asset-audit-2026-09-28';
const url='http://127.0.0.1:5211/@fs/C:/Users/dmkra/Documents/Codex%20Apps/Voro-camera/'+root+'/review.html';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1360,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(url,{waitUntil:'networkidle'});
 assert.equal(await page.locator('article:visible').count(),48);
 await page.locator('#severity').selectOption('');assert.equal(await page.locator('article:visible').count(),168);
 await page.locator('#stage').selectOption('Microscopio');assert.equal(await page.locator('article:visible').count(),16);
  await page.getByLabel('Seleccionar 10',{exact:true}).check();assert.match(await page.locator('#selection').inputValue(),/10\. Protista espinoso/);
  await page.getByLabel('Seleccionar 10',{exact:true}).uncheck();
 await page.locator('#stage').selectOption('');
 // Inspect all files, not only the first lazily decoded screenful.
 const broken=await page.evaluate(async()=>{const imgs=[...document.images];return (await Promise.all(imgs.map(async im=>{try{im.loading="eager";await im.decode();return null;}catch{return im.src;}}))).filter(Boolean);});assert.deepEqual(broken,[]);
 await page.evaluate(()=>{document.querySelectorAll('header,nav,textarea').forEach(e=>e.remove());document.querySelectorAll('article').forEach(a=>{const n=Number(a.querySelector('input').dataset.name.split('.')[0]);a.hidden=false;a.style.display=[10,37,64,161].includes(n)?'':'none';});});
 await page.locator('main').screenshot({path:root+'/ejemplos.png'});
 assert.deepEqual(errors,[]);await writeFile(root+'/verification.json',JSON.stringify({total:168,clear:48,micro:16,selectionWorks:true,broken,errors,url},null,2));console.log('168 cards load; filters and selection verified');
}finally{await browser.close();}
