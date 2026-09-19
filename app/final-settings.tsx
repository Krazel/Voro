'use client';

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { DialogClose } from '@/components/ui/dialog';
import { MUSIC } from './music.mjs';
import { STAGES } from './journey-data.mjs';

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
}) {
  const [section, setSection] = useState<Section>('main');
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="final-settings-shell" data-section={section}>
      <header className="final-settings-heading">
        {section === 'main' ? (
          <DialogClose className="living-back" aria-label="Volver al juego"><ChevronLeft /></DialogClose>
        ) : (
          <button className="living-back" aria-label="Volver a configuración" onClick={() => setSection('main')}><ChevronLeft /></button>
        )}
        <h2>{section === 'main' ? 'Configuración' : section === 'journey' ? 'Recorrido' : 'Créditos'}</h2>
      </header>

      {section === 'main' && <>
        <section className="living-panel final-settings-panel" aria-label="Configuración general">
          <div className="final-setting-row final-movement-row">
            <span>Movimiento</span>
            <div className="living-segmented">
              <button aria-pressed={!tilt} onClick={() => onMovement(false)}>Dedo</button>
              <button aria-pressed={tilt} onClick={() => onMovement(true)}>Inclinar</button>
            </div>
          </div>
          <button className="final-setting-row" aria-pressed={leftHanded} onClick={onLeftHanded}>
            <span>Modo zurdo</span><i className="living-toggle" aria-hidden="true" />
          </button>
          <button className="final-setting-row" aria-pressed={sound} onClick={onSound}>
            <span>Sonido</span><i className="living-toggle" aria-hidden="true" />
          </button>
          <div className="final-setting-row">
            <span>Idioma</span><b className="setting-value">Automático</b>
          </div>
        </section>
        <nav className="final-settings-links" aria-label="Más opciones">
          <button onClick={() => setSection('journey')}>Recorrido</button>
          <button onClick={() => setSection('credits')}>Créditos</button>
          <a href="https://www.instagram.com/krazelgames/" target="_blank" rel="noopener noreferrer">Instagram</a>
          {!testMode && <button className="rebirth-link" onClick={() => setConfirmReset(true)}>Volver a nacer</button>}
        </nav>
        {confirmReset && <div className="living-panel reset-sheet" role="alertdialog" aria-label="Confirmar nueva vida">
          <p>Se borrará esta partida y sus adaptaciones.</p>
          <div><button onClick={() => setConfirmReset(false)}>Cancelar</button><button className="danger" onClick={onRestart}>Sí, volver a nacer</button></div>
        </div>}
        <DialogClose className="living-primary">Volver al juego</DialogClose>
      </>}

      {section === 'journey' && <>
        <section className="living-panel journey-panel">
          <ol className="final-journey" aria-label="Evolución de Voro">
            {STAGES.map((item, index) => <li key={item.id} className={complete || index < stage ? 'done' : index === stage ? 'current' : 'locked'}>
              <i aria-hidden="true"/><span>{item.short}</span>{index === stage && !complete && <small>Actual</small>}
            </li>)}
          </ol>
          <div className="final-stats"><span>Absorciones <b>{eaten}</b></span><span>Tiempo <b>{Math.floor(elapsed / 60)} min</b></span></div>
        </section>
        <button className="living-primary" onClick={() => setSection('main')}>Volver</button>
      </>}

      {section === 'credits' && <>
        <section className="living-panel credits-panel">
          <h3>Voro Abisal</h3><p>Un juego de Krazel Games</p>
          <hr/><h4>Creación y desarrollo</h4><p>Krazel Games</p>
          <hr/><h4>Música y licencias</h4>
          <p>Música de Scott Buckley · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a></p>
          <ul>{MUSIC.map(track => <li key={track.id}><a href={track.source} target="_blank" rel="noopener noreferrer">{track.title}</a></li>)}</ul>
        </section>
        <p className="credits-thanks">Gracias por acompañar a Voro desde el origen.</p>
        <button className="living-primary" onClick={() => setSection('main')}>Volver</button>
      </>}
    </div>
  );
}
