import {Capacitor,registerPlugin} from '@capacitor/core';
import {MUSIC} from './music.mjs';
const plugin=registerPlugin('VoroMusic');
let commandRevision=Date.now()*100;
export const nativeMusicAvailable=()=>Capacitor.getPlatform()==='ios';

// Only state changes cross the bridge. There are no media elements, Web Audio
// music nodes, warm-up cycles or automatic pause/play recovery on iOS.
export class NativeMusicPlayer {
  constructor(_context=null,{bridge=plugin,onDiagnostic=(_kind,_detail)=>{}}={}) {
    this.backend='AVAudioPlayer';this.bridge=bridge;this.onDiagnostic=onDiagnostic;
    this.decks=[];this.bus=undefined;this.desired='menu';this.active=false;
    this.unlocked=true;this.blocked=false;this.destroyed=false;this.serial=0;
    this.native={};this.listener=null;this.current=null;this.transition=null;
    bridge.addListener('musicState',state=>this.receive(state)).then(handle=>{
      if(this.destroyed)handle.remove();else this.listener=handle;
    }).catch(error=>this.report(error));
  }
  receive(state){if(this.destroyed||state.revision<(this.native.revision??-1))return;this.native=state;this.current=state.track?{id:state.track}:null;
    this.blocked=!!state.error;this.onDiagnostic('native-music',state);}
  report(error){if(this.destroyed)return;this.blocked=true;this.onDiagnostic('native-music-error',{message:String(error).slice(0,160)});}
  setState(id,active,immediate=false,fadeSeconds=.08,level=1){
    if(this.destroyed)return;
    if(MUSIC.some(track=>track.id===id))this.desired=id;
    this.active=!!active;this.volumeTarget=active?.42*Math.max(0,Math.min(1,Number.isFinite(level)?level:1)):0;
    const state={track:this.desired,active:this.active,volume:this.volumeTarget,immediate:!!immediate,fade:Math.max(.08,Math.min(3,fadeSeconds))};
    const key=JSON.stringify(state);if(this.last===key)return;this.last=key;
    this.bridge.setState({...state,revision:++commandRevision}).then(state=>this.receive(state)).catch(error=>this.report(error));
  }
  unlock(){} // Native playback has no browser gesture unlock.
  tick(){}
  stats(){return {backend:this.backend,desired:this.desired,active:this.active,volumeTarget:this.volumeTarget??0,...this.native};}
  destroy(){if(this.destroyed)return;this.destroyed=true;this.listener?.remove();
    this.bridge.setState({track:this.desired,active:false,volume:0,immediate:true,fade:0,revision:++commandRevision}).catch(()=>{});}
}
