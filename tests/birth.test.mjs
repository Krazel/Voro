import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEngine} from './engine-fixture.mjs';

test('A first birth reveals the existing cell without simulation or dash, then releases the game',()=>{
 const {game}=makeEngine(); game.initAudio=()=>{}; game.setAudio=()=>{};
 game.action('start'); assert.equal(game.birth,2.8);
 const x=game.life.x,y=game.life.y,mass=game.life.biomass,elapsed=game.life.elapsed;
 game.keys.add('ArrowRight'); game.action('dash');
 for(let i=0;i<25;i++) {game.time+=.1; game.update(.1);}
 assert.equal(game.life.x,x); assert.equal(game.life.y,y); assert.equal(game.life.biomass,mass); assert.equal(game.life.elapsed,elapsed);
 assert.equal(game.life.cooldown,0);
 for(let i=0;i<4;i++){game.time+=.1;game.update(.1);}
 assert.equal(game.birth,0); assert.equal(game.keys.size,0); game.destroy();
});
test('Resuming saved progress skips the birth; reduced motion has a short static reveal',()=>{
 const {game}=makeEngine();game.initAudio=()=>{};game.setAudio=()=>{};game.saved=true;
 game.action('start');assert.equal(game.birth,0);
 game.saved=false;game.started=false;game.reduced=true;game.action('start');assert.equal(game.birth,.8);
 game.startTest(2,1);assert.equal(game.birth,0);game.destroy();
});
