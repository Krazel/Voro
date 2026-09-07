import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { BACKGROUND_ASSETS } from '../app/background-assets.mjs';
import { stageResources } from '../app/stage-assets.mjs';
import { STAGES } from '../app/journey-data.mjs';
import { makeEngine } from './engine-fixture.mjs';

test('Every biome loads its approved local background with a matching content revision',()=>{
 assert.equal(Object.keys(BACKGROUND_ASSETS).length,10);
 for(let i=0;i<STAGES.length;i++) {
   const url=stageResources(i).find(r=>r.kind==='ground').url;
   assert.equal(url,BACKGROUND_ASSETS[STAGES[i].id]);
   const [path,query]=url.split('?');
   const bytes=readFileSync(new URL('../public/'+path,import.meta.url));
   assert.equal(query,'v='+createHash('sha256').update(bytes).digest('hex').slice(0,12));
   assert.equal(new URL(url,'capacitor://localhost/').protocol,'capacitor:');
 }
});

test('Gameplay renderer selects the current biome image, including after a stage change',()=>{
 const {game}=makeEngine();let selected;
 game.worldGround.draw=(_context,image,stage)=>{selected={image,stage};return true;};
 for(let i=1;i<STAGES.length;i++) {
   const stage=STAGES[i].id, image={complete:true,naturalWidth:1536};
   game.groundImages[stage]=image;game.paintBackground(i);
   assert.equal(selected.image,image);assert.equal(selected.stage,stage);
 }
 game.destroy();
});
