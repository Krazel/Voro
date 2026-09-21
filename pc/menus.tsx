import React, { useState } from 'react';
import { LanguagePicker } from '../app/language-picker';
import { t } from '../app/language.mjs';
import { STAGES } from '../app/journey-data.mjs';

export function PcPause({onResume,onSettings,onMenu}:{onResume:()=>void;onSettings:()=>void;onMenu:()=>void}) {
  return <section className="pc-pause" aria-label={t('Pausa')}><div className="pc-panel"><p className="eyebrow">VORO · ABISAL</p><h1>{t('Pausa')}</h1><button className="pc-gold" onClick={onResume}>{t('Continuar')}</button><button onClick={onSettings}>{t('Configuración')}</button><button onClick={onMenu}>{t('Volver al menú')}</button></div></section>;
}
export function PcSettings(p:{stage:number;complete:boolean;eaten:number;elapsed:number;sound:boolean;onSound:()=>void;onClose:()=>void;onRestart:()=>void}) {
  const [section,setSection]=useState('main');
  const [confirm,setConfirm]=useState(false);
  return <div className="final-settings-shell pc-settings"><header><p className="eyebrow">VORO · ABISAL</p><h1>{t(section==='main'?'Configuración':section==='journey'?'Recorrido':'Créditos')}</h1></header><div className="pc-panel">
    {section==='main'? <><p className="pc-controls">WASD / ↑ ↓ ← → · {t('Movimiento')}<br/>{t('Impulso')} · Space<br/>{t('Pausa')} · Esc</p><button onClick={p.onSound} aria-pressed={p.sound}>{t('Sonido')} · {t(p.sound?'Activado':'Desactivado')}</button><LanguagePicker /><nav><button onClick={()=>setSection('journey')}>{t('Recorrido')}</button><button onClick={()=>setSection('credits')}>{t('Créditos')}</button><a href="https://www.instagram.com/krazelgames/" target="_blank" rel="noopener noreferrer">Instagram ↗</a></nav><button onClick={()=>setConfirm(true)}>{t('Volver a nacer')}</button>{confirm&&<div role="alertdialog"><p>{t('Se borrará esta partida y sus adaptaciones.')}</p><button onClick={()=>setConfirm(false)}>{t('Cancelar')}</button><button onClick={p.onRestart}>{t('Sí, volver a nacer')}</button></div>}</> : section==='journey'? <><ol className="pc-route">{STAGES.slice(0,p.complete?STAGES.length:p.stage+1).map((s:any,i:number)=><li key={s.id} data-current={i===p.stage}>{t(s.short)}</li>)}</ol><p>{t('Absorciones')} · {p.eaten} &nbsp; {Math.floor(p.elapsed/60)} min</p></> : <><h2>VORO ABISAL</h2><p>{t('Un juego de Krazel Games')}</p><p>{t('Creación y desarrollo')} · Krazel Games</p><a href="/music/credits.txt" target="_blank">{t('Música y licencias')}</a></>}
  </div><button className="pc-gold" onClick={section==='main'?p.onClose:()=>setSection('main')}>{t(section==='main'?'Volver al juego':'Volver')}</button></div>;
}
export function PcTools(_:unknown) { return null; }
