import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out=process.env.VORO_AUDIT_OUT||'design/asset-audit-2026-09-28';await mkdir(out+'/cards',{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1320,height:950},locale:'es-ES'});
 await page.goto('http://127.0.0.1:5211/?ui=final&lab=cosmos',{waitUntil:'networkidle'});
 const rows=await page.evaluate(async()=>{
  const base='/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/';
  const {STAGE_SPECIES,STAGES,ATLAS_URLS,stageStartMass}=await import(base+'journey-data.mjs');
  const {sizeRange}=await import(base+'entity-sizes.mjs');
  const {drawInhabitant}=await import(base+'inhabitant-animation.mjs');
  const {ANIMATIONS,animationCrop}=await import(base+'animation-catalog.mjs');
  const {AnimationSheets}=await import(base+'animation-sheets.mjs');
  const {gameplayZoom}=await import(base+'camera.mjs');
  const {radiusForMass}=await import(base+'simulation.mjs');
  window.__voroLab.paused=true;const rows=[];
  // Run each stage separately: don't hold every decoded atlas simultaneously.
  for(const [stage,list]of STAGE_SPECIES.entries()){
   const images={};await Promise.all([...new Set(list.map(s=>s.imageAtlas||s.atlas))].map(async key=>{const im=new Image();im.src=ATLAS_URLS[key];await im.decode();images[key]=im;}));
   for(const s of list){
    const card=document.createElement('canvas');card.width=640;card.height=304;const c=card.getContext('2d');
    c.fillStyle='#071d29';c.fillRect(0,0,640,304);c.fillStyle='#f2f9fb';c.font='bold 18px Arial';
    const number=rows.length+1;c.fillText(`${number}. ${s.name}`,15,27);c.fillStyle='#9fc7d6';c.font='12px Arial';
    const range=sizeRange(s),im=images[s.imageAtlas||s.atlas],crop=animationCrop(s,im),entry=radiusForMass(stageStartMass(stage)),zoom=gameplayZoom(entry,entry);
    c.fillText(`${STAGES[stage].short} · fuente ${Math.round(crop[2])} × ${Math.round(crop[3])} · tres tamaños reales`,15,46);
    const metrics=[];
    for(const [side,highDetail,scale,dpr]of [['MÓVIL',true,390/480,1.5],['PC',true,900/720,1]]){
     const x=side==='MÓVIL'?15:335;
     c.fillStyle='#daedf0';c.font='bold 12px Arial';c.fillText(side+' · mínimo / medio / máximo',x,69);
     const sheets=new AnimationSheets({limit:(side==='PC'?128:64)*1048576});sheets.highDetail=highDetail;sheets.setSpecies([s]);
     const samples=[];
     for(const r of [range.min,s.r,range.max]){
      const w=Math.ceil(Math.max(210,r*2*zoom*scale*1.4)),h=Math.ceil(Math.max(210,r*2*zoom*scale*crop[3]/crop[2]*1.4));
      const canvas=document.createElement('canvas');canvas.width=Math.ceil(w*dpr);canvas.height=Math.ceil(h*dpr);const cx=canvas.getContext('2d');
      const draw=()=>{cx.setTransform(1,0,0,1,0,0);cx.clearRect(0,0,canvas.width,canvas.height);cx.translate(canvas.width/2,canvas.height/2);cx.scale(zoom*scale*dpr,zoom*scale*dpr);drawInhabitant(cx,im,s,r,0,ANIMATIONS[s.id].period*.25,{sheets});};
      draw();for(let n=0;n<100;n++){sheets.beginFrame();draw();if(!sheets.active&&![...sheets.entries.values()].some(e=>e.state==='queued'))break;await new Promise(r=>setTimeout(r,10));}
      samples.push({canvas,w,h,r});
      metrics.push({view:side,r,diameterCSS:r*2*zoom*scale,sheet:sheets.selections.get(s.id)||null});
     }
     // Three complete silhouettes share a fixed comparison scale (not native
     // screen size). The large lower sample is 1:1 CSS detail, no enlargement.
     const factor=Math.min(1,83/Math.max(...samples.map(a=>Math.max(a.w,a.h))));
     samples.forEach((a,i)=>c.drawImage(a.canvas,x+i*100+(86-a.w*factor)/2,77+(60-a.h*factor)/2,a.w*factor,a.h*factor));
     const a=samples[2];c.drawImage(a.canvas,a.canvas.width/2-145*dpr,a.canvas.height/2-65*dpr,290*dpr,130*dpr,x,147,290,130);
     c.fillStyle='#aac3cc';c.font='11px Arial';c.fillText(`Detalle 1:1 · diámetro máximo ${Math.round(a.r*2*zoom*scale)} px`,x,292);
     sheets.destroy();for(const a of samples){a.canvas.width=a.canvas.height=1;}
    }
    rows.push({number,id:s.id,name:s.name,stage,stageName:STAGES[stage].short,crop,range,zoom,metrics,png:card.toDataURL()});
   }
   for(const im of Object.values(images))im.src='';
  }
  return rows;
 });
 for(const row of rows){row.file=`cards/${String(row.number).padStart(3,'0')}.png`;await writeFile(`${out}/${row.file}`,Buffer.from(row.png.split(',')[1],'base64'));}
 // A self-contained review page with every asset and visible identifying number.
 let html='<!doctype html><meta charset="utf-8"><title>VORO · auditoría de todos los assets</title><style>body{margin:20px;background:#031019;color:#eef7ff;font:16px Arial}header{margin-bottom:20px}main{display:grid;grid-template-columns:repeat(2,640px);gap:12px}img{width:640px;height:304px}h1{font-size:23px}</style><header><h1>VORO · 168 assets, uno a uno</h1><p>Detalle adaptativo: móvil 64 MiB / PC 128 MiB. Siluetas para comparar los tres tamaños; abajo, detalle al tamaño real en pantalla.</p></header><main>';
 html+=rows.map(r=>`<img id="asset-${r.number}" src="${r.file}" title="${r.id}">`).join('')+'</main>';
 await writeFile(`${out}/index.html`,html);
 await page.setContent(html.replaceAll(/src="cards\/(\d+)\.png"/g,(_,num)=>`src="${rows[Number(num)-1].png}"`));
 const sheets=[];
 for(const stage of [...new Set(rows.map(r=>r.stage))]){
  const group=rows.filter(r=>r.stage===stage);
  for(let start=0;start<group.length;start+=8){
   const batch=group.slice(start,start+8),ids=batch.map(r=>'asset-'+r.number),file=`stage-${stage}-${Math.floor(start/8)}.png`;
   await page.evaluate(ids=>document.querySelectorAll('img').forEach(im=>im.style.display=ids.includes(im.id)?'':'none'),ids);
   await page.screenshot({path:`${out}/${file}`,fullPage:true});sheets.push({stage,file,numbers:batch.map(r=>r.number)});
  }
 }
 for(const row of rows)delete row.png;
 await writeFile(`${out}/assets.json`,JSON.stringify({method:'Production Canvas painter and animation sheets, entry zoom, minimum/nominal/maximum size, phone CSS390 DPR1.5 adaptive detail 64MiB / PC900px height DPR1 adaptive detail 128MiB. Fixed pose at quarter cycle. One species per card, scene pressure tested separately. Not physical iOS.',assets:rows,sheets},null,2));
 console.log(JSON.stringify({assets:rows.length,sheets:sheets.length,output:out}));
}finally{await browser.close();}
