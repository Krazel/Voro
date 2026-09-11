import test from 'node:test';
import assert from 'node:assert/strict';
import {ZoomGesture,wheelZoom} from '../app/zoom-gesture.mjs';
import {makeEngine} from './engine-fixture.mjs';
const send=(game,type,id,x,y,extra={})=>{
 const event=Object.assign(new Event(type,{cancelable:true}),{pointerId:id,pointerType:'touch',clientX:x,clientY:y,...extra});
 game.canvas.dispatchEvent(event);return event;
};

test('Pinch does not jump on touchdown, clamps, rebases extra fingers and waits for all releases',()=>{
 const z=new ZoomGesture();z.down(1,{x:0,y:0});z.down(2,{x:100,y:0});
 assert.equal(z.move(2,{x:100,y:0},1),1);
 assert.equal(z.move(2,{x:200,y:0},1),1.75);
 assert.ok(Math.abs(z.move(2,{x:190,y:0},1.75)-1.6625)<1e-10);
 z.down(3,{x:250,y:0});z.up(1);
 assert.equal(z.move(3,{x:250,y:0},1),1);
 z.up(2);assert.equal(z.locked,true);assert.equal(z.move(3,{x:900,y:0},1),null);
 z.up(3);assert.equal(z.locked,false);
 assert.ok(wheelZoom(1,-100)>1);assert.ok(wheelZoom(1,100)<1);
});

test('Canvas pinch suppresses movement, tilt and dash; remaining finger cannot turn into movement',()=>{
 const {game}=makeEngine();game.startTest(0,1,false,true,false);
 send(game,'pointerdown',1,50,300);send(game,'pointerdown',2,150,300);
 game.keys.add('KeyD');game.tilt.enabled=true;game.tilt.read=()=>({x:1,y:1});
 assert.deepEqual(game.input(),{x:0,y:0});game.action('dash');assert.equal(game.life.cooldown,0);
 const camera={...game.camera},mass=game.life.biomass;
 send(game,'pointermove',2,250,300);assert.equal(game.zoomFactor,1.75);
 assert.deepEqual(game.camera,camera);assert.equal(game.life.biomass,mass);
 send(game,'pointerup',2,250,300);send(game,'pointermove',1,100,300);
 assert.equal(game.pointer,null);assert.equal(game.zoomGesture.locked,true);
 send(game,'pointerup',1,100,300);game.keys.clear();game.tilt.enabled=false;
 send(game,'pointerdown',3,100,300);send(game,'pointermove',3,140,300);
 assert.ok(game.input().x>.5);send(game,'pointerup',99,0,0);assert.equal(game.pointer.id,3);
 send(game,'pointercancel',3,140,300);assert.equal(game.pointer,null);
 game.destroy();
});

test('Wheel uses the actual camera scale without publishing every gesture event and ignores menus',()=>{
 const {game}=makeEngine();game.startTest(0,1,false,true,false);
 game.zoom=.95;let publishes=0;game.publish=()=>publishes++;
 const before=game.zoom;
 const e=send(game,'wheel',0,0,0,{deltaY:-60,deltaMode:0});
 assert.equal(e.defaultPrevented,true);assert.ok(game.zoomFactor>1);
 assert.ok(Math.abs(game.zoom-before*game.zoomFactor)<1e-10);assert.equal(publishes,0);
 const factor=game.zoomFactor;game.settingsOpen=true;
 send(game,'wheel',0,0,0,{deltaY:100,deltaMode:0});assert.equal(game.zoomFactor,factor);
 send(game,'pointerdown',1,0,0);send(game,'pointerdown',2,100,0);assert.equal(game.zoomGesture.locked,false);
 game.destroy();
});

test('Microscope paints an opaque background once, retaining a loading fallback',()=>{
 const {game}=makeEngine();game.startTest(0,1,false,true,false);
 let baseFills=0;const original=game.ctx.fillRect.bind(game.ctx);
 game.ctx.fillRect=function(...args){if(this.fillStyle==='#041423')baseFills++;return original(...args)};
 game.drawBackground=()=>true;game.renderScene();assert.equal(baseFills,0);
 game.drawBackground=()=>false;game.renderScene();assert.equal(baseFills,1);
 game.destroy();
});
