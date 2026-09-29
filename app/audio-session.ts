import {Capacitor,registerPlugin,type PluginListenerHandle} from '@capacitor/core';
import {observeAudioSession} from './native-audio-observer.mjs';
const native=registerPlugin<{
  snapshot():Promise<Record<string,unknown>>;
  addListener(event:string,listener:(event:Record<string,unknown>)=>void):Promise<PluginListenerHandle>;
}>('VoroAudioDiagnostics');

export function observeNativeAudio(record:(event:string,detail:Record<string,unknown>)=>void,onActivity:(active:boolean)=>void){
  if(!Capacitor.isNativePlatform())return Object.assign(()=>{},{recheck:()=>false});
  return observeAudioSession(native,record,onActivity);
}
