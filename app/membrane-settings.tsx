'use client';
import { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { DialogClose } from '@/components/ui/dialog';
import { LanguagePicker } from './language-picker';
import { t } from './language.mjs';
import './membrane-settings.css';

export function MembraneFrame() {
  return <img className="membrane-frame" src="/ui/membrane/panel-cutout.webp" alt="" aria-hidden="true" draggable={false}/>;
}

export function MembraneSettings({wide,tilt,leftHanded,sound,testMode,blocked,menuTheme,onMenuTheme,onMovement,onLeftHanded,onSound,onSection,onRebirth}: {
  wide:boolean;tilt:boolean;leftHanded:boolean;sound:boolean;testMode:boolean;
  blocked:boolean;
  menuTheme:string;onMenuTheme:(theme:string)=>boolean;
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
  return <div ref={root} className="final-settings-shell membrane-settings" data-wide={wide} data-menu-theme={menuTheme} inert={blocked}>
    <header className="membrane-heading" tabIndex={-1} style={{outline:'none'}}><p>VORO · ABISAL</p><h2>{t('Configuración')}</h2></header>
    <section className="membrane-controls" aria-label={t('Configuración general')}>
      <MembraneFrame />
      <div className="membrane-control-content">
        <div className="membrane-movement"><span>{t('Movimiento')}</span>
          <div className="membrane-segments"><button aria-pressed={!tilt} onClick={()=>onMovement(false)}>{t('Dedo')}</button><button aria-pressed={tilt} onClick={()=>onMovement(true)}>{t('Inclinar')}</button></div>
        </div>
        <button className="membrane-row" aria-pressed={leftHanded} onClick={onLeftHanded}><span>{t('Modo zurdo')}</span><i className="membrane-switch" aria-hidden="true" /></button>
        <button className="membrane-row" aria-pressed={sound} onClick={onSound}><span>{t('Sonido')}</span><i className="membrane-switch" aria-hidden="true" /></button>
        <div className="membrane-row"><LanguagePicker /></div>
        <div className="membrane-row membrane-theme-row"><label htmlFor="voro-menu-theme">{t('Apariencia')}</label>
          <select id="voro-menu-theme" aria-label={t('Apariencia')} value={menuTheme} onChange={event=>onMenuTheme(event.target.value)}>
            <option value="current">{t('Actual')}</option>
            <option value="organic">{t('Azul orgánico')}</option>
            <option value="mixed">{t('Azul + actual')}</option>
            <option value="inverse">{t('Azul + verde')}</option>
          </select>
        </div>
      </div>
    </section>
    <nav className="membrane-links" aria-label={t('Más opciones')}>
      <button onClick={()=>onSection('journey')}><MembraneFrame/><span>{t('Recorrido')} <b aria-hidden="true">›</b></span></button>
      <button onClick={()=>onSection('credits')}><MembraneFrame/><span>{t('Créditos')} <b aria-hidden="true">›</b></span></button>
    </nav>
    <a className="membrane-instagram" href="https://www.instagram.com/krazelgames/" target="_blank" rel="noopener noreferrer">Instagram <ArrowUpRight aria-hidden="true" size="1.15em"/></a>
    <div className="membrane-actions">
      {!testMode&&<button className="membrane-rebirth" onClick={onRebirth}>{t('Volver a nacer')}</button>}
      <DialogClose className="membrane-return">{t('Volver al juego')}</DialogClose>
    </div>
    <a className="membrane-privacy" href="https://krazel.github.io/voro-abisal/privacy/" target="_blank" rel="noopener noreferrer">{t('Política de privacidad')}</a>
  </div>;
}
