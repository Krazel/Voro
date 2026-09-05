'use client';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Volume2, VolumeX, ArrowUpRight, ChevronsRight } from 'lucide-react';
import { VoroEngine } from './engine';
export default function Home() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<VoroEngine | null>(null);
  const [state, setState] = useState({ eaten: 0, size: 40, elapsed: 0, dash: 0, evolved: false, complete: false, paused: false, started: false, sound: true, hint: '' });
  useEffect(() => { const game = new VoroEngine(canvas.current!, setState); engine.current = game; return () => { game.destroy(); engine.current = null; }; }, []);
  const action = (name: 'start' | 'pause' | 'restart' | 'dash' | 'sound' | 'continue') => engine.current?.action(name);
  return <main className="voro-shell">
    <aside className="outside-caption"><span className="side-line" />UN UNIVERSO POR DENTRO</aside>
    <section className="viewport" aria-label="VORO: inicio de Abisal">
      <canvas ref={canvas} aria-label="Escenario de juego. Usa WASD o flechas, o arrastra para nadar. Espacio para impulsarte." tabIndex={0} />
      <div className="shade" />
      <header className="game-header"><div className="brand">VORO<span>ABISAL</span></div><div className="header-actions">
        <button className="icon-button" onClick={() => action('sound')} aria-label={state.sound ? 'Silenciar sonido' : 'Activar sonido'}>{state.sound ? <Volume2 size={19} /> : <VolumeX size={19} />}</button>
        {state.started && <button className="icon-button" onClick={() => action('pause')} aria-label={state.paused ? 'Reanudar' : 'Pausar'}>{state.paused ? <Play size={19} /> : <Pause size={19} />}</button>}
      </div></header>
      <div className="biomass-hud"><div className="size"><strong>{state.size}</strong><span>µm</span></div><div className="growth"><div className="growth-label"><span>{state.evolved ? 'MEMBRANA EXPANDIDA' : 'ORGANISMO UNICELULAR'}</span><span>{Math.min(state.eaten,18)} / 18</span></div><div className="growth-track" role="progressbar" aria-label="Nutrientes absorbidos" aria-valuemin={0} aria-valuemax={18} aria-valuenow={Math.min(state.eaten,18)}><span style={{ width: `${Math.min(state.eaten/18,1)*100}%` }} /></div></div></div>
      {!state.started && <div className="intro"><p className="eyebrow">01 / EL DESPERTAR</p><h1>Todo empieza<br />con hambre.</h1><p className="intro-instruction">Nada hacia los nutrientes dorados.<br />Tu membrana hará el resto.</p><button className="primary-button" onClick={() => action('start')}>Despertar <ArrowUpRight size={20} /></button><span className="short-note">Una primera vida · aproximadamente 1 minuto</span></div>}
      {state.started && !state.complete && <><div className={`hint ${state.hint ? 'show' : ''}`} role="status">{state.hint}</div><div className="bottom-controls"><div className="movement-guide"><span className="guide-dot" /><span>ARRASTRA PARA NADAR</span></div><button className={`dash-button ${state.dash > 0 ? 'cooldown' : ''}`} onPointerDown={e => { e.preventDefault(); action('dash'); }} onClick={e => { if (e.detail === 0) action('dash'); }} disabled={state.dash > 0 || state.paused} aria-label="Impulso, también con la barra espaciadora"><ChevronsRight size={31} /><span>{state.dash > 0 ? `${state.dash.toFixed(1)} s` : 'IMPULSO'}</span></button></div></>}
      {state.complete && <div className="finish-panel" role="status"><p className="eyebrow">PRIMERA EVOLUCIÓN</p><h2>Has despertado.</h2><p>De 40 a {state.size} µm. Tu membrana se expande.<br />El océano todavía no sabe que existes.</p><div className="finish-stats"><span><b>18</b>nutrientes</span><span><b>{Math.floor(state.elapsed)} s</b>de vida</span></div><button className="primary-button" onClick={() => action('continue')}>Seguir nadando <ArrowUpRight size={20} /></button><button className="text-button" onClick={() => action('restart')}><RotateCcw size={14} /> Volver a nacer</button></div>}
      {state.paused && !state.complete && <div className="pause-panel"><p className="eyebrow">EN SUSPENSIÓN</p><h2>Respira.</h2><button className="primary-button" onClick={() => action('pause')}>Seguir nadando <Play size={18} /></button><button className="text-button" onClick={() => action('restart')}><RotateCcw size={14} /> Volver a nacer</button></div>}
      <div className="scale-marker"><i /><span>20 µm</span></div>
    </section>
    <aside className="desktop-note"><span>01 — EL DESPERTAR</span><p>Arrastra para nadar<br />WASD / flechas · espacio para impulso</p><small>Prototipo jugable · 2D</small></aside>
  </main>;
}
