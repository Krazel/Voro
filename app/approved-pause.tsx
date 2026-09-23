'use client';
import { Protagonist } from './adaptation-constellation';
import { LivingMenuArt } from './living-menu-art';
import { t } from './language.mjs';
import './approved-pause.css';

export function ApprovedPause({onContinue,onSettings,onMenu,onProtagonist}:{onContinue:()=>void;onSettings:()=>void;onMenu:()=>void;onProtagonist:(canvas:HTMLCanvasElement|null)=>void}) {
  return <section className="approved-pause" aria-label={t('Pausa')}>
    <div className="pause-artboard">
      <LivingMenuArt journey={false} pause />
      <p className="pause-brand">VORO · <span>ABISAL</span></p>
      <h2>{t('Pausa')}</h2>
      <div className="pause-organism"><Protagonist connect={onProtagonist}/></div>
      <nav aria-label={t('Pausa')}>
        <button className="pause-choice pause-continue" onClick={onContinue}>{t('Continuar')}</button>
        <button className="pause-choice pause-settings" onClick={onSettings}>{t('Configuración')}</button>
        <button className="pause-choice pause-menu" onClick={onMenu}>{t('Volver al menú')}</button>
      </nav>
      <p className="pause-save">{t('El progreso se guarda automáticamente.')}</p>
    </div>
  </section>;
}
