import { EFFECT_LEAD_SECONDS } from './audio-health.mjs';
// Five different wet gestures; runtime pitch varies independently of the sample.
export const INGEST_SOUNDS = [1, 2, 3, 4, 5].map(index => `./sfx/ingest-${index}.wav`);
// Music has its own output; this bus controls only effects. The quiet WAVs
// need a higher level to remain audible on phone speakers.
export const EFFECTS_MASTER_GAIN = 0.11;
export const INGEST_GAIN = 3;
export const INGEST_PITCH = Object.freeze({ min: -5, max: 6 });
export const HIT_SOUNDS = Object.freeze({
  damage: Object.freeze({type:'triangle',from:460,to:220,gain:4.2,attack:.009,hold:.045,duration:.30}),
  shield: Object.freeze({type:'sine',from:1340,to:360,gain:1.5,attack:.006,duration:.38}),
});

export class SfxPlayer {
  constructor(context, output, {
    fetcher = (...args) => fetch(...args),
    random = Math.random,
    now = () => performance.now(),
    baseURL = () => globalThis.location?.href,
    onDiagnostic = (_kind,_detail) => {},
    canResume = /** @returns {boolean} */ () => true,
  } = {}) {
    this.context = context;
    this.output = output;
    this.fetcher = fetcher;
    this.random = random;
    this.now = now;
    this.baseURL = baseURL;
    this.onDiagnostic=onDiagnostic;
    this.canResume=canResume;
    this.buffers = [];
    this.last = -1;
    this.remaining = [];
    this.lastPlayedAt = -Infinity;
    this.loading = null;
    this.destroyed = false;
    this.voices = new Set();
    this.lastAttemptAt = -Infinity;
    this.lastResumeAt = -Infinity;
    this.resuming = null;
    this.lastImpactAt = -Infinity;
    this.impactVoice = null;
    this.diagnostics = { attempts: 0, loadErrors: 0, readErrors: 0, decodeErrors: 0, lastLoadError: null, resumeErrors: 0, resumeAttempts: 0, playErrors: 0, requested: 0, played: 0, notReady: 0, notRunning: 0, throttled: 0, damageRequested: 0, damagePlayed: 0, shieldRequested:0, shieldPlayed:0, impactThrottled:0 };
  }
  unlock(retryResume = false) {
    if (this.destroyed) return Promise.resolve();
    const sinceResume = this.now()-this.lastResumeAt;
    // A resume requested while iOS is backgrounded can remain pending. A new
    // foreground/gesture attempt must not wait forever for that old promise.
    if (this.context.state && !['running','closed'].includes(this.context.state) && this.canResume()
      && (retryResume || sinceResume>=1000) && (!this.resuming || retryResume || sinceResume>=1500)) {
      this.lastResumeAt=this.now();this.diagnostics.resumeAttempts++;
      const resumeId=this.diagnostics.resumeAttempts;
      this.report('resume-request',{owner:'sfx',resumeId,state:this.context.state});
      const attempt=Promise.resolve().then(()=>{});
      this.resuming=attempt;
      try {
        // Call synchronously to retain the current user activation.
        Promise.resolve(this.context.resume?.()).then(()=>this.report('resume-resolved',{owner:'sfx',resumeId,state:this.context.state})).catch(error=>{this.diagnostics.resumeErrors++;this.report('resume-rejected',{owner:'sfx',resumeId,name:error?.name??'Error'});})
          .finally(()=>{if(this.resuming===attempt)this.resuming=null;});
      } catch {this.diagnostics.resumeErrors++;this.report('resume-threw',{owner:'sfx',resumeId});if(this.resuming===attempt)this.resuming=null;}
    }
    if (this.loading) return this.loading;
    if (this.buffers.filter(Boolean).length === INGEST_SOUNDS.length || this.now() - this.lastAttemptAt < 5000) return Promise.resolve();
    this.lastAttemptAt = this.now();
    this.loading = Promise.all(INGEST_SOUNDS.map(async (url,index) => {
      if (this.buffers[index]) return;
      this.diagnostics.attempts++;
      let phase='fetch',status=null;
      try {
        const response = await this.fetcher(url);
        status=response.status;phase='response';
        // Capacitor's iOS media handler returns URLResponse, not HTTPURLResponse.
        // A readable local WAV can therefore have status 0 / ok false. Do not
        // extend this exception to remote, opaque or failed HTTP responses.
        let localMedia=false;
        try {
          const base=new URL(this.baseURL()),asset=new URL(url,base);
          localMedia=base.protocol==='capacitor:' && asset.protocol===base.protocol && asset.host===base.host;
        } catch {}
        if (!response.ok && !(localMedia && status===0 && response.type!=='opaque' && response.type!=='opaqueredirect'))
          throw new Error(`SFX response ${status}`);
        phase='read';const bytes=await response.arrayBuffer();
        if(!bytes.byteLength)throw new Error('Empty sound asset');
        phase='decode';const buffer = await this.context.decodeAudioData(bytes);
        if (!this.destroyed) this.buffers[index] = buffer;
      } catch(error) {
        this.diagnostics.loadErrors++;
        if(phase==='decode')this.diagnostics.decodeErrors++;else this.diagnostics.readErrors++;
        this.diagnostics.lastLoadError={phase,url,status,message:String(error?.message||error).slice(0,160)};
      }
    })).finally(() => { this.loading = null; });
    return this.loading;
  }
  stats() { return { ...this.diagnostics, decoded: this.buffers.filter(Boolean).length, pending: !!this.loading, voices: this.voices.size, contextState: this.context.state || 'unknown', voiceGain: INGEST_GAIN }; }
  report(kind,detail){try{this.onDiagnostic(kind,detail);}catch{/* Diagnostics cannot interrupt playback. */}}
  /** @param {number|null} sampleIndex Optional diagnostic-only sample selection. */
  playIngest(sampleIndex = null) {
    const at = this.now();
    if (this.destroyed) return false;
    this.diagnostics.requested++;
    const available = this.buffers.flatMap((buffer,index) => buffer ? [index] : []);
    if (!available.length) { this.diagnostics.notReady++; return false; }
    // A diagnostic request must not silently substitute a different WAV.
    if(sampleIndex!==null && (!Number.isInteger(sampleIndex)||!available.includes(sampleIndex))){this.diagnostics.notReady++;return false;}
    if (this.context.state && this.context.state !== 'running') { this.diagnostics.notRunning++; return false; }
    if (at - this.lastPlayedAt < 1000 / 3) { this.diagnostics.throttled++; return false; }
    // Hear the entire bank in random order before starting another round.
    this.remaining = this.remaining.filter(index => available.includes(index));
    if (!this.remaining.length) this.remaining = [...available];
    const different = this.remaining.filter(index => index !== this.last);
    const choices = different.length ? different : this.remaining;
    const index = Number.isInteger(sampleIndex) && available.includes(sampleIndex) ? sampleIndex
      : choices[Math.min(choices.length - 1, Math.floor(this.random() * choices.length))];
    const source = this.context.createBufferSource();
    source.buffer = this.buffers[index];
    // Resampling changes pitch and duration together, preserving the whole bite.
    // Wider pitch/duration variation applies only to eating, never to music.
    const semitones = INGEST_PITCH.min + this.random() * (INGEST_PITCH.max - INGEST_PITCH.min);
    source.playbackRate.value = 2 ** (semitones / 12);
    const gain = this.context.createGain();
    gain.gain.value = INGEST_GAIN;
    const audioAt=(this.context.currentTime || 0) + EFFECT_LEAD_SECONDS;
    const duration=source.buffer.duration/source.playbackRate.value;
    // De-click both ends, including pitch-shifted samples; preserve the full bite.
    if(Number.isFinite(duration)&&gain.gain.setValueAtTime){
      gain.gain.setValueAtTime(0,audioAt);
      gain.gain.linearRampToValueAtTime(INGEST_GAIN,audioAt+Math.min(.006,duration*.1));
      gain.gain.setValueAtTime(INGEST_GAIN,audioAt+Math.max(duration*.5,duration-.02));
      gain.gain.linearRampToValueAtTime(0,audioAt+duration);
    }
    source.connect(gain);
    gain.connect(this.output);
    const voice = { source, gain };
    this.voices.add(voice);
    source.onended = () => { source.disconnect(); gain.disconnect(); this.voices.delete(voice); };
    try { source.start(audioAt); }
    catch { source.onended(); this.diagnostics.playErrors++; return false; }
    this.diagnostics.played++;
    this.last = index;
    this.remaining = this.remaining.filter(candidate => candidate !== index);
    this.lastPlayedAt = at;
    return true;
  }
  playDamage() { return this.playImpact('damage'); }
  playShield() { return this.playImpact('shield'); }
  playImpact(kind) {
    if(this.destroyed)return false;
    const sound=HIT_SOUNDS[kind];if(!sound)return false;
    this.diagnostics[`${kind}Requested`]++;
    if(this.context.state && this.context.state!=='running'){this.diagnostics.notRunning++;return false;}
    if(this.impactVoice || this.now()-this.lastImpactAt<420){this.diagnostics.impactThrottled++;return false;}
    const at=this.context.currentTime + EFFECT_LEAD_SECONDS;
    // Organic low knock for damage; a higher, softer membrane snap for shield.
    // One impact voice, no sample loading and no queued/replayed missed events.
    const source=this.context.createOscillator(),gain=this.context.createGain();
    source.type=sound.type;source.frequency.setValueAtTime(sound.from,at);
    if(kind==='shield')source.frequency.exponentialRampToValueAtTime(1860,at+.035);
    source.frequency.exponentialRampToValueAtTime(sound.to,at+sound.duration-.035);
    gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(sound.gain,at+sound.attack);
    // Give damage a short audible body before the decay, especially on phones.
    if(sound.hold)gain.gain.setValueAtTime(sound.gain,at+sound.hold);
    gain.gain.exponentialRampToValueAtTime(.001,at+sound.duration-.018);
    gain.gain.linearRampToValueAtTime(0,at+sound.duration);
    source.connect(gain);gain.connect(this.output);
    const voice={source,gain};this.voices.add(voice);this.impactVoice=voice;
    source.onended=()=>{source.disconnect();gain.disconnect();this.voices.delete(voice);if(this.impactVoice===voice)this.impactVoice=null;};
    try {source.start(at);source.stop(at+sound.duration+.01);}
    catch {source.onended();this.diagnostics.playErrors++;return false;}
    this.lastImpactAt=this.now();this.diagnostics[`${kind}Played`]++;
    return true;
  }
  cancelImpacts() {
    const voice=this.impactVoice;if(!voice)return;
    const {source,gain}=voice,at=this.context.currentTime;
    // A suspended context must never resume an old hit. During normal playback,
    // use a short release rather than cutting a waveform at an arbitrary sample.
    if(this.context.state!=='running'){
      try{source.stop();}catch{}source.onended?.();source.onended=null;return;
    }
    if(voice.cancelling)return;voice.cancelling=true;
    if(gain.gain.cancelAndHoldAtTime)gain.gain.cancelAndHoldAtTime(at);
    else {gain.gain.cancelScheduledValues(at);gain.gain.setValueAtTime(gain.gain.value,at);}
    gain.gain.linearRampToValueAtTime(0,at+.012);
    try{source.stop(at+.016);}catch{}
  }
  destroy() {
    this.destroyed = true;
    for(const {source,gain} of this.voices){source.onended=null;try{source.stop();}catch{}source.disconnect();gain.disconnect();}
    this.voices.clear();
    this.impactVoice = null;
    this.buffers = [];
    this.remaining = [];
  }
}
