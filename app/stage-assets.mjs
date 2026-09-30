import { STAGES, STAGE_SPECIES, ATLAS_URLS } from './journey-data.mjs';
import { BACKGROUND_ASSETS } from './background-assets.mjs';

// Keep high-resolution masters on disk, but city residents are tiny on screen.
// Resize once during stage loading, never in the animation loop. Source-space
// crop metadata is retained through explicit scale factors (including props).
export function compactCityAtlas(image, createCanvas) {
  if(!(image.naturalWidth>0&&image.naturalHeight>0))return null;
  const canvas=createCanvas?.();
  if(!canvas)return null;
  const w=image.naturalWidth,h=image.naturalHeight;
  const scale=Math.min(1,768/Math.max(w,h));
  canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);
  const c=canvas.getContext('2d');if(!c)return null;
  c.drawImage(image,0,0,canvas.width,canvas.height);
  Object.assign(canvas,{complete:true,naturalWidth:canvas.width,naturalHeight:canvas.height,
    sourceScaleX:canvas.width/w,sourceScaleY:canvas.height/h});
  return canvas;
}

export function stageResources(stage) {
  return RESOURCE_LISTS[stage];
}
const RESOURCE_LISTS = STAGES.map((_, stage) => {
  const resources = [...new Set(STAGE_SPECIES[stage].map(s => s.imageAtlas || s.atlas))]
    .map(key => ({ key, url: ATLAS_URLS[key], kind: 'atlas' }));
  const id = STAGES[stage].id;
  if (id === 'orbit') resources.push({ key: 'earth', kind: 'atlas', url: ATLAS_URLS.earth });
  resources.push({ key: id, kind: 'ground', url: BACKGROUND_ASSETS[id] });
  return resources;
});

// Only current/transition art is decoded. Two concurrent loads avoid a burst
// of decode completions at startup; readiness includes decode(), not just load.
export class StageAssets {
  constructor(atlases, grounds, changed, createImage = () => new Image(),
    createCanvas = () => typeof document==='undefined'?null:document.createElement('canvas')) {
    this.atlases = atlases;
    this.grounds = grounds;
    this.changed = changed;
    this.createImage = createImage;
    this.createCanvas = createCanvas;
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
      if(e.surface)e.surface.width=e.surface.height=1;
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
          if(ok&&e.key.startsWith('cityView_')) {
            const surface=compactCityAtlas(e.image,this.createCanvas);
            if(surface) {
              e.surface=surface;this.atlases[e.key]=surface;
              e.image.onload=e.image.onerror=null;e.image.src='';
            }
          }
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
    for (const e of this.entries.values()) {
      e.cancelled = true;
      if(e.surface)e.surface.width=e.surface.height=1;
    }
    this.entries.clear();
  }
}
