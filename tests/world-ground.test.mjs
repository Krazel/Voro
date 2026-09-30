import test from 'node:test';
import assert from 'node:assert/strict';
import { WorldGround, groundPatch, GROUND_PROFILES } from '../app/world-ground.mjs';
import { STAGES, SPECIES_BY_ID } from '../app/journey-data.mjs';
import { makeEngine } from './engine-fixture.mjs';

test('Pond keeps source crop resolution with less texture memory and one cached draw per frame', () => {
  const layer = new Proxy({}, {get:(_,k)=>k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{},set:()=>true});
  const ground = new WorldGround(()=>({width:0,height:0,getContext:()=>layer}));
  const image = {width:1536,height:1024,naturalWidth:1536,complete:true};
  const patches = ground.prepare(image,'pond');
  assert.deepEqual(patches.map(p=>[p.width,p.height]), [...Array(4).fill([768,512]),...Array(4).fill([614,410])]);
  assert.ok(patches.reduce((sum,p)=>sum+p.width*p.height*4,0)<8*768*768*4);
  assert.equal(ground.prepare(image,'pond'),patches);
  let draws=0;
  const screen={drawImage:()=>draws++,getTransform:()=>({a:1.5,b:0})};
  ground.draw(screen,image,'pond',{x:0,y:0},2,844,834,0,false,390);
  const rebuilt=ground.redraws;
  for(let i=1;i<=60;i++)ground.draw(screen,image,'pond',{x:i*.1,y:0},2,844,834,0,false,390);
  assert.equal(ground.redraws,rebuilt);
  assert.equal(draws,61);
});

test('Non-shore atlases stream stable varied regions; every biome has a ground profile', () => {
  assert.deepEqual(
    Object.keys(GROUND_PROFILES),
    STAGES.map((s) => s.id),
  );
  for (const stage of Object.keys(GROUND_PROFILES).filter(s => s !== 'land')) {
    const seen = new Set();
    for (let x = -20; x < 20; x++) {
      const patch = groundPatch(stage, x, 8, 71);
      seen.add(patch.variant);
      assert.deepEqual(patch, groundPatch(stage, x, 8, 71));

    }
    assert.equal(seen.size, 8);
  }
  assert.notDeepEqual(
    groundPatch('water', 40, -9, 71),
    groundPatch('water', 40, -9, 72),
  );
});

test('Background streaming remains bounded through every sandbox biome including microscope', () => {
  const { game } = makeEngine();
  game.drawBackground(0);
  assert.equal(game.worldGround.cache.size, 1);
  for (let stage = 1; stage < STAGES.length; stage++) {
    game.startTest(stage, 1);
    game.camera = { x: -1874.3, y: -2351.7 };
    game.zoom = 0.65;
    game.drawBackground(stage);
    assert.ok(game.worldGround.views.has(STAGES[stage].id));
    assert.ok(game.worldGround.cache.size <= 3);
  }
  const entries = game.worldGround.cache.size;
  game.drawBackground(0);
  assert.equal(game.worldGround.cache.size, entries);
  game.destroy();
});

test('Loose plants and coral have sensible proportions next to marine fish', () => {
  const s = SPECIES_BY_ID;
  assert.ok(s['water-matter-kelp'].r / s['water-2'].r < 2.5);
  assert.ok(s['water-matter-coral'].r <= 2 * s['water-2'].r);
  assert.ok(s['water-1'].r < s['water-2'].r);
  assert.ok(s['water-2'].r < s['water-14'].r);
  assert.ok(s['water-14'].r < s['water-12'].r);
  assert.ok(s['land-matter-leaf'].r < s['land-10'].r);
});
