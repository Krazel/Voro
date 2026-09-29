import { BenchmarkTour } from './benchmark-tour.mjs';
import { MUSIC } from './music.mjs';
import { audioPlaybackStats } from './audio-health.mjs';

export class AudioBenchmark extends BenchmarkTour {
  constructor(stages, startMass) {
    super(MUSIC.map(track=>{
      const stage=Math.max(0,track.id==='final'?stages.length-1:stages.findIndex(s=>s.id===track.id));
      return {stage,id:track.id,music:track.id,name:track.title,size:'audio',biomass:startMass(stage)};
    }),{seconds:8,warmupMs:500,loadTimeoutMs:15000});
    this.mode='audio';
  }
}

// Sampling is diagnostic-only, bounded to each short scene. No microphone,
// AudioWorklet or continuous PCM recording. Sampled peaks cannot prove that
// no clipping/underrun occurred between windows or after the device output.
export class AudioProbe {
  constructor(context, outputs=[], now=()=>performance.now()) {
    this.context=context;this.now=now;this.created=now();this.last=null;this.samples=[];this.events=[];this.done=new Set();
    this.initialOutput=audioPlaybackStats(context);this.connections=[];
    if(context?.createAnalyser)try{
      this.analyser=context.createAnalyser();this.analyser.fftSize=2048;
      this.wave=new Float32Array(2048);
      for(const output of outputs.filter(Boolean)){output.connect(this.analyser);this.connections.push(output);}
    }catch{this.destroy();}
  }
  event(type,detail={}){
    if(this.events.length<100)this.events.push({atMs:Math.round(this.now()-this.created),type,...detail});
  }
  sample(active,phase,music){
    if(!active){this.last=null;return;}
    const wall=this.now(),audio=this.context?.currentTime??null;
    if(this.last&&wall-this.last.wall<100)return;
    let peak=null,rms=null;
    if(this.analyser)try{
      this.analyser.getFloatTimeDomainData(this.wave);let energy=0;peak=0;
      for(const n of this.wave){peak=Math.max(peak,Math.abs(n));energy+=n*n;}
      rms=+Math.sqrt(energy/this.wave.length).toFixed(5);peak=+peak.toFixed(5);
    }catch{}
    const gap=this.last?wall-this.last.wall:0;
    const audioMs=this.last&&audio!==null&&this.last.audio!==null?(audio-this.last.audio)*1000:null;
    if(this.samples.length<400)this.samples.push({atMs:Math.round(wall-this.created),phase,
      gapMs:Math.round(gap),audioMs:audioMs===null?null:Math.round(audioMs),state:this.context?.state??'unavailable',peak,rms,
      track:music?.current??null,transition:music?.transition??false,
      decks:music?.decks?.map(d=>({id:d.id,time:+d.time.toFixed(3),paused:d.paused,ready:d.readyState,error:d.error}))??[]});
    this.last={wall,audio};
  }
  due(seconds,track,play){
    const sequence=track==='menu'?[]:track==='final'?[[.5,'final']]:[
      [1,'ingest',0],[1.5,'ingest',1],[2,'ingest',2],[2.5,'ingest',3],[3,'ingest',4],
      [3.8,'damage'],[4.4,'shield'],[5,'chime'],[5.8,'evolve'],
    ];
    for(const [at,kind,index] of sequence){
      if(seconds<at||this.done.has(at))continue;this.done.add(at);
      // A slow frame must not queue a burst of obsolete sounds.
      if(seconds-at>.35){this.event('effect-missed',{kind,index,lateMs:Math.round((seconds-at)*1000)});continue;}
      this.event('effect',{kind,index,...play(kind,index)});
    }
  }
  report(){
    return {initialOutput:this.initialOutput,finalOutput:audioPlaybackStats(this.context),samples:this.samples,events:this.events,
      observations:{sampledOverload:this.samples.filter(s=>s.peak!==null&&s.peak>=1).length,
        mainThreadGaps:this.samples.filter(s=>s.gapMs>250).length,
        stalledAudioClock:this.samples.filter(s=>s.gapMs>150&&s.audioMs!==null&&s.audioMs<20&&s.state==='running').length,
        notRunning:this.samples.filter(s=>s.state!=='running').length,
        userMarks:this.events.filter(e=>e.type==='heard-glitch').length,
        effectsPlayed:this.events.filter(e=>e.type==='effect'&&e.played).length,
        effectsFailed:this.events.filter(e=>e.type==='effect'&&!e.played).length,
        effectsMissed:this.events.filter(e=>e.type==='effect-missed').length},
      limits:['Sampled mono mix before hardware: no microphone and no recorded audio.',
        'A quiet waveform may be intended music; it is not proof of failure.',
        'Clock gaps, media events and frame stalls are correlations, not confirmed causes.',
        'Unavailable output/underrun metrics are null. iOS may not expose them.']};
  }
  destroy(){for(const output of this.connections){try{output.disconnect(this.analyser);}catch{}}this.connections=[];this.analyser?.disconnect();this.analyser=null;}
}
