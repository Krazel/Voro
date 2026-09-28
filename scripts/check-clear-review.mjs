import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/asset-improvements-2026-09-28';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1360,height:1000}});
 const url='http://127.0.0.1:5211/@fs/C:/Users/dmkra/Documents/Codex%20Apps/Voro-camera/'+out+'/review.html';
 await page.goto(url,{waitUntil:'networkidle'});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 const loaded=await page.evaluate(async()=>{const imgs=[...document.images];for(const im of imgs)im.loading='eager';await Promise.all(imgs.map(im=>im.decode()));return imgs.filter(im=>im.naturalWidth===640).length;});
 assert.equal(loaded,96);assert.equal(await page.locator('article').count(),48);
 await page.locator('#stage').selectOption({label:'Charca'});assert.equal(await page.locator('article:visible').count(),5);
 await page.locator('#stage').selectOption('');
 await page.evaluate(()=>{document.querySelector('header').style.display='none';document.querySelector('nav').style.display='none';for(const a of document.querySelectorAll('article'))a.style.display=/^(10\.|64\.|110\.|161\.)/.test(a.querySelector('h2').textContent)?'':'none';});
 await page.screenshot({path:out+'/comparison-examples.png',fullPage:true});
 assert.deepEqual(errors,[]);await writeFile(out+'/review-verification.json',JSON.stringify({url,cases:48,loadedImages:96,charcaFilter:5,errors},null,2));
 console.log({cases:48,loadedImages:96,errors});
}finally{await browser.close();}
