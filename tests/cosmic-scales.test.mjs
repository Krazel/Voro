import test from 'node:test';
import assert from 'node:assert/strict';
import { JourneyWorld } from '../app/journey-world.mjs';
import { SPECIES_BY_ID as S } from '../app/journey-data.mjs';
import { finaleState, FINALE_SECONDS } from '../app/universe-finale.mjs';
import { transitionScene } from '../app/journey-transitions.mjs';

test('Enlarged accretion disks actually fit in generated stellar populations', () => {
  const w = new JourneyWorld(63281, [], 7), disks=[];
  for(let x=0;x<30;x++) for(let y=0;y<20;y++) {
    const a=w.generate(x,y,0).entities;
    disks.push(...a.filter(e=>e.kind==='stars-Agujero negro estelar'));
    assert.deepEqual(a,w.generate(x,y,0).entities);
  }
  assert.ok(disks.length>20);
  assert.ok(Math.min(...disks.map(e=>e.r))>=252);
  assert.ok(Math.max(...disks.map(e=>e.r))>390);
});
test('Galaxy source crops include the upper arms and remain inside the atlas',()=>{
  for(let i=0;i<6;i++) {
    const s=S[`galaxies-${i}`], [x,y,w,h]=s.crop;
    assert.ok(y<768 && y+h===1024 && x+w<=1536);
    assert.equal(s.animationCropRevision,1);
    assert.ok(s.sizeFactors[1]/s.sizeFactors[0]>=4);
  }
});
test('Survivor reveal takes six seconds and remains fully visible after completion',()=>{
  const at=t=>finaleState(FINALE_SECONDS-t).survivor;
  assert.equal(at(10.2),0);
  assert.ok(Math.abs(at(13.2)-.5)<1e-10);
  assert.equal(at(16.2),1);
  assert.equal(at(17),1);
  assert.equal(at(100),1);
});
test('Scene handoff fades inhabitants continuously and keeps reduced motion stationary',()=>{
  for(const stage of ['micro','pond','water','city','orbit','stars','galaxies']) {
    for(let i=0;i<=100;i++) {
      const s=transitionScene(stage,i/100), r=transitionScene(stage,i/100,true);
      assert.equal(s.incoming+s.outgoing,1);
      assert.ok(s.scale>=.92 && s.scale<=1.025);
      assert.equal(r.scale,1);assert.equal(r.panX,0);assert.equal(r.panY,0);
    }
    assert.equal(transitionScene(stage,.5).inhabitants,0);
    assert.equal(transitionScene(stage,1).inhabitants,1);
  }
});
