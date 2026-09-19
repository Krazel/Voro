import {chromium} from 'file:///C:/Users/dmkra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {newJourney,journeyLife,saveJourney} from '../../app/journey-progress.mjs';
const dir='design/cosmic-finale-2026-09-19';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:'work/cosmic-finale-2026-09-19/videos',size:{width:390,height:844}}});
const page=await context.newPage(),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
// Test-only access: freeze nearby food so the HUD is not covered by an adaptation offer.
await page.route('**/app/engine.ts*',async r=>{const response=await r.fetch();const body=(await response.text()).replace('this.canvas = canvas;', 'this.canvas = canvas;globalThis.__qaGame=this;');await r.fulfill({response,body});});
const p=newJourney(63281);p.stage=9;const l=journeyLife(p);l.biomass=220;
const save=saveJourney(p,l,{journal:[]},false);
await page.route('**/fixture-blank',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));
await page.goto('http://127.0.0.1:5191/fixture-blank');
await page.evaluate(save=>localStorage.setItem('voro-journey-v1',save),save);
await page.goto('http://127.0.0.1:5191');await page.getByRole('button',{name:'Continuar partida',exact:true}).waitFor();
await page.evaluate(()=>{const g=globalThis.__qaGame;g.world.entities=[];g.food=[];g.world.stream=()=>{};g.world.move=()=>{};g.world.replenish=()=>{};});
await page.getByRole('button',{name:'Continuar partida',exact:true}).click();
await page.waitForTimeout(3500);
for(const [width,height] of [[320,568],[390,844],[430,932],[844,390],[1440,900]]) {
 await page.setViewportSize({width,height});await page.waitForTimeout(250);
 const result=await page.locator('.biomass-hud').evaluate(el=>({text:el.textContent,rects:[el,...el.querySelectorAll('*')].filter(e=>e.textContent?.trim()).map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width};}),viewport:innerWidth}));
 assert.ok(result.rects.every(r=>r.left>=0&&r.right<=width+.5),JSON.stringify(result));
 checks.push({width,height,...result});await page.screenshot({path:`${dir}/hud-${width}.png`});
}
await page.setViewportSize({width:390,height:844});
// A normal saved campaign, at the final biomass threshold, drives the real React UI.
l.biomass=230;
await page.goto('http://127.0.0.1:5191/fixture-blank');
await page.evaluate(save=>localStorage.setItem('voro-journey-v1',save),saveJourney(p,l,{journal:[]},false));
await page.goto('http://127.0.0.1:5191');await page.getByRole('button',{name:'Continuar partida',exact:true}).waitFor();
await page.evaluate(()=>{const g=globalThis.__qaGame;g.world.entities=[];g.food=[];g.world.stream=()=>{};g.world.move=()=>{};g.world.replenish=()=>{};});
await page.getByRole('button',{name:'Continuar partida',exact:true}).click();
await page.waitForTimeout(10000);await page.screenshot({path:dir+'/final-dark-pause.png'});
await page.waitForTimeout(4000);await page.screenshot({path:dir+'/final-reappearing.png'});
await page.getByRole('button',{name:'VORO permanece solo',exact:false}).waitFor({timeout:20000});
await page.waitForTimeout(1500);await page.screenshot({path:dir+'/final-survivor.png'});
assert.equal(await page.locator('.universe-survivor-control').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
await page.locator('.universe-survivor-control').click();await page.getByRole('button',{name:'Volver al silencio'}).click();
await page.screenshot({path:dir+'/final-return.png'});
await page.reload();await page.waitForTimeout(1500);await page.screenshot({path:dir+'/final-resumed.png'});
assert.ok(await page.locator('.universe-survivor-control').isVisible());
await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForTimeout(1000);await page.screenshot({path:dir+'/final-reduced-motion.png'});
const video=page.video();await context.close();await video.saveAs(dir+'/ui-finale.webm');await browser.close();
fs.writeFileSync(dir+'/ui-checks.json',JSON.stringify({checks,errors},null,2));assert.deepEqual(errors,[]);console.log('HUD at five viewports; finale, details, resume, reduced motion passed.');
