import test from 'node:test';
import assert from 'node:assert/strict';
import {BenchmarkTour} from '../app/benchmark-tour.mjs';
import {makeEngine} from './engine-fixture.mjs';
import {STAGES} from '../app/journey-data.mjs';
import {compactPerformanceReport,performanceSummaryText,deliverReportFile} from '../app/performance-report.mjs';

test('Short tour covers twenty scenarios in two minutes plus loading, with a measured dash in each',()=>{
  const tour=new BenchmarkTour(STAGES.flatMap(stage=>[{stage:stage.id},{stage:stage.id}]));
  assert.equal(tour.plan.length*(tour.seconds*1000+tour.warmupMs),120000);
  const state={active:true,ready:true,error:false};
  tour.tick(0,state);tour.tick(10,state);
  tour.tick(1010,state);assert.equal(tour.state,'recording');
  assert.equal(tour.dashDue(),false);
  tour.tick(2010,state);assert.equal(tour.dashDue(),true);
  assert.equal(tour.dashDue(),false,'One attempt per interval');
  tour.complete('ok');tour.tick(2020,state);tour.tick(2030,state);
  assert.equal(tour.dashDue(),false,'New size resets dash timing');
  tour.tick(3030,state);tour.tick(4030,state);assert.equal(tour.dashDue(),true);
});

test('Tour separates load/warmup, excludes background time and times out missing resources',()=>{
  const tour=new BenchmarkTour([{stage:0}],{warmupMs:100,loadTimeoutMs:1000});
  const state={active:true,ready:false,error:false};
  assert.equal(tour.tick(0,state),'enter');
  assert.equal(tour.tick(200,state),null);assert.equal(tour.loadingMs,200);
  tour.tick(90000,{...state,active:false});
  tour.tick(91000,state);assert.equal(tour.loadingMs,200);
  assert.equal(tour.tick(91800,state),'load-timeout');
  const ready=new BenchmarkTour([{}],{warmupMs:100});
  ready.tick(0,state);assert.equal(ready.tick(50,{...state,ready:true}),null);
  assert.equal(ready.tick(100,{...state,ready:true}),null);
  assert.equal(ready.tick(150,{...state,ready:true}),'record');
  assert.equal(ready.state,'recording');
});

test('Automatic tour visits both sizes in every stage and restores the saved campaign and camera',()=>{
  const previous=globalThis.localStorage,writes=[];
  globalThis.localStorage={getItem:()=>null,setItem:(...args)=>writes.push(args)};
  const {game}=makeEngine();
  try{
    game.started=true;game.paused=true;game.life.biomass=35;game.life.eaten=7;
    game.setZoom(1.3);game.rasterBudget.quality=.9;game.time=12;
    const progress=game.progress,life=game.life,world=game.world,camera={...game.camera},zoom=game.zoom;
    assert.equal(game.startAutomaticBenchmark(),true);
    assert.equal(game.startAutomaticBenchmark(),false);
    game.autoTour.seconds=.1;game.autoTour.warmupMs=0;
    const saved=writes.at(-1);
    for(let i=0;game.autoTour && i<400;i++)game.frame(1000+i*50);
    assert.equal(game.autoTour,null,'All environments must finish without choosing adaptations');
    const report=game.performanceReport();
    assert.equal(report.status,'completed');assert.equal(report.results.length,STAGES.length*2);
    assert.deepEqual(report.results.map(x=>x.id),STAGES.flatMap(x=>[x.id,x.id]));
    assert.ok(report.results.every(x=>x.status==='ok' && x.report.summary.frames>0));
    assert.equal(report.protocol.automaticMovement,true);
    assert.equal(game.progress,progress);assert.equal(game.life,life);assert.equal(game.world,world);
    assert.equal(game.life.biomass,35);assert.equal(game.life.eaten,7);
    assert.equal(game.zoomFactor,1.3);assert.equal(game.zoom,zoom);assert.deepEqual(game.camera,camera);
    assert.equal(game.rasterBudget.quality,.9);assert.equal(game.time,12);assert.equal(game.paused,true);
    assert.equal(game.testMode,false);assert.deepEqual(writes.at(-1),saved,'No sandbox save replaces the campaign');
    assert.equal(compactPerformanceReport(report),report);
    assert.ok(performanceSummaryText(report).includes('20/20'));
    assert.ok(JSON.stringify(report).length<150000,'Shareable report must omit raw per-frame samples');
  } finally{game.destroy();globalThis.localStorage=previous;}
});

test('Cancel during load retains an exportable partial result and restores an interrupted birth',async()=>{
  const {game}=makeEngine();game.birth=2.5;game.paused=true;
  const progress=game.progress;
  game.startAutomaticBenchmark();game.action('restart');assert.equal(game.testMode,true);
  game.finishAutomaticBenchmark();
  assert.equal(game.progress,progress);assert.equal(game.birth,2.5);assert.equal(game.paused,true);
  const report=game.performanceReport();
  assert.equal(report.status,'cancelled');assert.equal(report.summary.frames,0);
  assert.equal(report.results[0].status,'cancelled');
  let sent;
  await deliverReportFile(JSON.stringify(compactPerformanceReport(report)),{native:true,
    write:async(name,data)=>{sent={name,data};return {uri:'file:///test.txt'};},shareNative:async()=>{}});
  assert.equal(JSON.parse(sent.data).format,'voro-performance-tour-v1');
  game.destroy();
});

test('Hidden and paused tour frames do not advance measurement, and failure skips to the next scenario',()=>{
  const {game}=makeEngine();game.paused=true;game.startAutomaticBenchmark();
  game.autoTour.seconds=.2;game.autoTour.warmupMs=0;
  game.frame(100);game.frame(150);game.frame(200);
  const elapsed=game.frameMonitor.elapsed;
  document.hidden=true;game.frame(50000);document.hidden=false;game.paused=true;game.frame(60000);
  assert.equal(game.frameMonitor.elapsed,elapsed);
  game.resumeAutomaticBenchmark();game.frame(60050);assert.equal(game.frameMonitor.elapsed,elapsed);
  game.finishAutomaticBenchmark();
  game.startAutomaticBenchmark();
  game.assets.failed=()=>true;
  game.frame(70000);assert.equal(game.autoTour.results[0].status,'asset-error');
  game.frame(70050);assert.equal(game.autoTour.index,1);
  game.finishAutomaticBenchmark();game.destroy();
});
