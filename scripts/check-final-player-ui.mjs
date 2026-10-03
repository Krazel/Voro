// QA of our compiled game: normal player actions, no runtime lab hooks.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {newJourney,journeyLife,saveJourney,JOURNEY_SAVE} from '../app/journey-progress.mjs';
import {JourneyWorld} from '../app/journey-world.mjs';
import {journeyAdaptation,UPGRADES} from '../app/mutations.mjs';
const {chromium,webkit}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/final-review-1.0-2026-10-04/ui';await mkdir(out,{recursive:true});
const results=[];
const p=newJourney(834);p.stage=4;p.mutations=UPGRADES.map(u=>u.id);p.level=p.mutations.length;
p.xp=journeyAdaptation(p.level-1);p.totalTime=1800;p.totalEaten=120;p.absorptionsByStage=[30,30,30,30,0,0,0,0,0,0];
const life=journeyLife(p);const saved=saveJourney(p,life,new JourneyWorld(p.seed,[],p.stage),true);
for(const [browserName,type,options] of [['edge',chromium,{channel:'msedge'}],['webkit',webkit,{}]]){
 const browser=await type.launch({headless:true,...options});
 try{for(const [name,width,height,port,locale,save] of [
  ['iphone-new',390,844,5230,'es-ES',false],['iphone-save',390,844,5230,'es-ES',true],
  ['small-phone',375,667,5230,'en-US',true],['ipad-landscape',1194,834,5230,'en-US',true],
  ['ipad-portrait',834,1194,5230,'es-ES',true],['pc',1440,900,5231,'es-ES',true],
 ]){
  const tablet=name.startsWith('ipad'),phone=name.includes('iphone')||name==='small-phone';
  const page=await browser.newPage({viewport:{width,height},locale,reducedMotion:'reduce',hasTouch:tablet||phone,
   ...(tablet?{userAgent:'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'}:phone?{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.7 Mobile/15E148 Safari/604.1'}:{})});
  const errors=[],failed=[];page.on('pageerror',e=>errors.push(String(e)));
  page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))failed.push([r.status(),r.url()]);});
  await page.addInitScript(({saved,key,save})=>{
   localStorage.setItem('voro-ui-mode-v1','development');
   if(save)localStorage.setItem(key,saved);
  },{saved,key:name==='pc'?'voro-pc-demo-journey-v1':JOURNEY_SAVE,save});
  await page.goto(`http://127.0.0.1:${port}/?ui=development&lab=cosmos#/animaciones`);
  const en=locale==='en-US',start=page.locator('[data-voro-action="start"]');await start.waitFor();
  await start.click({timeout:60000});await page.waitForTimeout(3200);
  assert.equal(await page.locator('main').getAttribute('data-ui-mode'),'final');
  assert.equal(await page.evaluate(()=>typeof window.__voroLab),'undefined');
  assert.equal(await page.locator('.cosmic-lab,.settings-development-access,.ui-mode-toggle,.automatic-benchmark').count(),0);
  await page.getByRole('button',{name:en?'Pause':'Pausar',exact:true}).click();
  await page.getByRole('button',{name:en?'Your adaptations':'Tus adaptaciones',exact:true}).click();
  await page.locator('.owned-adaptations').waitFor();
  assert.equal(await page.locator('.owned-capsule').count(),save?UPGRADES.length:0);
  const back=page.locator('.owned-back');
  const bounds=await back.boundingBox();assert.ok(bounds.width>=44&&bounds.height>=44);
  assert.equal(await back.locator('.lucide-arrow-left').count(),1);
  const clipping=await page.locator('.owned-capsule').evaluateAll(nodes=>nodes.flatMap(n=>{
   const a=n.getBoundingClientRect(),b=n.querySelector('.owned-name')?.getBoundingClientRect();
   return b&&(b.left<a.left-2||b.right>a.right+2)?[n.textContent]:[];
  }));assert.deepEqual(clipping,[]);
  await page.screenshot({path:`${out}/${browserName}-${name}-adaptations.png`});
  await back.click();await page.getByRole('button',{name:en?'Continue':'Continuar',exact:true}).click();
  await page.getByRole('button',{name:en?'Settings':'Configuración',exact:true}).click();
  await page.locator('.membrane-heading').waitFor();
  assert.equal(await page.getByRole('button',{name:/development|desarrollo|automática|benchmark|rendimiento/i}).count(),0);
  await page.screenshot({path:`${out}/${browserName}-${name}-settings.png`});
  await page.getByRole('button',{name:en?'Journey':'Recorrido',exact:false}).click();
  await page.locator('.journey-horizons').waitFor();
  // Future stages must remain undisclosed, including in old saves.
  assert.equal(await page.getByText(en?'Galaxies':'Galaxias',{exact:true}).count(),0);
  await page.screenshot({path:`${out}/${browserName}-${name}-journey.png`});
  await page.getByRole('button',{name:en?'Back to settings':'Volver a configuración',exact:true}).click();
  await page.getByRole('button',{name:en?'Credits':'Créditos',exact:false}).click();
  await page.locator('.credits-panel').waitFor();
  await page.getByRole('button',{name:en?'View licenses':'Ver licencias',exact:true}).click();
  assert.ok((await page.locator('.credits-panel').innerText()).includes('Scott Buckley'));
  await page.locator('.membrane-detail .membrane-return').click();
  await page.getByRole('button',{name:en?'Back to game':'Volver al juego',exact:true}).click();
  await page.getByRole('button',{name:en?'Pause':'Pausar',exact:true}).waitFor();
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  results.push({browser:browserName,device:name,width,height,locale,saved:save,passed:true});
  await writeFile(`${out}/result.json`,JSON.stringify({results},null,2));await page.close();
 }}finally{await browser.close();}
}
console.log(JSON.stringify({passed:results.length,results},null,2));
