import { chromium } from 'file:///C:/Users/dmkra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {newJourney,journeyLife,saveJourney,refreshOffer} from '../../app/journey-progress.mjs';
import {JourneyWorld} from '../../app/journey-world.mjs';
import {UPGRADES,journeyAdaptation} from '../../app/mutations.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.VORO_PREVIEW_URL || 'http://127.0.0.1:5191/';
const dir='design/camera-2026-09-19/integration'; fs.mkdirSync(dir,{recursive:true});
const progress = newJourney(6); progress.xp=12;refreshOffer(progress);
const saved=(p)=>saveJourney(p,journeyLife(p),new JourneyWorld(p.seed),false);
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[], results=[];
const context=await browser.newContext({viewport:{width:430,height:932},deviceScaleFactor:1,recordVideo:{dir:'work/adaptation-2026-09-19/videos',size:{width:430,height:932}}});
await context.addInitScript(value=>{if(location.protocol==='http:')localStorage.setItem('voro-journey-v1',value)},saved(progress));
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
await page.goto(base);
async function openOffer(p=progress){
 await page.evaluate(value=>{if(location.protocol==='http:')localStorage.setItem('voro-journey-v1',value)},saved(p));
 await page.reload();
 await page.getByRole('button',{name:'Continuar partida'}).click();
 await page.locator('.adaptation-bubble').first().waitFor();
}
await openOffer();
const bubbles=page.locator('.adaptation-bubble');
assert.equal(await bubbles.count(),3);
assert.equal(await page.getByRole('button',{name:/omitir|renovar|otras opciones|cambio utilizado/i}).count(),0);
await page.screenshot({path:dir+'/arrival.png'});
await page.waitForTimeout(1400);
await page.screenshot({path:dir+'/mobile-430.png'});
const before=await bubbles.first().evaluate(el=>getComputedStyle(el).transform);
await page.waitForTimeout(1700);
const after=await bubbles.first().evaluate(el=>getComputedStyle(el).transform);
assert.notEqual(before,after);
results.push({check:'entry and continuous motion',before,after,passed:true});
await page.keyboard.press('Escape');
await page.mouse.click(8,8);
assert.equal(await bubbles.count(),3);
results.push({check:'no skip on Escape or outside click',passed:true});
await page.waitForTimeout(1800);
for(let i=0;i<3;i++){
 if(i) await openOffer();
 await page.waitForTimeout(900);
 const id=await bubbles.nth(i).getAttribute('data-upgrade');
 if(i===1){await bubbles.nth(i).focus();await page.keyboard.press('Enter');}
 else {const r=await bubbles.nth(i).boundingBox();await page.mouse.click(r.x+r.width/2,r.y+r.height/2);}
 await page.waitForTimeout(400);
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('voro-journey-v1')));
 assert.equal(state.progress.level,1);assert.deepEqual(state.progress.mutations,[id]);
 assert.equal(await bubbles.count(),0);
 results.push({check:'choice '+i,id,input:i===1?'keyboard':'pointer',passed:true});
 await page.waitForTimeout(900);
}
const video=page.video(); await context.close();await video.saveAs(dir+'/adaptation-selection.webm');
const qa=await browser.newPage({viewport:{width:390,height:844},storageState:{cookies:[],origins:[{origin:new URL(base).origin,localStorage:[{name:'voro-journey-v1',value:saved(progress)}]}]}});qa.on('pageerror',e=>errors.push(e.message));
await qa.goto(base);
await qa.evaluate(value=>{if(location.protocol==='http:')localStorage.setItem('voro-journey-v1',value)},saved(progress));await qa.reload();
await qa.getByRole('button',{name:'Continuar partida'}).click();await qa.locator('.adaptation-bubble').first().waitFor();
const original=await qa.locator('.adaptation-bubble').evaluateAll(els=>els.map(e=>e.dataset.upgrade));
await qa.reload();await qa.getByRole('button',{name:'Continuar partida'}).click();await qa.locator('.adaptation-bubble').first().waitFor();
assert.deepEqual(await qa.locator('.adaptation-bubble').evaluateAll(els=>els.map(e=>e.dataset.upgrade)),original);
results.push({check:'reload preserves three choices',original,passed:true});
for(const [width,height] of [[320,568],[390,844],[768,1024],[932,430]]){
 await qa.setViewportSize({width,height});await qa.waitForTimeout(1000);
 await qa.screenshot({path:dir+`/viewport-${width}x${height}.png`});
 const layout=await qa.locator('.adaptation-bubble').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,scroll:el.scrollHeight,client:el.clientHeight};}));
 assert.equal(layout.length,3);assert.ok(layout.every(r=>r.x>=0&&r.x+r.w<=width));
 for(const el of await qa.locator('.adaptation-bubble').all()){await el.evaluate(node=>node.scrollIntoView({block:"nearest"}));assert.ok(await el.isVisible());}
 results.push({check:`layout ${width}x${height}`,layout,passed:true});
}
await qa.setViewportSize({width:390,height:844});await qa.emulateMedia({reducedMotion:'reduce'});await qa.waitForTimeout(200);
const animations=await qa.locator('.adaptation-constellation').evaluate(el=>el.getAnimations({subtree:true}).length);
assert.equal(animations,0);results.push({check:'reduced motion',animations,passed:true});
for(const remaining of [1,2]){
 const p=newJourney(8);p.mutations=UPGRADES.flatMap((u,i)=>Array(u.max-(i<remaining?1:0)).fill(u.id));p.level=p.mutations.length;p.xp=journeyAdaptation(p.level);refreshOffer(p);
 await qa.goto('about:blank');
 await qa.addInitScript(value=>{if(location.protocol==='http:')localStorage.setItem('voro-journey-v1',value)},saved(p));
 await qa.goto(base);await qa.getByRole('button',{name:'Continuar partida'}).click();await qa.locator('.adaptation-bubble').first().waitFor();
 assert.equal(await qa.locator('.adaptation-bubble').count(),3);
 const id=await qa.locator('.adaptation-bubble').last().getAttribute('data-upgrade');await qa.locator('.adaptation-bubble').last().click();
 const state=await qa.evaluate(()=>JSON.parse(localStorage.getItem('voro-journey-v1')));assert.equal(state.progress.level,p.level+1);assert.equal(state.progress.mutations.filter(x=>x===id).length,UPGRADES.find(u=>u.id===id).max);
 results.push({check:`final ${remaining} types fill three capped choices`,passed:true});
}
assert.deepEqual(errors,[]);
fs.writeFileSync(dir+'/browser-checks.json',JSON.stringify({date:new Date().toISOString(),browser:await browser.version(),platform:'web Chromium; not a native iOS build',results,errors},null,2));
await browser.close();console.log(JSON.stringify({checks:results.length,errors,video:dir+'/adaptation-selection.webm'}));
