import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { UPGRADES } from '../app/mutations.mjs';
const { chromium, webkit } = createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out = 'design/owned-adaptations-ui-2026-09-29/implementation';
await mkdir(out, { recursive: true });
const results = [];
const counts = [3,4,2,3,2,3,2,1,2,2,3,2,1,2];
const fixtures = {
  full: UPGRADES.flatMap((u,i) => Array(counts[i]).fill(u.id)),
  empty: [], few: ['speed','speed','shield'], max: UPGRADES.flatMap(u => Array(u.max).fill(u.id)),
};
for (const [name, type, options] of [['chrome',chromium,{channel:'msedge'}], ['webkit',webkit,{}]]) {
  const browser = await type.launch({headless:true,...options});
  try {
    for (const [device,width,height,port,locale] of [
      ['iphone',390,844,5210,'es-ES'], ['iphone-safe',390,844,5210,'es-ES'], ['small-phone',375,667,5210,'es-ES'],
      ['pc',1280,800,5211,'es-ES'], ['ipad',1194,834,5210,'en-US'],
      ['ipad-portrait',834,1194,5210,'es-ES'],
    ]) {
      const page = await browser.newPage({viewport:{width,height},locale,reducedMotion:'reduce'});
      const errors=[]; page.on('pageerror',error => errors.push(String(error)));
      const artRequests=[];page.on('request',request=>{if(request.url().includes('/ui/owned-adaptations/'))artRequests.push(request.url());});
      const buildPort = process.env.VORO_QA_BUILD ? (port===5210?5212:5213) : port;
      await page.goto(`http://127.0.0.1:${buildPort}/?ui=final&lab=cosmos`);
      await page.waitForFunction(() => window.__voroLab?.assetsReady);
      assert.deepEqual(artRequests,[],'Collection textures must not load during gameplay');
      await page.addStyleTag({content:'.cosmic-lab{display:none!important}'});
      if(device==='iphone-safe')await page.addStyleTag({content:'.owned-adaptations{--owned-safe-top:47px!important;--owned-safe-bottom:34px!important}'});
      for (const [fixture,mutations] of Object.entries(fixtures)) {
        await page.evaluate(mutations => {
          const g=window.__voroLab; g.startTest(0,20,false,true,false);
          g.progress.mutations=mutations; g.progress.level=mutations.length;g.paused=true;g.publish();
        },mutations);
        const entry=page.locator('.pause-panel button').last();
        await entry.click();
        await page.locator('.owned-adaptations').waitFor();
        const ownedIds=[...new Set(mutations)];
        assert.equal(await page.locator('.owned-capsule').count(),ownedIds.length);
        assert.deepEqual(await page.locator('.owned-capsule').evaluateAll(els=>els.map(e=>e.dataset.ownedId)), UPGRADES.filter(u=>ownedIds.includes(u.id)).map(u=>u.id));
        assert.ok(await page.evaluate(()=>window.__voroLab.settingsOpen&&window.__voroLab.paused));
        const before=await page.evaluate(()=>JSON.stringify(window.__voroLab.progress));
        if (mutations.includes('shield')) {
          await page.locator('[data-owned-id="shield"]').click();
          assert.match(await page.locator('.owned-detail').innerText(),/40 s/);
          assert.match(await page.locator('.owned-detail').innerText(),/×1 · M/);
        }
        if (fixture==='full') {
          await page.locator('.owned-scroll').evaluate(e=>e.scrollTop=0);
          // Wait for browser image decoding before visual comparison.
          await page.evaluate(async()=>Promise.all(['/ui/owned-adaptations/organisms.png','/ui/owned-adaptations/background.png'].map(src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>i.decode().then(resolve);i.onerror=reject;i.src=src;}))));
          await page.screenshot({path:`${out}/${name}-${device}${process.env.VORO_QA_BUILD?'-build':''}.png`});
        }
        const layout=await page.evaluate(()=>{
          const root=document.querySelector('.owned-adaptations'),scroll=document.querySelector('.owned-scroll');
          const footer=document.querySelector('.owned-return').getBoundingClientRect();
          const clipped=[...root.querySelectorAll('.owned-name')].filter(e=>e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1).map(e=>e.textContent);
          return {rootOverflow:root.scrollWidth>root.clientWidth,rootBox:root.getBoundingClientRect().toJSON(),scroll:scroll.scrollHeight>scroll.clientHeight+2,footerBottom:footer.bottom,clipped};
        });
        assert.equal(layout.rootOverflow,false);assert.deepEqual(layout.clipped,[]);assert.ok(layout.footerBottom<=height);
        assert.ok(Math.abs(layout.rootBox.x)<1);assert.ok(Math.abs(layout.rootBox.y)<1);assert.ok(Math.abs(layout.rootBox.width-width)<1);assert.ok(Math.abs(layout.rootBox.height-height)<1);
        if(fixture==='full'&&device.startsWith('iphone'))assert.equal(layout.scroll,false,'All 14 types should fit the approved portrait size, including safe areas');
        assert.equal(await page.evaluate(()=>JSON.stringify(window.__voroLab.progress)),before,'Collection must not mutate the run');
        if (fixture==='few') await page.keyboard.press('Escape'); else await page.locator('.owned-return').click();
        await page.locator('.owned-adaptations').waitFor({state:'detached'});
        assert.ok(await page.evaluate(()=>window.__voroLab.paused&&!window.__voroLab.settingsOpen));
        await page.waitForFunction(()=>document.activeElement===document.querySelector('.pause-panel button:last-child'));
        results.push({name,device,fixture,...layout});
      }
      await page.locator('.pause-panel button').first().click();
      assert.equal(await page.evaluate(()=>window.__voroLab.paused),false);
      assert.deepEqual(errors,[]);
      await page.close();
    }
  } finally { await browser.close(); }
}
await writeFile(`${out}/report${process.env.VORO_QA_BUILD?'-build':''}.json`,JSON.stringify(results,null,2));
console.log(`Passed ${results.length} browser/device/save scenarios.`);
