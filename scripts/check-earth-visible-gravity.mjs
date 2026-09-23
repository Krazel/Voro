import {createRequire} from 'node:module';import {mkdir,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/pond-camera-audio-2026-09-23';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true}),reports=[];
try{for(const viewport of [{width:390,height:844},{width:1194,height:834}]){
 const page=await browser.newPage({viewport,locale:'es-ES'});await page.goto('http://127.0.0.1:5206/',{waitUntil:'networkidle'});
 await page.evaluate(async()=>{const url=performance.getEntriesByType('resource').map(e=>e.name).find(u=>u.includes('/app/engine.ts'));const {VoroEngine}=await import(url),init=VoroEngine.prototype.initAudio;
 VoroEngine.prototype.initAudio=function(){window.g=this;return init.call(this);};window.earthModule=await import(new URL('earth-landmark.mjs',url));});
 await page.getByRole('button',{name:'Despertar',exact:true}).click();await page.evaluate(()=>window.g.startTest(5,120,false,true,false));await page.waitForTimeout(2200);
 const report=await page.evaluate(()=>{
  const g=window.g,{ORBITAL_EARTH:e,constrainOrbit}=window.earthModule;cancelAnimationFrame(g.raf);
  const image=g.atlasImages.earth,source=document.createElement('canvas');source.width=image.naturalWidth;source.height=image.naturalHeight;
  const sc=source.getContext('2d');sc.drawImage(image,0,0);const pixels=sc.getImageData(0,0,source.width,source.height).data;
  const bounds={left:source.width,right:0,top:source.height,bottom:0};for(let y=0;y<source.height;y++)for(let x=0;x<source.width;x++)if(pixels[(y*source.width+x)*4+3]>32){bounds.left=Math.min(bounds.left,x);bounds.right=Math.max(bounds.right,x);bounds.top=Math.min(bounds.top,y);bounds.bottom=Math.max(bounds.bottom,y);}
  const draw=g.ctx.drawImage.bind(g.ctx),paint=[];g.ctx.drawImage=(im,...a)=>{if(im===image)paint.push(a);return draw(im,...a);};
  const cases=[];
  for(const zoom of [.45,1,2.36])for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5])for(const distance of [0,300,600,640,1100,1250]){
   const x=e.x+Math.cos(angle)*distance,y=e.y+Math.sin(angle)*distance;
   g.life.x=x;g.life.y=y;g.life.vx=Math.cos(angle)*80;g.life.vy=Math.sin(angle)*80;g.camera={x,y};g.zoom=zoom;g.render();
   const rect=paint.at(-1);constrainOrbit(g.life,1/60);
   cases.push({zoom,angle,distance,shift:Math.hypot(g.life.x-x,g.life.y-y),rect:rect?.slice(0,4)});
  }
  g.ctx.drawImage=draw;return {viewport:[g.width,g.height],asset:[source.width,source.height],bounds,cases};
 });
 for(const c of report.cases){if(c.distance<=1100)assert.ok(c.shift<1e-8);else assert.ok(c.shift>0);}
 reports.push(report);
 await page.evaluate(()=>{const g=window.g,e=window.earthModule.ORBITAL_EARTH;g.life.x=e.x;g.life.y=e.y+500;g.life.vx=g.life.vy=0;g.camera={x:g.life.x,y:g.life.y};g.zoom=.45;g.render();
  // QA-only contour overlay; never added to the game or its bundle.
  const c=g.ctx;c.save();const k=g.pixelRatio*g.scale;c.setTransform(k,0,0,k,0,0);c.translate(g.width/2+(e.x-g.camera.x)*g.zoom,g.height*.48+(e.y-g.camera.y)*g.zoom);
  for(const [radius,color] of [[e.radius,'#00ffff'],[e.softLimit,'#ffaa00']]){c.strokeStyle=color;c.lineWidth=2;c.setLineDash([8,6]);c.beginPath();c.arc(0,0,radius*g.zoom,0,Math.PI*2);c.stroke();}c.restore();
 });
 const png=await page.evaluate(()=>window.g.canvas.toDataURL());await writeFile(`${out}/earth-contours-${viewport.width}.png`,Buffer.from(png.split(',')[1],'base64'));await page.close();
}}finally{await browser.close();}
await writeFile(`${out}/earth-visible-gravity.json`,JSON.stringify(reports,null,2));console.log('Visible Earth, lower/lateral/upper crossings and exterior verified at three zooms in both formats.');
