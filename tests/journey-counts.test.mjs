import test from 'node:test';
import assert from 'node:assert/strict';
import {newJourney,journeyLife,advanceJourney,bankJourneyLife,journeyAbsorptions,saveJourney,loadJourney} from '../app/journey-progress.mjs';
const roundtrip=(p,l)=>loadJourney(saveJourney(p,l,{journal:new Map()},false));

test('Stage counts survive evolution, retry and repeated saves without double counting',()=>{
 const p=newJourney(31);let l=journeyLife(p);l.eaten=12;
 l=advanceJourney(p,l);l.eaten=7;
 bankJourneyLife(p,l);p.deaths++;l=journeyLife(p);l.eaten=3;
 assert.deepEqual(journeyAbsorptions(p,l).slice(0,3),[12,10,0]);
 let saved=roundtrip(p,l);saved=roundtrip(saved.progress,saved.life);
 assert.deepEqual(journeyAbsorptions(saved.progress,saved.life).slice(0,3),[12,10,0]);
 assert.equal(saved.progress.totalEaten+saved.life.eaten,22);
 assert.deepEqual(journeyAbsorptions(newJourney(31),journeyLife(newJourney(31))),Array(10).fill(0));
});

test('Legacy saves preserve known current counts without inventing past stage totals',()=>{
 const p=newJourney(31);p.stage=3;p.totalEaten=120;delete p.absorptionsByStage;
 const l=journeyLife(p);l.eaten=8;
 let saved=roundtrip(p,l);
 assert.deepEqual(journeyAbsorptions(saved.progress,saved.life).slice(0,5),[null,null,null,8,0]);
 p.deaths=1;saved=roundtrip(p,l);
 assert.equal(journeyAbsorptions(saved.progress,saved.life)[3],null);
 const next=advanceJourney(saved.progress,saved.life);next.eaten=5;
 saved=roundtrip(saved.progress,next);
 assert.equal(journeyAbsorptions(saved.progress,saved.life)[3],null);
 assert.equal(journeyAbsorptions(saved.progress,saved.life)[4],5);
 p.stage=0;saved=roundtrip(p,l);
 assert.equal(journeyAbsorptions(saved.progress,saved.life)[0],128);
});
