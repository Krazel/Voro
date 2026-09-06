import { STAGES, STAGE_SPECIES, ATLAS_URLS } from './journey-data.mjs';
import { GROUND_PROFILES } from './world-ground.mjs';

export function stageResources(stage) {
  return RESOURCE_LISTS[stage];
}
const RESOURCE_LISTS = STAGES.map((_, stage) => {
  const resources = [...new Set(STAGE_SPECIES[stage].map(s => s.imageAtlas || s.atlas))]
    .map(key => ({ key, url: ATLAS_URLS[key], kind: 'atlas' }));
  const id = STAGES[stage].id;
  resources.push({ key: id, kind: 'ground', url: id === 'micro'
    ? './abyssal-background.png'
    : `./backgrounds/${GROUND_PROFILES[id].file}-variants.webp` });
  return resources;
});

// Only current/transition art is decoded. Two concurrent loads avoid a burst
// of decode completions at startup; readiness includes decode(), not just load.
export class StageAssets {
  constructor(atlases, grounds, changed, createImage = () => new Image()) {
    this.atlases = atlases;
    this.grounds = grounds;
    this.changed = changed;
    this.createImage = createImage;
    this.entries = new Map();
    this.queue = [];
    this.active = 0;
    this.destroyed = false;
  }
  setStages(stages) {
    const resources = stages.flatMap(stageResources);
    const keep = new Set(resources.map(r => `${r.kind}:${r.key}`));
    for (const [id, e] of this.entries) {
      if (keep.has(id)) continue;
      e.cancelled = true;
      this.entries.delete(id);
      delete (e.kind === 'atlas' ? this.atlases : this.grounds)[e.key];
    }
    this.queue = this.queue.filter(e => !e.cancelled);
    for (const r of resources) {
      const id = `${r.kind}:${r.key}`;
      if (this.entries.has(id)) continue;
      const image = this.createImage();
      image.decoding = 'async';
      const entry = { ...r, image, ready: false, error: false, cancelled: false };
      this.entries.set(id, entry);
      (r.kind === 'atlas' ? this.atlases : this.grounds)[r.key] = image;
      this.queue.push(entry);
    }
    this.pump();
  }
  pump() {
    while (!this.destroyed && this.active < 2 && this.queue.length) {
      const e = this.queue.shift();
      this.active++;
      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        this.active--;
        if (!e.cancelled && !this.destroyed) {
          e.ready = ok;
          e.error = !ok;
          this.changed();
        }
        this.pump();
      };
      e.image.onload = () => {
        if (settled) { if (!this.destroyed && !e.cancelled) this.changed(); return; }
        if (typeof e.image.decode === 'function')
          e.image.decode().then(() => finish(true), () => finish(false));
        else finish(!!e.image.naturalWidth);
      };
      e.image.onerror = () => finish(false);
      e.image.src = e.url;
      if (e.image.complete && e.image.naturalWidth) e.image.onload();
    }
  }
  ready(stage) {
    return stageResources(stage).every(r => this.entries.get(`${r.kind}:${r.key}`)?.ready);
  }
  failed(stage) {
    return stageResources(stage).some(r => this.entries.get(`${r.kind}:${r.key}`)?.error);
  }
  stats() {
    return { images: this.entries.size, loading: this.active + this.queue.length };
  }
  destroy() {
    this.destroyed = true;
    this.queue.length = 0;
    for (const e of this.entries.values()) e.cancelled = true;
    this.entries.clear();
  }
}
