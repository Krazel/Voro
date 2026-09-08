import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { BACKGROUND_ASSETS } from '../app/background-assets.mjs';
import { stageResources } from '../app/stage-assets.mjs';
import { STAGES } from '../app/journey-data.mjs';
import { makeEngine } from './engine-fixture.mjs';

test('Obsolete background atlases cannot ship from public',()=>{
 for(const path of ['shore-v2.png','sea-v2.png','inhabitants/environments.png'])
   assert.equal(existsSync(new URL('../public/'+path,import.meta.url)),false,path);
});

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
   game.assets.entries.set(`ground:${stage}`, {ready:true,image});
   game.groundImages[stage]=image;game.paintBackground(i);
   assert.equal(selected.image,image);assert.equal(selected.stage,stage);
 }
 game.destroy();
});

test('Direct environment tests never cache a background before its decode has finished',()=>{
 const {game}=makeEngine();
 let prepared=0;
 game.worldGround.draw=()=>{prepared++;return true;};
 for(const stage of [1,3,2,1,8,1]) {
   game.startTest(stage,1);
   const entry=game.assets.entries.get(`ground:${STAGES[stage].id}`);
   entry.ready=false; // Image.complete/naturalWidth can precede decode().
   const before=prepared;
   game.paintBackground(stage);
   assert.equal(prepared,before,'Undecoded image must not enter the terrain cache');
   entry.ready=true;
   game.paintBackground(stage);
   assert.equal(prepared,before+1);
 }
 game.exitTest(); game.destroy();
});
