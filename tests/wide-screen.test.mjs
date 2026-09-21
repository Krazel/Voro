import test from 'node:test';
import assert from 'node:assert/strict';
import { desktopViewport, isTabletDevice, wideScreenEnabled, visibleChunkRadius } from '../app/desktop-viewport.mjs';
import { STAGES } from '../app/journey-data.mjs';
import { makeEngine } from './engine-fixture.mjs';

test('Landscape is enabled on both iPad browser identities, never on portrait iPad or iPhone', () => {
  for(const device of [{userAgent:'iPad'}, {platform:'MacIntel',maxTouchPoints:5}]) {
    assert.ok(isTabletDevice(device));
    assert.ok(wideScreenEnabled(false,isTabletDevice(device),1194,834));
    assert.equal(wideScreenEnabled(false,isTabletDevice(device),834,1194),false);
  }
  assert.equal(isTabletDevice({userAgent:'iPhone',platform:'iPhone',maxTouchPoints:5}),false);
  assert.equal(isTabletDevice({platform:'MacIntel',maxTouchPoints:0}),false);
  assert.equal(wideScreenEnabled(false,false,844,390),false);
});
test('PC aspect ratios reveal more world without changing vertical scale; raster is bounded', () => {
  for(const [w,h] of [[1280,720],[1920,1080],[3440,1440],[3840,2160]]) {
    const v=desktopViewport(w,h,2);
    assert.equal(v.height,720);
    assert.equal(v.width/v.height,w/h);
    assert.ok(w*h*v.pixelRatio**2<=2400001);
    assert.ok(visibleChunkRadius(v.width,v.height,1)*600>=v.width/2+300);
  }
});
test('iPad rotation resizes the same game and preserves progression and camera', t => {
  const original=Object.getOwnPropertyDescriptor(globalThis,'navigator');
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{platform:'MacIntel',maxTouchPoints:5}});
  t.after(()=>Object.defineProperty(globalThis,'navigator',original));
  const bounds={width:560,height:1194,left:0,top:0};
  const {game}=makeEngine({bounds});
  t.after(()=>game.destroy());
  const life=game.life,progress=game.progress,world=game.world,zoom=game.zoom;
  const portraitHeight=game.height;
  assert.equal(game.width,480);
  bounds.width=1194;bounds.height=834;game.resize();
  assert.ok(game.width>1000);assert.ok(Math.abs(game.height-720)<1e-9);
  const point=game.point({clientX:597,clientY:417});
  assert.equal(point.x,game.width/2);assert.ok(Math.abs(point.y-360)<1e-9);
  assert.equal(game.life,life);assert.equal(game.progress,progress);assert.equal(game.world,world);assert.equal(game.zoom,zoom);
  bounds.width=560;bounds.height=1194;game.resize();
  assert.equal(game.width,480);assert.equal(game.height,portraitHeight);
});
test('All backgrounds render at desktop width and invalidate cached crop after resize', t => {
  const bounds={width:1280,height:720,left:0,top:0};
  const {game}=makeEngine({desktop:true,bounds});t.after(()=>game.destroy());
  for(let stage=0;stage<STAGES.length;stage++) {
    game.startTest(stage,1);game.drawBackground(stage);
    assert.equal(game.width,1280);
    bounds.width=1600;game.resize();game.drawBackground(stage);
    const view=game.worldGround.views.get(STAGES[stage].id);
    if(STAGES[stage].id!=='land') { assert.ok(view?.view); assert.equal(view.view.viewportWidth,1600); }
    bounds.width=1280;game.resize();
  }
});
