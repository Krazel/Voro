import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire('C:/Users/dmkra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright');
const out='design/journey-spiral-2026-09-23';
const browser=await chromium.launch({channel:'msedge',headless:true});
const reports=[];
try {for(const [width,height,lang,pc] of [[390,844,'es',false],[375,667,'en',false],[1194,834,'es',false],[1280,800,'en',true]]){
 const errors=[];
 const p=await browser.newPage({viewport:{width,height},locale:lang==='es'?'es-ES':'en-US',
   ...(width===1194?{userAgent:'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'}:{})});
 p.on('pageerror',e=>errors.push(String(e)));
 await p.goto(`http://127.0.0.1:${pc?5206:5208}/?ui=final`,{waitUntil:'networkidle'});
 await p.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').map(e=>e.name).find(u=>u.includes('/app/engine.ts'));
  const {VoroEngine}=await import(url),original=VoroEngine.prototype.initAudio;
  VoroEngine.prototype.initAudio=function(){window.g=this;return original.call(this);};
 });
 await p.getByRole('button',{name:lang==='es'?'Despertar':'Awaken',exact:true}).click();
 await p.waitForFunction(()=>window.g?.started);
 await p.locator('.header-actions').getByRole('button',{name:lang==='es'?'Configuración':'Settings',exact:true}).click();
 const privacy=p.getByRole('link',{name:lang==='es'?'Política de privacidad':'Privacy policy',exact:true});
 await privacy.waitFor();await p.waitForTimeout(450);
 const bounds=await privacy.boundingBox();assert.ok(bounds.y>=0&&bounds.y+bounds.height<=height+1);assert.ok(bounds.height>=44);
 const development=await p.locator('.settings-development-access').boundingBox();
 assert.ok(!development || bounds.x+bounds.width<=development.x || bounds.y+bounds.height<=development.y || bounds.x>=development.x+development.width,'Privacy must not overlap development control');
 assert.equal(await privacy.getAttribute('href'),'https://krazel.github.io/voro-abisal/privacy/');
 await p.screenshot({path:`${out}/settings-${width}-${lang}.png`});
 if(width===390){const popupPromise=p.waitForEvent('popup');await privacy.click();const popup=await popupPromise;await popup.waitForLoadState('domcontentloaded');assert.match(await popup.title(),/Privacy/);await popup.close();}
 await p.locator('.approved-settings > .living-primary').click();
 await p.evaluate(()=>{
  const g=window.g;cancelAnimationFrame(g.raf);g.progress.completed=true;g.progress.stage=9;g.ending=0;g.progress.offer=[];g.birth=0;
  g.progress.totalEaten=2345;g.life.eaten=0;g.progress.totalTime=4680;g.life.elapsed=0;g.progress.level=47;g.publish();g.render();
 });
 assert.equal(await p.locator('.journey-complete-dialog').count(),0,'Journey must never auto-open');
 await p.locator('.universe-survivor-control').click();
 await p.locator('.journey-complete-dialog').waitFor();
 assert.equal(await p.locator('.journey-complete-dialog').evaluate(e=>e.scrollTop),0,'Opening must show title, without autofocus scrolling to actions');
 await p.waitForFunction(()=>[...document.images].every(x=>x.complete));await p.waitForTimeout(700);
 assert.equal(await p.locator('.journey-spiral-map li').count(),10);
 assert.match(await p.locator('.journey-complete-stats').innerText(),/2[,.]?345/);
 await p.screenshot({path:`${out}/journey-${width}-${lang}.png`});
 if(width===390){await p.locator('.journey-complete-dialog').evaluate(e=>{e.style.height='1000px';});await p.screenshot({path:`${out}/journey-portrait-full.png`,fullPage:true});await p.locator('.journey-complete-dialog').evaluate(e=>e.style.height='');}
 await p.locator('.journey-rebirth-control').click();
 if(width===375)await p.screenshot({path:`${out}/journey-small-confirm.png`});
 await p.locator('.journey-reset-confirm').waitFor();
 assert.equal(await p.evaluate(()=>window.g.progress.completed),true,'Opening reset confirmation preserves completed run');
 await p.locator('.journey-reset-confirm').getByRole('button',{name:lang==='es'?'Cancelar':'Cancel',exact:true}).click();
 assert.equal(await p.evaluate(()=>window.g.progress.completed),true);
 await p.locator('.journey-silence-control').click();
 await p.locator('.journey-complete-dialog').waitFor({state:'detached'});
 assert.equal(await p.evaluate(()=>window.g.progress.completed),true);
 await p.locator('.universe-survivor-control').click();await p.locator('.journey-rebirth-control').click();
 await p.locator('.journey-reset-confirm').getByRole('button',{name:lang==='es'?'Sí, volver a nacer':'Yes, be born again',exact:true}).click();
 assert.equal(await p.evaluate(()=>window.g.progress.completed),false);
 assert.equal(await p.evaluate(()=>window.g.progress.stage),0);
 assert.deepEqual(errors,[]);
 reports.push({width,height,lang,pc,privacyBounds:bounds,manual:true,cancelPreserved:true,silencePreserved:true,confirmedRestart:true,errors});
 await p.close();
}}finally{await browser.close();}
await writeFile(`${out}/checks.json`,JSON.stringify(reports,null,2));console.log('Privacy and completed journey: 4 layouts, EN/ES, manual entry, cancel, silence, confirmed restart passed.');



