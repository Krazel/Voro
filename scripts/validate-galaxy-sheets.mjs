import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {drawPose,applyPoseTransform} from '../app/inhabitant-animation.mjs';
import {ANIMATIONS} from '../app/animation-catalog.mjs';
import {SPECIES_BY_ID,ATLAS_URLS} from '../app/journey-data.mjs';
import manifest from '../app/animation-sheets.json' with {type:'json'};
const req=createRequire(process.env.VORO_CANVAS_RUNTIME || import.meta.url);
const {createCanvas,loadImage}=req('@napi-rs/canvas');
const source=await loadImage('public/'+ATLAS_URLS.cosmos.slice(2));
const board=createCanvas(2304,450),b=board.getContext('2d');b.fillStyle='#041423';b.fillRect(0,0,2304,450);
const samples=[];
let column=0;
for(const id of Array.from({length:6},(_,i)=>'galaxies-'+i))for(const energy of [1,1.5]) {
  const s=SPECIES_BY_ID[id],m=manifest[id][energy],sheet=await loadImage('public/'+m.url.slice(2));
  assert.equal(sheet.width,m.cols*m.w);assert.equal(sheet.height,Math.ceil(m.frames/m.cols)*m.h);
  for(const f of [0,Math.floor(m.frames*.27),Math.floor(m.frames*.71)]) {
    const expected=createCanvas(m.size,m.size),actual=createCanvas(m.size,m.size),ec=expected.getContext('2d'),ac=actual.getContext('2d');
    const phase=f/m.frames*Math.PI*2;
    ec.translate(m.size/2,m.size/2);ac.translate(m.size/2,m.size/2);
    drawPose(ec,source,s,m.size/m.extent,phase,{activity:energy});
    applyPoseTransform(ac,ANIMATIONS[id],m.size/m.extent,phase,energy);
    ac.drawImage(sheet,f%m.cols*m.w,Math.floor(f/m.cols)*m.h,m.w,m.h,m.x-m.size/2,m.y-m.size/2,m.w,m.h);
    const x=ec.getImageData(0,0,m.size,m.size).data,y=ac.getImageData(0,0,m.size,m.size).data;
    let error=0,alpha=0;
    for(let i=0;i<x.length;i+=4){for(let j=0;j<3;j++)error+=Math.abs(x[i+j]*x[i+3]/255-y[i+j]*y[i+3]/255);alpha+=Math.abs(x[i+3]-y[i+3]);}
    const colorMae=error/(m.size*m.size*3),alphaMae=alpha/(m.size*m.size);
    assert.ok(colorMae<6);assert.ok(alphaMae<4);
    samples.push({id,energy,frame:f,colorMae,alphaMae});
    if(f===0){b.drawImage(expected,column*192,30);b.drawImage(actual,column*192,250);b.fillStyle='#fff';b.font='14px sans-serif';b.fillText(id+' '+energy,column*192+8,20);}
  }
  column++;
}
writeFileSync('design/report-fixes-2026-09-22/galaxy-comparison.png',board.toBuffer('image/png'));
writeFileSync('design/report-fixes-2026-09-22/galaxy-validation.json',JSON.stringify({kind:'Original rig above, exported animation below; Skia pixels, no iOS GPU measurement',samples},null,2)+'\n');
console.log(JSON.stringify({comparisons:samples.length,maxColorMae:Math.max(...samples.map(s=>s.colorMae)),maxAlphaMae:Math.max(...samples.map(s=>s.alphaMae))}));
