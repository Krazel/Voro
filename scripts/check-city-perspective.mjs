import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const{chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/city-perspective-2026-09-30';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1280,height:3200},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5226/@fs/C:/Users/dmkra/Documents/Codex%20Apps/Voro-camera/'+out+'/index.html');
 await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 for(const group of ['props','vehicles','people']) {
  await page.locator('#'+group).scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);
  await page.locator('#'+group).screenshot({path:out+'/'+group+'.png'});
 }
 const count=await page.locator('article').count();
 await page.setViewportSize({width:1200,height:900});
 await page.goto('http://127.0.0.1:5226/?ui=final&lab=cosmos');
 await page.waitForFunction(()=>!!window.__voroLab);
 await page.evaluate(()=>{const g=window.__voroLab;g.sound=false;g.startTest(4,40,false,true,false);g.reviewHold=true;g.birth=0;g.transition=0;g.progress.offer=[];});
 await page.waitForFunction(()=>window.__voroLab.assetsReady,{},{timeout:60000});
 const scenes=[];
 for(const [scene,cx,cy]of[['centre',1,1],['park',0,1],['yard',0,0]]) {
  const result=await page.evaluate(({cx,cy})=>{
   const g=window.__voroLab;g.time=1;g.zoom=1.3;g.progress.seed=834;g.world.seed=834;
   g.food=[];for(let y=-1;y<4;y++)for(let x=-1;x<4;x++)g.food.push(...g.world.generate(x,y,0).entities);
   g.camera.x=cx*600+300;g.camera.y=cy*600+300;g.life.x=g.camera.x-250;g.life.y=g.camera.y;g.renderScene(true);
   const textures=Object.entries(g.atlasImages).map(([key,im])=>({key,width:im.naturalWidth||im.width,height:im.naturalHeight||im.height,compact:!!im.sourceScaleX}));
   return{image:g.canvas.toDataURL(),textures,entities:g.food.length};
  },{cx,cy});
  await writeFile(out+'/'+scene+'.png',Buffer.from(result.image.split(',')[1],'base64'));delete result.image;
  scenes.push({scene,...result});
 }
 const memory=scenes[0].textures.reduce((sum,t)=>sum+t.width*t.height*4,0);
 await writeFile(out+'/browser-verification.json',JSON.stringify({count,errors,scenes,cityAtlasMiB:memory/1048576,scope:'Browser QA; no physical iPhone performance measurement'},null,2));
 console.log(JSON.stringify({count,errors,cityAtlasMiB:memory/1048576}));
}finally{await browser.close();}
