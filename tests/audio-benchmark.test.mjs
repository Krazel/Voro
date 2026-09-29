import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioBenchmark, AudioProbe } from '../app/audio-benchmark.mjs';
import { SfxPlayer } from '../app/sfx.mjs';
import { STAGES, stageStartMass } from '../app/journey-data.mjs';
import { makeEngine } from './engine-fixture.mjs';
import { compactPerformanceReport, deliverReportFile } from '../app/performance-report.mjs';

test('A missing diagnostic bite is reported unavailable instead of replaced by another sample',()=>{
 const p=new SfxPlayer({state:'running'},{});p.buffers=[{duration:.5}];
 assert.equal(p.playIngest(4),false);assert.equal(p.stats().notReady,1);assert.equal(p.stats().played,0);
});

test('Audio sequence covers all tracks, five bites and both impacts without replaying late bursts',()=>{
 const tour=new AudioBenchmark(STAGES,stageStartMass);
 assert.equal(tour.plan.length,12);assert.equal(tour.plan[0].music,'menu');assert.equal(tour.plan.at(-1).music,'final');
 let clock=0;const p=new AudioProbe(null,[],()=>clock),calls=[];
 for(let t=0;t<8;t+=.05){clock=t*1000;p.due(t,'micro',(kind,index)=>{calls.push([kind,index]);return {played:true};});}
 assert.deepEqual(calls.filter(c=>c[0]==='ingest').map(c=>c[1]),[0,1,2,3,4]);
 assert.deepEqual(calls.slice(5).map(c=>c[0]),['damage','shield','chime','evolve']);
 const late=new AudioProbe(null);late.due(7,'micro',()=>assert.fail('No burst after a stalled frame'));
 assert.equal(late.events.length,9);assert.ok(late.events.every(e=>e.type==='effect-missed'));
});

test('Audio monitor records gaps, sampled overload and user marks without interpreting silence as an error',()=>{
 let at=0,disconnected=0;const c={currentTime:0,state:'running',createAnalyser:()=>({getFloatTimeDomainData:a=>a.fill(1.1),disconnect(){}})};
 const p=new AudioProbe(c,[{connect(){},disconnect(){disconnected++;}}],()=>at);
 p.sample(true,'recording',null);at=300;p.sample(true,'recording',null);p.event('heard-glitch');
 assert.equal(p.report().observations.stalledAudioClock,1);assert.equal(p.report().observations.sampledOverload,2);
 p.sample(false,'recording',null);at=90000;p.sample(true,'recording',null);
 assert.equal(p.samples.at(-1).gapMs,0);assert.equal(p.report().observations.userMarks,1);
 p.destroy();assert.equal(disconnected,1);
});

test('Automatic audio cancellation restores muted campaign and exports even during loading',async()=>{
 const previous=globalThis.localStorage,writes=[];
 globalThis.localStorage={getItem:()=>null,setItem:(...args)=>writes.push(args)};
 const {game}=makeEngine();
 try{
  game.started=true;game.sound=false;game.paused=true;game.life.biomass=42;
  const life=game.life,progress=game.progress;
  assert.equal(game.startAutomaticBenchmark(true),true);const saved=writes.at(-1);
  game.markAudioGlitch();game.finishAutomaticBenchmark();
  assert.equal(game.life,life);assert.equal(game.progress,progress);assert.equal(game.sound,false);assert.equal(game.paused,true);
  assert.deepEqual(writes.at(-1),saved);assert.equal(game.audioProbe,null);
  const r=game.performanceReport();assert.equal(r.mode,'audio');assert.equal(r.status,'cancelled');
  assert.equal(r.results[0].report.audioProbe.observations.userMarks,1);assert.equal(compactPerformanceReport(r),r);
  let name;await deliverReportFile(JSON.stringify(r),{native:true,write:async n=>{name=n;return{uri:'file:///audio.txt'}},shareNative:async()=>{}});
  assert.equal(name,'Voro-audio.txt');
 }finally{game.destroy();globalThis.localStorage=previous;}
});

test('Audio tour completes all twelve scenes and retains probe data with frame measurements',()=>{
 const {game}=makeEngine();game.sound=false;game.paused=true;
 const life=game.life;game.startAutomaticBenchmark(true);game.autoTour.warmupMs=0;
 for(let i=0;i<3600&&game.autoTour;i++)game.frame(1000+i*50);
 assert.equal(game.autoTour,null);assert.equal(game.life,life);assert.equal(game.sound,false);
 const r=game.performanceReport();assert.equal(r.results.length,12);assert.equal(r.status,'completed');
 assert.ok(r.results.every(s=>s.report.audioProbe&&s.report.summary.frames>0));
 assert.ok(JSON.stringify(r).length<450000);game.destroy();
});
