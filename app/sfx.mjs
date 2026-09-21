export const INGEST_SOUNDS = [1, 2, 3].map(index => `./sfx/ingest-${index}.wav`);

export class SfxPlayer {
  constructor(context, output, {
    fetcher = (...args) => fetch(...args),
    random = Math.random,
    now = () => performance.now(),
  } = {}) {
    this.context = context;
    this.output = output;
    this.fetcher = fetcher;
    this.random = random;
    this.now = now;
    this.buffers = [];
    this.last = -1;
    this.lastPlayedAt = -Infinity;
    this.loading = null;
    this.destroyed = false;
    this.voices = new Set();
  }
  unlock() {
    this.context.resume?.().catch(() => {});
    if (!this.loading) this.loading = Promise.all(INGEST_SOUNDS.map(async url => {
      const response = await this.fetcher(url);
      if (!response.ok) throw new Error(`SFX ${response.status}`);
      return this.context.decodeAudioData(await response.arrayBuffer());
    })).then(buffers => { if (!this.destroyed) this.buffers = buffers; }).catch(() => {});
    return this.loading;
  }
  playIngest() {
    const at = this.now();
    if (this.destroyed || !this.buffers.length || at - this.lastPlayedAt < 1000 / 3) return false;
    const choices = this.buffers.map((_, index) => index).filter(index => index !== this.last);
    const index = choices[Math.min(choices.length - 1, Math.floor(this.random() * choices.length))];
    const source = this.context.createBufferSource();
    source.buffer = this.buffers[index];
    // Resampling changes pitch and duration together, preserving the whole bite.
    // -5 to +6 semitones: roughly 1.33x to 0.71x its original duration.
    const semitones = -5 + this.random() * 11;
    source.playbackRate.value = 2 ** (semitones / 12);
    const gain = this.context.createGain();
    gain.gain.value = 0.65;
    source.connect(gain);
    gain.connect(this.output);
    const voice = { source, gain };
    this.voices.add(voice);
    source.onended = () => { source.disconnect(); gain.disconnect(); this.voices.delete(voice); };
    source.start();
    this.last = index;
    this.lastPlayedAt = at;
    return true;
  }
  destroy() {
    this.destroyed = true;
    for(const {source,gain} of this.voices){source.onended=null;try{source.stop();}catch{}source.disconnect();gain.disconnect();}
    this.voices.clear();
    this.buffers = [];
  }
}
