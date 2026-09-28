'use client';
import {useLayoutEffect,useRef} from 'react';

let frameImage:Promise<HTMLImageElement>|undefined;
function loadFrame() {
 return frameImage??=new Promise<HTMLImageElement>((resolve,reject)=>{
  const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{frameImage=undefined;reject(new Error('Membrane frame could not load'));};
  image.src='/ui/cristal/membrane-frame.png';
 });
}

// Same nine-slice artwork as the approved desktop border-image. iOS can drop
// that animated negative-z pseudo-element; an explicit canvas stays above the
// button background. Paint only on load/resize, never in the gameplay loop.
export function MembraneRim() {
 const ref=useRef<HTMLCanvasElement>(null);
 useLayoutEffect(()=>{
  const canvas=ref.current!;let disposed=false,image:HTMLImageElement|undefined;
  const paint=()=>{
   const parent=canvas.parentElement;if(!image||disposed||!parent)return;
   const w=parent.clientWidth+8,h=parent.clientHeight+8;
   if(!parent.clientWidth||!parent.clientHeight)return;
   const ratio=Math.min(2,window.devicePixelRatio||1);
   canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
   const ctx=canvas.getContext('2d');if(!ctx)return;
   ctx.scale(ratio,ratio);
   const iw=image.naturalWidth,ih=image.naturalHeight,cut=200,edge=Math.min(28,w/2,h/2);
   const sx=[0,cut,iw-cut,iw],sy=[0,cut,ih-cut,ih];
   const dx=[0,edge,w-edge,w],dy=[0,edge,h-edge,h];
   for(let y=0;y<3;y++)for(let x=0;x<3;x++) {
    if(x===1&&y===1)continue;
    ctx.drawImage(image,sx[x],sy[y],sx[x+1]-sx[x],sy[y+1]-sy[y],dx[x],dy[y],dx[x+1]-dx[x],dy[y+1]-dy[y]);
   }
   canvas.dataset.ready='true';
  };
  const observer=new ResizeObserver(paint);observer.observe(canvas.parentElement!);
  loadFrame().then(loaded=>{image=loaded;paint();}).catch(()=>{});
  return()=>{disposed=true;observer.disconnect();};
 },[]);
 return <canvas ref={ref} className="membrane-rim" aria-hidden="true"/>;
}
