// Fixed storage, only gameplay frames. Pausing/backgrounding never produces a
// fake low-FPS sample. CPU time is separate from the browser's frame interval.
export class FrameMonitor {
  intervals = new Float64Array(120);
  work = new Float64Array(120);
  count = 0;
  index = 0;
  add(interval, work) {
    if (!(interval > 0) || !Number.isFinite(interval)) return;
    this.intervals[this.index] = interval;
    this.work[this.index] = work;
    this.index = (this.index + 1) % 120;
    this.count = Math.min(120, this.count + 1);
  }
  reset() { this.count = this.index = 0; }
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
}
