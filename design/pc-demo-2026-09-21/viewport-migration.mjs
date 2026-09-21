// Mechanical replacement of portrait screen coordinates with viewport dimensions.
// World distances, radii, speeds and the initial 480-unit default stay unchanged.
import fs from 'node:fs';
const root = new URL('../../', import.meta.url);
const patch=(file,fn)=>{const url=new URL(file,root);fs.writeFileSync(url,fn(fs.readFileSync(url,'utf8')));};
patch('app/engine.ts',s=>s.replace("'use client';", "'use client';")
  .replace("export class VoroEngine {", "export class VoroEngine {")
  .replace('constructor(canvas: HTMLCanvasElement, emit: (s: Snapshot) => void) {','constructor(canvas: HTMLCanvasElement, emit: (s: Snapshot) => void, readonly desktop = false) {')
  .replace('this.scale = b.width / 480;\n    this.width = 480;\n    this.height = b.height / this.scale;', `this.scale = this.desktop ? b.height / 720 : b.width / 480;
    this.width = this.desktop ? b.width / this.scale : 480;
    this.height = b.height / this.scale;`)
  .replace('const width = Math.round(b.width * this.pixelRatio)', 'if (this.desktop) this.pixelRatio = desktopViewport(b.width,b.height,devicePixelRatio).pixelRatio * this.rasterBudget.quality;\n    const width = Math.round(b.width * this.pixelRatio)')
  .replace('loadJourney(localStorage.getItem(JOURNEY_SAVE)) ||\n        migrateMicro(localStorage.getItem(MICRO_SAVE))','loadJourney(localStorage.getItem(this.desktop ? "voro-pc-demo-journey-v1" : JOURNEY_SAVE)) ||\n        (this.desktop ? null : migrateMicro(localStorage.getItem(MICRO_SAVE)))')
  .replace('        JOURNEY_SAVE,','        this.desktop ? "voro-pc-demo-journey-v1" : JOURNEY_SAVE,')
  .replaceAll('localStorage.getItem(VISUAL_SPEED_MODE)','localStorage.getItem(this.desktop ? "voro-pc-demo-speed-v1" : VISUAL_SPEED_MODE)')
  .replaceAll('localStorage.setItem(VISUAL_SPEED_MODE,','localStorage.setItem(this.desktop ? "voro-pc-demo-speed-v1" : VISUAL_SPEED_MODE,')
  .replaceAll(' + 240)', ' + this.width / 2)')
  .replaceAll('this.camera.x-240/this.zoom','this.camera.x-this.width/2/this.zoom')
  .replaceAll('this.camera.x+240/this.zoom','this.camera.x+this.width/2/this.zoom')
  .replace('Math.ceil(((this.height * 0.55) / this.zoom + 300) / 600)','visibleChunkRadius(this.width,this.height,this.zoom)')
  .replaceAll('(480 - 480 * scene.scale) / 2','(this.width - this.width * scene.scale) / 2')
  .replaceAll('480 * scene.scale','this.width * scene.scale')
  .replaceAll('0, 0, 480, this.height','0, 0, this.width, this.height')
  .replaceAll('0,0,480,this.height','0,0,this.width,this.height')
  .replaceAll('c.translate(240,','c.translate(this.width/2,')
  .replaceAll('draw(c,480,this.height','draw(c,this.width,this.height')
  .replaceAll('drawVoidSurvivor(c,480,this.height','drawVoidSurvivor(c,this.width,this.height')
  .replaceAll('ox = 240 / this.zoom','ox = this.width / 2 / this.zoom')
  .replaceAll('x + ox < 480 / this.zoom','x + ox < this.width / this.zoom')
  .replace('x < 455','x < this.width - 25')
  .replace('const cx = 240 +','const cx = this.width/2 +')
  .replace('this.time, !this.reduced);','this.time, !this.reduced, this.width);')
  .replace('this.life, this.earthAbsorption);','this.life, this.earthAbsorption, this.width);')
);
patch('app/engine.ts',s=>"import { desktopViewport, visibleChunkRadius } from './desktop-viewport.mjs';\n"+s);
patch('app/world-ground.mjs',s=>s.replace('waves = false) {','waves = false, viewportWidth = 480) {')
  .replaceAll('480','viewportWidth').replace('viewportWidth = viewportWidth','viewportWidth = 480')
  .replaceAll('240','viewportWidth/2')
  .replace('view.height === height','view.viewportWidth === viewportWidth && view.height === height')
  .replace('{ image, stage, seed, height, zoom','{ image, stage, seed, viewportWidth, height, zoom'));
patch('app/earth-landmark.mjs',s=>s.replace('absorption = 0) {','absorption = 0, width = 480) {')
  .replaceAll('240','width/2').replace('x - r > 480','x - r > width').replace('Math.min(410,x)','Math.min(width-70,x)'));
