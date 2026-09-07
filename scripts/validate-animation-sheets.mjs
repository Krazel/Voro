import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {drawPose,applyPoseTransform,simpleAnimation} from '../app/inhabitant-animation.mjs';
import {ANIMATIONS} from '../app/animation-catalog.mjs';
import {SPECIES_BY_ID,ATLAS_URLS} from '../app/journey-data.mjs';
import manifest from '../app/animation-sheets.json' with {type:'json'};
const req=createRequire(process.env.VORO_CANVAS_RUNTIME || import.meta.url);
const {createCanvas,loadImage}=req('@napi-rs/canvas');
const images={};for(const [k,url] of Object.entries(ATLAS_URLS)) images[k]=await loadImage('public/'+url.slice(2));
const before=execFileSync('git',['show','2205780effb5b586e844e1c0cdf5b3c36e8f9863:app/engine.ts'],{encoding:'utf8'});
const after=readFileSync('app/engine.ts','utf8');
const hero=s=>s.slice(s.indexOf('  drawCell() {'),s.indexOf('  drawDigestion(',s.indexOf('  drawCell() {'))).replaceAll('\r\n','\n');
assert.ok(hero(before).length>5000);assert.equal(hero(after),hero(before),'Protagonist drawing must remain untouched');
const samples=[],bytes=new Map();
const board=createCanvas(960,600),b=board.getContext('2d');b.fillStyle='#092331';b.fillRect(0,0,960,600);
let bi=0;
for(const s of Object.values(SPECIES_BY_ID)) {
  const profile=ANIMATIONS[s.id];
  if(simpleAnimation(profile)){assert.equal(manifest[s.id],undefined);continue;}
  assert.ok(manifest[s.id]);
  for(const [energy,m] of Object.entries(manifest[s.id])) {
    assert.ok(m.frames>=24&&m.frames<=64);assert.ok(m.bytes<6*1048576);
    const im=await loadImage('public/'+m.url.slice(2));
    assert.equal(im.width,m.cols*m.w);assert.equal(im.height,Math.ceil(m.frames/m.cols)*m.h);
    bytes.set(m.url,m.encodedBytes);
    for(const f of [0,Math.floor(m.frames*.27),Math.floor(m.frames*.71)]) {
      const phase=f/m.frames*Math.PI*2,expected=createCanvas(192,192),actual=createCanvas(192,192);
      const ec=expected.getContext('2d'),ac=actual.getContext('2d');
      ec.translate(96,96);ac.translate(96,96);
      drawPose(ec,images[s.imageAtlas||s.atlas],s,192/m.extent,phase,{activity:+energy});
      applyPoseTransform(ac,profile,192/m.extent,phase,+energy);
      ac.drawImage(im,f%m.cols*m.w,Math.floor(f/m.cols)*m.h,m.w,m.h,m.x-96,m.y-96,m.w,m.h);
      const x=ec.getImageData(0,0,192,192).data,y=ac.getImageData(0,0,192,192).data;
      let error=0,alpha=0;
      for(let i=0;i<x.length;i+=4) {
        for(let j=0;j<3;j++) error+=Math.abs(x[i+j]*x[i+3]/255-y[i+j]*y[i+3]/255);
        alpha+=Math.abs(x[i+3]-y[i+3]);
      }
      samples.push({id:s.id,energy:+energy,frame:f,premultipliedMae:+(error/(192*192*3)).toFixed(3),alphaMae:+(alpha/(192*192)).toFixed(3)});
      if(+energy===1&&f===0&&['water-2','water-10','water-16','amoeba','galaxies-1'].includes(s.id)) {
        const xx=bi*192;b.drawImage(expected,xx,70);b.drawImage(actual,xx,330);
        b.fillStyle='#ddd';b.font='13px sans-serif';b.fillText(s.name,xx+10,30);bi++;
      }
    }
  }
}
assert.ok(Math.max(...samples.map(s=>s.premultipliedMae))<6,'Export color/geometry regression');
assert.ok(Math.max(...samples.map(s=>s.alphaMae))<4,'Export alpha/geometry regression');
const result={kind:'Native Skia pixel comparison against approved procedural rigs, compressed exports; not browser GPU testing',protagonistUnchanged:true,species:Object.keys(manifest).length,comparisons:samples.length,uniqueFiles:bytes.size,encodedBytes:[...bytes.values()].reduce((a,b)=>a+b,0),maxColorMae:Math.max(...samples.map(s=>s.premultipliedMae)),maxAlphaMae:Math.max(...samples.map(s=>s.alphaMae)),samples};
writeFileSync('design/animation-sheet-validation.json',JSON.stringify(result,null,2)+'\n');
writeFileSync('artifact/sheet-comparison.png',board.toBuffer('image/png'));
console.log(JSON.stringify({...result,samples:undefined}));

