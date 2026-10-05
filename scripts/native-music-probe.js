// Copied into the simulator bundle only. Exercises the real Capacitor bridge.
(async()=>{
 window.__voroSmoke='waiting-proxy';
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const contexts=[],BaseAudioContext=window.AudioContext;
 window.AudioContext=class extends BaseAudioContext {
  constructor(...args){const type=navigator.audioSession?.type;super(...args);this.probeCreationType=type;this.probeDecoded=0;contexts.push(this);}
  decodeAudioData(...args){return super.decodeAudioData(...args).then(buffer=>{this.probeDecoded++;return buffer;});}
 };
 for(let i=0;i<30&&!window.Capacitor?.Plugins?.VoroMusic;i++)await sleep(1000);
 const music=window.Capacitor?.Plugins?.VoroMusic;
 if(!music){window.__voroSmoke='missing VoroMusic JS proxy';return;}
 let revision=Date.now()*100+100000,ready=false;
 const set=(track,active,volume=.42)=>music.setState({track,active,volume,fade:.08,immediate:false,revision:++revision});
 let backgroundSeen=false;
 const foreground=async()=>{if(!ready||!backgroundSeen||document.hidden)return;ready=false;window.__voroSmoke='resuming';await sleep(700);await set('micro',true);await sleep(1300);await music.snapshot({probe:'foreground'});window.__voroSmoke='complete';};
 window.addEventListener('focus',foreground);
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&ready){backgroundSeen=true;window.__voroSmoke='background';void music.snapshot({probe:'background'});}
  else void foreground();
 });
 try {
  window.__voroSmoke='menu-command';await set('menu',true);window.__voroSmoke='menu-playing';await sleep(1600);await music.snapshot({probe:'menu'});
  await set('micro',true);await sleep(4600);await music.snapshot({probe:'micro'});
  await set('micro',false,0);await sleep(250);await music.snapshot({probe:'muted'});
  await set('micro',true);await sleep(1300);await music.snapshot({probe:'resumed'});
  for(let i=0;i<60&&!document.querySelector('[data-voro-action="start"]:not(:disabled)');i++)await sleep(500);
  const button=document.querySelector('[data-voro-action="start"]:not(:disabled)');
  if(!button)throw Error('Start button unavailable');button.click();
  for(let i=0;i<40&&!(contexts[0]?.state==='running'&&contexts[0]?.probeDecoded===5);i++)await sleep(250);
  const context=contexts[0],before=context?.currentTime;await sleep(250);
  ready=true;window.__voroSmoke='ready-for-background';
  await music.snapshot({probe:'effects',webEffects:{creationType:context?.probeCreationType??'missing',type:navigator.audioSession?.type??'missing',state:context?.state??'missing',decoded:context?.probeDecoded??0,advanced:!!context&&context.currentTime>before+.1}});
 }catch(error){window.__voroSmoke=String(error);await music.snapshot({probe:'error',error:String(error)});}
})();
