import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
const req=createRequire(process.env.VORO_CANVAS_RUNTIME||import.meta.url);
const {chromium}=req('playwright'),root=resolve('pc-dist'),prefix='/itch-voro/';
const server=createServer((request,response)=>{
  const path=new URL(request.url,'http://localhost').pathname;
  if(!path.startsWith(prefix)){response.writeHead(404);response.end();return;}
  const file=resolve(root,decodeURIComponent(path.slice(prefix.length))||'index.html');
  if(!file.startsWith(root+sep)){response.writeHead(403);response.end();return;}
  try{const data=readFileSync(file);response.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.wav':'audio/wav','.mp3':'audio/mpeg'})[extname(file)]||'application/octet-stream');response.end(data);}
  catch{response.writeHead(404);response.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${server.address().port}${prefix}`;
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:900},locale:'es-ES'}),errors=[],failed=[];
  page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()});});
  await page.goto(url,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Configuración',exact:true}).click();
  await page.waitForTimeout(500);
  await page.screenshot({path:'artifact/itchio/0.6.2-pc/settings.png'});
  await page.reload({waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Despertar',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.viewport')?.dataset.event==='play');
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(1500);await page.keyboard.up('ArrowRight');
  assert.equal(errors.length,0,errors.join('\n'));assert.deepEqual(failed,[]);
  await page.screenshot({path:'artifact/itchio/0.6.2-pc/gameplay.png'});
  const result={kind:'Chromium desktop, HTML5 served from subdirectory as on itch.io',settings:true,started:true,keyboardMovement:true,errors,failed};
  writeFileSync('artifact/itchio/0.6.2-pc/browser-check.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();server.close();}
