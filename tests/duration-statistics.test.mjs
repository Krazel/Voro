import test from 'node:test';
import assert from 'node:assert/strict';
import {durationSummary,descriptive} from '../scripts/duration-statistics.mjs';
test('Unfinished campaigns still contribute completed stages, never censored completion times or 60Hz contrasts',()=>{
 const stage=(id,seconds,completed)=>({id,seconds,menuSeconds:0,completed,hits:0});
 const runs=[{profile:'direct',seed:1,hz:30,completed:false,estimatedSessionSeconds:900,stages:[stage('micro',60,true),stage('pond',840,false)]},
 {profile:'direct',seed:2,hz:30,completed:true,estimatedSessionSeconds:300,stages:[stage('micro',120,true),stage('pond',180,true)]},
 {profile:'direct',seed:2,hz:60,completed:true,estimatedSessionSeconds:1800,stages:[stage('micro',900,true),stage('pond',900,true)]}];
 const s=durationSummary(runs);
 assert.equal(s.attempted,2);assert.equal(s.completed,1);assert.equal(s.sessionMinutes.mean,5);
 assert.equal(s.stages[0].minutes.mean,1.5);assert.equal(s.stages[1].minutes.mean,3);
 assert.equal(s.stages[1].reached,2);assert.equal(s.stages[1].censored.length,1);assert.equal(s.contrasts.length,1);
 assert.equal(s.stages[2].minutes.mean,null);
});
test('Summary distinguishes arithmetic mean from median without substituting empty means with zero',()=>{
 assert.deepEqual(descriptive([1,2,9]),{n:3,mean:4,median:2,min:1,max:9});
 assert.equal(descriptive([]).mean,null);assert.equal(descriptive([2,4]).median,3);
});
