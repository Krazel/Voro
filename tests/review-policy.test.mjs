import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldHoldReview } from '../app/review-policy.mjs';
import { makeEngine } from './engine-fixture.mjs';
import { journeyLife } from '../app/journey-progress.mjs';

const checkpoint = {enabled:true,handled:false,stage:1,testMode:false};
test('only the end of the second environment holds the real iOS game',()=>{
 assert.equal(shouldHoldReview(checkpoint),true);
 for(const patch of [{stage:0},{stage:2},{stage:5},{enabled:false},{handled:true},{testMode:true}])
  assert.equal(shouldHoldReview({...checkpoint,...patch}),false);
});
function atWaterEnd(){
 const {game:g}=makeEngine();
 g.started=true;g.birth=0;g.reviewEnabled=true;g.progress.stage=1;
 g.life=journeyLife(g.progress);g.life.biomass=g.life.goalMass;g.progress.offer=[];
 return g;
}
test('checkpoint freezes simulation and inputs before entering the third environment',()=>{
 const g=atWaterEnd();g.beginEvolution();
 assert.equal(g.reviewHold,true);assert.equal(g.progress.stage,1);assert.equal(g.transition,0);
 assert.equal(g.progress.pendingEvolution,true);
 const before={x:g.life.x,y:g.life.y,mass:g.life.biomass,elapsed:g.life.elapsed};
 g.keys.add('KeyD');g.action('dash');g.action('pause');g.update(10);
 assert.deepEqual({x:g.life.x,y:g.life.y,mass:g.life.biomass,elapsed:g.life.elapsed},before);
 assert.equal(g.paused,false);assert.equal(g.cameraInputAllowed(),false);
 // Closing a native modal may blur the webview; explicit continue must recover.
 g.paused=true;g.finishReview();
 assert.equal(g.reviewHold,false);assert.equal(g.paused,false);assert.equal(g.transition,7.2);
 g.finishReview();assert.equal(g.transition,7.2);
 g.update(4);assert.equal(g.progress.stage,2);assert.equal(g.reviewHold,false);g.destroy();
});
test('restarting permits another beta checkpoint, while a later saved stage never triggers it',()=>{
 const g=atWaterEnd();g.beginEvolution();g.action('restart');
 assert.equal(g.reviewHold,false);assert.equal(g.reviewHandled,false);assert.equal(g.progress.stage,0);
 g.birth=0;g.progress.stage=1;g.life=journeyLife(g.progress);g.beginEvolution();assert.equal(g.reviewHold,true);
 g.finishReview();g.transition=0;g.progress.stage=3;g.reviewHandled=false;g.beginEvolution();
 assert.equal(g.reviewHold,false);g.destroy();
});
test('desktop and test/benchmark modes retain uninterrupted environment transitions',()=>{
 for(const patch of [{reviewEnabled:false},{testMode:true,testEvolution:true}]){
  const g=atWaterEnd();Object.assign(g,patch);g.beginEvolution();
  assert.equal(g.reviewHold,false);assert.equal(g.transition,7.2);g.destroy();
 }
});
