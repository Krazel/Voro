import {chromium} from 'file:///C:/Users/dmkra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try {
 for(const locale of ['en-US','es-ES','es-MX','fr-FR']) {
  const context=await browser.newContext({viewport:{width:390,height:844},locale,reducedMotion:'reduce'});
  const p=await context.newPage();p.setDefaultTimeout(10000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*engine.ts*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('this.registerTools();','window.__qaEngine=this; this.registerTools();')});});
  await p.goto('http://127.0.0.1:5196/');
  await p.waitForFunction(()=>window.__qaEngine?.assetsReady);
  const language=locale.startsWith('es')?'es':'en';
  assert.equal(await p.locator('html').getAttribute('lang'),language);
  const awaken=language==='es'?'Despertar':'Awaken';assert.equal(await p.getByRole('button',{name:awaken,exact:true}).count(),1);
  if(locale==='en-US') {
   await p.getByRole('button',{name:'Settings',exact:true}).first().click();
   await p.screenshot({path:'design/localization-2026-09-20/en-settings.png'});
   await p.locator('#voro-language').selectOption('es');
   assert.equal(await p.locator('html').getAttribute('lang'),'es');
   await p.reload();await p.waitForFunction(()=>window.__qaEngine?.assetsReady);
   assert.equal(await p.locator('html').getAttribute('lang'),'es');
   await p.getByRole('button',{name:'Configuración',exact:true}).first().click();
   await p.locator('#voro-language').selectOption('auto');
   assert.equal(await p.locator('html').getAttribute('lang'),'en');
   await p.getByRole('button',{name:'Journey',exact:true}).click();
   const journey=await p.locator('.final-journey').innerText();assert.match(journey,/Microscope/i);assert.match(journey,/Universe/i);
   await p.screenshot({path:'design/localization-2026-09-20/en-journey.png'});
   await p.getByRole('button',{name:'Back',exact:true}).click();
   await p.getByRole('button',{name:'Credits',exact:true}).click();assert.match(await p.locator('.credits-panel').innerText(),/A game by/);
   await p.getByRole('button',{name:'Back',exact:true}).click();
   await p.getByRole('button',{name:'Back to game',exact:true}).last().click();
   await p.evaluate(()=>{const e=window.__qaEngine;e.startTest(0,2,false,true,true);e.world.move=()=>{};e.progress.offer=['reach','digest','tentacles'];e.publish();});
   await p.locator('.adaptation-bubble').first().waitFor();
   assert.match(await p.locator('.adaptation-constellation').innerText(),/Long pseudopods/i);
   assert.equal(await p.locator('.adaptation-membrane circle').count(),0);
   const colors=await p.locator('.adaptation-position').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).color));assert.equal(colors[0],colors[1]);assert.notEqual(colors[1],colors[2]);
   await p.screenshot({path:'design/localization-2026-09-20/en-adaptations.png'});
   const before=await p.evaluate(()=>JSON.stringify({mutations:__qaEngine.progress.mutations,mass:__qaEngine.life.biomass,stage:__qaEngine.progress.stage,offer:__qaEngine.progress.offer}));
   await p.evaluate(()=>{localStorage.setItem('voro-language-v1','es');window.dispatchEvent(new StorageEvent('storage',{key:'voro-language-v1',newValue:'es'}));});
   await p.getByText('Pseudópodos largos',{exact:true}).waitFor();
   const after=await p.evaluate(()=>JSON.stringify({mutations:__qaEngine.progress.mutations,mass:__qaEngine.life.biomass,stage:__qaEngine.progress.stage,offer:__qaEngine.progress.offer}));assert.equal(after,before);
   await p.screenshot({path:'design/localization-2026-09-20/es-adaptations.png'});
   const box=await p.locator('.adaptation-bubble').first().boundingBox();await p.mouse.click(box.x+box.width/2,box.y+box.height/2);
   await p.waitForFunction(()=>window.__qaEngine.progress.offer.length===0);
   await p.evaluate(()=>{localStorage.setItem('voro-language-v1','en');window.dispatchEvent(new StorageEvent('storage',{key:'voro-language-v1',newValue:'en'}));__qaEngine.life.dead=true;__qaEngine.publish();});
   await p.getByText('Life persists.',{exact:true}).waitFor();await p.screenshot({path:'design/localization-2026-09-20/en-death.png'});
   await p.evaluate(()=>{__qaEngine.startTest(9,230,false,true,true);__qaEngine.beginUniverseFinale();__qaEngine.update(17);});
   await p.waitForTimeout(300);await p.screenshot({path:'design/localization-2026-09-20/en-finale.png'});
  }
  results.push({locale,automatic:language,errors});assert.deepEqual(errors,[]);await context.close();
 }
 fs.writeFileSync('design/localization-2026-09-20/browser.json',JSON.stringify(results,null,2));console.log(results);
} finally {await browser.close();}

