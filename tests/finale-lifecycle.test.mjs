import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEngine} from './engine-fixture.mjs';
import {newJourney,journeyLife,saveJourney,loadJourney,JOURNEY_SAVE} from '../app/journey-progress.mjs';
import {FINALE_SECONDS} from '../app/universe-finale.mjs';

test('Background/foreground during darkness resumes the cinematic instead of leaving an invisible pause',()=>{
 const {game:g}=makeEngine();g.startTest(9,230,false,true,true);g.beginUniverseFinale();g.ending=17;
 document.hidden=true;window.dispatchEvent(new Event('blur'));document.dispatchEvent(new Event('visibilitychange'));
 assert.equal(g.paused,true);assert.equal(g.finaleBackgroundPause,true);const saved=g.ending;
 g.frame(1000);assert.equal(g.ending,saved);
 document.hidden=false;document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));
 assert.equal(g.paused,false);assert.equal(g.finaleBackgroundPause,false);
 g.update(17);assert.equal(g.ending,0);assert.equal(g.progress.completed,true);g.destroy();
});

test('Cold launch preserves dark/reveal progress and waits for Continue; completed survivors stay complete',()=>{
 const previous=globalThis.localStorage;
 try{
  for(const elapsed of [2,8.5,12.9,15,18.1,26,31]){
   const p=newJourney(453);p.stage=9;p.completed=true;p.finaleRemaining=FINALE_SECONDS-elapsed;
   const l=journeyLife(p);l.biomass=230;l.eaten=47;
   const values=new Map([[JOURNEY_SAVE,saveJourney(p,l,{journal:new Map()},false)]]);
   globalThis.localStorage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};
   const {game:g}=makeEngine();const remaining=Math.min(23,FINALE_SECONDS-elapsed);
   assert.equal(g.ending,remaining);g.frame(1000);assert.equal(g.ending,remaining,'Intro must not consume the restored sequence');
   assert.equal(g.life.eaten,47);g.action('start');g.update(remaining||.01);g.save();
   const restored=loadJourney(values.get(JOURNEY_SAVE));assert.equal(restored.progress.finaleRemaining,0);assert.equal(restored.progress.completed,true);assert.equal(restored.life.eaten,47);g.destroy();
  }
 }finally{if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous}
});

test('Normal gameplay still pauses on background; legacy completed saves do not lose their ending',()=>{
 const {game:g}=makeEngine();g.started=true;document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));document.hidden=false;document.dispatchEvent(new Event('visibilitychange'));
 assert.equal(g.paused,true);g.destroy();
 const p=newJourney(2);p.stage=9;p.completed=true;delete p.finaleRemaining;
 const restored=loadJourney(saveJourney(p,journeyLife(p),{journal:new Map()},false));assert.equal(restored.progress.completed,true);assert.equal(restored.progress.finaleRemaining,0);
});

test('Low frame cadence does not stretch the final darkness; membrane integration remains bounded',()=>{
 const {game:g}=makeEngine();g.startTest(9,230,false,true,true);g.beginUniverseFinale();
 g.syncStageAssets=()=>{};Object.defineProperty(g,'assetsReady',{get:()=>true});g.render=()=>{};
 let maxStep=0;const animate=g.animateMembrane.bind(g);g.animateMembrane=dt=>{maxStep=Math.max(maxStep,dt);animate(dt)};
 g.last=1000;for(let stamp=1100;stamp<=32100&&g.ending>0;stamp+=100)g.frame(stamp);
 assert.equal(g.ending,0,'A 31-second cinematic must finish in 31 seconds at 10fps');
 assert.ok(maxStep<=.035);assert.ok(g.membrane.every(Number.isFinite));g.destroy();
});
