// Experimental geography shared by the painting and the habitat preview.
function noise(y, seed) {
  const i = Math.floor(y), t = y - i, u = t * t * (3 - 2 * t);
  const hash = n => { let h = Math.imul(n, 374761393) ^ seed; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967295; };
  return hash(i) * (1 - u) + hash(i + 1) * u - .5;
}
export function coastX(y) {
  return noise(y / 1800, 823) * 1100 + noise(y / 570, 921) * 260 + noise(y / 170, 334) * 28;
}
export function coastHabitat(x, y) {
  const d = x - coastX(y);
  return d < -75 ? 'Arena seca' : d < 0 ? 'Arena húmeda' : 'Agua';
}
// Mirroring MATERIALS makes their edges meet; the geography is never tiled.
function material(image, crop, createCanvas) {
  const tile = createCanvas(); tile.width = tile.height = 512;
  const c = tile.getContext('2d');
  for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
    c.save(); c.translate(x ? 512 : 0, y ? 512 : 0); c.scale(x ? -1 : 1, y ? -1 : 1);
    c.drawImage(image, ...crop, 0, 0, 256, 256); c.restore();
  }
  return tile;
}
export class CoastPreview {
  constructor(image, createCanvas = () => document.createElement('canvas')) {
    this.createCanvas = createCanvas;
    const w = image.naturalWidth, h = image.naturalHeight;
    this.sand = material(image, [w * .52, h * .08, w * .22, h * .32], createCanvas);
    this.water = material(image, [w * .86, h * .08, w * .13, h * .32], createCanvas);
    this.depth = createCanvas(); this.depth.width = 618; this.depth.height = 2;
    const d = this.depth.getContext('2d');
    const wet = d.createLinearGradient(0, 0, 90, 0);
    wet.addColorStop(0, 'rgba(62,73,57,0)'); wet.addColorStop(1, 'rgba(62,73,57,.23)');
    d.fillStyle = wet; d.fillRect(0, 0, 90, 2);
    const sea = d.createLinearGradient(90, 0, 618, 0);
    sea.addColorStop(0, 'rgba(3,67,77,0)'); sea.addColorStop(1, 'rgba(3,67,77,.44)');
    d.fillStyle = sea; d.fillRect(90, 0, 528, 2);
    this.surface = createCanvas(); this.view = null; this.rebuilds = 0;
  }
  region(c, x0, x1, y0, y1, offset) {
    c.beginPath(); c.moveTo(x1, y0); c.lineTo(coastX(y0) + offset, y0);
    // Global sample grid avoids changing the curve when the viewport moves.
    for (let y = Math.ceil(y0 / 12) * 12; y < y1; y += 12) c.lineTo(coastX(y) + offset, y);
    c.lineTo(coastX(y1) + offset, y1); c.lineTo(x1, y1); c.closePath();
  }
  draw(c, camera, zoom, width, height, time, waves = true) {
    const pad = 160, v = this.view;
    const dx = v ? (v.x - camera.x) * zoom - pad : 0;
    const dy = v ? (v.y - camera.y) * zoom - pad : 0;
    if (!v || v.zoom !== zoom || v.width !== width || v.height !== height || dx > 0 || dy > 0 || dx + this.surface.width < width || dy + this.surface.height < height) {
      this.surface.width = Math.ceil(width + pad * 2); this.surface.height = Math.ceil(height + pad * 2);
      const layer = this.surface.getContext('2d');
      const x0 = camera.x - (width / 2 + pad) / zoom, x1 = camera.x + (width / 2 + pad) / zoom;
      const y0 = camera.y - (height / 2 + pad) / zoom, y1 = camera.y + (height / 2 + pad) / zoom;
      layer.setTransform(zoom, 0, 0, zoom, -x0 * zoom, -y0 * zoom);
      layer.fillStyle = layer.createPattern(this.sand, 'repeat'); layer.fillRect(x0, y0, x1 - x0, y1 - y0);
      this.region(layer, x0, x1, y0, y1, 0);
      layer.fillStyle = layer.createPattern(this.water, 'repeat'); layer.fill();
      this.region(layer, x0, x1, y0, y1, 528);
      layer.fillStyle = 'rgba(3,67,77,.44)'; layer.fill();
      // Warp a tiny precomputed gradient along the coast. Each pixel is shaded
      // once, instead of drawing dozens of full-water translucent polygons.
      for (let y = Math.floor(y0 / 12) * 12; y < y1; y += 12) {
        const start = coastX(y), slope = (coastX(y + 12) - start) / 12;
        layer.save(); layer.transform(1, 0, slope, 1, start - 90, y);
        layer.drawImage(this.depth, 0, 0, 618, 12); layer.restore();
      }
      this.view = { x: camera.x, y: camera.y, zoom, width, height }; this.rebuilds++;
    }
    const sx = pad + (camera.x - this.view.x) * zoom, sy = pad + (camera.y - this.view.y) * zoom;
    c.drawImage(this.surface, sx, sy, width, height, 0, 0, width, height);
    if (!waves) return;
    c.save(); c.translate(width / 2, height / 2); c.scale(zoom, zoom); c.translate(-camera.x, -camera.y);
    const y0 = camera.y - height / (2 * zoom) - 24, y1 = camera.y + height / (2 * zoom) + 24;
    for (let wave = 0; wave < 3; wave++) {
      const phase = ((time * .12 + wave / 3) % 1 + 1) % 1;
      const offset = 48 * (1 - phase) - 8, alpha = Math.sin(phase * Math.PI) * .32;
      c.beginPath();
      for (let y = Math.floor(y0 / 8) * 8, first = true; y <= y1; y += 8) {
        const x = coastX(y) + offset + Math.sin(y * .045 + wave) * 2.2 + noise(y / 18, wave + 53) * 5;
        if (first) c.moveTo(x, y); else c.lineTo(x, y); first = false;
      }
      c.strokeStyle = `rgba(237,249,237,${alpha * .22})`; c.lineWidth = 11; c.stroke();
      c.strokeStyle = `rgba(246,251,237,${alpha})`; c.lineWidth = 2.4; c.stroke();
    }
    c.restore();
  }
  destroy() { this.surface.width = this.surface.height = 1; this.sand.width = this.water.width = this.depth.width = 1; }
}
