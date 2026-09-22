import {useEffect} from 'react';
import {Capacitor,registerPlugin} from '@capacitor/core';
const native=registerPlugin<{setActive(options:{active:boolean}):Promise<void>}>('VoroBenchmarkDisplay');
let pending=Promise.resolve();
function setNative(active:boolean){pending=pending.catch(()=>{}).then(()=>native.setActive({active}));void pending.catch(()=>{});}

export function useBenchmarkAwake(active:boolean){
  useEffect(()=>{
    if(!active)return;
    if(Capacitor.isNativePlatform()){
      setNative(true);return ()=>setNative(false);
    }
    let disposed=false,lock:WakeLockSentinel|undefined;
    const request=()=>{
      if(!document.hidden)void navigator.wakeLock?.request('screen').then(value=>{
        if(disposed)void value.release();else lock=value;
      }).catch(()=>{});
    };
    request();document.addEventListener('visibilitychange',request);
    return()=>{disposed=true;document.removeEventListener('visibilitychange',request);void lock?.release();};
  },[active]);
}
