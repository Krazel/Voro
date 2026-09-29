import {Capacitor,registerPlugin,type PluginListenerHandle} from '@capacitor/core';
const native=registerPlugin<{
  snapshot():Promise<Record<string,unknown>>;
  addListener(event:string,listener:(event:Record<string,unknown>)=>void):Promise<PluginListenerHandle>;
}>('VoroAudioDiagnostics');

export function observeNativeAudio(record:(event:string,detail:Record<string,unknown>)=>void){
  if(!Capacitor.isNativePlatform())return ()=>{};
  let disposed=false,handle:PluginListenerHandle|undefined;
  const seen=new Set<number>();
  const emit=(name:string,value:Record<string,unknown>)=>{if(!disposed)record(name,value);};
  const event=(value:Record<string,unknown>)=>{const n=Number(value.sequence);if(!seen.has(n)){seen.add(n);if(seen.size>100)seen.delete(seen.values().next().value!);emit('native-event',value);}};
  const snapshot=(name:string,value:Record<string,unknown>)=>{
    for(const item of (Array.isArray(value.events)?value.events:[]))event(item);
    emit(name,{session:value.session});
  };
  void native.addListener('audioSession',event).then(value=>{
    if(disposed)void value.remove();else handle=value;
  }).catch(()=>emit('native-unavailable',{}));
  void native.snapshot().then(value=>snapshot('native-initial',value)).catch(()=>emit('native-snapshot-error',{}));
  const refresh=()=>{if(!document.hidden)void native.snapshot().then(value=>snapshot('native-foreground',value)).catch(()=>emit('native-snapshot-error',{}));};
  document.addEventListener('visibilitychange',refresh);
  return()=>{disposed=true;document.removeEventListener('visibilitychange',refresh);void handle?.remove();};
}
