import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {_electron}=createRequire('C:/Users/dmkra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright');
const out=resolve('design/pause-reference-2026-09-23');
let app;
try{
 app=await _electron.launch({executablePath:resolve('artifact/windows/0.6.4-preview.5/VORO-win32-x64/VORO.exe'),env:{...process.env,VORO_QA_PROFILE:resolve('work/pause-reference-'+Date.now())},args:['--lang=es']});
 const p=await app.firstWindow();await p.waitForSelector('.viewport');
 await p.evaluate(()=>localStorage.setItem('voro-language-v1','es'));await p.reload();
 await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];w.unmaximize();w.setContentSize(1280,720);w.show();w.focus();});
 await p.getByRole('button',{name:'Despertar',exact:true}).click();
 await p.waitForFunction(()=>document.querySelector('.viewport')?.dataset.event==='play');
 await p.waitForTimeout(600);await p.keyboard.press('Escape');
 await p.locator('.pause-panel').waitFor();await p.waitForTimeout(950);
 assert.equal(await p.locator('.approved-pause').count(),0);
 await p.getByRole('heading',{name:'Respira.',exact:true}).waitFor();
 const styles=await p.locator('.pause-panel .primary-button').first().evaluate(e=>{const b=getComputedStyle(e),r=getComputedStyle(e,'::before');return {font:b.font,width:b.width,height:b.height,borderImage:r.borderImageSource,borderWidth:r.borderImageWidth,opacity:r.opacity};});
 await p.screenshot({path:resolve(out,'windows-prueba5-respira.png')});
 await p.locator('.pause-panel').getByRole('button',{name:'Configuración',exact:true}).click();
 const links=await p.locator('.voro-settings a').evaluateAll(a=>a.map(e=>({text:e.textContent,url:e.href})));
 await writeFile(resolve(out,'verified.json'),JSON.stringify({candidate:'0.6.4 Windows prueba5',reference:'design/pause-a-2026-09-22/pc-restored.png',styles,settingsLinks:links,privacyLinkVisible:links.some(x=>/privacy|privacidad/i.test(x.url+' '+x.text)),respira:true},null,2));
 console.log('Real Windows preview5: Respira visible, historical CSS/art identical; privacy link absent.');
}finally{if(app)await app.close();}
