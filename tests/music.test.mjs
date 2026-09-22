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
test('Pausing mid-crossfade and resuming never leaves a second song audible',async()=>{
 const {player:p,context:c}=fixture();c.state='running';
 p.setState('micro',true);p.unlock();await settle();
 p.setState('water',true);await settle();assert.ok(p.transition);
 p.setState('water',false);p.setState('water',true);await settle();
 const other=p.decks.find(d=>d!==p.current);
 assert.equal(other.audio.paused,true);assert.equal(other.gain.gain.value,0);
 assert.equal(p.current.audio.paused,false);p.destroy();
});
test('A stale play promise cannot pause the newly resumed active deck',async()=>{
 const {player:p,context:c}=fixture();c.state='running';p.setState('micro',true);p.unlock();await settle();
 const pending=[];p.current.audio.play=function(){this.paused=false;return new Promise(r=>pending.push(r));};
 p.resume();p.setState('micro',false);p.setState('micro',true);
 pending[0]();await settle();assert.equal(p.current.audio.paused,false);
 for(const resolve of pending.slice(1))resolve();await settle();p.destroy();
});
test('Repeated movement gestures never restart an already running audio deck',async()=>{
 const {player:p,context:c,media}=fixture();c.state='running';let plays=0,resumes=0;
 c.resume=()=>{resumes++;return Promise.resolve();};
 media.forEach(a=>{const play=a.play;a.play=function(){plays++;return play.call(this);};});
 p.setState('micro',true);p.unlock();await settle();const initial=plays;
 for(let i=0;i<100;i++)p.unlock();await settle();
 assert.equal(plays,initial);assert.equal(resumes,0);p.destroy();
});

test('A cancelled pending crossfade cannot interrupt its replacement on the same deck',async()=>{
 const {player:p,context:c}=fixture();c.state='running';p.setState('micro',true);p.unlock();await settle();
 const next=p.decks.find(d=>d!==p.current),pending=[];
 next.audio.play=function(){this.paused=false;return new Promise(r=>pending.push(r));};
 p.setState('water',true);p.setState('water',false);p.setState('water',true);
 assert.equal(pending.length,2);
 pending[0]();await settle();assert.equal(next.audio.paused,false);assert.equal(next.pending,true);
 pending[1]();await settle();assert.equal(p.current,next);assert.equal(next.audio.paused,false);assert.equal(next.pending,false);p.destroy();
});
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
