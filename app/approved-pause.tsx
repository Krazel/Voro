'use client';
import { Protagonist } from './adaptation-constellation';
import { t } from './language.mjs';
import './approved-pause.css';
function PauseSurface({warm=false}:{warm?:boolean}) {
  return <svg className="pause-surface" viewBox="0 0 360 90" preserveAspectRatio="none" aria-hidden="true">
    <path d="M12 47 C17 29 37 8 67 9 C105 8 119 27 170 26 C221 27 246 11 278 14 C312 16 342 33 346 51 C354 70 327 83 300 82 C253 84 230 69 187 69 C135 68 114 86 71 82 C34 79 5 68 12 47Z" fill={warm?'#554323':'#053540'} stroke={warm?'#ffe294':'#7feef0'} strokeWidth="2"/>
    <path d="M16 46 C24 28 40 13 68 14 C107 13 121 31 170 30 C219 31 246 15 278 19 C309 21 337 36 341 51 C347 67 324 77 300 77 C253 78 229 65 187 65 C134 64 112 81 72 77 C39 74 11 65 16 46Z" fill="none" stroke={warm?'#efc66855':'#74f1ed44'} strokeWidth="3"/>
  </svg>;
}

export function ApprovedPause({onContinue,onSettings,onMenu,onProtagonist}:{onContinue:()=>void;onSettings:()=>void;onMenu:()=>void;onProtagonist:(canvas:HTMLCanvasElement|null)=>void}) {
  return <section className="approved-pause" aria-label={t('Pausa')}>
    <p className="pause-brand">VORO · <span>ABISAL</span></p>
    <h2>{t('Pausa')}</h2>
    <div className="pause-organism"><Protagonist connect={onProtagonist}/></div>
    <nav aria-label={t('Pausa')}>
      <button className="pause-choice pause-continue" onClick={onContinue}><PauseSurface warm/>{t('Continuar')}</button>
      <button className="pause-choice" onClick={onSettings}><PauseSurface/>{t('Configuración')}</button>
      <button className="pause-choice" onClick={onMenu}><PauseSurface/>{t('Volver al menú')}</button>
    </nav>
    <p className="pause-save">{t('El progreso se guarda automáticamente.')}</p>
  </section>;
}
