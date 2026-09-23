'use client';
import { t as tr } from './language.mjs';


import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { MUSIC } from './music.mjs';
import { STAGES } from './journey-data.mjs';
import './approved-settings.css';
import { LivingMenuArt } from './living-menu-art';
import { LandscapeMenuArt } from './landscape-menu-art';
import './landscape-settings.css';
import { MembraneSettings } from './membrane-settings';

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
    <div className="final-settings-shell approved-settings" data-section={section} data-wide={wide}>
      <div className="approved-art" aria-hidden="true" />
      {wide ? <LandscapeMenuArt /> : <LivingMenuArt journey={section === 'journey'} />}
      <header className="final-settings-heading">
        <button className="living-back" aria-label={tr("Volver a configuración")} onClick={() => setSection('main')}><ChevronLeft /></button>
        <h2>{tr(section === 'journey' ? 'Recorrido' : 'Créditos')}</h2>
      </header>
      {wide && <nav className="landscape-tabs" aria-label={tr('Configuración')}>
        <button onClick={() => setSection('main')}>{tr('Configuración')}</button>
        <button aria-current={section === 'journey' ? 'page' : undefined} onClick={() => setSection('journey')}>{tr('Recorrido')}</button>
        <button aria-current={section === 'credits' ? 'page' : undefined} onClick={() => setSection('credits')}>{tr('Créditos')}</button>
        <a href="https://www.instagram.com/krazelgames/" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
        {!testMode && <button className="landscape-rebirth" onClick={() => {setSection('main');setConfirmReset(true);}}>{tr('Volver a nacer')}</button>}
      </nav>}

      {tr(section === 'journey' && <>
        <section className="living-panel journey-panel">
          <ol className="final-journey" aria-label={tr("Evolución de Voro")}>
            {tr(STAGES.slice(0, complete ? STAGES.length : stage + 1).map((item, index) => <li key={item.id} className={complete || index < stage ? 'done' : index === stage ? 'current' : 'locked'}>
              <i aria-hidden="true"/><span>{tr(item.short)}</span>{tr(index === stage && !complete && <small>{tr("Actual")}</small>)}
            </li>))}
          </ol>
          <div className="final-stats"><span>{tr("Absorciones ")}<b>{tr(eaten)}</b></span><span>{tr("Tiempo ")}<b>{tr(Math.floor(elapsed / 60))}{tr(" min")}</b></span></div>
        </section>
        {!testMode && <button className="journey-rebirth" onClick={()=>{setSection('main');setConfirmReset(true);}}>{tr('Volver a nacer')}</button>}
        <button className="living-primary" onClick={() => setSection('main')}>{tr("Volver")}</button>
      </>)}

      {tr(section === 'credits' && <>
        <section className="living-panel credits-panel">
          <h3>{tr("Voro Abisal")}</h3><p>{tr("Un juego de Krazel Games")}</p>
          <hr/><h4>{tr("Creación y desarrollo")}</h4><p>{tr("Krazel Games")}</p>
          <hr/><h4>{tr("Música y licencias")}</h4>
          <button className="license-open" aria-expanded={licenses} onClick={()=>setLicenses(!licenses)}>{tr('Ver licencias')}</button>
          {licenses && <div className="license-sheet"><button onClick={()=>setLicenses(false)}>{tr('Volver')}</button><p>{tr("Música de Scott Buckley · ")}<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a></p><ul>{MUSIC.map(track => <li key={track.id}><a href={track.source} target="_blank" rel="noopener noreferrer">{track.title}</a> — Scott Buckley</li>)}</ul><p>{tr('Composiciones completas. Volumen normalizado, conversión MP3 y fundidos de entrada, salida y repetición. Sin recortes de secciones.')}</p></div>}
        </section>
        <p className="credits-thanks">{tr("Gracias por acompañar a Voro desde el origen.")}</p>
        <button className="living-primary" onClick={() => setSection('main')}>{tr("Volver")}</button>
      </>)}
    </div>
  );
}
