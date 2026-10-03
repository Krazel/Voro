import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEngine} from './engine-fixture.mjs';
test('Final runtime has no periodic diagnostic journal or document command registration',()=>{
 let scheduled=0,registered=0;
 const priorInterval=window.setInterval,priorContext=document.modelContext;
 window.setInterval=()=>{scheduled++;return 1;};
 document.modelContext={registerTool(){registered++;}};
 try{
  const {game}=makeEngine();
  assert.equal(game.audioJournal,null);assert.equal(game.audioJournalTimer,undefined);
  assert.equal(scheduled,0);assert.equal(registered,0);
  assert.equal(game.testMode,false);assert.equal(game.diagnosticsEnabled,false);assert.equal(game.zoomFactor,1);
  game.destroy();
 }finally{window.setInterval=priorInterval;document.modelContext=priorContext;}
});
