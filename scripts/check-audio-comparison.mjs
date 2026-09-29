import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium,webkit}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/audio-comparison-0.13';await mkdir(out,{recursive:true});const results=[];
for(const [name,type,options] of [['edge',chromium,{channel:'msedge'}],['webkit',webkit,{}]]){
 const browser=await type.launch({headless:true,...options});
 try{for(const [device,width,height,locale] of [['iphone',390,844,'es-ES'],['ipad',1194,834,'en-US']]){
  const page=await browser.newPage({viewport:{width,height},locale,acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(()=>Object.defineProperty(navigator,'canShare',{value:()=>false,configurable:true}));
  await page.goto('http://127.0.0.1:5239/?ui=final&lab=cosmos');await page.waitForFunction(()=>window.__voroLab);
  await page.evaluate(()=>{const g=window.__voroLab;g.startTest(0,20,false,true,false);g.publish();});
  await page.getByRole('button',{name:/Ocultar pruebas|Hide tests/}).click();
  await page.getByRole('button',{name:/Mostrar pruebas|Show tests/}).evaluate(el=>el.parentElement.style.display='none');
  await page.getByRole('button',{name:locale==='es-ES'?'Configuración':'Settings',exact:true}).first().click();
  const panel=page.locator('.audio-diagnostics'),ab=page.locator('.audio-comparison');
  const hasContext=await page.evaluate(()=>typeof AudioContext==='function');
  let report;
  if(hasContext){
   const a=ab.getByRole('button',{name:locale==='es-ES'?'Escuchar A':'Listen to A',exact:true});await a.waitFor();
   await page.waitForFunction(()=>window.__voroLab.audioComparison?.buffer);
   await a.click();await page.waitForFunction(()=>window.__voroLab.audioComparison.phase==='playing');
   assert.equal(await page.evaluate(()=>window.__voroLab.music.decks.every(d=>d.audio.paused)),true);
   await ab.locator('select').selectOption('crackle');
   await page.waitForFunction(()=>window.__voroLab.audioComparison.phase==='complete',null,{timeout:16000});
   await ab.getByRole('button',{name:locale==='es-ES'?'Escuchar B':'Listen to B',exact:true}).click();
   await page.waitForFunction(()=>window.__voroLab.audioComparison.phase==='playing');await ab.locator('select').selectOption('good');
   const bState=await page.evaluate(()=>{const c=window.__voroLab.audioComparison;return{route:c.route,streamPaused:c.audio.paused,buffer:!!c.node};});
   assert.deepEqual(bState,{route:'B',streamPaused:true,buffer:true});
   await ab.getByRole('button',{name:locale==='es-ES'?'Parar prueba':'Stop test',exact:true}).click();
   await a.click();await page.waitForFunction(()=>window.__voroLab.audioComparison.phase==='playing');
   await page.evaluate(()=>window.__voroLab.setNativeAudioActive(false));
   assert.equal(await page.evaluate(()=>window.__voroLab.audioComparison.audio.paused),true);
   await page.evaluate(()=>window.__voroLab.setNativeAudioActive(true));
   assert.equal(await page.evaluate(()=>window.__voroLab.audioComparison.audio.paused),true);
  }
  await panel.scrollIntoViewIfNeeded();await panel.screenshot({path:`${out}/${name}-${device}.png`});
  const box=await ab.boundingBox();assert.ok(box&&box.x>=0&&box.x+box.width<=width);
  const download=page.waitForEvent('download');
  await panel.getByRole('button',{name:locale==='es-ES'?'Compartir diagnóstico de audio':'Share audio diagnostics',exact:true}).click();
  const file=await download;report=JSON.parse(await readFile(await file.path(),'utf8'));
  if(hasContext){assert.deepEqual(report.current.comparison.trials.slice(0,2).map(t=>t.heard),['crackle','good']);assert.equal(report.current.comparison.trials[2].status,'focus-lost');}
  assert.equal(report.current.metadata.version,'0.13');assert.deepEqual(errors,[]);
  await writeFile(`${out}/${name}-${device}-report.json`,JSON.stringify(report,null,2));
  await page.reload();await page.waitForFunction(()=>window.__voroLab?.audioJournal);
  if(hasContext)assert.deepEqual(await page.evaluate(()=>window.__voroLab.audioJournal.previous.comparison.trials.slice(0,2).map(t=>t.heard)),['crackle','good']);
  results.push({browser:name,device,locale,hasContext,errors,box,export:true,observationsAreSimulated:true});await page.close();
 }}finally{await browser.close();}
}
await writeFile(out+'/browser-check.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
