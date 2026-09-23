'use client';
import { useLayoutEffect, useRef } from 'react';
import { DialogClose } from '@/components/ui/dialog';
import { LanguagePicker } from './language-picker';
import { t } from './language.mjs';
import './membrane-settings.css';

function Frame({ small = false }: { small?: boolean }) {
  return <svg className="membrane-frame" aria-hidden="true" viewBox={small ? '42 1055 379 192' : '42 316 768 700'} preserveAspectRatio="none">
    <svg x="42" y={small?1055:316} width={small?379:768} height={small?192:700} viewBox={small?'42 1055 379 192':'42 316 768 700'} style={{overflow:'hidden',borderRadius:small?'12% / 24%':'10% / 12%'}} preserveAspectRatio="none">
      <image href="/ui/membrane/settings-art.webp" width="853" height="1844" preserveAspectRatio="none" />
    </svg>
  </svg>;
}

export function MembraneSettings({wide,tilt,leftHanded,sound,testMode,blocked,onMovement,onLeftHanded,onSound,onSection,onRebirth}: {
  wide:boolean;tilt:boolean;leftHanded:boolean;sound:boolean;testMode:boolean;
  blocked:boolean;
  onMovement:(value:boolean)=>void;onLeftHanded:()=>void;onSound:()=>void;
  onSection:(section:'journey'|'credits')=>void;onRebirth:()=>void;
}) {
  const root=useRef<HTMLDivElement>(null);
  useLayoutEffect(()=>{
    const dialog=root.current?.closest<HTMLElement>('.voro-settings');
    const fit=()=>dialog?.style.setProperty('--settings-viewport-height',`${window.visualViewport?.height||window.innerHeight}px`);
    fit();window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);
    return ()=>{window.removeEventListener('resize',fit);window.visualViewport?.removeEventListener('resize',fit);};
  },[]);
  return <div ref={root} className="final-settings-shell membrane-settings" data-wide={wide} inert={blocked}>
    <header className="membrane-heading" tabIndex={-1} style={{outline:'none'}}><p>VORO · ABISAL</p><h2>{t('Configuración')}</h2></header>
    <section className="membrane-controls" aria-label={t('Configuración general')}>
      <Frame />
      <div className="membrane-control-content">
        <div className="membrane-movement"><span>{t('Movimiento')}</span>
          <div className="membrane-segments"><button aria-pressed={!tilt} onClick={()=>onMovement(false)}>{t('Dedo')}</button><button aria-pressed={tilt} onClick={()=>onMovement(true)}>{t('Inclinar')}</button></div>
        </div>
        <button className="membrane-row" aria-pressed={leftHanded} onClick={onLeftHanded}><span>{t('Modo zurdo')}</span><i className="membrane-switch" aria-hidden="true" /></button>
        <button className="membrane-row" aria-pressed={sound} onClick={onSound}><span>{t('Sonido')}</span><i className="membrane-switch" aria-hidden="true" /></button>
        <div className="membrane-row"><LanguagePicker /></div>
      </div>
    </section>
    <nav className="membrane-links" aria-label={t('Más opciones')}>
      <button onClick={()=>onSection('journey')}><Frame small/><span>{t('Recorrido')} <b aria-hidden="true">›</b></span></button>
      <button onClick={()=>onSection('credits')}><Frame small/><span>{t('Créditos')} <b aria-hidden="true">›</b></span></button>
    </nav>
    <a className="membrane-instagram" href="https://www.instagram.com/krazelgames/" target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a>
    <div className="membrane-actions">
      {!testMode&&<button className="membrane-rebirth" onClick={onRebirth}>{t('Volver a nacer')}</button>}
      <DialogClose className="membrane-return">{t('Volver al juego')}</DialogClose>
    </div>
    <a className="membrane-privacy" href="https://krazel.github.io/voro-abisal/privacy/" target="_blank" rel="noopener noreferrer">{t('Política de privacidad')}</a>
  </div>;
}
