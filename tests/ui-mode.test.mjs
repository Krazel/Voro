import test from 'node:test';
import assert from 'node:assert/strict';
import { initialUiMode, readUiMode } from '../app/ui-mode.mjs';
test('Final release ignores legacy development preferences and all query overrides',()=>{
 for(const value of [null,'development','final']) for(const query of ['', '?ui=development','?ui=final','?ui=development&lab=cosmos']){
  const saved={getItem:()=>value};assert.equal(initialUiMode(saved,query),'final');assert.equal(readUiMode(saved),'final');
 }
});
