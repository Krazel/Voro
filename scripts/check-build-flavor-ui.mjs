import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const flavor=process.argv[2]||'development',url=process.argv[3]||'http://127.0.0.1:5237';
const out=`design/release-1.1-2026-10-05/${flavor}`;await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});const results=[];
try{for(const [name,width,height]of [['iphone',390,844],['ipad',1024,768]]){
 const context=await browser.newContext({viewport:{width,height},locale:'es-ES'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url+'/?ui=development');await page.locator('.viewport').waitFor();
 const info=await page.evaluate(async()=>await(await fetch('voro-build.json')).json());
 assert.equal(info.developmentTools,flavor==='development');
 if(flavor==='development'){
  await page.locator('[data-developer-tools]').click();
  const panel=page.getByRole('dialog',{name:'Modo desarrollador'});await panel.waitFor();
  await panel.locator('select').selectOption('6');
  await page.screenshot({path:`${out}/${name}-tools.png`});
  await panel.getByRole('button',{name:'Entrar en la prueba',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.viewport')?.getAttribute('data-event')==='play');
  await page.waitForTimeout(700);await page.locator('[data-developer-tools]').click();
  await panel.getByRole('button',{name:'Añadir biomasa',exact:false}).click();
  await panel.getByRole('button',{name:'Volver a mi partida',exact:true}).click();
  await page.locator('[data-developer-tools]').click();
  await panel.getByRole('button',{name:'Prueba automática de todos los entornos',exact:true}).click();
  await page.getByRole('button',{name:'Detener prueba',exact:true}).waitFor();
  await page.getByRole('button',{name:'Detener prueba',exact:true}).click();
 }else{
  assert.equal(await page.locator('[data-developer-tools]').count(),0);
  await page.getByRole('button',{name:'Configuración',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Pruebas',exact:true}).count(),0);
  await page.screenshot({path:`${out}/${name}-settings.png`});
 }
 assert.deepEqual(errors,[]);results.push({name,flavor,info,errors,passed:true});await context.close();
}}finally{await browser.close();}
await fs.writeFile(`${out}/qa.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results));
