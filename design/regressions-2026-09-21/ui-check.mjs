import {chromium} from 'file:///C:/Users/dmkra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs';
const b=await chromium.launch({channel:'chrome',headless:true});const results=[];
try{for(const locale of ['es-ES','en-US']){
 const c=await b.newContext({viewport:{width:390,height:844},locale,reducedMotion:'reduce'});const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/*engine.ts*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('this.registerTools();','window.__qaEngine=this; this.registerTools();')});});
 await p.goto('http://127.0.0.1:5196/');await p.waitForFunction(()=>window.__qaEngine?.assetsReady);
 await p.getByRole('button',{name:locale==='es-ES'?'Despertar':'Awaken',exact:true}).click();await p.waitForTimeout(600);
 await p.evaluate(()=>{__qaEngine.birth=0;__qaEngine.life.invulnerable=100;__qaEngine.action('pause');});
 await p.locator('.approved-pause').waitFor();await p.screenshot({path:`design/regressions-2026-09-21/pause-${locale}.png`});
 const frozen=await p.evaluate(()=>({mass:__qaEngine.life.biomass,stage:__qaEngine.progress.stage,mutations:JSON.stringify(__qaEngine.progress.mutations)}));
 const select=await p.locator('.approved-pause h2').evaluate(n=>getComputedStyle(n).userSelect);assert.equal(select,'none');
 await p.getByRole('button',{name:locale==='es-ES'?'Volver al menú':'Back to menu',exact:true}).click();
 await p.getByRole('button',{name:locale==='es-ES'?'Continuar partida':'Continue game',exact:true}).waitFor();
 const saved=await p.evaluate(()=>({mass:__qaEngine.life.biomass,stage:__qaEngine.progress.stage,mutations:JSON.stringify(__qaEngine.progress.mutations)}));assert.deepEqual(saved,frozen);
 await p.getByRole('button',{name:locale==='es-ES'?'Continuar partida':'Continue game',exact:true}).click();assert.equal(await p.evaluate(()=>__qaEngine.started),true);
 results.push({locale,errors,progressPreserved:true,selectionDisabled:select==='none'});assert.deepEqual(errors,[]);await c.close();
}}finally{await b.close();}fs.writeFileSync('design/regressions-2026-09-21/ui.json',JSON.stringify(results,null,2));console.log(results);
