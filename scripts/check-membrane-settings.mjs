import {createRequire} from 'node:module';import {mkdir,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out=process.env.VORO_UI_QA_OUT||'design/menu-membrane-2026-09-23';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true}),reports=[];
try{for(const [width,height,locale,port] of [[390,844,'es-ES',5208],[375,667,'en-US',5208],[1194,834,'es-ES',5208],[834,1194,'en-US',5208],[1280,800,'en-US',5206]]){
 const ipad=width===1194||width===834;
 const context=await browser.newContext({viewport:{width,height},locale,...(ipad?{userAgent:'Mozilla/5.0 (iPad; CPU OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',hasTouch:true}:{})});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(`http://127.0.0.1:${port}/?ui=final`,{waitUntil:'networkidle'});
 const es=locale==='es-ES',word=(a,b)=>es?a:b;
 await page.getByRole('button',{name:word('Despertar','Awaken'),exact:true}).click();
 await page.getByRole('button',{name:word('Configuración','Settings'),exact:true}).first().click();
 const main=page.locator('.membrane-settings');await main.waitFor();await page.waitForTimeout(350);
 const top=await page.locator('.membrane-heading').boundingBox();assert.ok(top.y>=0,'Menu must initially show its heading, not scroll to developer tools');
 await page.screenshot({path:`${out}/settings-${width}-${locale}.png`,fullPage:true});
 const boxes=await main.locator('button,a,select').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return {label:n.textContent,x:b.x,y:b.y,w:b.width,h:b.height};}));
 for(const b of boxes){assert.ok(b.h>=43.9,`Small target ${b.label}: ${b.h}`);assert.ok(b.x>=-1&&b.x+b.w<=width+1,`Outside width: ${b.label}`);}
 const left=main.getByRole('button',{name:word('Modo zurdo','Left-handed mode'),exact:true});const before=await left.getAttribute('aria-pressed');await left.click();assert.notEqual(await left.getAttribute('aria-pressed'),before);await left.click();
 const sound=main.getByRole('button',{name:word('Sonido','Sound'),exact:true});const was=await sound.getAttribute('aria-pressed');await sound.click();assert.notEqual(await sound.getAttribute('aria-pressed'),was);await sound.click();
 await main.locator('select').selectOption(es?'en':'es');assert.equal(await page.locator('.membrane-heading h2').textContent(),es?'Settings':'Configuración');await main.locator('select').selectOption('auto');
 assert.equal(await main.locator('.membrane-instagram').getAttribute('href'),'https://www.instagram.com/krazelgames/');
 assert.ok((await main.locator('.membrane-privacy').getAttribute('href')).endsWith('/privacy/'));
 await main.getByRole('button',{name:word('Recorrido','Journey'),exact:true}).click();await page.locator('.journey-horizons').waitFor();assert.equal(await page.locator('.journey-horizons li').count(),1);
 const row=await page.locator('.journey-horizons li').boundingBox(),label=await page.locator('.journey-horizons span').boundingBox(),number=await page.locator('.journey-stage-count').boundingBox();
 assert.ok(number.x>label.x+label.width&&number.x+number.width<row.x+row.width,'Counter fits to the right without touching label or edge');
 assert.match(await page.locator('.journey-stage-count').textContent(),/^\d/);
 await page.screenshot({path:`${out}/journey-${width}-${locale}.png`});assert.equal(await page.locator('.approved-art,.living-menu-art').count(),0);
 await page.getByRole('button',{name:word('Volver a configuración','Back to settings'),exact:true}).click();
 await main.getByRole('button',{name:word('Créditos','Credits'),exact:true}).click();await page.locator('.credits-panel').waitFor();await page.screenshot({path:`${out}/credits-${width}-${locale}.png`});await page.locator('.membrane-license-button').click();await page.locator('.membrane-licenses').waitFor();assert.ok(await page.locator('.membrane-licenses a').count()>1);await page.screenshot({path:`${out}/licenses-${width}-${locale}.png`});
 await page.getByRole('button',{name:word('Volver a configuración','Back to settings'),exact:true}).click();
 await main.getByRole('button',{name:word('Volver a nacer','Be born again'),exact:true}).click();await page.getByRole('alertdialog').waitFor();
 await page.getByRole('button',{name:word('Cancelar','Cancel'),exact:true}).click();await page.getByRole('alertdialog').waitFor({state:'hidden'});
 await context.tracing.start({screenshots:false,snapshots:false});
 await main.getByRole('button',{name:word('Volver al juego','Back to game'),exact:true}).click();await main.waitFor({state:'hidden'});await context.tracing.stop();
 assert.deepEqual(errors,[]);reports.push({width,height,locale,boxes,errors});await context.close();
}}finally{await browser.close();}
await writeFile(`${out}/web-qa.json`,JSON.stringify(reports,null,2));console.log(JSON.stringify(reports.map(({boxes,...r})=>r)));
