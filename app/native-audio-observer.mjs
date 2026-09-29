// History is diagnostic only. Only the newest live activity state controls audio.
export function observeAudioSession(plugin,record,onActivity,doc=globalThis.document) {
  let disposed=false,handle,lastSequence=-1;
  const seen=new Set();
  onActivity(false);
  const emit=(kind,detail)=>{if(!disposed)record(kind,detail);};
  const activity=value=>{
    if(disposed||!value||typeof value.allowed!=='boolean'||!Number.isSafeInteger(value.sequence)||value.sequence<=lastSequence)return false;
    lastSequence=value.sequence;onActivity(value.allowed);return true;
  };
  const event=(value,live)=>{
    if(live)activity(value.activity);
    if(!seen.has(value.sequence)){seen.add(value.sequence);if(seen.size>100)seen.delete(seen.values().next().value);emit('native-event',value);}
  };
  const fallback=()=>{if(!disposed&&lastSequence<0){onActivity(true);emit('native-activity-unavailable',{});}};
  const snapshot=(kind,value)=>{
    activity(value.activity);
    for(const item of (Array.isArray(value.events)?value.events:[]))event(item,false);
    emit(kind,{session:value.session,activity:value.activity});
    fallback();
  };
  void plugin.addListener('audioSession',value=>event(value,true)).then(value=>{
    if(disposed)void value.remove();else handle=value;
  }).catch(()=>emit('native-unavailable',{}));
  const refresh=(kind)=>void plugin.snapshot().then(value=>snapshot(kind,value)).catch(()=>{emit('native-snapshot-error',{});fallback();});
  refresh('native-initial');
  const visible=()=>{if(!doc.hidden)refresh('native-foreground');};
  doc.addEventListener('visibilitychange',visible);
  return()=>{disposed=true;doc.removeEventListener('visibilitychange',visible);void handle?.remove();};
}
