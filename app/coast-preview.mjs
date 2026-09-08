import { shoreDepth } from './shore-geography.mjs';
export { coastHabitat } from './shore-geography.mjs';

// Approved painted materials meet at mirrored edges. The sand/water geography
// comes from a continuous field, never from repeated pictures of a coastline.
function material(image, crop, createCanvas) {
  const tile = createCanvas(); tile.width = tile.height = 512;
  const c = tile.getContext('2d');
  for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
    c.save(); c.translate(x ? 512 : 0, y ? 512 : 0); c.scale(x ? -1 : 1, y ? -1 : 1);
    c.drawImage(image, ...crop, 0, 0, 256, 256); c.restore();
  }
  return tile;
}
const clamp = x => Math.max(0, Math.min(1, x));
function resize(canvas, width, height) {
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
}
export class CoastPreview {
  constructor(image, createCanvas = () => document.createElement('canvas')) {
    this.image = image;
    const w = image.naturalWidth || image.width, h = image.naturalHeight || image.height;
    this.sand = material(image, [w * .52, h * .08, w * .22, h * .32], createCanvas);
    this.water = material(image, [w * .40, h * .58, w * .09, h * .32], createCanvas);
    this.surface = createCanvas(); this.foam = createCanvas();
    this.mask = createCanvas(); this.waterLayer = createCanvas();
    this.view = null; this.rebuilds = 0;
  }
  rebuild(camera, zoom, width, height, anchorY) {
    const pad = 192;
    for (const canvas of [this.surface, this.waterLayer]) resize(canvas, Math.ceil(width + pad * 2), Math.ceil(height + pad * 2));
    // Masks stay on a global grid so revisiting a place gives identical edges.
    const step = 12;
    const x0 = Math.floor((camera.x - (width / 2 + pad) / zoom) / step) * step;
    const y0 = Math.floor((camera.y - (height * anchorY + pad) / zoom) / step) * step;
    const mw = Math.ceil(this.surface.width / zoom / step) + 3;
    const mh = Math.ceil(this.surface.height / zoom / step) + 3;
    for (const canvas of [this.mask, this.foam]) resize(canvas, mw, mh);
    const maskContext = this.mask.getContext('2d'), foamContext = this.foam.getContext('2d');
    const water = maskContext.createImageData(mw, mh), shade = maskContext.createImageData(mw, mh), foam = maskContext.createImageData(mw, mh);
    for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
      const d = shoreDepth(x0 + x * step, y0 + y * step), i = (y * mw + x) * 4;
      water.data[i + 3] = Math.round((1 - clamp((d + 2) / 4)) * 255);
      shade.data[i] = 15; shade.data[i + 1] = 62; shade.data[i + 2] = 61;
      shade.data[i + 3] = Math.round(255 * (d > 0 ? clamp(d / 180) * .36 : clamp(1 + d / 38) * .23));
      foam.data[i] = 244; foam.data[i + 1] = 250; foam.data[i + 2] = 232;
      foam.data[i + 3] = Math.round(Math.exp(-(((d - 3) / 3.2) ** 2)) * 135);
    }
    const layer = this.surface.getContext('2d'), wet = this.waterLayer.getContext('2d');
    const ox = width / 2 + pad - camera.x * zoom, oy = height * anchorY + pad - camera.y * zoom;
    for (const [c, texture] of [[layer, this.sand], [wet, this.water]]) {
      c.globalCompositeOperation = 'source-over';
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, this.surface.width, this.surface.height);
      c.setTransform(zoom, 0, 0, zoom, ox, oy);
      c.fillStyle = c.createPattern(texture, 'repeat');
      c.fillRect(-ox / zoom, -oy / zoom, this.surface.width / zoom, this.surface.height / zoom);
    }
    // Pixel samples represent cell centres: avoid shifting habitat edges.
    const rect = [x0 - step / 2, y0 - step / 2, mw * step, mh * step];
    const screenRect = [rect[0] * zoom + ox, rect[1] * zoom + oy, rect[2] * zoom, rect[3] * zoom];
    maskContext.clearRect(0, 0, mw, mh); maskContext.putImageData(water, 0, 0);
    wet.setTransform(1, 0, 0, 1, 0, 0);
    wet.globalCompositeOperation = 'destination-out'; wet.drawImage(this.mask, 0, 0, mw, mh, ...screenRect);
    layer.setTransform(1, 0, 0, 1, 0, 0); layer.drawImage(this.waterLayer, 0, 0);
    maskContext.clearRect(0, 0, mw, mh); maskContext.putImageData(shade, 0, 0);
    layer.drawImage(this.mask, 0, 0, mw, mh, ...screenRect);
    foamContext.clearRect(0, 0, mw, mh); foamContext.putImageData(foam, 0, 0);
    this.view = { image: this.image, x: camera.x, y: camera.y, zoom, width, height, anchorY, rect };
    this.rebuilds++;
  }
  draw(c, camera, zoom, width, height, time, waves = true, anchorY = .5) {
    const pad = 192, v = this.view, ratio = v ? zoom / v.zoom : 1;
    const dx = v ? width / 2 * (1 - ratio) + (v.x - camera.x) * zoom - pad * ratio : 0;
    const dy = v ? height * anchorY * (1 - ratio) + (v.y - camera.y) * zoom - pad * ratio : 0;
    if (!v || ratio < .85 || ratio > 1.18 || v.anchorY !== anchorY || v.width !== width || v.height !== height || dx > 0 || dy > 0 || dx + this.surface.width * ratio < width || dy + this.surface.height * ratio < height)
      this.rebuild(camera, zoom, width, height, anchorY);
    const scale = zoom / this.view.zoom;
    const sx = pad + (camera.x - this.view.x) * this.view.zoom + width / 2 * (1 - 1 / scale);
    const sy = pad + (camera.y - this.view.y) * this.view.zoom + height * anchorY * (1 - 1 / scale);
    c.drawImage(this.surface, sx, sy, width / scale, height / scale, 0, 0, width, height);
    if (waves) {
      const [x, y, w, h] = this.view.rect;
      c.save(); c.globalAlpha *= .58 + Math.sin(time * 1.5) * .2;
      c.drawImage(this.foam, (x - camera.x) * zoom + width / 2, (y - camera.y) * zoom + height * anchorY, w * zoom, h * zoom);
      c.restore();
    }
  }
  destroy() {
    for (const c of [this.surface, this.foam, this.mask, this.waterLayer, this.sand, this.water]) c.width = c.height = 1;
  }
}
