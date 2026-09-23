'use client';
import { t as tr } from './language.mjs';


import { useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { MUSIC } from './music.mjs';
import { STAGES } from './journey-data.mjs';
import { MembraneFrame, MembraneSettings } from './membrane-settings';

type Section = 'main' | 'journey' | 'credits';

export function FinalSettings({
  wide = false,
  stage,
  complete,
  eaten,
  elapsed,
  tilt,
  leftHanded,
  sound,
  testMode,
  onMovement,
  onLeftHanded,
  onSound,
  onRestart,
}: {
  wide?: boolean;
  stage: number;
  complete: boolean;
  eaten: number;
  elapsed: number;
  tilt: boolean;
  leftHanded: boolean;
  sound: boolean;
  testMode: boolean;
  onMovement: (tilt: boolean) => void;
  onLeftHanded: () => void;
  onSound: () => void;
  onRestart: () => void;
}) {
  const [section, setSection] = useState<Section>('main');
  const [confirmReset, setConfirmReset] = useState(false);
  const [licenses, setLicenses] = useState(false);

  const detailRoot=useRef<HTMLDivElement>(null);
  useLayoutEffect(()=>{
    if(section==='main') return;
    const root=detailRoot.current,dialog=root?.closest<HTMLElement>('.voro-settings');
    const fit=()=>dialog?.style.setProperty('--settings-viewport-height',`${window.visualViewport?.height||window.innerHeight}px`);
    fit();if(dialog) dialog.scrollTop=0;
    root?.querySelector<HTMLElement>('h2')?.focus({preventScroll:true});
    window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);
    return ()=>{window.removeEventListener('resize',fit);window.visualViewport?.removeEventListener('resize',fit);};
  },[section]);

  if (section === 'main') return <>
    <MembraneSettings wide={wide} tilt={tilt} leftHanded={leftHanded} sound={sound} testMode={testMode} blocked={confirmReset}
      onMovement={onMovement} onLeftHanded={onLeftHanded} onSound={onSound}
      onSection={setSection} onRebirth={()=>setConfirmReset(true)} />
    {confirmReset&&<div className="membrane-reset" role="alertdialog" aria-modal="true" aria-label={tr('Confirmar nueva vida')}
      onKeyDown={event=>{
        if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setConfirmReset(false);}
        if(event.key==='Tab'){
          const buttons=event.currentTarget.querySelectorAll('button');
          const next=document.activeElement===buttons[0]?buttons[1]:buttons[0];
          event.preventDefault();next.focus();
        }
      }}>
      <p>{tr('Se borrará esta partida y sus adaptaciones.')}</p>
      <button autoFocus onClick={()=>setConfirmReset(false)}>{tr('Cancelar')}</button>
      <button onClick={onRestart}>{tr('Sí, volver a nacer')}</button>
    </div>}
  </>;

  return (
    <div ref={detailRoot} className="final-settings-shell membrane-settings membrane-detail" data-section={section} data-wide={wide}>
      <header className="membrane-heading">
        <button className="membrane-back" aria-label={tr('Volver a configuración')} onClick={()=>{setLicenses(false);setSection('main');}}><ChevronLeft/></button>
        <p>VORO · ABISAL</p>
        <h2 tabIndex={-1}>{tr(section==='journey'?'Recorrido':'Créditos')}</h2>
      </header>
      <section className={`membrane-detail-panel ${section==='credits'?'credits-panel':'journey-panel'}`}>
        <MembraneFrame/>
        <div className="membrane-detail-content">
          {section==='journey'? <>
            <ol className="membrane-journey final-journey" aria-label={tr('Evolución de Voro')}>
              {STAGES.slice(0,complete?STAGES.length:stage+1).map((item,index)=><li key={item.id} className={complete||index<stage?'done':'current'}>
                <i aria-hidden="true"/><span>{tr(item.short)}</span>{index===stage&&!complete&&<small>{tr('Actual')}</small>}
              </li>)}
            </ol>
            <div className="membrane-stats"><span>{tr('Absorciones ')}<b>{eaten}</b></span><span>{tr('Tiempo ')}<b>{Math.floor(elapsed/60)}{tr(' min')}</b></span></div>
          </>:<>
            <h3>{tr('Voro Abisal')}</h3><p>{tr('Un juego de Krazel Games')}</p>
            <hr/><h4>{tr('Creación y desarrollo')}</h4><p>Krazel Games</p>
            <hr/><h4>{tr('Música y licencias')}</h4>
            <button className="membrane-license-button" aria-expanded={licenses} onClick={()=>setLicenses(!licenses)}>{tr(licenses?'Volver':'Ver licencias')}</button>
            {licenses&&<div className="membrane-licenses"><p>{tr('Música de Scott Buckley · ')}<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a></p><ul>{MUSIC.map(track=><li key={track.id}><a href={track.source} target="_blank" rel="noopener noreferrer">{track.title}</a> — Scott Buckley</li>)}</ul><p>{tr('Composiciones completas. Volumen normalizado, conversión MP3 y fundidos de entrada, salida y repetición. Sin recortes de secciones.')}</p></div>}
          </>}
        </div>
      </section>
      {section==='credits'&&<p className="membrane-thanks">{tr('Gracias por acompañar a Voro desde el origen.')}</p>}
      <div className="membrane-actions">
        {section==='journey'&&!testMode&&<button className="membrane-rebirth" onClick={()=>{setSection('main');setConfirmReset(true);}}>{tr('Volver a nacer')}</button>}
        <button className="membrane-return" onClick={()=>{setLicenses(false);setSection('main');}}>{tr('Volver')}</button>
      </div>
    </div>
  );
}
