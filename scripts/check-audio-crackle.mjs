// Real Web Audio signal check. Offline rendering cannot detect device underruns.
import {createRequire} from 'node:module';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const out='design/audio-crackle-2026-09-29';
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage();
 await page.route('http://audio-audit.test/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(path==='/')return route.fulfill({contentType:'text/html',body:'Audio signal audit'});
  if(!/^\/(app\/(sfx|audio-health)\.mjs|public\/(sfx\/ingest-[1-5]\.wav|music\/solace\.mp3))$/.test(path))return route.abort();
  await route.fulfill({body:await readFile(`.${path}`),contentType:path.endsWith('.mjs')?'text/javascript':path.endsWith('.mp3')?'audio/mpeg':'audio/wav'});
 });
 await page.goto('http://audio-audit.test/');
 const result=await page.evaluate(async()=>{
  const {SfxPlayer,EFFECTS_MASTER_GAIN}=await import('/app/sfx.mjs');
  const rate=48000,seconds=24,c=new OfflineAudioContext(2,rate*seconds,rate);
  const decode=async path=>c.decodeAudioData(await(await fetch(path)).arrayBuffer());
  const bites=await Promise.all([1,2,3,4,5].map(i=>decode(`/public/sfx/ingest-${i}.wav`)));
  const music=await decode('/public/music/solace.mp3');
  const track=c.createBufferSource(),musicGain=c.createGain(),fx=c.createGain();
  track.buffer=music;musicGain.gain.value=.42;track.connect(musicGain);musicGain.connect(c.destination);track.start(0,170);
  fx.gain.value=EFFECTS_MASTER_GAIN;fx.connect(c.destination);
  let at=0,seed=97;
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const facade={state:'running',get currentTime(){return at;},createGain:()=>c.createGain(),createBufferSource:()=>c.createBufferSource(),createOscillator:()=>c.createOscillator()};
  const p=new SfxPlayer(facade,fx,{random,now:()=>at*1000});p.buffers=bites;
  for(at=.1;at<seconds-1;at+=.334)p.playIngest();
  // Independent scheduled players emulate one impact every 0.5 s, after each
  // previous voice ends. Offline rendering does not dispatch onended yet.
  for(at=.1;at<seconds-1;at+=.5){const hit=new SfxPlayer(facade,fx);hit.playImpact(Math.round(at*2)%2?'shield':'damage');}
  const rendered=await c.startRendering();let peak=0,clipped=0,energy=0,maxAdjacentDelta=0;
  for(let channel=0;channel<2;channel++){
   const samples=rendered.getChannelData(channel);
   for(let i=0;i<samples.length;i++){const v=samples[i];peak=Math.max(peak,Math.abs(v));energy+=v*v;if(Math.abs(v)>=1)clipped++;if(i)maxAdjacentDelta=Math.max(maxAdjacentDelta,Math.abs(v-samples[i-1]));}
  }
  return {mode:'offline Web Audio / Edge',seconds,rate,channels:2,ingests:p.stats().played,impactIntervalSeconds:.5,peak,clippedSamples:clipped,rms:Math.sqrt(energy/(rate*seconds*2)),maxAdjacentDelta,limitations:'Not a realtime playback or physical iOS test. Does not detect hardware/decoder underruns.'};
 });
 await mkdir(out,{recursive:true});await writeFile(`${out}/mixed-signal.json`,JSON.stringify(result,null,2));
 console.log(JSON.stringify(result,null,2));if(result.clippedSamples)process.exitCode=1;
}finally{await browser.close();}
