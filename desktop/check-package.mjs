import { createRequire } from 'node:module';
import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import assert from 'node:assert/strict';
const runtime = process.env.VORO_PLAYWRIGHT_RUNTIME;
if (!runtime) throw new Error('Set VORO_PLAYWRIGHT_RUNTIME to a package.json with Playwright installed');
const { _electron } = createRequire(runtime)('playwright');
const release = JSON.parse(await readFile('desktop/release.json','utf8'));
const base = resolve(`artifact/windows/${release.gameVersion}-preview.${release.preview}`);
const executablePath = resolve(base, 'VORO-win32-x64/VORO.exe');
const evidence = resolve(`design/windows-preview-${release.preview}-2026-09-22`);
await mkdir(evidence, { recursive: true });
const profile = resolve('work/windows-package', `qa-profile-${Date.now()}`);
const errors = [], failed = [], remoteRequests = [];
const result = { executablePath, profile, errors, failed, remoteRequests };
let app;
async function launch() {
  app = await _electron.launch({ executablePath, args: ['--lang=es'], env: { ...process.env, VORO_QA_PROFILE: profile }, timeout: 60000 });
  const page = await app.firstWindow();
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { if(message.type()==='error') console.log('Renderer:',message.text()); });
  page.on('response', response => { if (response.status() >= 400) failed.push({url:response.url(),status:response.status()}); });
  page.on('request', request => { if (/^https?:/.test(request.url())) remoteRequests.push(request.url()); });
  await page.waitForLoadState('domcontentloaded');
  await app.evaluate(({ BrowserWindow }) => { const win=BrowserWindow.getAllWindows()[0];win.show();win.focus(); });
  try { await page.waitForSelector('.viewport'); } catch(error) { console.log(await page.content()); throw error; }
  return page;
}
try {
  let page = await launch();
  result.runtime = await app.evaluate(({app}) => ({version:app.getVersion(),electron:process.versions.electron,chrome:process.versions.chrome}));
  result.origin = await page.evaluate(()=>location.origin);
  assert.equal(result.origin, 'voro://game');
  await page.evaluate(()=>localStorage.setItem('voro-language-v1','es'));
  await page.reload();
  await page.getByRole('button',{name:'Configuración',exact:true}).click();
  await page.screenshot({path:resolve(evidence,'settings.png')});
  await page.reload();
  await page.getByRole('button',{name:'Despertar',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.viewport')?.dataset.event==='play',{},{timeout:30000});
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(2000);await page.keyboard.up('ArrowRight');
  await page.keyboard.press('Space');
  await page.waitForTimeout(1000);
  await page.screenshot({path:resolve(evidence,'gameplay.png')});
  result.runtime.gpu = await app.evaluate(async ({app})=>{await app.getGPUInfo('complete');return app.getGPUFeatureStatus();});
  await app.evaluate(({BrowserWindow})=>{const c=BrowserWindow.getAllWindows()[0].webContents;c.sendInputEvent({type:'keyDown',keyCode:'F11'});c.sendInputEvent({type:'keyUp',keyCode:'F11'});});
  await page.waitForTimeout(300);
  assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isFullScreen()),true);
  await app.evaluate(({BrowserWindow})=>{const c=BrowserWindow.getAllWindows()[0].webContents;c.sendInputEvent({type:'keyDown',keyCode:'F11'});c.sendInputEvent({type:'keyUp',keyCode:'F11'});});
  await page.waitForTimeout(300);
  assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isFullScreen()),false);
  await page.keyboard.press('Escape');
  result.fullscreen = true;
  const files = (await readdir(resolve('pc-dist'),{recursive:true,withFileTypes:true})).filter(f=>f.isFile()).map(f=>relative(resolve('pc-dist'),resolve(f.parentPath,f.name)).replaceAll('\\','/'));
  result.assets = await page.evaluate(async files => {
    let count=0, bytes=0;
    for(const file of files) {
      const response=await fetch('/'+file);
      if(!response.ok)throw new Error(`${file}: ${response.status}`);
      bytes+=(await response.arrayBuffer()).byteLength;count++;
    }
    return {count,bytes};
  },files);
  const wav = files.find(file=>file.endsWith('.wav'));
  result.audio = await page.evaluate(async wav => {
    const context = new AudioContext();await context.resume();
    const buffer=await context.decodeAudioData(await (await fetch('/'+wav)).arrayBuffer());
    const source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);source.start();
    const info={state:context.state,duration:buffer.duration,channels:buffer.numberOfChannels,sampleRate:buffer.sampleRate};
    await new Promise(r=>source.onended=r);await context.close();return info;
  },wav);
  assert.equal(result.audio.state,'running');
  const saved=await page.evaluate(()=>localStorage.getItem('voro-pc-demo-journey-v1'));
  assert.ok(saved,'Run must have been saved');
  await app.close();app=null;
  page=await launch();
  assert.equal(await page.evaluate(()=>localStorage.getItem('voro-pc-demo-journey-v1')),saved);
  assert.equal(await page.evaluate(()=>localStorage.getItem('voro-language-v1')),'es');
  await page.getByRole('button',{name:/Continuar|Reanudar|Despertar/}).first().waitFor();
  result.saveSurvivesRestart=true;
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(remoteRequests,[]);
  result.success=true;
} catch(error) {result.success=false;result.failure=String(error);throw error;}
finally {if(app)await app.close();await writeFile(resolve(evidence,'check.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));}
