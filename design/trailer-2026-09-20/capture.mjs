import { VoroEngine } from '../../app/engine.ts';
import { STAGES } from '../../app/journey-data.mjs';
const status=document.querySelector('#status'), out=document.querySelector('#out'), ctx=out.getContext('2d');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const scenes=[
 {id:'micro',mass:6,text:'TODO EMPIEZA CON HAMBRE',seconds:5.5},
 {id:'water',mass:12,text:'ABSORBE. CRECE. EVOLUCIONA.',seconds:5.5},
 {id:'city',mass:20,text:'NADA ES DEMASIADO GRANDE',seconds:5.5},
 {id:'planets',mass:35,text:'NI SIQUIERA UN MUNDO',seconds:5.5},
];
function caption(text,t,duration){
 const opacity=Math.min(1,t/.4,(duration-t)/.35);ctx.save();ctx.globalAlpha=Math.max(0,opacity);
 const gradient=ctx.createLinearGradient(0,920,0,1280);gradient.addColorStop(0,'#00101800');gradient.addColorStop(1,'#001018ee');ctx.fillStyle=gradient;ctx.fillRect(0,920,720,360);
 ctx.textAlign='center';ctx.fillStyle='#fff5df';ctx.font='26px Georgia';ctx.fillText(text,360,1130);ctx.fillStyle='#91c4cb';ctx.font='15px Arial';ctx.fillText('V O R O   A B I S A L',360,1190);ctx.restore();
}
document.querySelector('#start').onclick=async()=>{
 document.querySelector('#start').disabled=true;
 let engine;
 try{
 const config={codec:'avc1.640020',width:720,height:1280,bitrate:10000000,framerate:60,avc:{format:'annexb'},latencyMode:'quality'};
 if(!(await VideoEncoder.isConfigSupported(config)).supported)throw Error('El codificador H264 no está disponible');
 const chunks=[];let error=null;
 const encoder=new VideoEncoder({output:chunk=>{const bytes=new Uint8Array(chunk.byteLength);chunk.copyTo(bytes);chunks.push(bytes);},error:e=>error=e});encoder.configure(config);
 engine=new VoroEngine(document.querySelector('#game'),()=>{});cancelAnimationFrame(engine.raf);engine.testMode=true;engine.sound=false;engine.observer.disconnect();
 engine.scale=1.5;engine.width=480;engine.height=1280/1.5;engine.pixelRatio=1;engine.canvas.width=720;engine.canvas.height=1280;
 let count=0;
 const encode=async()=>{const frame=new VideoFrame(out,{timestamp:Math.round(count*1000000/60),duration:Math.round(1000000/60)});encoder.encode(frame,{keyFrame:count%120===0});frame.close();count++;if(encoder.encodeQueueSize>8)await encoder.flush();if(error)throw error;};
 for(const scene of scenes){
  const stage=STAGES.findIndex(s=>s.id===scene.id);if(stage<0)throw Error('Entorno desconocido '+scene.id);
  status.textContent='Preparando '+STAGES[stage].short;
  engine.startTest(stage,scene.mass,false,true,false);engine.progress.cameraEntryRadius=engine.life.radius*.45;engine.zoom=50/engine.life.radius;engine.sound=false;engine.music?.setState('menu',false,true);engine.paused=false;engine.progress.offer=[];engine.birth=0;engine.hint='';engine.floating=[];engine.syncStageAssets();
  let timeout=0;while(!engine.assetsReady){await wait(50);engine.syncStageAssets();if(++timeout>600)throw Error('Assets sin cargar: '+scene.id);}
  // Warm animation sheets and background without including loading in the film.
  for(let i=0;i<45;i++){engine.time+=1/60;engine.update(1/60);engine.progress.offer=[];engine.render();await wait(8);}
  for(let f=0;f<scene.seconds*60;f++){
   const p=engine.life;
   const targets=engine.food.filter(e=>!e.eaten&&e.requiredMass<p.biomass*.95&&e.r>p.radius*.12).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
   const target=targets[0];const dx=target?target.x-p.x:Math.cos(f/100),dy=target?target.y-p.y:Math.sin(f/100);const len=Math.max(1,Math.hypot(dx,dy));
   engine.padInput={x:dx/len,y:dy/len};engine.time+=1/60;engine.update(1/60);engine.progress.offer=[];engine.hint='';engine.render();
   ctx.drawImage(engine.canvas,0,0,720,1280);caption(scene.text,f/60,scene.seconds);
   const fade=Math.min(1,f/12,(scene.seconds*60-1-f)/12);if(fade<1){ctx.fillStyle=`rgba(0,9,16,${1-fade})`;ctx.fillRect(0,0,720,1280);}
   await encode();if(f%12===0){status.textContent=`${STAGES[stage].short} · ${count} fotogramas · ${(count/60).toFixed(1)} s`;await wait(0);}
  }
 }
 // Current VORO emblem: cyan V and amber nucleus, revealed as a drawn mark.
 for(let f=0;f<240;f++){
   const t=f/60, ease=x=>1-(1-Math.max(0,Math.min(1,x)))**3;
   ctx.fillStyle='#000c13';ctx.fillRect(0,0,720,1280);
   const glow=ctx.createRadialGradient(360,470,2,360,470,330);glow.addColorStop(0,'#093a43');glow.addColorStop(1,'#000c13');ctx.fillStyle=glow;ctx.fillRect(0,0,720,1280);
   const fade=Math.min(1,(4-t)/.45);ctx.save();ctx.globalAlpha=fade;
   const arrival=ease(t/.95), size=.78+.22*arrival;
   ctx.translate(360,430+35*(1-arrival));ctx.scale(size,size);
   // Tiny lights converge toward the nucleus before the mark settles.
   for(let i=0;i<18;i++){const a=i*2.399, r=150*(1-arrival)+20;ctx.globalAlpha=fade*(1-arrival)*.7;ctx.fillStyle=i%3?'#a9dee1':'#e9bb63';ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,1.5+i%3,0,Math.PI*2);ctx.fill();}
   ctx.globalAlpha=fade*arrival;ctx.strokeStyle='#a9dee1';ctx.lineWidth=13;ctx.lineCap='butt';ctx.shadowColor='#83e5ec';ctx.shadowBlur=12;
   const progress=ease((t-.15)/1.1), pts=[[-87,-88],[0,102],[87,-88]], distance=progress*2;
   ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=0;i<2;i++){const u=Math.min(1,Math.max(0,distance-i));ctx.lineTo(pts[i][0]+(pts[i+1][0]-pts[i][0])*u,pts[i][1]+(pts[i+1][1]-pts[i][1])*u);if(u<1)break;}ctx.stroke();
   ctx.fillStyle='#e9bb63';ctx.shadowColor='#e9bb63';ctx.shadowBlur=24;ctx.beginPath();ctx.arc(0,-49,20*(.9+.1*arrival),0,Math.PI*2);ctx.fill();ctx.restore();
   ctx.save();ctx.globalAlpha=fade*ease((t-.65)/.85);ctx.textAlign='center';ctx.fillStyle='#fff2d8';ctx.font='64px Georgia';ctx.fillText('V O R O',360,665+20*(1-ease((t-.65)/.85)));ctx.font='26px Georgia';ctx.fillText('A B I S A L',360,715);
   ctx.globalAlpha=fade*ease((t-1.1)/.7);ctx.fillStyle='#a1d5d9';ctx.font='23px Georgia';ctx.fillText('El hambre no tiene límites.',360,805);ctx.font='17px Arial';ctx.fillText('KRAZEL GAMES',360,940);ctx.restore();
   await encode();if(f%12===0)await wait(0);
 }
 await encoder.flush();encoder.close();await fetch('/save-trailer-stream',{method:'POST',body:new Blob(chunks,{type:'video/h264'})});
 status.textContent=`Completado: ${count} fotogramas / ${count/60} segundos / 60 fps. Guardado.`;document.body.dataset.done='true';
 }catch(e){status.textContent='ERROR: '+e.message;console.error(e);}finally{engine?.destroy();}
};



