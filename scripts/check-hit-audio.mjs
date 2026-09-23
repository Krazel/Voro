import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/hit-audio-2026-09-23';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5208/',{waitUntil:'networkidle'});
 const result=await page.evaluate(async()=>{
  const engineURL=performance.getEntriesByType('resource').map(e=>e.name).find(u=>u.includes('/app/engine.ts'));
  const {SfxPlayer}=await import(new URL('sfx.mjs',engineURL));const rate=48000;
  const wav=buffer=>{const samples=buffer.getChannelData(0),data=new ArrayBuffer(44+samples.length*2),v=new DataView(data),tag=(at,s)=>[...s].forEach((c,i)=>v.setUint8(at+i,c.charCodeAt(0)));
   tag(0,'RIFF');v.setUint32(4,data.byteLength-8,true);tag(8,'WAVE');tag(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);tag(36,'data');v.setUint32(40,samples.length*2,true);
   samples.forEach((n,i)=>v.setInt16(44+i*2,Math.max(-32768,Math.min(32767,Math.round(n*32767))),true));
   let s='';const bytes=new Uint8Array(data);for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s)};
  const files={},stats={},buffers={};
  for(const kind of ['damage','shield']){
   const c=new OfflineAudioContext(1,rate*.7,rate),bus=c.createGain();bus.gain.value=.055;bus.connect(c.destination);
   const facade={state:'running',currentTime:0,createGain:()=>c.createGain(),createOscillator:()=>c.createOscillator()};
   const p=new SfxPlayer(facade,bus);p.playImpact(kind);const b=await c.startRendering(),samples=b.getChannelData(0);buffers[kind]=b;
   files[`${kind}.wav`]=wav(b);stats[kind]={peak:Math.max(...samples.map(Math.abs)),rms:Math.sqrt(samples.reduce((sum,n)=>sum+n*n,0)/samples.length),start:samples[0],last:samples.at(-1),voicesAfter:p.voices.size};p.destroy();
  }
  const mix=new OfflineAudioContext(1,rate*8,rate);
  const music=await mix.decodeAudioData(await(await fetch('/music/solace.mp3')).arrayBuffer());
  const track=mix.createBufferSource(),level=mix.createGain();track.buffer=music;level.gain.value=.42;track.connect(level);level.connect(mix.destination);track.start(0,45);
  for(const [kind,time] of [['damage',2],['shield',4],['damage',6]]){const src=mix.createBufferSource();src.buffer=buffers[kind];src.connect(mix.destination);src.start(time)}
  const b=await mix.startRendering();files['music-damage-shield.wav']=wav(b);stats.mix={peak:b.getChannelData(0).reduce((peak,n)=>Math.max(peak,Math.abs(n)),0),duration:8};
  return {files,stats};
 });
 for(const [name,data] of Object.entries(result.files))await writeFile(`${out}/${name}`,Buffer.from(data,'base64'));
 await writeFile(`${out}/levels.json`,JSON.stringify(result.stats,null,2));console.log(result.stats);
}finally{await browser.close()}
