// Real Chromium decoder/source; the status-0 native URLResponse is emulated.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const req=createRequire(process.env.VORO_CANVAS_RUNTIME||import.meta.url);
const {chromium}=req('playwright');
const source=readFileSync('app/sfx.mjs','utf8').replaceAll('export ','');
const browser=await chromium.launch({headless:true,channel:'msedge',args:['--autoplay-policy=no-user-gesture-required']});
try {
  const page=await browser.newPage();
  await page.goto(process.argv[2]||'http://127.0.0.1:5207/',{waitUntil:'networkidle'});
  const results=await page.evaluate(async source=>{
    const Player=new Function(source+';return SfxPlayer;')();
    const Context=window.AudioContext||window.webkitAudioContext;
    const context=new Context();await context.resume();
    const results=[];
    for(const native of [false,true]){
      let time=0;
      const player=new Player(context,context.destination,{now:()=>time,
        baseURL:()=>native?'capacitor://localhost/':location.href,
        fetcher:async url=>{const r=await fetch(url);if(!r.ok)throw new Error('Actual asset missing');return native?{ok:false,status:0,type:'basic',arrayBuffer:()=>r.arrayBuffer()}:r;}});
      await player.unlock();
      for(let i=0;i<6;i++){time+=400;player.playIngest();}
      results.push({mode:native?'Native response contract emulated':'HTTP',...player.stats(),durations:player.buffers.map(b=>b.duration)});
      player.destroy();
    }
    await context.close();return results;
  },source);
  for(const r of results){assert.equal(r.decoded,3);assert.equal(r.played,6);assert.equal(r.loadErrors,0);}
  writeFileSync('design/report-fixes-2026-09-22/audio-chromium.json',JSON.stringify({kind:'Desktop Chromium real WAV decoding/playback scheduling; does not validate physical iOS output',results},null,2)+'\n');
  console.log(JSON.stringify(results));
}finally{await browser.close();}
