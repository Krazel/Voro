// History is diagnostic only. Only the newest live activity state controls audio.
export function observeAudioSession(plugin,record,onActivity,doc=globalThis.document) {
  let disposed=false,handle,lastSequence=-1,liveActivityAvailable=true,fallbackOpened=false;
  let latestActivity=null,recoveryHeld=false,rechecking=false;
  const seen=new Set();
  onActivity(false);
  const emit=(kind,detail)=>{if(!disposed)record(kind,detail);};
  const activity=value=>{
    if(disposed||!liveActivityAvailable||!value||typeof value.allowed!=='boolean'||!Number.isSafeInteger(value.sequence)||value.sequence<=lastSequence)return false;
    lastSequence=value.sequence;latestActivity=value;fallbackOpened=false;
    if(!recoveryHeld||!value.allowed)onActivity(value.allowed);
    return true;
  };
  const event=(value,live)=>{
    // After a failed check, only a new live transition can release the hold.
    if(live&&recoveryHeld&&!rechecking&&value.activity?.sequence>lastSequence)recoveryHeld=false;
    if(live)activity(value.activity);
    if(!seen.has(value.sequence)){seen.add(value.sequence);if(seen.size>100)seen.delete(seen.values().next().value);emit('native-event',value);}
  };
  const fallback=()=>{if(!disposed&&lastSequence<0&&!fallbackOpened){fallbackOpened=true;onActivity(true);emit('native-activity-unavailable',{});}};
  const snapshot=(kind,value)=>{
    activity(value.activity);
    for(const item of (Array.isArray(value.events)?value.events:[]))event(item,false);
    emit(kind,{session:value.session,activity:value.activity});
    fallback();
  };
  const refresh=(kind)=>void plugin.snapshot().then(value=>snapshot(kind,value)).catch(()=>{emit('native-snapshot-error',{});fallback();});
  const recheck=()=>{
    if(disposed||!liveActivityAvailable||fallbackOpened)return false;
    recoveryHeld=true;onActivity(false);
    if(rechecking)return true;
    rechecking=true;emit('native-interruption-check',{});
    void Promise.resolve().then(()=>plugin.snapshot()).then(value=>{
      if(disposed)return;
      snapshot('native-interruption-snapshot',value);
      if(typeof value.activity?.allowed!=='boolean'||!Number.isSafeInteger(value.activity?.sequence))return;
      // The fresh reply or a newer live event wins. Earlier snapshots cannot
      // reopen playback while this request is in flight.
      recoveryHeld=false;
      if(latestActivity)onActivity(latestActivity.allowed);
    }).catch(()=>emit('native-interruption-check-error',{})).finally(()=>{rechecking=false;});
    return true;
  };
  // Subscribe before reading current state so a transition cannot fall in a gap.
  void plugin.addListener('audioSession',value=>event(value,true)).then(value=>{
    if(disposed)void value.remove();else {handle=value;refresh('native-initial');}
  }).catch(()=>{
    liveActivityAvailable=false;emit('native-unavailable',{});fallback();
    if(!disposed)refresh('native-initial');
  });
  const visible=()=>{if(!doc.hidden){if(recoveryHeld)recheck();else refresh('native-foreground');}};
  doc.addEventListener('visibilitychange',visible);
  return Object.assign(()=>{disposed=true;doc.removeEventListener('visibilitychange',visible);void handle?.remove();},{recheck});
}
