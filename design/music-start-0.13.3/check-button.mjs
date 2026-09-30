import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const reports=[];
try {
  const page=await browser.newPage({viewport:{width:390,height:844},locale:'es-ES',reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(String(error)));
  await page.goto('http://127.0.0.1:5239/?lab=cosmos');
  await page.waitForFunction(()=>window.__voroLab?.assetsReady);
  await page.evaluate(()=>{const g=window.__voroLab;g.progress.stage=3;g.saved=true;g.save();});
  for(const input of ['pointer','keyboard']) {
    await page.reload();await page.waitForFunction(()=>window.__voroLab?.assetsReady);
    await page.addStyleTag({content:'.cosmic-lab{display:none!important}'});
    await page.evaluate(()=>{const g=window.__voroLab;window.__startAudio=[];const init=g.initAudio.bind(g);g.initAudio=(...args)=>{window.__startAudio.push({started:g.started,stage:g.progress.stage});return init(...args);};});
    const button=page.locator('[data-voro-action="start"]');
    assert.match(await button.innerText(),/Continuar partida/);
    if(input==='pointer') {
      await button.click({trial:true}); const box=await button.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
      await page.mouse.down();await page.waitForTimeout(150);
      const beforeClick=await page.evaluate(()=>window.__startAudio);
      assert.equal(beforeClick.length,0,'Touch-down must not initialize menu audio');
      await page.mouse.up();
    } else {await button.focus();await page.keyboard.press('Enter');}
    await page.waitForFunction(()=>window.__voroLab?.music?.current?.id==='water');
    const report=await page.evaluate(()=>({calls:window.__startAudio,track:window.__voroLab.music.current.id,started:window.__voroLab.started,stage:window.__voroLab.progress.stage}));
    assert.ok(report.calls.length>0);assert.ok(report.calls.every(call=>call.started&&call.stage===3));
    assert.equal(report.track,'water');reports.push({input,...report});
  }
  assert.deepEqual(errors,[]);
  await writeFile(new URL('./button-verification.json',import.meta.url),JSON.stringify({browser:'Edge',physicalDevice:false,errors,reports},null,2));
  console.log(JSON.stringify(reports));
} finally {await browser.close();}
