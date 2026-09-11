import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {makeEngine} from '../../tests/engine-fixture.mjs';
import {stageResources} from '../../app/stage-assets.mjs';
import {STAGE_SPECIES,stageStartMass} from '../../app/journey-data.mjs';
const req=createRequire('C:/Users/dmkra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const {createCanvas,loadImage}=req('@napi-rs/canvas');
const manifest=JSON.parse(readFileSync('app/animation-sheets.json'));
const images=new Map();const started=performance.now();
for(const r of stageResources(0))images.set(r.url,await loadImage('public/'+r.url.split('?')[0].replace(/^\.\//,'')));
const metas=new Map(STAGE_SPECIES[0].flatMap(s=>Object.values(manifest[s.id]||{})).map(m=>[m.url,m]));
for(const [url] of metas)images.set(url,await loadImage('public/'+url.replace(/^\.\//,'')));
const decodeElapsed=performance.now()-started;
const results=[];
for(const quality of [1,.7])for(const moving of [false,true]){
 const {game}=makeEngine();game.progress.seed=1834;game.startTest(0,stageStartMass(0),false,true,false);
 const canvas=createCanvas(Math.round(560*quality),Math.round(1218*quality));canvas.focus=()=>{};
 game.canvas=canvas;game.ctx=canvas.getContext('2d');game.scale=560/480/1.5;game.pixelRatio=1.5*quality;game.height=1218/(560/480);
 game.worldGround.createCanvas=()=>createCanvas(1,1);document.createElement=()=>createCanvas(1,1);
 for(const r of stageResources(0)){
  const image=images.get(r.url);(r.kind==='ground'?game.groundImages:game.atlasImages)[r.key]=image;
  Object.assign(game.assets.entries.get(`${r.kind}:${r.key}`),{image,ready:true});
 }
 game.animationSheets.bytes=0;
 for(const [url,meta] of metas){game.animationSheets.entries.set(url,{meta,cost:meta.bytes,state:'ready',seen:0,image:images.get(url),cancelled:false});game.animationSheets.bytes+=meta.bytes;}
 // Keep shared fixtures' native images intact between runs.
 game.animationSheets.release=function(url,e){this.entries.delete(url);this.bytes-=e.cost;};
 const samples=[],parts={};game.measured=(name,run)=>{const a=performance.now();const v=run();(parts[name]??=[]).push(performance.now()-a);return v;};
 for(let i=0;i<360;i++){
  const a=performance.now();game.time+=1/60;
  if(game.progress.offer.length)game.choose(game.progress.offer[0]);
  game.keys.clear();if(moving)game.keys.add(i<180?'KeyD':'KeyS');
  game.update(1/60);game.render();game.ctx.getImageData(0,0,1,1);
  samples.push(performance.now()-a);
 }
 const summary=a=>{const sorted=[...a].sort((x,y)=>x-y);return{mean:a.reduce((x,y)=>x+y,0)/a.length,p95:sorted[Math.floor(sorted.length*.95)],max:sorted.at(-1)}};
 results.push({quality,moving,frames:samples.length,cpuAndSynchronousRasterMs:summary(samples),parts:Object.fromEntries(Object.entries(parts).map(([k,v])=>[k,summary(v)])),groundRebuilds:game.worldGround.redraws,entities:game.food.length,sheetBytes:game.animationSheets.bytes,finalPixels:createHash('sha256').update(game.ctx.getImageData(0,0,canvas.width,canvas.height).data).digest('hex')});
 if(quality===1&&moving){mkdirSync('design/gesture-audit-0.4.18',{recursive:true});writeFileSync('design/gesture-audit-0.4.18/micro-benchmark.png',canvas.toBuffer('image/png'));}
 game.destroy();
}
const output={renderer:'Actual VORO engine + Skia in Node; no browser, WebKit, device FPS, or GPU timing',source:process.env.VORO_BENCH_SOURCE||'working tree',decodeElapsedMs:decodeElapsed,decodedSheets:metas.size,results};
writeFileSync(process.argv[2]||'artifact/micro-current-baseline.json',JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2));
