import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEngine } from './engine-fixture.mjs';
import { STAGES, stageStartMass } from '../app/journey-data.mjs';
import { JOURNEY_SAVE } from '../app/journey-progress.mjs';
import { gameplayZoom } from '../app/camera.mjs';

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
test('All entries and real transitions match the microscope, including oversized orbital entry and reload', () => {
  const storage = new Map();
  globalThis.localStorage = {getItem:k=>storage.get(k) ?? null,setItem:(k,v)=>storage.set(k,v)};
  try {
    for (let stage=0; stage<STAGES.length; stage++) {
      for (const factor of [.75,1,1.75]) {
        const {game}=makeEngine();
        game.startTest(stage,stageStartMass(stage),false,true,true);
        game.setZoom(factor);
        close(game.life.radius*game.zoom,24*1.12*factor);
        if(stage<STAGES.length-1) {
          game.life.biomass=STAGES[stage].goal*1.2;
          game.transition=3.61;game.transitionFrom=stage;game.transitionAdvanced=false;
          game.zoom=.3;game.update(.02);
          close(game.life.radius*game.zoom,24*1.12*factor);
          const entry=game.life.radius;
          game.started=false;
          for(let i=0;i<220;i++)game.update(1/60);
          close(game.life.radius*game.zoom,24*1.12*factor);
          game.testMode=false;game.started=true;game.save();
          const {game:loaded}=makeEngine();
          close(loaded.cameraEntryRadius,entry);
          close(loaded.life.radius*loaded.zoom,24*1.12);
          loaded.life.biomass*=4;loaded.life.radius*=2;loaded.save();
          const {game:grown}=makeEngine();
          close(grown.cameraEntryRadius,entry);
          assert.ok(grown.life.radius*grown.zoom>24*1.12*1.65);
          grown.life.dead=true;grown.action('retry');
          close(grown.life.radius*grown.zoom,24*1.12);
          grown.destroy();loaded.destroy();
        }
        game.destroy();storage.clear();
      }
    }
  } finally { delete globalThis.localStorage; }
});
test('Historical saves use the local newborn reference; malformed camera data falls back safely',()=>{
  const storage=new Map();
  globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
  try {
    const {game}=makeEngine();game.startTest(1,stageStartMass(1));game.testMode=false;game.started=true;game.save();
    const data=JSON.parse(storage.get(JOURNEY_SAVE));
    for(const value of [undefined,0,-1,'24',1e20]) {
      data.progress.cameraEntryRadius=value;storage.set(JOURNEY_SAVE,JSON.stringify(data));
      const {game:loaded}=makeEngine();
      close(loaded.life.radius*loaded.zoom,24*1.12);loaded.destroy();
    }
    game.destroy();
  } finally {delete globalThis.localStorage;}
  close(gameplayZoom(24,24),1.12);
});
