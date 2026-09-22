// Functional desktop WebKit test with accelerated measurement clock. Its
// timings are deliberately synthetic and must never be used as device FPS.
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {RELEASE} from '../app/release.mjs';
const req=createRequire(process.env.VORO_CANVAS_RUNTIME || import.meta.url);
const {webkit}=req('playwright');
const browser=await webkit.launch({headless:true});
mkdirSync('design/report-fixes-2026-09-22',{recursive:true});
try {
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'es-ES',acceptDownloads:true});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(()=>{
    const request=window.requestAnimationFrame.bind(window);let real=0,clock=0;
    window.requestAnimationFrame=callback=>request(stamp=>{
      const text=document.querySelector('.automatic-benchmark')?.textContent||'';
      const speed=/Midiendo|Preparando escena/.test(text)?30:1;
      if(real)clock+=(stamp-real)*speed;else clock=stamp;
      real=stamp;callback(clock);
    });
  });
  await page.goto(process.argv[2]||'http://127.0.0.1:5207/',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Configuración',exact:true}).click();
  await page.getByRole('button',{name:'Modo de desarrollo',exact:true}).click();
  await page.getByRole('button',{name:/Probar todos los entornos automáticamente/}).click();
  await page.getByText('Prueba terminada',{exact:true}).waitFor({timeout:180000});
  await page.screenshot({path:'design/report-fixes-2026-09-22/completed-webkit.png'});
  const downloadPromise=page.waitForEvent('download');
  await page.getByRole('button',{name:'Compartir informe como archivo',exact:true}).click();
  const download=await downloadPromise;
  const stream=await download.createReadStream(),parts=[];for await(const part of stream)parts.push(part);
  const data=Buffer.concat(parts),report=JSON.parse(data.toString());
  assert.equal(report.format,'voro-performance-tour-v1');assert.equal(report.results.length,20);
  assert.equal(report.version,RELEASE.version,'Preview must serve the current mobile build');
  assert.ok(report.results.every(x=>x.status==='ok'&&x.report.summary.frames>0));
  assert.equal(errors.length,0,errors.join('\n'));
  assert.ok(report.results.filter(x=>x.id==='galaxies').every(x=>x.report.animationCache.bakeSteps===0),'Galaxies must not bake procedural poses');
  await page.getByRole('button',{name:'Volver',exact:true}).click();
  await page.getByRole('button',{name:'Despertar',exact:true}).waitFor();
  const result={kind:'Desktop WebKit functional test with accelerated rAF clock, NOT performance results',scenarios:report.results.length,
    statuses:report.results.map(x=>({id:x.id,size:x.size,status:x.status})),galaxyPoseBakeSteps:report.results.filter(x=>x.id==='galaxies').map(x=>x.report.animationCache.bakeSteps),fileBytes:data.length,filename:download.suggestedFilename(),campaignRestored:true,errors};
  writeFileSync('design/report-fixes-2026-09-22/browser-smoke.json',JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));
} finally{await browser.close();}
