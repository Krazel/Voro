import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {RELEASE} from '../app/release.mjs';
const {chromium,webkit}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out=`design/audio-journal-${RELEASE.version}`;await mkdir(out,{recursive:true});const results=[];
for(const [name,type,options] of [['edge',chromium,{channel:'msedge'}],['webkit',webkit,{}]]){
 const browser=await type.launch({headless:true,...options});
 try{
  for(const [device,width,height,locale] of [['iphone',390,844,'es-ES'],['ipad',1194,834,'en-US']]){
   const page=await browser.newPage({viewport:{width,height},locale,acceptDownloads:true,reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',e=>errors.push(String(e)));
   await page.addInitScript(()=>Object.defineProperty(navigator,'canShare',{value:()=>false,configurable:true}));
   await page.goto('http://127.0.0.1:5239/?ui=final&lab=cosmos');
   await page.waitForFunction(()=>window.__voroLab?.audioJournal?.current.samples.length>0);
   await page.evaluate(()=>{const g=window.__voroLab;g.startTest(0,20,false,true,false);g.publish();});
   await page.getByRole('button',{name:/Ocultar pruebas|Hide tests/}).click();
   const nativeGate=await page.evaluate(()=>{
    const g=window.__voroLab;g.setNativeAudioActive(false);
    const stopped=!g.effectsAudible()&&g.audioFocus===false&&g.paused&&(!g.music||g.music.decks.every(d=>d.audio.paused));
    g.restoreForegroundAudio();const blocked=g.audioFocus===false;
    g.setNativeAudioActive(true);const pauseRetained=g.paused;g.action('pause');
    return {stopped,blocked,pauseRetained};
   });
   assert.deepEqual(nativeGate,{stopped:true,blocked:true,pauseRetained:true});
   await page.getByRole('button',{name:locale==='es-ES'?'Configuración':'Settings',exact:true}).first().click();
   const panel=page.locator('.audio-diagnostics');await panel.scrollIntoViewIfNeeded();
   await panel.locator('select').selectOption('silent');
   await page.screenshot({path:out+'/'+name+'-'+device+'.png'});
   const box=await panel.boundingBox();assert.ok(box&&box.x>=0&&box.x+box.width<=width);
   const download=page.waitForEvent('download');await panel.getByRole('button').click();const file=await download;
   assert.equal(file.suggestedFilename(),'Voro-diagnostico-audio.txt');
   const report=JSON.parse(await readFile(await file.path(),'utf8'));
   await writeFile(out+'/'+name+'-'+device+'-report.json',JSON.stringify(report,null,2));
   assert.equal(report.format,'voro-audio-journal-v1');assert.ok(report.current.samples.length>0);
   assert.equal(report.current.events.at(-1).detail.observation,'silent');
   const audioContextAvailable=await page.evaluate(()=>typeof AudioContext==='function');
   assert.ok(report.current.events.some(e=>e.kind===(audioContextAvailable?'audio-created':'audio-init-error')));
   const originalStart=report.current.startedAt;
   await page.reload();await page.waitForFunction(()=>window.__voroLab?.audioJournal);
   const previous=await page.evaluate(()=>window.__voroLab.audioJournal.previous);
   assert.equal(previous.startedAt,originalStart);assert.deepEqual(errors,[]);
   results.push({browser:name,device,locale,errors,audioContextAvailable,nativeGate,bytes:JSON.stringify(report).length,samples:report.current.samples.length,events:report.current.events.length,previousRetained:true,box});
   await page.close();
  }
 }finally{await browser.close();}
}
await writeFile(out+'/browser-check.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
