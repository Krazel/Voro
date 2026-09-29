import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEngine} from './engine-fixture.mjs';
import {newJourney,journeyLife,advanceJourney,saveJourney,loadJourney} from '../app/journey-progress.mjs';
import {upgradeStats} from '../app/mutations.mjs';
const saved=(p,l)=>loadJourney(saveJourney(p,l,{journal:[]},false));

test('Hits count once for damage and shield impact, ignoring invulnerability and disabled damage',()=>{
 const {game:g}=makeEngine();g.sound=false;g.life.invulnerable=0;g.life.biomass=10;
 try{
  assert.ok(g.receiveHit({x:0,y:0},.1)>0);assert.equal(g.progress.hitsReceived,1);
  g.receiveHit({x:0,y:0},.1);assert.equal(g.progress.hitsReceived,1);
  g.life.invulnerable=0;g.receiveHit({x:0,y:0},0,0);assert.equal(g.progress.hitsReceived,1);
  g.life.invulnerable=0;g.progress.mutations=['shield'];g.stats=upgradeStats(g.progress.mutations);
  const before=g.life.biomass;g.receiveHit({x:0,y:0},.1);
  assert.equal(g.life.biomass,before);assert.equal(g.progress.hitsReceived,2);
  g.life.invulnerable=0;g.testMode=g.testInvulnerable=true;
  g.receiveHit({x:0,y:0},.1);assert.equal(g.progress.hitsReceived,2);
  g.testMode=false;g.life.dead=true;g.action('retry');assert.equal(g.progress.hitsReceived,2);
  g.action('restart');assert.equal(g.progress.hitsReceived,0);assert.equal(g.progress.hitsPartial,false);
 }finally{g.destroy();}
});
test('Hit history survives evolution and save/load; old histories are explicitly partial',()=>{
 const p=newJourney(31);let l=journeyLife(p);p.hitsReceived=12;
 l=advanceJourney(p,l);let d=saved(p,l);d=saved(d.progress,d.life);
 assert.equal(d.progress.hitsReceived,12);assert.equal(d.progress.hitsPartial,false);
 delete p.hitsReceived;delete p.hitsPartial;
 d=saved(p,l);assert.equal(d.progress.hitsReceived,0);assert.equal(d.progress.hitsPartial,true);
 d.progress.hitsReceived=3;d=saved(d.progress,d.life);
 assert.equal(d.progress.hitsReceived,3);assert.equal(d.progress.hitsPartial,true);
 for(const bad of [-1,1.2,null,'9']){p.hitsReceived=bad;d=saved(p,l);assert.equal(d.progress.hitsReceived,0);assert.equal(d.progress.hitsPartial,true);}
});
