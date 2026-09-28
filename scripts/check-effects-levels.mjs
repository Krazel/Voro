import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const base=process.env.VORO_QA_BASE||'http://127.0.0.1:5210/';
const out='design/effects-levels-2026-09-28';await mkdir(out,{recursive:true});
const previous=execFileSync('git',['show','fd0381d:app/sfx.mjs'],{encoding:'utf8'});
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage();await page.goto(base,{waitUntil:'networkidle'});
 const result=await page.evaluate(async previous=>{
  const current=await import('/@fs/C:/Users/dmkra/Documents/Codex Apps/Voro-camera/app/sfx.mjs');
  const old=await import('data:text/javascript;base64,'+btoa(previous));
  const rate=48000,stats={},clips={};
  const metric=b=>{const a=b.getChannelData(0);let peak=0,sum=0;for(const n of a){peak=Math.max(peak,Math.abs(n));sum+=n*n;}return {peak,rms:Math.sqrt(sum/a.length)};};
  const facade=c=>({state:'running',get currentTime(){return c.currentTime;},createGain:()=>c.createGain(),createOscillator:()=>c.createOscillator(),createBufferSource:()=>c.createBufferSource()});
  const bytes=await Promise.all(current.INGEST_SOUNDS.map(async path=>(await fetch(path)).arrayBuffer()));
  const decoder=new OfflineAudioContext(1,1,rate),bites=await Promise.all(bytes.map(b=>decoder.decodeAudioData(b)));
  for(const [label,mod] of [['before',old],['after',current]]){
   stats[label]={};
   for(const kind of ['damage','shield','ingest']){
    const c=new OfflineAudioContext(1,rate,rate),bus=c.createGain();bus.gain.value=mod.EFFECTS_MASTER_GAIN;bus.connect(c.destination);
    const p=new mod.SfxPlayer(facade(c),bus,{now:()=>1000,random:()=>.5});p.buffers=bites;
    kind==='ingest'?p.playIngest():p.playImpact(kind);
    const b=await c.startRendering();stats[label][kind]=metric(b);p.destroy();
    if(label==='after')clips[kind]=b;
   }
  }
  // Simultaneous damage, maximal eating cadence, every sample and pitch extreme,
  // mixed with the real music: check clipping rather than just configured gains.
  const music=await decoder.decodeAudioData(await(await fetch('./music/solace.mp3')).arrayBuffer());
  stats.mixes=[];
  for(const roll of [0,.5,.999999]){
   const c=new OfflineAudioContext(1,rate*8,rate),bus=c.createGain();bus.gain.value=current.EFFECTS_MASTER_GAIN;bus.connect(c.destination);
   const src=c.createBufferSource(),g=c.createGain();src.buffer=music;g.gain.value=.42;src.connect(g);g.connect(c.destination);src.start(0,45);
   for(let i=0;i<24;i++){
    const at=i/3,virtual=facade(c);Object.defineProperty(virtual,'currentTime',{get:()=>at});
    virtual.createBufferSource=()=>{const node=c.createBufferSource(),start=node.start.bind(node);node.start=()=>start(at);return node;};
    const p=new current.SfxPlayer(virtual,bus,{now:()=>1000,random:()=>roll});p.buffers=[bites[i%bites.length]];p.playIngest();
    if(i%2===0)p.playDamage();
   }
   const b=await c.startRendering();stats.mixes.push({roll,...metric(b)});if(roll===.5)clips.mix=b;
  }
  const wav=b=>{const a=b.getChannelData(0),buf=new ArrayBuffer(44+a.length*2),v=new DataView(buf),tag=(at,s)=>[...s].forEach((n,i)=>v.setUint8(at+i,n.charCodeAt(0)));
   tag(0,'RIFF');v.setUint32(4,buf.byteLength-8,true);tag(8,'WAVE');tag(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);tag(36,'data');v.setUint32(40,a.length*2,true);a.forEach((n,i)=>v.setInt16(44+i*2,Math.round(Math.max(-1,Math.min(1,n))*32767),true));
   let s='';const arr=new Uint8Array(buf);for(let i=0;i<arr.length;i+=8192)s+=String.fromCharCode(...arr.subarray(i,i+8192));return btoa(s);};
  return {stats,files:Object.fromEntries(Object.entries(clips).map(([k,b])=>[k,wav(b)]))};
 },previous);
 assert.ok(result.stats.after.damage.rms>result.stats.before.damage.rms*1.4);
 assert.ok(result.stats.after.ingest.rms>result.stats.before.ingest.rms*1.4);
 for(const mix of result.stats.mixes)assert.ok(mix.peak<.98,`Clipping risk: ${mix.peak}`);
 for(const [kind,data] of Object.entries(result.files))await writeFile(`${out}/${kind}.wav`,Buffer.from(data,'base64'));
 await writeFile(`${out}/levels.json`,JSON.stringify(result.stats,null,2));console.log(JSON.stringify(result.stats,null,2));
}finally{await browser.close();}
