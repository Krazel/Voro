import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const { chromium, webkit } = createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out = 'design/testflight-0.10.1-build-1';
await mkdir(out, { recursive: true });
const results = [];
for (const [name,type,options] of [['chrome',chromium,{channel:'msedge'}],['webkit',webkit,{}]]) {
  const browser = await type.launch({headless:true,...options});
  try {
    for (const [device,width,height,port,locale] of [['iphone',390,844,5212,'es-ES'],['ipad',1194,834,5212,'en-US'],['pc',1280,800,5213,'es-ES']]) {
      const page = await browser.newPage({viewport:{width,height},locale,reducedMotion:'reduce'});
      const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
      await page.addInitScript(()=>localStorage.setItem('voro-menu-theme-v1','organic'));
      await page.goto(`http://127.0.0.1:${port}/?ui=final&lab=cosmos`);
      await page.waitForFunction(()=>window.__voroLab?.assetsReady);
      await page.addStyleTag({content:'.cosmic-lab{display:none!important}'});
      await page.getByRole('button',{name:/^(Configuración|Settings)$/}).first().click();
      await page.locator('.membrane-settings').waitFor();
      assert.equal(await page.locator('#voro-menu-theme').count(),0);
      assert.equal(await page.locator('.membrane-settings').getAttribute('data-menu-theme'),'inverse');
      const appearance=await page.locator('.voro-settings').evaluate(e=>getComputedStyle(e,'::before').filter);
      assert.match(appearance,/hue-rotate\(28deg\)/);
      assert.equal(await page.locator('.membrane-control-content > *').count(),4);
      await page.screenshot({path:`${out}/${name}-${device}-settings.png`});
      await page.locator('.membrane-links button').last().click();
      assert.equal(await page.locator('.membrane-detail').getAttribute('data-menu-theme'),'inverse');
      await page.keyboard.press('Escape');
      await page.locator('.voro-settings').waitFor({state:'detached'});
      await page.evaluate(()=>{const g=window.__voroLab;g.startTest(0,20,false,true,false);g.progress.mutations=['speed','speed','shield'];g.progress.level=3;g.paused=true;g.publish();});
      await page.locator('.pause-panel').waitFor();
      assert.equal(await page.locator('.pause-panel button').count(),2);
      assert.match(await page.locator('.pause-panel button').first().innerText(),/Continuar|Continue/);
      assert.match(await page.locator('.pause-panel button').last().innerText(),/Tus adaptaciones|Your adaptations/);
      await page.screenshot({path:`${out}/${name}-${device}-pause.png`});
      await page.locator('.pause-panel button').last().click();
      await page.locator('.owned-return').waitFor();
      const button=await page.locator('.owned-return').boundingBox();
      assert.ok(button.height>=44 && button.y+button.height<=height);
      assert.equal(await page.locator('.owned-return svg').count(),1);
      await page.screenshot({path:`${out}/${name}-${device}-collection.png`});
      await page.locator('.owned-return').click();
      await page.locator('.owned-adaptations').waitFor({state:'detached'});
      assert.equal(await page.evaluate(()=>window.__voroLab.paused),true);
      await page.waitForFunction(()=>document.activeElement===document.querySelector('.pause-panel button:last-child'));
      assert.deepEqual(errors,[]);
      results.push({name,device,fixedAppearance:'inverse',pauseButtons:2,returnButton:button,errors});
      await page.close();
    }
  } finally { await browser.close(); }
}
await writeFile(`${out}/menus-report.json`,JSON.stringify(results,null,2));
console.log(`Passed ${results.length} simplified-menu browser/device scenarios.`);
