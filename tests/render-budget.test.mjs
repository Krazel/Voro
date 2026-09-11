import test from 'node:test';
import assert from 'node:assert/strict';
import { FramePacer, RasterBudget, rasterRatio } from '../app/render-budget.mjs';
import { gameplayZoom } from '../app/camera.mjs';
import { compactPerformanceReport } from '../app/performance-report.mjs';
import { makeEngine } from './engine-fixture.mjs';

test('120 Hz submits sixty frames per second, while 60 and 30 Hz keep their cadence',()=>{
  for(const hz of [30,60,120]) {
    const p=new FramePacer(),accepted=[];
    for(let i=0;i<hz*10;i++)if(p.accept(i*1000/hz))accepted.push(i*1000/hz);
    assert.equal(accepted.length,Math.min(hz,60)*10);
    for(let i=1;i<accepted.length;i++)assert.ok(Math.abs(accepted[i]-accepted[i-1]-1000/Math.min(hz,60))<1e-6);
    assert.equal(p.accept(100000),true,'Resume after suspension immediately');
    assert.equal(p.accept(100001),false,'No catch-up burst');
  }
});

test('Raster work has a tablet pixel budget without changing camera or CSS geometry',()=>{
  for(const [w,h,dpr,coarse] of [[375,812,3,true],[1024,1366,2,true],[1920,1080,2,false]]){
    const ratio=rasterRatio(w,h,dpr,coarse);
    assert.ok(w*h*ratio*ratio <= (coarse?1000000:1500000)+.01);
    assert.ok(ratio<=dpr);
  }
  assert.equal(rasterRatio(375,812,3,true),1.5);
});

test('Zoom controls change the framing, not biomass, and survive biome entry and tests',()=>{
  const {game}=makeEngine();game.startTest(0,150,false,true,true);
  const mass=game.life.biomass;
  game.setZoom(1.5);assert.equal(game.life.biomass,mass);
  assert.equal(game.zoom,gameplayZoom(game.life.radius)*1.5);
  game.transition=3.61;game.transitionAdvanced=false;game.transitionFrom=0;
  game.zoom=.6;game.update(.02);
  assert.equal(game.progress.stage,1);
  assert.equal(game.zoom,gameplayZoom(game.life.radius)*1.5);
  game.startTest(2,1,false,true,false);
  assert.equal(game.zoomFactor,1.5);
  assert.equal(game.zoom,gameplayZoom(game.life.radius)*1.5);
  game.setZoom(-100);assert.equal(game.zoomFactor,.75);
  game.setZoom(Infinity);assert.equal(game.zoomFactor,1);
  game.setZoom(100);assert.equal(game.zoomFactor,1.75);
  game.setZoom(1);assert.equal(game.zoom,gameplayZoom(game.life.radius));
  game.destroy();
});

test('Shared diagnostics preserve render budget and manual zoom settings',()=>{
  const {game}=makeEngine();game.setDiagnostics(true);game.setZoom(1.4);
  game.frameMonitor.add(17,4,{stage:0});
  const report=game.performanceReport();
  assert.equal(report.rendering.targetFPS,60);
  assert.equal(report.rendering.zoomFactor,1.4);
  assert.deepEqual(compactPerformanceReport(report).rendering,report.rendering);
  game.destroy();
});

test('Adaptive raster ignores isolated stalls and pauses, reduces sustained load without oscillation',()=>{
  const b=new RasterBudget();
  for(let i=0;i<300;i++)b.observe(i===20?100:16.67,true);
  assert.equal(b.quality,1);
  for(let i=0;i<90;i++)b.observe(33.34,true);
  assert.equal(b.quality,.9);
  for(let i=0;i<300;i++)b.observe(16.67,true);
  assert.equal(b.quality,.9);
  for(let i=0;i<1000;i++)b.observe(40,true);
  assert.equal(b.quality,.7);
  const paused=new RasterBudget();
  for(let i=0;i<1000;i++)paused.observe(40,false);
  assert.equal(paused.quality,1);
});

test('Sustained 10 fps also lowers resolution; severe stalls cannot miss a minimum-frame threshold',()=>{
  const budget=new RasterBudget();
  for(let i=0;i<25;i++)budget.observe(100,true);
  assert.equal(budget.quality,.9);
  for(let i=0;i<75;i++)budget.observe(100,true);
  assert.equal(budget.quality,.7);
});
