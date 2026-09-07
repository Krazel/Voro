// Fixed storage, only gameplay frames. Pausing/backgrounding never produces a
// fake low-FPS sample. CPU time is separate from the browser's frame interval.
export class FrameMonitor {
  intervals = new Float64Array(120);
  work = new Float64Array(120);
  count = 0;
  index = 0;
  samples = [];
  events = [];
  totalFrames = 0;
  elapsed = 0;
  partTotals = {};
  slowFrames = 0;
  /** @type {Record<string, number>} */
  frameParts = {};
  add(interval, work, context = {}) {
    if (!(interval > 0) || !Number.isFinite(interval)) return;
    this.intervals[this.index] = interval;
    this.work[this.index] = work;
    this.index = (this.index + 1) % 120;
    this.count = Math.min(120, this.count + 1);
    this.totalFrames++;
    this.elapsed += interval;
    const sample = { at: Math.round(this.elapsed), interval, cpu: work, ...context,
      parts: this.frameParts };
    const old = this.samples.length === 3600 ? this.samples[(this.totalFrames - 1) % 3600] : null;
    if (old) {
      if (old.interval > 33.34) this.slowFrames--;
      for (const [k,v] of Object.entries(old.parts)) this.partTotals[k] -= v;
    }
    if (interval > 33.34) this.slowFrames++;
    for (const [k,v] of Object.entries(sample.parts)) this.partTotals[k] = (this.partTotals[k] || 0) + v;
    if (this.samples.length < 3600) this.samples.push(sample);
    else this.samples[(this.totalFrames - 1) % 3600] = sample;
  }
  beginFrame() { this.frameParts = {}; }
  measure(name, run) {
    const start = performance.now();
    try { return run(); } finally { this.frameParts[name] = (this.frameParts[name] || 0) + performance.now() - start; }
  }
  event(name, ms, detail = {}) {
    this.events.push({ at: Math.round(this.elapsed), name, ms: +ms.toFixed(2), ...detail });
    if (this.events.length > 120) this.events.shift();
  }
  reset() {
    this.count = this.index = this.totalFrames = this.elapsed = 0;
    this.samples = []; this.events = []; this.frameParts = {}; this.partTotals = {}; this.slowFrames = 0;
  }
  report() {
    let total = 0, cpu = 0, peak = 0;
    for (let i = 0; i < this.count; i++) {
      total += this.intervals[i];
      cpu += this.work[i];
      peak = Math.max(peak, this.intervals[i]);
    }
    return { fps: total ? Math.round(this.count * 1000 / total) : 0,
      cpu: this.count ? Math.round(cpu / this.count * 10) / 10 : 0,
      peak: Math.round(peak) };
  }
  summary(wholeSession = false) {
    const intervals = (wholeSession ? this.samples.map(s=>s.interval) : Array.from(this.intervals.subarray(0, this.count))).sort((a,b) => a-b);
    const samples = this.samples;
    const report = wholeSession && samples.length ? {
      fps: Math.round(samples.length * 1000 / samples.reduce((n,s)=>n+s.interval,0)),
      cpu: +(samples.reduce((n,s)=>n+s.cpu,0) / samples.length).toFixed(1),
      peak: Math.round(intervals.at(-1)),
    } : this.report();
    return { ...report, p95: intervals.length ? +intervals[Math.ceil(intervals.length * .95) - 1].toFixed(1) : 0,
      seconds: Math.round(this.elapsed / 1000), frames: this.totalFrames,
      slowFrames: this.slowFrames,
      parts: Object.fromEntries(Object.entries(this.partTotals).map(([k,v]) => [k, +(v / (samples.length || 1)).toFixed(2)])) };
  }
  export(metadata = {}) {
    const samples = [...this.samples].sort((a,b) => a.at-b.at).map(s => ({ ...s,
      interval: +s.interval.toFixed(2), cpu: +s.cpu.toFixed(2),
      parts: Object.fromEntries(Object.entries(s.parts).map(([k,v])=>[k,+v.toFixed(2)])) }));
    const intervals = samples.map(s=>s.interval).sort((a,b)=>a-b);
    const p = f => intervals.length ? intervals[Math.ceil(intervals.length * f)-1] : 0;
    return { format: 'voro-performance-v1', ...metadata, summary: this.summary(true),
      session: { p50: p(.5), p95: p(.95), p99: p(.99), retainedFrames: samples.length,
        fps: samples.length ? +(samples.length * 1000 / samples.reduce((n,s)=>n+s.interval,0)).toFixed(1) : 0 },
      worstFrames: samples.map((s,i) => ({...s, previousFrame: i ? {
        at: samples[i-1].at, cpu: samples[i-1].cpu, parts: samples[i-1].parts,
      } : null})).sort((a,b)=>b.interval-a.interval).slice(0,30),
      events: [...this.events], samples,
      notes: ['Intervals are requestAnimationFrame cadence, not GPU timings.',
        'A long interval can reflect work in the previous frame; worstFrames includes that frame for correlation.',
        'CPU sections overlap: render includes backgrounds, inhabitants and protagonist; simulation can include saving.',
        'Paused, hidden and asset-wait frames excluded. Up to 3600 active frames retained; worst frames refer to that window.',
        'No telemetry is sent automatically.'] };
  }
}
