'use client';
import { t as tr } from './language.mjs';


import { useState } from 'react';
import { LanguagePicker } from './language-picker';
import { ChevronLeft } from 'lucide-react';
import { DialogClose } from '@/components/ui/dialog';
import { MUSIC } from './music.mjs';
import { STAGES } from './journey-data.mjs';
import './approved-settings.css';

type Section = 'main' | 'journey' | 'credits';

export function FinalSettings({
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
  onDevelopment,
}: {
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
  onDevelopment: () => void;
}) {
  const [section, setSection] = useState<Section>('main');
  const [confirmReset, setConfirmReset] = useState(false);
  const [licenses, setLicenses] = useState(false);

  return (
    <div className="final-settings-shell approved-settings" data-section={section}>
      <div className="approved-art" aria-hidden="true" />
      <div className="approved-breath" aria-hidden="true" />
      <header className="final-settings-heading">
        {tr(section === 'main' ? (
          <DialogClose className="living-back" aria-label={tr("Volver al juego")}><ChevronLeft /></DialogClose>
        ) : (
          <button className="living-back" aria-label={tr("Volver a configuración")} onClick={() => setSection('main')}><ChevronLeft /></button>
        ))}
        <h2>{tr(section === 'main' ? 'Configuración' : section === 'journey' ? 'Recorrido' : 'Créditos')}</h2>
      </header>

      {tr(section === 'main' && <>
        <section className="living-panel final-settings-panel" aria-label={tr("Configuración general")}>
          <div className="final-setting-row final-movement-row">
            <span>{tr("Movimiento")}</span>
            <div className="living-segmented">
              <button aria-pressed={!tilt} onClick={() => onMovement(false)}>{tr("Dedo")}</button>
              <button aria-pressed={tilt} onClick={() => onMovement(true)}>{tr("Inclinar")}</button>
            </div>
          </div>
          <button className="final-setting-row" aria-pressed={leftHanded} onClick={onLeftHanded}>
            <span>{tr("Modo zurdo")}</span><i className="living-toggle" aria-hidden="true" />
          </button>
          <button className="final-setting-row" aria-pressed={sound} onClick={onSound}>
            <span>{tr("Sonido")}</span><i className="living-toggle" aria-hidden="true" />
          </button>
          <div className="final-setting-row">
            <LanguagePicker />
          </div>
        </section>
        <nav className="final-settings-links" aria-label={tr("Más opciones")}>
          <button onClick={() => setSection('journey')}>{tr("Recorrido")}</button>
          <button onClick={() => setSection('credits')}>{tr("Créditos")}</button>
          <button className="development-access" onClick={onDevelopment}>{tr("Desarrollo")}</button>
          <a href="https://www.instagram.com/krazelgames/" target="_blank" rel="noopener noreferrer">{tr("Instagram")}</a>
          {tr(!testMode && <button className="rebirth-link" onClick={() => setConfirmReset(true)}>{tr("Volver a nacer")}</button>)}
        </nav>
        {tr(confirmReset && <div className="living-panel reset-sheet" role="alertdialog" aria-label={tr("Confirmar nueva vida")}>
          <p>{tr("Se borrará esta partida y sus adaptaciones.")}</p>
          <div><button onClick={() => setConfirmReset(false)}>{tr("Cancelar")}</button><button className="danger" onClick={onRestart}>{tr("Sí, volver a nacer")}</button></div>
        </div>)}
        <DialogClose className="living-primary">{tr("Volver al juego")}</DialogClose>
      </>)}

      {tr(section === 'journey' && <>
        <section className="living-panel journey-panel">
          <ol className="final-journey" aria-label={tr("Evolución de Voro")}>
            {tr(STAGES.map((item, index) => <li key={item.id} className={complete || index < stage ? 'done' : index === stage ? 'current' : 'locked'}>
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
