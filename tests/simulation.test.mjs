import test from 'node:test';
import assert from 'node:assert/strict';
import {createLife,integrate,beginAbsorb,digest,impulse,WORLD} from '../app/simulation.mjs';

test('Swimming stays nearly identical at 30 and 60 fps and remains inside the world',()=>{
  const a=createLife(),b=createLife();
  for(let i=0;i<120;i++)integrate(a,1/30,{x:1,y:-1});
  for(let i=0;i<240;i++)integrate(b,1/60,{x:1,y:-1});
  assert.ok(Math.abs(a.x-b.x)<2);assert.ok(Math.abs(a.y-b.y)<2);
  for(let i=0;i<3000;i++)integrate(a,1/30,{x:1,y:-1});
  assert.ok(a.x<=WORLD.width-110&&a.y>=140);
});
test('A nutrient can only enter once and contributes mass only after digestion',()=>{
  const p=createLife(),far={x:100,y:100,eaten:false},near={x:p.x+20,y:p.y,eaten:false};
  assert.equal(beginAbsorb(p,far),false);
  assert.equal(beginAbsorb(p,near),true);assert.equal(beginAbsorb(p,near),false);
  assert.equal(p.eaten,0);digest(p,.4);assert.equal(p.eaten,0);digest(p,.6);assert.equal(p.eaten,1);
  digest(p,2);assert.equal(p.eaten,1);
});
test('18 meals lead to a visible evolution, then completion; free swim resumes',()=>{
  const p=createLife();
  for(let i=0;i<18;i++){beginAbsorb(p,{x:p.x+10,y:p.y,eaten:false});digest(p,1);}
  assert.equal(p.evolved,true);assert.equal(p.complete,false);
  for(let i=0;i<140;i++){integrate(p,1/60,{x:0,y:0});digest(p,1/60);}
  assert.equal(p.complete,true);assert.ok(p.radius>70);
  p.free=true;p.complete=false;integrate(p,1/60,{x:1,y:0});digest(p,1/60);assert.equal(p.complete,false);
});
test('Impulse respects cooldown and a new life fully resets progress',()=>{
  const p=createLife();assert.equal(impulse(p),true);assert.equal(impulse(p),false);
  for(let i=0;i<220;i++)integrate(p,1/60,{x:0,y:1});
  assert.equal(impulse(p),true);p.eaten=18;p.evolved=true;
  const fresh=createLife();assert.equal(fresh.eaten,0);assert.equal(fresh.cooldown,0);assert.equal(fresh.evolved,false);assert.equal(fresh.digestion.length,0);
});
