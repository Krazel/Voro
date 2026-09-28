import MANIFEST from './animation-sheets.json' with { type: 'json' };
import { ANIMATIONS } from './animation-catalog.mjs';
import { applyPoseTransform } from './inhabitant-animation.mjs';

export class AnimationSheets {
  constructor({ createImage = () => new Image(), changed = () => {}, event = (_name, _ms, _detail) => {}, manifest = MANIFEST,
    limit = 64 * 1024 * 1024 } = {}) {
    this.createImage = createImage; this.changed = changed; this.event = event; this.manifest = manifest;
    this.limit = limit; this.entries = new Map(); this.allowed = new Set();
    this.baselines=new Map();this.baseForUrl=new Map();
    this.frame = 0; this.bytes = 0; this.active = 0; this.hits = 0;
    this.loads = 0; this.evictions = 0; this.dropped = 0; this.errors = 0;
    this.enabled = true; this.destroyed = false; this.highDetail = false; this.selections=new Map();
  }
  setSpecies(species) {
    this.selections.clear();
    this.baselines.clear();this.baseForUrl.clear();
    for(const s of species){const v=this.manifest[s.id];if(!v)continue;
      this.baselines.set(v[1].url,v[1].bytes);
      for(const m of Object.values(v))this.baseForUrl.set(m.url,v[1].url);
    }
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
  request(meta, optional=false) {
    if (!meta || !this.allowed.has(meta.url)) return null;
    let e = this.entries.get(meta.url);
    if (e) { e.seen = this.frame; return e; }
    if (meta.bytes > this.limit) return null;
    // Optional sharpness must leave room for the other residents' basic cycles.
    // Count an already queued/loaded detailed cycle as covering its own base.
    const reserved=()=>{
      if(!optional)return 0;
      const covered=new Set([...this.entries.keys(),meta.url].map(url=>this.baseForUrl.get(url)));
      let bytes=0;for(const [url,cost]of this.baselines)if(!covered.has(url))bytes+=cost;
      return bytes;
    };
    // Never evict an animal being drawn to load another one in the same view.
    for (const [url, old] of this.entries) {
      if (this.bytes + meta.bytes + reserved() <= this.limit) break;
      if (old.state !== 'loading' && this.frame - old.seen > 30) this.release(url, old);
    }
    if (this.bytes + meta.bytes + reserved() > this.limit) return null;
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
    if (Object.values(versions).some(m => (m.cropRevision || 0) !== (s.animationCropRevision || 0))) return 'unavailable';
    // A close view must not switch a decoded animation into hundreds of Canvas
    // clips per frame. Scale the approved cycle like any other sprite. The
    // animation gallery still uses the continuous rig for detailed inspection.
    // Normal motion first, then the reaction variant. A missing reaction never
    // removes the normal swimming cycle from the screen.
    const matrix = c.getTransform?.();
    const pixels = matrix ? Math.hypot(matrix.a, matrix.b) : 1;
    const energy = activity > 1.25 ? 1.5 : 1;
    const lowMeta=versions[energy]||versions[1];
    const demand=r*pixels*2;
    const candidates=[lowMeta];
    if(this.highDetail)for(const tier of ['md','hd']) {
      const m=versions[`${tier}${energy}`];
      const previous=candidates.at(-1);
      if(m && demand>previous.size*2/previous.extent*1.18)candidates.push(m);
    }
    // Try the sharpest useful tier that fits. Budget pressure falls back to a
    // smaller animated sheet; it never disables the cap or invokes a live rig.
    const desired=candidates.at(-1);
    const reusable=Object.entries(versions).filter(([key,m])=>(key===String(energy)||key.endsWith('d'+energy))&&m.size>=desired.size)
      .map(([,m])=>this.entries.get(m.url)).find(e=>e?.state==='ready');
    let preferred=reusable||null;
    if(reusable)reusable.seen=this.frame;
    else for(const m of [...candidates].reverse())if((preferred=this.request(m,m!==lowMeta)))break;
    // Load only the requested energy, rather than pinning two full cycles for
    // every species. Optional detail uses an already-ready low cycle as fallback.
    let e=preferred?.state==='ready'?preferred:null;
    if(!e) {
      const ready=Object.entries(versions).filter(([key])=>energy===1.5||!key.endsWith('1.5')).map(([,m])=>this.entries.get(m.url))
        .filter(e=>e?.state==='ready'&&e.meta.size<=candidates.at(-1).size)
        .sort((a,b)=>b.meta.size-a.meta.size);
      const low=ready[0];
      if(low?.state==='ready'){low.seen=this.frame;e=low;}
      else if(preferred?.meta!==lowMeta)this.request(lowMeta,true);
    }
    // Budget pressure must never switch gameplay back to live mesh generation.
    if(!e)return preferred?.state==='error'?'unavailable':'pending';
    this.hits++;
    const m = e.meta, f = Math.floor(phase / (Math.PI * 2) * m.frames) % m.frames;
    this.selections.set(s.id,{id:s.id,seen:this.frame,posesPerSecond:+(m.frames/ANIMATIONS[s.id].period).toFixed(2),
      bodyPixels:Math.round(m.size*2/m.extent),tier:m===versions.hd1||m===versions['hd1.5']?'close':m===versions.md1||m===versions['md1.5']?'medium':'standard'});
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
      hits: this.hits, loads: this.loads, evictions: this.evictions, dropped: this.dropped, errors: this.errors,
      quality:this.highDetail?'optional-close-up':'standard',
      visibleCycles:[...this.selections.values()].filter(s=>this.frame-s.seen<=1).map(({seen,...s})=>s) };
  }
  destroy() {
    this.destroyed = true;
    for (const [url, e] of this.entries) this.release(url, e);
  }
}
