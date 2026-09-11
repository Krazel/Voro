// A 120 Hz display must not double the game's drawing and simulation workload.
export class FramePacer {
  next = null;
  skipped = 0;
  accept(stamp) {
    const step = 1000 / 60;
    if (this.next !== null && stamp < this.next - 1) { this.skipped++; return false; }
    this.next = this.next === null || stamp - this.next > step ? stamp + step : this.next + step;
    return true;
  }
}

// Bound total raster work, including large tablets. World scale stays intact.
export function rasterRatio(width, height, deviceRatio, coarse) {
  const budget = coarse ? 1000000 : 1500000;
  return Math.min(deviceRatio || 1, coarse ? 1.5 : 2,
    Math.sqrt(budget / Math.max(1, width * height)));
}

// Downshift only after sustained missed frames, never on one isolated load.
// Keep the chosen scale for the session so resizing cannot oscillate.
export class RasterBudget {
  quality = 1;
  elapsed = 0;
  frames = 0;
  slow = 0;
  resetWindow() { this.elapsed = this.frames = this.slow = 0; }
  observe(interval, active) {
    if (!active || interval <= 0 || interval > 250) { this.resetWindow(); return false; }
    this.elapsed += interval; this.frames++;
    if (interval > 22) this.slow++;
    if (this.elapsed < 2400) return false;
    const lower = this.frames >= 12 && this.slow / this.frames > .25 && this.quality > .71;
    this.resetWindow();
    if (lower) this.quality = Math.max(.7, Math.round((this.quality - .1) * 10) / 10);
    return lower;
  }
}
