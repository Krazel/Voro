import {createRequire} from 'node:module';
import {mkdir, writeFile} from 'node:fs/promises';

const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const base=process.env.VORO_QA_BASE || 'http://127.0.0.1:5208/';
const out='design/menu-inverse-2026-09-25';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const results=[];
try {
  for (const {name,width,height,language} of [
    {name:'iphone-es',width:390,height:844,language:'es'},
    {name:'iphone-en',width:375,height:812,language:'en'},
    {name:'ipad-es',width:834,height:1194,language:'es'},
    {name:'ipad-en',width:1194,height:834,language:'en'},
  ]) {
    const tablet=name.startsWith('ipad');
    const userAgent=tablet?'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1':undefined;
    const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,locale:language==='es'?'es-ES':'en-US',isMobile:true,hasTouch:true,userAgent});
    const page=await context.newPage();
    await page.goto(base,{waitUntil:'networkidle'});
    await page.evaluate(lang=>localStorage.setItem('voro-language-v1',lang),language);
    await page.reload({waitUntil:'networkidle'});
    const settingsButton=page.getByRole('button',{name:/^(Configuración|Settings)$/i}).first();
    if(!await settingsButton.count()) throw new Error(`${name}: settings button missing; buttons: ${JSON.stringify((await page.locator('button').allTextContents()).slice(0,20))}`);
    await settingsButton.click();
    const root=page.locator('.membrane-settings').first();
    await root.waitFor();
    const selector=page.locator('#voro-menu-theme');
    if(await selector.inputValue()!=='current')throw new Error(`${name}: missing preference should default to Current`);
    if((await selector.locator('option').allTextContents()).length!==4)throw new Error(`${name}: four choices missing`);
    const controls=()=>page.evaluate(()=>{
      const rows=[...document.querySelectorAll('.membrane-control-content button.membrane-row')];
      return {movement:document.querySelector('.membrane-segments button[aria-pressed=true]')?.textContent,
        left:rows[0]?.getAttribute('aria-pressed'),sound:rows[1]?.getAttribute('aria-pressed'),
        language:document.querySelector('.language-preference select')?.value};
    });
    const originalControls=await controls();
    for(const theme of ['current','organic','mixed','inverse']){
      await selector.selectOption(theme);
      await page.waitForTimeout(80);
      const state=await page.evaluate(()=>{
        const dialog=document.querySelector('.voro-settings');
        const menu=document.querySelector('.membrane-settings');
        const selector=document.querySelector('#voro-menu-theme');
        const frame=document.querySelector('.membrane-controls .membrane-frame');
        const pane=document.querySelector('.membrane-controls');
        const r=pane.getBoundingClientRect();
        const bg=getComputedStyle(dialog,'::before');
        return {theme:menu.dataset.menuTheme,selected:selector.value,saved:localStorage.getItem('voro-menu-theme-v1'),
          background:getComputedStyle(dialog).backgroundImage,backgroundLayer:bg.backgroundImage,
          backgroundFilter:bg.filter,frameFilter:getComputedStyle(frame).filter,
          panel:{x:r.x,y:r.y,width:r.width,height:r.height},scrollHeight:dialog.scrollHeight,clientHeight:dialog.clientHeight,
          text:menu.innerText.slice(0,300)};
      });
      if(state.theme!==theme||state.selected!==theme||state.saved!==theme)throw new Error(`${name} ${theme}: theme not applied/saved`);
      if(JSON.stringify(await controls())!==JSON.stringify(originalControls))throw new Error(`${name} ${theme}: other controls changed`);
      await page.screenshot({path:`${out}/${name}-${theme}.png`,fullPage:true});
      results.push({name,theme,...state});
      await page.reload({waitUntil:'networkidle'});
      await page.getByRole('button',{name:/^(Configuración|Settings)$/i}).first().click();
      if(await page.locator('#voro-menu-theme').inputValue()!==theme)throw new Error(`${name} ${theme}: theme not restored after reload`);
    }
    if(await page.locator('#voro-menu-theme').inputValue()!=='inverse')throw new Error(`${name}: last theme not restored`);
    await page.getByRole('button',{name:/^(Recorrido|Journey)/i}).first().click();
    if(!await page.getByRole('heading',{name:/^(Tu recorrido|Your journey)$/i}).count())throw new Error(`${name}: journey navigation failed`);
    await page.getByRole('button',{name:/^(Volver a configuración|Back to settings)$/i}).first().click();
    await page.getByRole('button',{name:/^(Créditos|Credits)/i}).first().click();
    if(!await page.getByRole('heading',{name:/^(Créditos|Credits)$/i}).count())throw new Error(`${name}: credits navigation failed`);
    await context.close();
  }
  const current=results.filter(r=>r.theme==='current'),mixed=results.filter(r=>r.theme==='mixed'),organic=results.filter(r=>r.theme==='organic'),inverse=results.filter(r=>r.theme==='inverse');
  for(let i=0;i<current.length;i++)if(current[i].background!==mixed[i].background)throw new Error(`${current[i].name}: mixed background changed`);
  for(let i=0;i<current.length;i++){
    if(current[i].frameFilter!==inverse[i].frameFilter)throw new Error(`${current[i].name}: inverse must retain green frame`);
    if(organic[i].backgroundLayer!==inverse[i].backgroundLayer||organic[i].backgroundFilter!==inverse[i].backgroundFilter)throw new Error(`${current[i].name}: inverse must use blue background only`);
  }
  await writeFile(`${out}/qa.json`,JSON.stringify(results,null,2));
  console.log(JSON.stringify({captures:results.length,restores:16,controlsPreserved:16,journey:4,credits:4,oldBackgroundSame:4,greenFrameSame:4,blueBackgroundSame:4}));
} finally {await browser.close();}
