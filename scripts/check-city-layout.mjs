import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const label=process.argv[2]||'after',out='design/city-layout-2026-09-30';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1200,height:900},deviceScaleFactor:1.5,locale:'es-ES'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5226/?ui=final&lab=cosmos');
 await page.waitForFunction(()=>!!window.__voroLab);
 await page.evaluate(()=>{const g=window.__voroLab;g.sound=false;g.startTest(4,40,false,true,false);g.reviewHold=true;g.birth=0;g.transition=0;g.progress.offer=[];});
 await page.waitForFunction(()=>window.__voroLab.assetsReady);
 const results=[];
 for(const [scene,cx,cy] of [['centre',1,1],['park',0,1],['palm',3,0],['yard',0,0]]) {
 const result=await page.evaluate(({cx,cy})=>{
  const g=window.__voroLab;g.time=0;g.zoom=.85;g.camera.x=900;g.camera.y=900;g.progress.seed=834;g.world.seed=834;
  g.food=[];for(let y=-1;y<4;y++)for(let x=-1;x<4;x++)g.food.push(...g.world.generate(x,y,0).entities);
  g.camera.x=cx*600+300;g.camera.y=cy*600+300;g.life.x=g.camera.x-250;g.life.y=g.camera.y;g.renderScene(true);
  return {image:g.canvas.toDataURL(),zoom:g.zoom,entities:g.food.map(e=>({id:e.id,kind:e.kind,x:e.x,y:e.y,r:e.r,heading:e.heading})),background:g.backgroundStatus()};
 },{cx,cy});
 await writeFile(out+'/'+label+'-'+scene+'.png',Buffer.from(result.image.split(',')[1],'base64'));delete result.image;
 results.push({scene,...result,errors});
 }
 await writeFile(out+'/'+label+'.json',JSON.stringify(results,null,2));
 console.log(JSON.stringify({label,errors}));
}finally{await browser.close();}
