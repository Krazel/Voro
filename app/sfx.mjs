export const INGEST_SOUNDS = [1, 2, 3].map(index => `./sfx/ingest-${index}.wav`);
// The effects master is 0.055. The samples already average about -26 dBFS;
// 0.65 here attenuated bites to roughly -55 dBFS, easily masked on a phone.
export const INGEST_GAIN = 2;
export const INGEST_PITCH = Object.freeze({ min: -7, max: 8 });

export class SfxPlayer {
  constructor(context, output, {
    fetcher = (...args) => fetch(...args),
    random = Math.random,
    now = () => performance.now(),
    baseURL = () => globalThis.location?.href,
  } = {}) {
    this.context = context;
    this.output = output;
    this.fetcher = fetcher;
    this.random = random;
    this.now = now;
    this.baseURL = baseURL;
    this.buffers = [];
    this.last = -1;
    this.lastPlayedAt = -Infinity;
    this.loading = null;
    this.destroyed = false;
    this.voices = new Set();
    this.lastAttemptAt = -Infinity;
    this.lastResumeAt = -Infinity;
    this.resuming = null;
    this.lastDamageAt = -Infinity;
    this.diagnostics = { attempts: 0, loadErrors: 0, readErrors: 0, decodeErrors: 0, lastLoadError: null, resumeErrors: 0, resumeAttempts: 0, playErrors: 0, requested: 0, played: 0, notReady: 0, notRunning: 0, throttled: 0, damageRequested: 0, damagePlayed: 0 };
  }
  unlock() {
    if (this.destroyed) return Promise.resolve();
    if (this.context.state && !['running','closed'].includes(this.context.state) && !this.resuming && this.now()-this.lastResumeAt>=1000) {
      this.lastResumeAt=this.now();this.diagnostics.resumeAttempts++;
      this.resuming=Promise.resolve(this.context.resume?.()).catch(()=>{this.diagnostics.resumeErrors++;}).finally(()=>{this.resuming=null;});
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
  playIngest() {
    const at = this.now();
    if (this.destroyed) return false;
    this.diagnostics.requested++;
    const available = this.buffers.flatMap((buffer,index) => buffer ? [index] : []);
    if (!available.length) { this.diagnostics.notReady++; return false; }
    if (this.context.state && this.context.state !== 'running') { this.diagnostics.notRunning++; return false; }
    if (at - this.lastPlayedAt < 1000 / 3) { this.diagnostics.throttled++; return false; }
    const choices = available.length > 1 ? available.filter(index => index !== this.last) : available;
    const index = choices[Math.min(choices.length - 1, Math.floor(this.random() * choices.length))];
    const source = this.context.createBufferSource();
    source.buffer = this.buffers[index];
    // Resampling changes pitch and duration together, preserving the whole bite.
    // Wider pitch/duration variation applies only to eating, never to music.
    const semitones = INGEST_PITCH.min + this.random() * (INGEST_PITCH.max - INGEST_PITCH.min);
    source.playbackRate.value = 2 ** (semitones / 12);
    const gain = this.context.createGain();
    gain.gain.value = INGEST_GAIN;
    source.connect(gain);
    gain.connect(this.output);
    const voice = { source, gain };
    this.voices.add(voice);
    source.onended = () => { source.disconnect(); gain.disconnect(); this.voices.delete(voice); };
    try { source.start(); }
    catch { source.onended(); this.diagnostics.playErrors++; return false; }
    this.diagnostics.played++;
    this.last = index;
    this.lastPlayedAt = at;
    return true;
  }
  playDamage() {
    if(this.destroyed)return false;
    this.diagnostics.damageRequested++;
    if(this.context.state && this.context.state!=='running'){this.diagnostics.notRunning++;return false;}
    if(this.now()-this.lastDamageAt<150)return false;
    const at=this.context.currentTime;
    // Midrange attack stays audible on small speakers, with an organic low tail.
    const source=this.context.createOscillator(),gain=this.context.createGain();
    source.type='triangle';source.frequency.setValueAtTime(320,at);
    source.frequency.exponentialRampToValueAtTime(105,at+.26);
    gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.75,at+.008);
    gain.gain.exponentialRampToValueAtTime(.001,at+.28);
    source.connect(gain);gain.connect(this.output);
    const voice={source,gain};this.voices.add(voice);
    source.onended=()=>{source.disconnect();gain.disconnect();this.voices.delete(voice);};
    try {source.start(at);source.stop(at+.3);}
    catch {source.onended();this.diagnostics.playErrors++;return false;}
    this.lastDamageAt=this.now();this.diagnostics.damagePlayed++;
    return true;
  }
  destroy() {
    this.destroyed = true;
    for(const {source,gain} of this.voices){source.onended=null;try{source.stop();}catch{}source.disconnect();gain.disconnect();}
    this.voices.clear();
    this.buffers = [];
  }
}
