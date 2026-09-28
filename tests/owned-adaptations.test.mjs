import test from 'node:test';
import assert from 'node:assert/strict';
import { ownedAdaptations, ownedEffect } from '../app/owned-adaptations-data.mjs';
import { UPGRADES, MAX_UPGRADE_CHOICES } from '../app/mutations.mjs';
test('Collection hides unowned/retired types, groups repeated choices and respects actual save caps without mutation',()=>{
  const save=['speed','speed','old-upgrade','shield','shield'];
  assert.deepEqual(ownedAdaptations([]),[]);
  assert.deepEqual(ownedAdaptations(save).map(u=>[u.id,u.count]),[['speed',2],['shield',1]]);
  assert.deepEqual(save,['speed','speed','old-upgrade','shield','shield']);
  const full=ownedAdaptations(UPGRADES.flatMap(u=>Array(u.max).fill(u.id)));
  assert.equal(full.length,14);assert.equal(full.reduce((s,u)=>s+u.count,0),MAX_UPGRADE_CHOICES);
});
test('Details show accumulated effects and conditional bonuses in both languages',()=>{
  assert.match(ownedEffect('speed',2,'es'),/15 %/);
  assert.match(ownedEffect('dash',8,'en'),/3 s/);
  assert.match(ownedEffect('shield',1,'es'),/40 s/);
  assert.match(ownedEffect('pull',3,'es'),/45 %.*42 unidades/);
  assert.match(ownedEffect('combo',4,'en'),/3 consecutive meals.*40%.*4 s/);
  for(const u of UPGRADES) for(const lang of ['es','en']) {
    const effect=ownedEffect(u.id,u.max,lang);
    assert.ok(effect.length>15);assert.doesNotMatch(effect,/undefined|NaN/);
  }
});
