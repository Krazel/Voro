// Copied into the simulator bundle only. Exercises the real Capacitor bridge.
(async()=>{
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 for(let i=0;i<30&&!window.Capacitor?.Plugins?.VoroMusic;i++)await sleep(1000);
 const music=window.Capacitor?.Plugins?.VoroMusic;
 if(!music){await window.Capacitor?.nativePromise('VoroMusic','snapshot',{probe:'error',error:'VoroMusic JS proxy not registered after 30 seconds'});return;}
 let revision=Date.now()*100+100000,ready=false;
 const set=(track,active,volume=.42)=>music.setState({track,active,volume,fade:.08,immediate:false,revision:++revision});
 window.addEventListener('focus',async()=>{if(!ready)return;await sleep(700);await set('micro',true);await sleep(1300);await music.snapshot({probe:'foreground'});});
 try {
  await set('menu',true);await sleep(1600);await music.snapshot({probe:'menu'});
  await set('micro',true);await sleep(4600);await music.snapshot({probe:'micro'});
  await set('micro',false,0);await sleep(250);await music.snapshot({probe:'muted'});
  await set('micro',true);await sleep(1300);await music.snapshot({probe:'resumed'});ready=true;
 }catch(error){await music.snapshot({probe:'error',error:String(error)});}
})();
