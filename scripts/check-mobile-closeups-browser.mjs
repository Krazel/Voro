// Isolated desktop WebKit smoke test. Does not use the user's saved game and
// does not claim iPhone/iPad timing equivalence.
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const req=createRequire(process.env.VORO_CANVAS_RUNTIME || import.meta.url);
const {webkit}=req('playwright');
const browser=await webkit.launch({headless:true});
const results=[];
try {
  for(const [name,viewport,ua,dpr] of [
    ['phone',{width:390,height:844},'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7 Mobile/15E148 Safari/604.1',3],
    ['tablet-landscape',{width:1194,height:834},'Mozilla/5.0 (iPad; CPU OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7 Mobile/15E148 Safari/604.1',2],
  ]) {
    const context=await browser.newContext({viewport,userAgent:ua,deviceScaleFactor:dpr,isMobile:true,hasTouch:true,locale:'es-ES'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.addInitScript(()=>{
      window.drawAudit={draws:0,clips:0};
      for(const [method,key] of [['drawImage','draws'],['clip','clips']]){
        const original=CanvasRenderingContext2D.prototype[method];
        CanvasRenderingContext2D.prototype[method]=function(...args){
          if(this.canvas.isConnected && this.canvas.closest('.viewport'))window.drawAudit[key]++;
          return original.apply(this,args);
        };
      }
    });
    await page.goto(process.argv[2] || 'http://127.0.0.1:5207/',{waitUntil:'networkidle'});
    await page.getByRole('button',{name:'Despertar',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('.viewport')?.dataset.event==='play',{},{timeout:60000});
    await page.evaluate(()=>window.drawAudit={draws:0,clips:0});
    await page.waitForTimeout(3000);
    const state=await page.evaluate(()=>({event:document.querySelector('.viewport').dataset.event,wide:document.querySelector('main').dataset.wide,
      canvas:{width:document.querySelector('.viewport canvas').width,height:document.querySelector('.viewport canvas').height},...window.drawAudit}));
    assert.equal(errors.length,0,errors.join('\n'));
    assert.equal(state.wide,name==='phone'?'false':'true');
    assert.equal(state.event,'play');assert.ok(state.draws>0);
    await page.screenshot({path:`design/mobile-performance-2026-09-22/${name}-webkit.png`});
    results.push({name,...state,errors});await context.close();
  }
} finally {await browser.close();}
writeFileSync('design/mobile-performance-2026-09-22/browser-smoke.json',JSON.stringify({kind:'Desktop WebKit with emulated viewport, isolated storage, not physical iOS FPS',results},null,2)+'\n');
console.log(JSON.stringify(results));
