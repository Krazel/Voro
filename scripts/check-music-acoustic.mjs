import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/pond-camera-audio-2026-09-23';await mkdir(out,{recursive:true});
const before=execFileSync('git',['show','9381ebc:app/music.mjs'],{encoding:'utf8'}),after=await readFile('app/music.mjs','utf8');
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const reports=[];
try{for(const [label,source] of [['tf064',before],['candidate',after]]){
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5206/');
 const data=await page.evaluate(async({source,label})=>{
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const context=new AudioContext();await context.resume();
  const {MusicPlayer}=await import(URL.createObjectURL(new Blob([source],{type:'text/javascript'})));
  const music=new MusicPlayer(context),events=[];
  music.decks.forEach((d,i)=>['playing','pause','waiting','stalled','error'].forEach(type=>d.audio.addEventListener(type,()=>events.push({deck:i,type,t:+context.currentTime.toFixed(3)}))));
  const worklet=`class Capture extends AudioWorkletProcessor {constructor(){super();this.buf=new Float32Array(4096);this.at=0;}process(inputs){const a=inputs[0]?.[0];if(a)for(const v of a){this.buf[this.at++]=v;if(this.at===4096){this.port.postMessage(this.buf);this.at=0;}}return true;}}registerProcessor('capture',Capture);`;
  await context.audioWorklet.addModule(URL.createObjectURL(new Blob([worklet],{type:'text/javascript'})));
  const tap=new AudioWorkletNode(context,'capture'),sink=context.createGain();sink.gain.value=0;music.bus.connect(tap);tap.connect(sink);sink.connect(context.destination);
  const chunks=[];tap.port.onmessage=e=>chunks.push(e.data);
  music.setState('micro',true);music.unlock();await sleep(700);music.current.audio.currentTime=20;
  music.setState('pond',true);await sleep(1200);music.current.audio.currentTime=20;
  // An interrupted biome crossfade, followed by fast resume. Old iOS code
  // leaves the outgoing song audible until another environment transition.
  music.setState('pond',false);await sleep(20);music.setState('pond',true);await sleep(900);
  const decks=music.decks.map(d=>({id:d.id,paused:d.audio.paused,gain:d.gain.gain.value}));
  await sleep(2500);
  music.current.audio.currentTime=music.current.audio.duration-4.3;
  await sleep(4900);
  const afterLoop=music.decks.map(d=>({id:d.id,paused:d.audio.paused,gain:d.gain.gain.value}));
  music.setState('land',true);await sleep(4500);
  const afterThird=music.decks.map(d=>({id:d.id,paused:d.audio.paused,gain:d.gain.gain.value}));
  music.setState('stars',true);await sleep(1200);music.current.audio.currentTime=20;
  music.setState('stars',false);await sleep(20);music.setState('stars',true);await sleep(900);
  const afterStars=music.decks.map(d=>({id:d.id,paused:d.audio.paused,gain:d.gain.gain.value}));
  music.current.audio.currentTime=music.current.audio.duration-4.3;await sleep(4900);
  const starsLoop=music.decks.map(d=>({id:d.id,paused:d.audio.paused,gain:d.gain.gain.value}));
  music.setState('final',true);await sleep(4500);
  const finalRest=music.decks.map(d=>({id:d.id,paused:d.audio.paused,gain:d.gain.gain.value}));
  // Movement gestures must not re-prime the outgoing decoder in the void.
  for(let n=0;n<30;n++){music.unlock();music.setState('final',true);await sleep(20);}
  const finalMoving=music.decks.map(d=>({id:d.id,paused:d.audio.paused,gain:d.gain.gain.value}));
  music.current.audio.currentTime=music.current.audio.duration-4.3;await sleep(4900);
  const finalLoop=music.decks.map(d=>({id:d.id,paused:d.audio.paused,gain:d.gain.gain.value}));
  music.destroy();tap.disconnect();sink.disconnect();await context.close();
  const length=chunks.reduce((n,a)=>n+a.length,0),pcm=new Int16Array(length);let i=0,peak=0,clipped=0;
  for(const a of chunks)for(const v of a){peak=Math.max(peak,Math.abs(v));if(Math.abs(v)>=1)clipped++;pcm[i++]=Math.max(-32768,Math.min(32767,Math.round(v*32767)));}
  let binary='';const bytes=new Uint8Array(pcm.buffer);for(let j=0;j<bytes.length;j+=8192)binary+=String.fromCharCode(...bytes.subarray(j,j+8192));
  return {label,decks,afterLoop,afterThird,afterStars,starsLoop,finalRest,finalMoving,finalLoop,peak,clipped,events,sampleRate:context.sampleRate,pcm:btoa(binary)};
 },{source,label});
 const pcm=Buffer.from(data.pcm,'base64');delete data.pcm;
 const wav=Buffer.alloc(44);wav.write('RIFF');wav.writeUInt32LE(pcm.length+36,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(data.sampleRate,24);wav.writeUInt32LE(data.sampleRate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(pcm.length,40);
 await writeFile(`${out}/music-${label}-crossfade-loop.wav`,Buffer.concat([wav,pcm]));reports.push(data);await page.close();
}}finally{await browser.close();}
await writeFile(`${out}/music-acoustic.json`,JSON.stringify(reports,null,2));console.log(JSON.stringify(reports));
assert.equal(reports[0].decks.filter(d=>!d.paused&&d.gain>.01).length,2,'reproduce overlapping biome audio in distributed 0.6.4');
assert.equal(reports[1].decks.filter(d=>!d.paused&&d.gain>.01).length,1);
assert.equal(reports[1].afterLoop.filter(d=>!d.paused).length,1);assert.equal(reports[1].clipped,0);
assert.equal(reports[0].afterStars.filter(d=>!d.paused&&d.gain>.01).length,2);
assert.equal(reports[1].afterStars.filter(d=>!d.paused&&d.gain>.01).length,1);
assert.equal(reports[1].starsLoop.filter(d=>!d.paused).length,1);
for(const key of ['finalRest','finalMoving','finalLoop'])assert.equal(reports[1][key].filter(d=>!d.paused&&d.gain>.01).length,1);
