import test from 'node:test';
import assert from 'node:assert/strict';
import {compactPerformanceReport,performanceSummaryText,deliverReportFile} from '../app/performance-report.mjs';
import {makeEngine} from './engine-fixture.mjs';
import {upgradeStats,UPGRADES} from '../app/mutations.mjs';
import {saveJourney,loadJourney} from '../app/journey-progress.mjs';
import {transitionScene} from '../app/journey-transitions.mjs';
import {gameplayZoom} from '../app/camera.mjs';

test('Completed captures survive toggling the overlay and only a new capture resets them',()=>{
 const {game}=makeEngine();game.started=true;game.render=()=>{};game.update=()=>{};game.startBenchmark();
 for(let i=0;i<301;i++)game.frame(1000+i*100);
 const report=game.performanceReport();assert.equal(report.summary.frames,300);
 game.setDiagnostics(false);game.setDiagnostics(true);
 for(let i=0;i<10;i++)game.frame(32000+i*100);
 assert.deepEqual(game.performanceReport(),report);
 game.startBenchmark();assert.equal(game.performanceReport().summary.frames,0);game.destroy();
});

test('Reports refuse empty data, preserve statistics and produce a small shareable file',()=>{
 const {game}=makeEngine();assert.throws(()=>compactPerformanceReport(game.performanceReport()));
 game.setDiagnostics(true);
 for(let i=0;i<3600;i++) {game.frameMonitor.beginFrame();game.frameMonitor.frameParts.render=2;game.frameMonitor.add(i%50?16:70,2,{stage:1,entities:300});}
 const full=game.performanceReport(),compact=compactPerformanceReport(full),text=JSON.stringify(compact,null,2);
 assert.deepEqual(compact.summary,full.summary);assert.deepEqual(compact.session,full.session);
 assert.equal(compact.worstFrames.length,5);assert.equal(compact.samples,undefined);
 assert.ok(Buffer.byteLength(text)<12000);assert.ok(performanceSummaryText(full).length<1200);
 game.destroy();
});

test('Native share writes one UTF-8 cache file before presenting its URI; web shares a real text file',async()=>{
 const calls=[];
 await deliverReportFile('datos ñ',{native:true,write:async(name,data)=>{calls.push([name,data]);return {uri:'file:///cache/Voro-rendimiento.txt'};},shareNative:async uri=>calls.push(uri)});
 assert.equal(calls[0][1],'datos ñ');assert.equal(calls[1],'file:///cache/Voro-rendimiento.txt');
 let shared;
 const operation=deliverReportFile('datos',{native:false,canShare:()=>true,shareWeb:file=>{shared=file;return Promise.resolve();}});
 assert.ok(shared instanceof File,'Web Share is called synchronously within user activation');
 await operation;assert.equal(await shared.text(),'datos');assert.equal(shared.type,'text/plain');
 let downloaded;assert.equal(await deliverReportFile('offline',{native:false,canShare:()=>false,download:file=>downloaded=file}),'downloaded');
 assert.equal(await downloaded.text(),'offline');
 await assert.rejects(deliverReportFile('cancel',{native:true,write:async()=>({uri:'file:///cache/file'}),shareNative:async()=>{throw new Error('Share canceled');}}),/canceled/);
});

test('Nucleus choices now boost adaptation additively, preserve saved choices and no longer boost mass',()=>{
 const {game}=makeEngine();
 game.progress.mutations=['yield','yield'];game.progress.level=2;game.progress.xp=35;
 const loaded=loadJourney(saveJourney(game.progress,game.life,game.world,true));
 assert.deepEqual(loaded.progress.mutations,['yield','yield']);assert.equal(loaded.progress.xp,35);
 assert.equal(upgradeStats(['yield','yield']).yieldFactor,1);
 assert.equal(upgradeStats(['yield','yield']).adaptationFactor,1.2);
 assert.equal(UPGRADES.find(u=>u.id==='yield').max,8);
 for(const count of [0,1,8]) {
   game.startTest(1,10,false,true);game.progress.mutations=Array(count).fill('yield');game.progress.level=count;
   game.stats=upgradeStats(game.progress.mutations);Object.assign(game.life,game.stats);
   game.life.digestion=[{progress:0.99,value:10,r:1,dx:0,dy:0,rotation:0,kind:'pond-0'}];
   const xp=game.progress.xp;game.update(.1);
   assert.ok(Math.abs(game.progress.xp-xp-8.5*(1+count*.1))<1e-8);
 }
 game.destroy();
});

test('Biome cinematics no longer shrink the outgoing world to a tiny island',()=>{
 for(const stage of ['micro','pond','land','water','city','orbit','planets','stars','galaxies']) {
  for(let i=0;i<=100;i++) {
   const scene=transitionScene(stage,i/100);assert.ok(scene.scale>=.7 && scene.scale<=1.035);
  }
 }
 const {game}=makeEngine();game.started=true;game.life.radius=130;game.zoom=gameplayZoom(130);
 game.transitionFrom=0;game.transition=7.2;game.transitionStartZoom=game.zoom;
 const initial=game.zoom;
 for(let i=0;i<100;i++)game.update(1/60);
 assert.ok(game.zoom>=initial*.96);game.destroy();
});
