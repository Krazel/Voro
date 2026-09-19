import test from 'node:test';
import assert from 'node:assert/strict';
import {MusicPlayer,MUSIC,musicScene} from '../app/music.mjs';
function fixture(){
 const context={currentTime:0,destination:{},resume:()=>Promise.resolve(),createGain:()=>({gain:{value:0,cancelScheduledValues(){},setValueAtTime(v){this.value=v},linearRampToValueAtTime(v){this.value=v}},connect(){},disconnect(){}}),createMediaElementSource:()=>({connect(){},disconnect(){}})};
 const media=[];let cancelled=false;
 const player=new MusicPlayer(context,{createAudio:()=>{const a={paused:true,currentTime:0,duration:100,setAttribute(){},removeAttribute(){},load(){},pause(){this.paused=true},play(){this.paused=false;return Promise.resolve()}};media.push(a);return a},schedule:()=>1,cancel:()=>{cancelled=true}});
 return {player,context,media,get cancelled(){return cancelled}};
}
const settle=async()=>{await Promise.resolve();await Promise.resolve();};
test('Twelve approved tracks cover menu, every stage and the completed survivor',()=>{
 assert.equal(MUSIC.length,12);assert.equal(new Set(MUSIC.map(t=>t.slug)).size,12);
 assert.equal(musicScene(false,false,'micro'),'menu');assert.equal(musicScene(true,true,'universe'),'final');
 assert.equal(musicScene(true,false,'water'),'water');
 assert.equal(MUSIC.find(t=>t.id==='final').title,'The Distant Sun');
});
test('No playback before a gesture; two streams crossfade and loop without restarting on repeated state',async()=>{
 const {player:p,context:c,media}=fixture();p.setState('menu',true);assert.ok(media.every(a=>a.paused));
 p.unlock();await settle();assert.equal(p.current.id,'menu');assert.equal(p.current.audio.paused,false);
 p.current.audio.currentTime=30;p.setState('menu',true);assert.equal(p.current.audio.currentTime,30);
 const old=p.current;p.setState('micro',true);await settle();assert.equal(p.current.id,'micro');assert.equal(old.audio.paused,false);
 c.currentTime=4.1;p.tick();assert.equal(old.audio.paused,true);
 p.current.audio.currentTime=96;p.tick();await settle();assert.equal(p.current.id,'micro');assert.equal(p.current.audio.currentTime,0);assert.equal(media.length,2);p.destroy();
});
test('Pause fades then freezes playback; hidden state stops immediately and resume preserves position',async()=>{
 const {player:p,context:c,media}=fixture();p.setState('water',true);p.unlock();await settle();p.current.audio.currentTime=25;
 p.setState('water',false);assert.equal(p.bus.gain.value,0);c.currentTime=.2;p.tick();assert.ok(media.every(a=>a.paused));
 p.setState('water',true);await settle();assert.equal(p.current.audio.currentTime,25);assert.equal(p.current.audio.paused,false);
 p.setState('water',false,true);assert.ok(media.every(a=>a.paused));p.destroy();
});
test('Rapid stage changes and blocked autoplay keep bounded decks and can retry on a gesture',async()=>{
 const f=fixture(),p=f.player;p.setState('city',true);p.unlock();await settle();
 p.setState('orbit',true);p.setState('planets',true);await settle();f.context.currentTime=5;p.tick();await settle();assert.equal(p.current.id,'planets');
 p.setState('planets',false,true);f.media.forEach(a=>a.play=()=>Promise.reject(new Error('NotAllowedError')));p.setState('planets',true);await settle();assert.equal(p.blocked,true);
 f.media.forEach(a=>a.play=function(){this.paused=false;return Promise.resolve()});p.unlock();await settle();assert.equal(p.blocked,false);p.destroy();assert.equal(f.cancelled,true);assert.ok(f.media.every(a=>a.paused));
});
