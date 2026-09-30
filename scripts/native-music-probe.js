// Copied into the simulator bundle only. Exercises the real Capacitor bridge.
(async()=>{
 window.__voroSmoke='waiting-proxy';
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 for(let i=0;i<30&&!window.Capacitor?.Plugins?.VoroMusic;i++)await sleep(1000);
 const music=window.Capacitor?.Plugins?.VoroMusic;
 if(!music){window.__voroSmoke='missing VoroMusic JS proxy';return;}
 let revision=Date.now()*100+100000,ready=false;
 const set=(track,active,volume=.42)=>music.setState({track,active,volume,fade:.08,immediate:false,revision:++revision});
 const foreground=async()=>{if(!ready||document.hidden)return;ready=false;await sleep(700);await set('micro',true);await sleep(1300);await music.snapshot({probe:'foreground'});};
 window.addEventListener('focus',foreground);document.addEventListener('visibilitychange',foreground);
 try {
  window.__voroSmoke='menu-command';await set('menu',true);window.__voroSmoke='menu-playing';await sleep(1600);await music.snapshot({probe:'menu'});
  await set('micro',true);await sleep(4600);await music.snapshot({probe:'micro'});
  await set('micro',false,0);await sleep(250);await music.snapshot({probe:'muted'});
  await set('micro',true);await sleep(1300);await music.snapshot({probe:'resumed'});ready=true;
 }catch(error){window.__voroSmoke=String(error);await music.snapshot({probe:'error',error:String(error)});}
})();
