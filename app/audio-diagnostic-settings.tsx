'use client';
import {useState} from 'react';
import {t} from './language.mjs';
export function AudioDiagnosticSettings({onShare}:{onShare:(observation:string)=>Promise<string>}) {
  const [observation,setObservation]=useState('unspecified'),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const share=async()=>{
    setBusy(true);setMessage('');
    try{await onShare(observation);setMessage('Archivo preparado. Guárdalo y adjúntalo en el chat.');}
    catch(error){setMessage(/cancel|abort/i.test(String(error))?'No se ha compartido el archivo.':'No se pudo compartir. Puedes volver a intentarlo.');}
    finally{setBusy(false);}
  };
  return <section className="audio-diagnostics" aria-label={t('Diagnóstico de audio')}>
    <p>{t('El audio se registra automáticamente como datos técnicos, sin micrófono. Puedes compartir el registro aunque suene bien.')}</p>
    <label>{t('Lo que escuché')}<select value={observation} onChange={e=>setObservation(e.target.value)}>
      <option value="unspecified">{t('Sin indicar')}</option><option value="good">{t('Sonaba bien')}</option>
      <option value="crackle">{t('Había petardeo')}</option><option value="silent">{t('Estaba en silencio')}</option>
    </select></label>
    <button disabled={busy} onClick={share}>{t(busy?'Preparando…':'Compartir diagnóstico de audio')}</button>
    {message&&<p role="status">{t(message)}</p>}
  </section>;
}
