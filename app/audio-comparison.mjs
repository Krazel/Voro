import {audioPlaybackStats} from './audio-health.mjs';

export const AUDIO_COMPARISON = Object.freeze({url:'./music/solace-comparison.mp3',seconds:12,gain:.42,track:'Solace',offset:0});
// Both routes share the game's context and the same short encoded asset. No
// microphone, output capture, extra context or automatic acoustic verdict.
export class AudioComparison {
  constructor(context,{allowed=/** @returns {boolean} */()=>true,record=(_kind,_detail,_report)=>{},createAudio=()=>new Audio(),fetcher=(...args)=>fetch(...args),now=Date.now,
    schedule=(fn,ms)=>setTimeout(fn,ms),cancel=id=>clearTimeout(id)}={}){
    Object.assign(this,{context,allowed,record,createAudio,fetcher,now,schedule,cancel});
    this.context=context;
    this.onChange=(_state)=>{};this.phase='idle';this.route=null;this.error=null;this.serial=0;this.trials=[];this.counter=0;
    this.audio=null;this.mediaSource=null;this.node=null;this.buffer=null;this.loading=null;this.timer=null;this.destroyed=false;
    this.gain=context.createGain();this.gain.gain.value=0;this.gain.connect(context.destination);
    this.stateChanged=()=>{if(context.state!=='running')this.stop('context-'+context.state);};
    context.addEventListener('statechange',this.stateChanged);
  }
  snapshot(){return {phase:this.phase,route:this.route,error:this.error,ready:!!this.buffer, trials:this.trials.map(t=>({...t}))};}
  report(){return {format:'voro-audio-comparison-v1',...AUDIO_COMPARISON,
    routes:{A:'HTMLAudioElement -> MediaElementAudioSourceNode',B:'AudioBufferSourceNode'},
    context:audioPlaybackStats(this.context),trials:this.trials.map(t=>({...t})),
    limitation:'User observations, not a recording or automatic detection. Repeating A controls for restarting playback.'};}
  emit(kind,detail={}){this.record('comparison-'+kind,detail,this.report());this.onChange(this.snapshot());}
  async prepare(){
    if(this.destroyed||this.buffer)return;
    if(this.loading)return this.loading;
    this.phase='loading';this.error=null;this.emit('prepare');
    this.loading=(async()=>{
      try{
        const response=await this.fetcher(AUDIO_COMPARISON.url);
        const local=globalThis.location?.protocol==='capacitor:'&&response.status===0&&response.type!=='opaque';
        if(!response.ok&&!local)throw Error('asset');
        const bytes=await response.arrayBuffer();if(!bytes.byteLength)throw Error('empty');
        const buffer=await this.context.decodeAudioData(bytes);
        if(this.destroyed)return;
        if(buffer.duration<AUDIO_COMPARISON.seconds)throw Error('short');
        this.buffer=buffer;
        this.audio=this.createAudio();this.audio.preload='auto';this.audio.setAttribute('playsinline','');
        this.audio.src=AUDIO_COMPARISON.url;this.audio.load();
        this.mediaSource=this.context.createMediaElementSource(this.audio);this.mediaSource.connect(this.gain);
        this.mediaError=()=>{if(this.route==='A'&&['starting','playing'].includes(this.phase)){this.stop('media-error');this.phase='error';this.error='play';this.emit('error',{phase:'media',code:this.audio.error?.code??null});}};
        this.audio.addEventListener('error',this.mediaError);
        this.phase='ready';this.emit('ready',{decodedBytes:buffer.length*buffer.numberOfChannels*4});
      }catch(e){if(!this.destroyed){this.buffer=null;this.phase='error';this.error='prepare';this.emit('error',{phase:'prepare',name:e?.name??'Error'});}}
      finally{this.loading=null;}
    })();
    return this.loading;
  }
  async play(route){
    if(this.destroyed||!['A','B'].includes(route)||!this.buffer)return;
    this.stop('replaced');
    if(!this.allowed()||this.context.state!=='running'){this.phase='error';this.error='inactive';this.emit('blocked');return;}
    const token=++this.serial;
    this.route=route;this.phase='starting';this.error=null;
    const trial={id:++this.counter,route,requestedAt:this.now(),startedAt:null,endedAt:null,status:'starting',heard:null,seconds:0};
    this.trials.push(trial);if(this.trials.length>12)this.trials.shift();
    this.emit('request',{id:trial.id,route});
    try{
      if(route==='A'){
        this.audio.currentTime=0;
        // This call stays in the trusted button gesture; no decoding await here.
        const play=this.audio.play();
        this.timer=this.schedule(()=>{if(token===this.serial){this.stop('timeout');this.phase='error';this.error='play';this.emit('error',{phase:'play',name:'Timeout'});}},10000);
        await play;
      }else{
        this.node=this.context.createBufferSource();this.node.buffer=this.buffer;this.node.connect(this.gain);
        this.node.start(this.context.currentTime,0,AUDIO_COMPARISON.seconds);
      }
      if(this.destroyed||token!==this.serial){
        if(route==='A'&&(this.route!=='A'||!['starting','playing'].includes(this.phase)))this.audio?.pause();
        return;
      }
      if(!this.allowed()||this.context.state!=='running'){this.stop('inactive');return;}
      if(this.timer!==null)this.cancel(this.timer);
      const at=this.context.currentTime;
      const gain=this.gain.gain;gain.cancelScheduledValues(at);gain.setValueAtTime(0,at);
      gain.linearRampToValueAtTime(AUDIO_COMPARISON.gain,at+.03);
      gain.setValueAtTime(AUDIO_COMPARISON.gain,at+AUDIO_COMPARISON.seconds-.03);
      gain.linearRampToValueAtTime(0,at+AUDIO_COMPARISON.seconds);
      this.startedAudioAt=at;trial.startedAt=this.now();trial.status='playing';this.phase='playing';this.emit('start',{id:trial.id,route});
      this.timer=this.schedule(()=>{if(token===this.serial)this.stop('complete');},AUDIO_COMPARISON.seconds*1000);
    }catch(e){
      if(token!==this.serial||this.destroyed)return;
      this.stop('error');this.phase='error';this.error='play';this.emit('error',{phase:'play',name:e?.name??'Error'});
    }
  }
  answer(id,heard){
    const trial=this.trials.find(t=>t.id===id);
    if(!trial||trial.startedAt===null||!['good','crackle','silent','unsure'].includes(heard))return;
    trial.heard=heard;this.emit('answer',{id,route:trial.route,heard});
  }
  stop(reason='stopped'){
    ++this.serial;
    if(this.timer!==null){this.cancel(this.timer);this.timer=null;}
    this.audio?.pause();
    if(this.node){try{this.node.stop();}catch{}this.node.disconnect();this.node=null;}
    const at=this.context.currentTime;this.gain.gain.cancelScheduledValues(at);this.gain.gain.value=0;
    const trial=this.trials.at(-1);
    if(trial&&['starting','playing'].includes(trial.status)){
      trial.seconds=trial.startedAt===null?0:Math.max(0,Math.min(AUDIO_COMPARISON.seconds,at-this.startedAudioAt));
      trial.mediaTime=this.route==='A'?this.audio?.currentTime??null:null;
      trial.status=reason;trial.endedAt=this.now();this.phase=reason==='complete'?'complete':'stopped';this.emit('stop',{id:trial.id,route:trial.route,reason});
    }
  }
  destroy(){
    if(this.destroyed)return;this.stop('destroyed');this.destroyed=true;
    this.context.removeEventListener('statechange',this.stateChanged);
    if(this.mediaError)this.audio?.removeEventListener('error',this.mediaError);
    this.audio?.removeAttribute('src');this.audio?.load();this.mediaSource?.disconnect();this.gain.disconnect();this.buffer=null;this.onChange=()=>{};
  }
}
