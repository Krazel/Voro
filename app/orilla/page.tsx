'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CoastPreview, coastX, coastHabitat } from '../coast-preview.mjs';
import { WorldGround } from '../world-ground.mjs';
import { BACKGROUND_ASSETS } from '../background-assets.mjs';
import './orilla.css';

export default function ShorePreview() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controls = useRef({ auto: true, old: false, zoom: .75, waves: true, reset: 0 });
  const [auto, setAuto] = useState(true), [old, setOld] = useState(false), [zoom, setZoom] = useState(.75);
  const [waves, setWaves] = useState(true), [status, setStatus] = useState('Preparando la costa…');
  const [metrics, setMetrics] = useState(''), [retry, setRetry] = useState(0);
  useEffect(() => { Object.assign(controls.current, { auto, old, zoom, waves }); }, [auto, old, zoom, waves]);
  useEffect(() => {
    const el = canvas.current!, c = el.getContext('2d')!;
    let alive = true, raf = 0, renderer: CoastPreview | undefined;
    const previous = new WorldGround(), image = new Image();
    let width = 0, height = 0, last = 0, time = 0, report = 0, total = 0, frames = 0, worst = 0, reset = 0;
    let camera = { x: coastX(0), y: 0 };
    let drag: { id: number; x: number; y: number } | null = null;
    const resize = () => { width = el.clientWidth; height = el.clientHeight; const dpr = Math.min(devicePixelRatio || 1, 1.5); el.width = Math.round(width * dpr); el.height = Math.round(height * dpr); };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    const down = (e: PointerEvent) => { drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); controls.current.auto = false; setAuto(false); };
    const move = (e: PointerEvent) => { if (!drag || drag.id !== e.pointerId) return; camera.x -= (e.clientX - drag.x) / controls.current.zoom; camera.y -= (e.clientY - drag.y) / controls.current.zoom; drag.x = e.clientX; drag.y = e.clientY; };
    const up = () => { drag = null; };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    const frame = (now: number) => {
      if (!alive) return;
      const dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now;
      if (!document.hidden && renderer) {
        const start = performance.now(), settings = controls.current;
        time += dt;
        if (reset !== settings.reset) { camera = { x: coastX(0), y: 0 }; reset = settings.reset; }
        if (settings.auto) { camera.y += dt * 95; camera.x += (coastX(camera.y) - camera.x) * Math.min(1, dt * 2); }
        c.setTransform(el.width / width, 0, 0, el.height / height, 0, 0);
        if (settings.old) {
          c.save(); c.scale(width / 480, width / 480);
          previous.draw(c, image, 'land', {x: 600 + camera.x - coastX(0), y: camera.y}, settings.zoom * 480 / width, height * 480 / width);
          c.restore();
        } else renderer.draw(c, camera, settings.zoom, width, height, time, settings.waves);
        const ms = performance.now() - start; total += ms; worst = Math.max(worst, ms); frames++;
        if (now - report > 1000) { setMetrics(`${settings.old ? 'Fondo anterior' : coastHabitat(camera.x, camera.y)} · dibujo ${(total / frames).toFixed(1)} ms · pico ${worst.toFixed(1)} ms`); report = now; frames = 0; total = 0; worst = 0; }
      }
      raf = requestAnimationFrame(frame);
    };
    image.onload = async () => { try { await image.decode(); if (!alive) return; renderer = new CoastPreview(image); setStatus(''); raf = requestAnimationFrame(frame); } catch { if (alive) setStatus('No se pudo preparar la imagen.'); } };
    image.onerror = () => { if (alive) setStatus('No se pudo cargar la imagen.'); };
    image.src = BACKGROUND_ASSETS.land;
    return () => { alive = false; cancelAnimationFrame(raf); observer.disconnect(); renderer?.destroy(); previous.cache.clear(); previous.views.clear(); el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
  }, [retry]);
  return <main className="coast-lab">
    <canvas ref={canvas} aria-label="Prueba de costa continua. Arrastra para explorar la arena y el agua." />
    <header className="coast-heading"><Link href="/">← Volver al juego</Link><h1>La orilla</h1><p>Prueba de costa continua</p></header>
    {status && <output className="coast-loading">{status}{status.startsWith('No') && <button onClick={() => {setStatus('Preparando la costa…');setRetry(n => n + 1);}}>Reintentar</button>}</output>}
    <section className="coast-controls" aria-label="Controles de la prueba">
      <div className="coast-switch"><button aria-pressed={!old} onClick={() => setOld(false)}>Nueva costa</button><button aria-pressed={old} onClick={() => setOld(true)}>Anterior</button></div>
      <p>Arrastra para explorar. Tu partida está a salvo.</p>
      <div className="coast-actions"><button aria-pressed={auto} onClick={() => setAuto(v => !v)}>{auto ? 'Pausar recorrido' : 'Recorrer costa'}</button><button onClick={() => {controls.current.reset++;}}>Volver al inicio</button><button aria-pressed={waves} disabled={old} onClick={() => setWaves(v => !v)}>Espuma {waves ? 'activada' : 'desactivada'}</button></div>
      <label>Vista <input aria-label="Escala de la vista" type="range" min="0.3" max="1.4" step="0.05" value={zoom} onChange={e => setZoom(Number(e.target.value))} /><span>{Math.round(zoom * 100)} %</span></label>
      <output>{metrics || 'Cargando…'}<small>Tiempo de dibujo en CPU; no incluye la GPU ni mide el juego completo.</small></output>
    </section>
  </main>;
}
