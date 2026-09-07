import test from 'node:test';
import assert from 'node:assert/strict';
import { FrameMonitor } from '../app/frame-monitor.mjs';
import { compactPerformanceReport } from '../app/performance-report.mjs';
import { makeEngine } from './engine-fixture.mjs';

test('Correlations attribute delayed cadence to previous work and survive compact sharing', () => {
  const m = new FrameMonitor();
  m.add(16, 2, { groundRebuilt: true, uiPublished: false, rafDelay: 1, uiCommitDelay: 0 });
  m.add(50, 3, { groundRebuilt: false, uiPublished: true, rafDelay: 5, uiCommitDelay: 4 });
  m.add(20, 2, { groundRebuilt: false, uiPublished: false, rafDelay: 2, uiCommitDelay: 0 });
  const full = m.export(), compact = compactPerformanceReport(full);
  assert.deepEqual(compact.diagnostics, full.diagnostics);
  assert.equal(full.diagnostics.correlations.afterGroundRebuild.slowFrames, 1);
  assert.equal(full.diagnostics.correlations.afterUiPublish.slowFrames, 0);
  assert.equal(full.worstFrames[0].previousFrame.groundRebuilt, true);
  assert.equal(full.diagnostics.rafCallbackDelay.max, 5);
  assert.equal(full.diagnostics.uiDeliveryDelay.max, 4);
  assert.equal(full.diagnostics.over20ms, 1);
});

test('Identical resize notifications preserve the drawing buffer', () => {
  const { game } = makeEngine();
  let width = game.canvas.width, height = game.canvas.height, writes = 0;
  Object.defineProperties(game.canvas, {
    width: { get: () => width, set: value => { width = value; writes++; } },
    height: { get: () => height, set: value => { height = value; writes++; } },
  });
  game.resize(); game.resize(); assert.equal(writes, 0);
  game.canvas.getBoundingClientRect = () => ({width:400,height:850,left:0,top:0});
  game.resize(); assert.equal(writes, 2);
  game.resize(); assert.equal(writes, 2); game.destroy();
});

test('Completed capture summary is reused while HUD values keep updating', () => {
  const { game } = makeEngine();
  game.frameMonitor.add(20, 2);
  game.lastPerformanceReport = game.performanceReport();
  game.diagnosticCompleted = true;
  game.frameMonitor.summary = () => { throw Error('Completed summary must not be recalculated'); };
  for (let i=0;i<20;i++) { game.life.biomass++; game.publish(); }
  assert.equal(game.diagnosticSnapshot.fps, 50); game.destroy();
});
