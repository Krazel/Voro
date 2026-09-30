import {audioPlaybackStats} from './audio-health.mjs';

export const AUDIO_JOURNAL_KEY='voro-audio-journal-v1';
export const JOURNAL_LIMITS=Object.freeze({samples:180,events:100,bytes:600000,interval:2000,saveInterval:30000});
const finite=value=>Number.isFinite(value)?Math.round(value*1000)/1000:null;
const append=(list,item,max)=>{list.push(item);if(list.length>max)list.splice(0,list.length-max);};
export function audioSnapshot(game) {
  const c=game.audio,m=game.music;
  return {
    context:c?{state:c.state,time:finite(c.currentTime),...audioPlaybackStats(c)}:null,
    gates:{audioStarted:!!game.audioStarted,sound:!!game.sound,focus:!!game.audioFocus,nativeActive:game.nativeAudioActive??true,
      hidden:!!globalThis.document?.hidden,started:!!game.started,paused:!!game.paused,
      settings:!!game.settingsOpen,review:!!game.reviewHold,dead:!!game.life?.dead,
      offer:!!game.progress?.offer?.length,completed:!!game.progress?.completed},
    stage:game.progress?.stage??null,effectsTarget:game.effectsGainTarget??null,
    effectsGain:finite(game.master?.gain.value),effects:game.sfx?.stats()??null,
    music:m?{desired:m.desired,current:m.current?.id??null,active:m.active,unlocked:m.unlocked,
      blocked:m.blocked,transition:!!m.transition,target:m.volumeTarget??null,gain:finite(m.bus?.gain.value),
      recovery:m.recovery?.phase??null,outputGain:finite(m.output?.gain.value),
      decks:m.decks.map(d=>({id:d.id,pending:d.pending,paused:d.audio.paused,ended:d.audio.ended,
        time:finite(d.audio.currentTime),duration:finite(d.audio.duration),ready:d.audio.readyState,
        network:d.audio.networkState,error:d.audio.error?.code??null,muted:d.audio.muted,
        volume:finite(d.audio.volume),gain:finite(d.gain.gain.value)}))}:null,
  };
}
// No analyser, PCM, microphone, network, per-frame work or playback mutation.
export class AudioJournal {
  /** @param {{snapshot?:()=>object,storage?:{getItem:(key:string)=>string|null,setItem:(key:string,value:string)=>void}|null,now?:()=>number,clock?:()=>number,metadata?:object}} [options] */
  constructor({snapshot=()=>({}),storage=null,now=Date.now,clock=()=>performance.now(),metadata={}}={}) {
    this.snapshot=snapshot;this.storage=storage;this.now=now;this.clock=clock;
    this.closed=false;this.storageStatus=storage?'available':'unavailable';this.previous=null;this.listeners=[];
    this.comparison=null;
    try{
      const raw=storage?.getItem(AUDIO_JOURNAL_KEY);
      if(raw&&raw.length<=JOURNAL_LIMITS.bytes){const saved=JSON.parse(raw);if(saved.format==='voro-audio-journal-v1')this.previous=saved.current??null;}
    }catch{this.storageStatus='read-error';}
    this.current={startedAt:now(),metadata,initial:null,samples:[],events:[]};
    this.current.initial=this.entry('launch');this.lastSave=now();
  }
  entry(kind,detail={}) {
    let state;try{state=this.snapshot();}catch{state={snapshotError:true};}
    return {kind,wallMs:this.now(),monotonicMs:finite(this.clock()),detail,state};
  }
  sample(){if(this.closed)return;append(this.current.samples,this.entry('sample'),JOURNAL_LIMITS.samples);
    if(this.now()-this.lastSave>=JOURNAL_LIMITS.saveInterval)this.flush();}
  event(kind,detail={}){if(this.closed)return;append(this.current.events,this.entry(kind,detail),JOURNAL_LIMITS.events);}
  attach(context,decks=[]) {
    this.detach();
    const listen=(target,type,detail)=>{const handler=()=>this.event(type,detail());target?.addEventListener?.(type,handler);this.listeners.push(()=>target?.removeEventListener?.(type,handler));};
    listen(context,'statechange',()=>({state:context.state}));
    for(const [index,deck] of decks.entries())for(const type of ['playing','pause','waiting','stalled','error','seeking','seeked','ended'])
      listen(deck.audio,type,()=>({deck:index,track:deck.id,error:deck.audio.error?.code??null}));
    this.event('audio-created');
  }
  detach(){this.listeners.forEach(remove=>remove());this.listeners=[];}
  setComparison(report){this.comparison=report;this.flush();}
  data(){return {format:'voro-audio-journal-v1',current:{...this.current,comparison:this.comparison},previous:this.previous};}
  flush(){
    if(this.closed)return;
    this.lastSave=this.now();
    try{
      let data=JSON.stringify(this.data());
      if(data.length>JOURNAL_LIMITS.bytes){this.previous=null;data=JSON.stringify(this.data());}
      while(data.length>JOURNAL_LIMITS.bytes&&this.current.samples.length){this.current.samples.shift();data=JSON.stringify(this.data());}
      if(data.length>JOURNAL_LIMITS.bytes)throw new Error('Journal size');
      if(this.storage){this.storage.setItem(AUDIO_JOURNAL_KEY,data);this.storageStatus='saved';}
    }catch{this.storageStatus='write-error';}
  }
  report(observation='unspecified'){
    this.event('export',{observation:['good','crackle','silent'].includes(observation)?observation:'unspecified'});
    this.flush();
    // Snapshot now, before opening the share sheet changes focus.
    return JSON.parse(JSON.stringify({...this.data(),mode:'audio',exportedAt:this.now(),storage:this.storageStatus,
      limits:['Technical state only; no microphone or audio recording. No automatic upload.',
        'Recent samples and bounded events, current and previous app session. Periodic saving may lose the last seconds after force quit.',
        'No sound in a signal sample is not measured here. Running/play success does not prove audible hardware output.',
        'Absent output metrics mean unavailable, not zero failures.'],retention:JOURNAL_LIMITS}));
  }
  destroy(){if(this.closed)return;this.event('destroy');this.flush();this.detach();this.closed=true;}
}
