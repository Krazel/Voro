import MANIFEST from './animation-sheets.json' with { type: 'json' };
import { ANIMATIONS } from './animation-catalog.mjs';
import { applyPoseTransform } from './inhabitant-animation.mjs';

export class AnimationSheets {
  constructor({ createImage = () => new Image(), changed = () => {}, event = (_name, _ms, _detail) => {}, manifest = MANIFEST,
    limit = 64 * 1024 * 1024 } = {}) {
    this.createImage = createImage; this.changed = changed; this.event = event; this.manifest = manifest;
    this.limit = limit; this.entries = new Map(); this.allowed = new Set();
    this.frame = 0; this.bytes = 0; this.active = 0; this.hits = 0;
    this.loads = 0; this.evictions = 0; this.dropped = 0; this.errors = 0;
    this.enabled = true; this.destroyed = false;
  }
  setSpecies(species) {
    this.allowed = new Set(species.flatMap(s => Object.values(this.manifest[s.id] || {}).map(m => m.url)));
    for (const [url, e] of this.entries) if (!this.allowed.has(url)) this.release(url, e);
  }
  release(url, e) {
    e.cancelled = true;
    this.entries.delete(url);
    // Active loads keep their reservation until completion, limiting peak memory.
    if (e.state !== 'loading') {
      this.bytes -= e.cost; e.cost = 0;
      if (e.image) { e.image.onload = e.image.onerror = null; e.image.src = ''; }
    }
    this.evictions++;
  }
  beginFrame() {
    this.frame++;
    for (const [url, e] of this.entries) {
      if (e.state === 'queued' && this.frame - e.seen > 3) {
        this.release(url, e); this.dropped++;
      }
    }
    this.pump();
  }
  request(meta) {
    if (!meta || !this.allowed.has(meta.url)) return null;
    let e = this.entries.get(meta.url);
    if (e) { e.seen = this.frame; return e; }
    if (meta.bytes > this.limit) return null;
    // Never evict an animal being drawn to load another one in the same view.
    for (const [url, old] of this.entries) {
      if (this.bytes + meta.bytes <= this.limit) break;
      if (old.state !== 'loading' && this.frame - old.seen > 30) this.release(url, old);
    }
    if (this.bytes + meta.bytes > this.limit) return null;
    e = { meta, cost: meta.bytes, state: 'queued', seen: this.frame, image: null, cancelled: false };
    this.entries.set(meta.url, e); this.bytes += meta.bytes;
    return e;
  }
  pump() {
    if (this.destroyed || !this.enabled) return;
    for (const e of this.entries.values()) {
      if (this.active >= 2) break;
      if (e.state !== 'queued') continue;
      e.state = 'loading'; this.active++; this.loads++;
      const startedAt = performance.now();
      const image = e.image = this.createImage(); image.decoding = 'async';
      let settled = false;
      const finish = ok => {
        if (settled) return; settled = true; this.active--;
        if (!ok || e.cancelled || this.destroyed) { this.bytes -= e.cost; e.cost = 0; }
        if (e.cancelled || this.destroyed) { image.onload = image.onerror = null; image.src = ''; return; }
        e.state = ok ? 'ready' : 'error';
        this.event('animation-image', performance.now() - startedAt,
          { url: e.meta.url, ok, decodedBytes: ok ? e.meta.bytes : 0, durationKind: 'load-and-decode-elapsed-not-CPU' });
        if (!ok) { this.errors++; image.onload = image.onerror = null; image.src = ''; e.image = null; }
        this.changed();
      };
      image.onload = () => typeof image.decode === 'function'
        ? image.decode().then(() => finish(true), () => finish(false))
        : finish(!!image.naturalWidth);
      image.onerror = () => finish(false);
      image.src = e.meta.url;
      if (image.complete && image.naturalWidth) image.onload();
    }
  }
  draw(c, s, r, phase, activity) {
    if (!this.enabled || this.destroyed) return 'unavailable';
    const versions = this.manifest[s.id];
    if (!versions || activity < 0.65) return 'unavailable';
    // Normal motion first, then the reaction variant. A missing reaction never
    // removes the normal swimming cycle from the screen.
    const normal = this.request(versions[1]);
    const desired = activity > 1.25 ? this.request(versions[1.5]) : normal;
    const e = desired?.state === 'ready' ? desired : normal?.state === 'ready' ? normal : null;
    if (!e) return normal && normal.state !== 'error' ? 'pending' : 'unavailable';
    this.hits++;
    const m = e.meta, f = Math.floor(phase / (Math.PI * 2) * m.frames) % m.frames;
    const scale = r * m.extent / m.size;
    c.save();
    applyPoseTransform(c, ANIMATIONS[s.id], r, phase, activity);
    c.drawImage(e.image, f % m.cols * m.w, Math.floor(f / m.cols) * m.h,
      m.w, m.h, (m.x - m.size / 2) * scale, (m.y - m.size / 2) * scale, m.w * scale, m.h * scale);
    c.restore();
    return 'ready';
  }
  stats() {
    return { bytes: this.bytes, limit: this.limit, resident: this.entries.size, active: this.active,
      pending: [...this.entries.values()].filter(e => e.state === 'queued' || e.state === 'loading').length,
      hits: this.hits, loads: this.loads, evictions: this.evictions, dropped: this.dropped, errors: this.errors };
  }
  destroy() {
    this.destroyed = true;
    for (const [url, e] of this.entries) this.release(url, e);
  }
}
