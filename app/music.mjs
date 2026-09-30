export const MUSIC = [
  ['menu','Life In Silico','life-in-silico'], ['micro','Solace','solace'],
  ['pond','Reverie','reverie'], ['land','Ephemera','ephemera'],
  ['water','Sleep','sleep'], ['city','Meanwhile','meanwhile'],
  ['orbit','Cirrus','cirrus'], ['planets','Hymn To The Dawn','hymn-to-the-dawn'],
  ['stars','Permafrost','permafrost'], ['galaxies','Hiraeth','hiraeth'],
  ['universe','Shadows And Dust','shadows-and-dust'], ['final','The Distant Sun','the-distant-sun'],
].map(([id,title,slug])=>({id,title,slug,url:`./music/${slug}.mp3`,source:`https://www.scottbuckley.com.au/library/${slug}/`}));
export function musicScene(started,completed,stage){return completed?'final':started?stage:'menu';}

// Two streaming media decks keep long songs out of the decoded PCM heap.
// Web Audio gain (rather than HTMLMediaElement.volume) also works on iOS.
export class MusicPlayer {
  constructor(context,{createAudio=()=>new Audio(),schedule=(fn)=>setInterval(fn,100),cancel=id=>clearInterval(id),onDiagnostic=(_kind,_detail)=>{},ownsContextResume=true,stabilizePlayback=false}={}) {
    this.stabilizePlayback=stabilizePlayback;this.recovery=null;
    this.ownsContextResume=ownsContextResume;
    this.onDiagnostic=onDiagnostic;
    this.context=context;this.cancel=cancel;this.active=false;this.unlocked=false;
    this.desired='menu';this.current=null;this.destroyed=false;this.transition=null;this.serial=0;this.blocked=false;
    this.diagnostics={switches:0,loops:0,waiting:0,stalled:0,errors:0};
    this.events=[];this.listeners=[];
    const observe=(target,type,listener)=>{target.addEventListener?.(type,listener);this.listeners.push(()=>target.removeEventListener?.(type,listener));};
    observe(context,'statechange',()=>{
      this.record('context',context.state);
      if(context.state!=='running')this.requestRecovery('context-'+context.state);
    });
    this.output=context.createGain();this.output.gain.value=1;this.output.connect(context.destination);
    this.bus=context.createGain();this.bus.gain.value=0;this.bus.connect(this.output);
    this.decks=Array.from({length:2},()=>{
      const audio=createAudio();audio.preload='auto';audio.setAttribute('playsinline','');
      for(const type of ['waiting','stalled','error','playing','pause'])observe(audio,type,()=>{
        if(['waiting','stalled','error'].includes(type))this.diagnostics[type==='error'?'errors':type]++;
        this.record(type,audio.currentSrc||audio.src,{mediaTime:audio.currentTime,readyState:audio.readyState});
      });
      const source=context.createMediaElementSource(audio),gain=context.createGain();
      gain.gain.value=0;source.connect(gain);gain.connect(this.bus);
      return {audio,source,gain,id:null,pending:false};
    });
    this.requestRecovery('startup');
    this.timer=schedule(()=>this.tick());
  }
  // Reproduce the successful Settings pause/resume before exposing a newly
  // activated stream. Keep the same context, source, position and gain policy.
  // Audio-clock and media progress, not a wall timer, establish readiness.
  requestRecovery(reason){
    if(!this.stabilizePlayback||this.destroyed)return;
    this.recovery={phase:'warmup',reason,baseline:null};
    this.output.gain.cancelScheduledValues(this.context.currentTime);
    this.output.gain.value=0;
  }
  recoveryHoldsPlayback(){return this.recovery&&this.recovery.phase!=='warmup';}
  stabilize(){
    const r=this.recovery;if(!r)return false;
    if(this.context.state!=='running'||this.blocked)return true;
    const d=this.current,now=this.context.currentTime;
    if(r.phase==='warmup'){
      if(!d||d.id!==this.desired||d.audio.paused||d.pending||d.audio.readyState<3){r.baseline=null;return false;}
      if(!r.baseline||r.baseline.deck!==d||r.baseline.id!==d.id){
        r.baseline={deck:d,id:d.id,time:now,media:d.audio.currentTime};return false;
      }
      if(now-r.baseline.time<.15||d.audio.currentTime-r.baseline.media<.08)return false;
      // End a still-muted initial crossfade, preserving only the chosen song.
      this.serial++;this.transition=null;this.pauseAt=null;
      this.decks.forEach(deck=>{deck.pending=false;deck.audio.pause();deck.gain.gain.cancelScheduledValues(now);deck.gain.gain.value=deck===d?1:0;});
      r.phase='paused';r.until=now+.12;
      this.report('stream-recovery-pause',{reason:r.reason,track:d.id,mediaTime:d.audio.currentTime});
      return true;
    }
    if(r.phase==='resuming'){
      if(now>=r.until){
        d.audio.pause();this.requestRecovery('retry');this.blocked=true;
        this.report('play-rejected',{operation:'stream-recovery',name:'TimeoutError'});
      }
      return true;
    }
    if(now<r.until)return true;
    r.phase='resuming';r.until=now+8;
    this.report('stream-recovery-resume',{reason:r.reason,track:d.id,mediaTime:d.audio.currentTime});
    d.audio.play().then(()=>{
      if(this.destroyed||!this.active){d.audio.pause();return;}
      if(this.recovery!==r)return;
      if(this.context.state!=='running'){d.audio.pause();this.requestRecovery('cancelled');return;}
      this.recovery=null;this.ramp(this.output.gain,1,.08);
      this.report('stream-recovery-ready',{reason:r.reason,track:d.id,mediaTime:d.audio.currentTime});
    }).catch(error=>{
      if(this.recovery!==r||this.destroyed)return;
      this.requestRecovery('retry');this.blocked=true;
      this.report('play-rejected',{operation:'stream-recovery',name:error?.name??'Error'});
    });
    return true;
  }
  record(type,detail,extra={}) {
    if(this.destroyed)return;
    this.events.push({type,at:Math.round((this.context.currentTime||0)*1000)/1000,detail,...extra});
    if(this.events.length>24)this.events.shift();
  }
  ramp(param,value,seconds){const now=this.context.currentTime;
    if(param.cancelAndHoldAtTime)param.cancelAndHoldAtTime(now);
    else {param.cancelScheduledValues(now);param.setValueAtTime(param.value,now);}
    param.linearRampToValueAtTime(value,now+seconds);}
  setState(id,active,immediate=false,fadeSeconds=.08,level=1){
    if(this.destroyed)return;
    if(this.recovery&&id!==this.desired)this.requestRecovery('scene-change');
    if(MUSIC.some(t=>t.id===id))this.desired=id;
    const target=active ? .42*Math.max(0,Math.min(1,Number.isFinite(level)?level:1)) : 0;
    const fade=immediate?.08:Math.max(.08,Math.min(3,fadeSeconds));
    if(this.volumeTarget!==target){
      this.ramp(this.bus.gain,target,fade);this.volumeTarget=target;
    }
    if(this.active!==active){
      this.active=active;
      if(!active){this.serial++;this.transition=null;this.pauseAt=this.context.currentTime+fade;this.decks.forEach(d=>{d.pending=false;if(immediate||this.recovery)d.audio.pause();});}
      else if(this.unlocked){this.blocked=false;this.resume();}
    }
    if(!active&&(immediate||this.recovery)){
      this.requestRecovery(immediate?'foreground':'paused');this.decks.forEach(d=>d.audio.pause());
    }
    if(this.active&&this.unlocked&&!this.blocked&&this.current?.id!==this.desired)this.switchTo(this.desired);
  }
  // Invoked directly from a trusted pointer/key gesture. Both reusable media
  // elements are primed here; rejected autoplay is retried only on a gesture.
  unlock(){
    if(this.destroyed)return;
    // Ordinary movement gestures must not restart the idle decoder or reschedule
    // gain ramps. Retry only an interrupted context or rejected/paused playback.
    if(this.unlocked&&!this.blocked&&this.context.state==='running'
      &&(!this.active||this.transition||this.current?.audio.paused===false))return;
    const firstUnlock=!this.unlocked;
    this.unlocked=true;this.blocked=false;
    if(this.ownsContextResume && this.context.state!=='running'){
      this.report('resume-request',{owner:'music',state:this.context.state});
      this.context.resume().then(()=>this.report('resume-resolved',{owner:'music',state:this.context.state}))
        .catch(error=>this.report('resume-rejected',{owner:'music',name:error?.name??'Error'}));
    }
    if(this.recoveryHoldsPlayback())return;
    if(!this.current){this.current=this.decks[0];this.current.gain.gain.value=1;}
    for(const d of this.decks){
      if(!d.id){const track=MUSIC.find(t=>t.id===this.desired);d.id=this.desired;d.audio.src=track.url;}
      if(!this.active)continue;
      // Prime the spare decoder only once. Replaying it on later gestures can
      // briefly expose the previous biome's song during an interrupted fade.
      if(!firstUnlock&&d!==this.current&&d!==this.transition?.next)continue;
      if(d!==this.current&&d!==this.transition?.next){d.gain.gain.cancelScheduledValues(this.context.currentTime);d.gain.gain.value=0;}
      d.audio.play().then(()=>{if(this.destroyed||!this.active)d.audio.pause();else if(d!==this.current&&d!==this.transition?.next)d.audio.pause();}).catch(e=>{this.report('play-rejected',{operation:'unlock',name:e.name});if(e.name!=='AbortError')this.blocked=true;});
    }
    if(this.active)this.resume();
  }
  resume(){
    if(!this.active||!this.unlocked||this.destroyed||this.recoveryHoldsPlayback())return;
    if(!this.current||this.current.id!==this.desired){this.switchTo(this.desired);return;}
    const d=this.current,token=this.serial;
    for(const other of this.decks)if(other!==d&&other!==this.transition?.next){other.audio.pause();other.gain.gain.cancelScheduledValues(this.context.currentTime);other.gain.gain.value=0;}
    d.audio.play().then(()=>{if(!this.active||this.destroyed){d.audio.pause();return;}if(token!==this.serial)return;this.ramp(d.gain.gain,1,.25);}).catch(error=>{this.report('play-rejected',{operation:'resume',name:error?.name??'Error'});if(token===this.serial)this.blocked=true;});
  }
  switchTo(id,loop=false){
    if(!this.active||this.destroyed||this.blocked||this.transition||this.recoveryHoldsPlayback())return;
    const old=this.current;
    const next=this.decks.find(d=>d!==old);if(next.pending)return;
    const track=MUSIC.find(t=>t.id===id);if(!track)return;
    this.diagnostics.switches++;if(loop)this.diagnostics.loops++;
    const token=++this.serial;next.pending=true;
    next.audio.pause();next.gain.gain.cancelScheduledValues(this.context.currentTime);next.gain.gain.value=0;
    if(next.id!==id){next.id=id;next.audio.src=track.url;}next.audio.currentTime=0;
    this.transition={next,old,token,end:Infinity};
    next.audio.play().then(()=>{
      if(this.destroyed||!this.active){next.audio.pause();return;}
      // A cancelled transition may reuse this same deck before play resolves.
      // Its stale promise must not pause or clear the newer request.
      if(token!==this.serial)return;
      next.pending=false;
      this.current=next;this.ramp(next.gain.gain,1,4);
      if(old)this.ramp(old.gain.gain,0,4);
      this.transition={next,old,token,end:this.context.currentTime+4};
    }).catch(error=>{this.report('play-rejected',{operation:'switch',name:error?.name??'Error'});if(token===this.serial){next.pending=false;this.transition=null;this.blocked=true;}});
  }
  tick(){
    if(!this.active&&this.pauseAt!=null&&this.context.currentTime>=this.pauseAt){this.decks.forEach(d=>d.audio.pause());this.pauseAt=null;}
    if(!this.active||!this.unlocked||this.destroyed)return;
    if(this.stabilize())return;
    if(this.transition&&this.context.currentTime>=this.transition.end){
      this.transition.old?.audio.pause();this.transition=null;
    }
    if(this.transition||this.blocked)return;
    if(this.current?.id!==this.desired){this.switchTo(this.desired);return;}
    const a=this.current?.audio;
    // The OS may pause a media element independently of our active flag.
    // Retry only a stopped deck, with bounded frequency; never restart music
    // that is already playing or retry rejected autoplay without a gesture.
    if(a?.paused && this.context.state==='running' && !a.ended){
      if(this.context.currentTime-(this.lastRecoveryAt??-Infinity)>=1){
        this.lastRecoveryAt=this.context.currentTime;this.record('resume-paused','foreground');this.resume();
      }
      return;
    }
    if(a&&Number.isFinite(a.duration)&&a.duration>8&&a.currentTime>=a.duration-4.5)this.switchTo(this.desired,true);
    else if(a?.ended)this.switchTo(this.desired,true);
  }
  destroy(){
    this.destroyed=true;this.serial++;this.cancel(this.timer);
    this.listeners.forEach(remove=>remove());this.listeners=[];
    this.decks.forEach(d=>{d.audio.pause();d.audio.removeAttribute('src');d.audio.load();d.source.disconnect();d.gain.disconnect();});
    this.bus.disconnect();this.output.disconnect();this.recovery=null;
  }
  report(kind,detail){try{this.onDiagnostic(kind,detail);}catch{/* Diagnostics cannot interrupt playback. */}}
  stats(){return {...this.diagnostics,desired:this.desired,current:this.current?.id||null,active:this.active,blocked:this.blocked,transition:!!this.transition,volumeTarget:this.volumeTarget??0,
    context:this.context.state,recovery:this.recovery?.phase??null,sampleRate:this.context.sampleRate,baseLatency:this.context.baseLatency,outputLatency:this.context.outputLatency,events:this.events.slice(),
    decks:this.decks.map(d=>({id:d.id,paused:d.audio.paused,pending:d.pending,readyState:d.audio.readyState,networkState:d.audio.networkState,time:d.audio.currentTime,duration:Number.isFinite(d.audio.duration)?d.audio.duration:null,error:d.audio.error?.code||null}))};}
}
