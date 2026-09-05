'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { STAGES, STAGE_SPECIES, ATLAS_URLS } from '../journey-data.mjs';
import { ANIMATIONS } from '../animation-catalog.mjs';
import { drawInhabitant } from '../inhabitant-animation.mjs';
import './studio.css';
import SizeComparison from './size-comparison';

type Images = Record<string, HTMLImageElement>;
const TOTAL = STAGE_SPECIES.flat().length;
function Thumbnail({ id, images }: { id: string; images: Images }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const s = STAGE_SPECIES.flat().find((s) => s.id === id),
      canvas = ref.current;
    if (!s || !canvas || !images[s.imageAtlas || s.atlas]) return;
    const c = canvas.getContext('2d')!;
    c.clearRect(0, 0, 100, 100);
    c.save();
    c.translate(50, 50);
    const crop = ANIMATIONS[s.id].crop || s.crop,
      aspect = crop ? crop[3] / crop[2] : 1;
    drawInhabitant(
      c,
      images[s.imageAtlas || s.atlas],
      s,
      34 / Math.max(1, aspect),
      0,
      0.2,
      {
        cache: false,
      },
    );
    c.restore();
  }, [id, images]);
  return <canvas ref={ref} width={100} height={100} aria-hidden="true" />;
}
export default function AnimationStudio() {
  const [stage, setStage] = useState(STAGES.findIndex((s) => s.id === 'water')),
    [selected, setSelected] = useState('water-matter-kelp');
  const [images, setImages] = useState<Images>({}),
    [error, setError] = useState(false),
    [playing, setPlaying] = useState(true),
    [slow, setSlow] = useState(false),
    [mode, setMode] = useState('move');
  const [view, setView] = useState('animation');
  const [seen, setSeen] = useState<Set<string>>(new Set(['water-matter-kelp']));
  const canvas = useRef<HTMLCanvasElement>(null),
    time = useRef(0);
  const species = STAGE_SPECIES[stage],
    s = species.find((s) => s.id === selected) || species[0],
    profile = ANIMATIONS[s.id];
  useEffect(() => {
    let alive = true;
    Promise.all(
      Object.entries(ATLAS_URLS).map(async ([name, url]) => {
        const image = new Image();
        image.src = url as string;
        await image.decode();
        return [name, image] as const;
      }),
    )
      .then((items) => {
        if (alive) {
          setImages(Object.fromEntries(items));
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
            setPlaying(false);
        }
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    const c = canvas.current?.getContext('2d');
    if (view !== 'animation' || !c || !images[s.imageAtlas || s.atlas]) return;
    let frame = 0,
      last = performance.now();
    function draw(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (playing && !document.hidden) time.current += dt * (slow ? 0.3 : 1);
      const t = time.current,
        w = 960,
        h = 570;
      c!.clearRect(0, 0, w, h);
      const bg = c!.createRadialGradient(470, 250, 5, 470, 260, 650);
      bg.addColorStop(0, '#123b48');
      bg.addColorStop(1, '#030d1a');
      c!.fillStyle = bg;
      c!.fillRect(0, 0, w, h);
      for (let i = 0; i < 24; i++) {
        const x = (((i * 193.3 - t * 4) % 1000) + 1000) % 1000,
          y = 80 + ((i * 67.3) % 380);
        c!.beginPath();
        c!.arc(x, y, 0.7 + (i % 2) * 0.5, 0, Math.PI * 2);
        c!.fillStyle = '#badbdd23';
        c!.fill();
      }
      c!.font = '13px Arial';
      c!.fillStyle = '#87b5bd';
      c!.fillText('V O R O   /   ' + STAGES[stage].short.toUpperCase(), 32, 34);
      const crop = profile.crop || s.crop,
        aspect = crop ? crop[3] / crop[2] : s.atlas === 'water' ? 2 / 3 : 1;
      const radius = Math.min(208, 158 / Math.max(0.6, aspect)),
        activity = mode === 'idle' ? 0.35 : mode === 'react' ? 1.5 : 1;
      c!.save();
      c!.translate(480, 270);
      drawInhabitant(c!, images[s.imageAtlas || s.atlas], s, radius, 0, t, {
        detail: true,
        cache: false,
        activity,
      });
      c!.restore();
      c!.strokeStyle = '#6e9fa62e';
      c!.beginPath();
      c!.moveTo(32, 464);
      c!.lineTo(928, 464);
      c!.stroke();
      c!.fillStyle = '#97b9b9';
      c!.font = '14px Arial';
      c!.fillText('Vista en miniatura', 32, 500);
      c!.save();
      c!.translate(337, 508);
      drawInhabitant(
        c!,
        images[s.imageAtlas || s.atlas],
        s,
        Math.min(35, 30 / Math.max(0.6, aspect)),
        0,
        t,
        { activity },
      );
      c!.restore();
      c!.fillStyle = '#86acae';
      c!.font = '13px Arial';
      c!.fillText(
        mode === 'idle'
          ? 'REPOSO'
          : mode === 'react'
            ? 'REACCIÓN / ESFUERZO'
            : 'MOVIMIENTO',
        706,
        504,
      );
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [images, s, profile, stage, playing, slow, mode, view]);
  function choose(id: string) {
    setSelected(id);
    time.current = 0;
    setSeen((old) => new Set([...old, id]));
  }
  function changeStage(value: unknown) {
    const i = Number(value);
    setStage(i);
    choose(STAGE_SPECIES[i][0].id);
  }
  function next(dir: number) {
    const all = STAGE_SPECIES.flat(),
      i = all.findIndex((e) => e.id === s.id),
      n = all[(i + dir + all.length) % all.length];
    setStage(n.stage);
    choose(n.id);
  }
  return (
    <main className="animation-studio">
      <header className="studio-header">
        <Link href="/" className="studio-back">
          <ArrowLeft size={17} />
          Volver al juego
        </Link>
        <span>
          {seen.size} / {TOTAL} explorados
        </span>
      </header>
      <div className="studio-title">
        <div>
          <p>EL ATLAS VIVO</p>
          <h1>Todo tiene su movimiento.</h1>
        </div>
        <span>
          {TOTAL} elementos · {STAGES.length} escalas
        </span>
      </div>
      <Tabs value={stage} onValueChange={changeStage}>
        <TabsList className="studio-stages">
          {STAGES.map((stage, i) => (
            <TabsTrigger key={stage.id} value={i}>
              {stage.short}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div
        className="studio-controls studio-view-switch"
        aria-label="Vista del atlas"
      >
        <button
          aria-pressed={view === 'animation'}
          onClick={() => setView('animation')}
        >
          Animaciones
        </button>
        <button
          aria-pressed={view === 'sizes'}
          onClick={() => setView('sizes')}
        >
          Comparar tamaños · mín. / máx.
        </button>
      </div>
      {view === 'sizes' ? (
        <SizeComparison
          stage={stage}
          images={images}
          error={error}
          onSelect={(id) => {
            choose(id);
            setView('animation');
          }}
        />
      ) : (
        <div className="studio-layout">
          <section className="studio-view" aria-label="Animación seleccionada">
            <div className="studio-canvas-wrap">
              <canvas
                ref={canvas}
                width={960}
                height={570}
                aria-label={`Animación de ${s.name}`}
              />
              {!images[s.imageAtlas || s.atlas] && (
                <div className="studio-loading">
                  {error ? (
                    <>
                      <p>No se han podido cargar las ilustraciones.</p>
                      <button onClick={() => location.reload()}>
                        Reintentar
                      </button>
                    </>
                  ) : (
                    'Cargando las ilustraciones…'
                  )}
                </div>
              )}
            </div>
            <div className="studio-controls">
              <button onClick={() => setPlaying(!playing)}>
                {playing ? <Pause size={17} /> : <Play size={17} />}{' '}
                {playing ? 'Pausar' : 'Reanudar'}
              </button>
              <button aria-pressed={slow} onClick={() => setSlow(!slow)}>
                Cámara lenta
              </button>
              <button
                aria-label="Reiniciar ciclo"
                onClick={() => {
                  time.current = 0;
                }}
              >
                <RotateCcw size={17} />
              </button>
              <div className="studio-modes" aria-label="Intensidad">
                {[
                  ['idle', 'Reposo'],
                  ['move', 'Movimiento'],
                  ['react', 'Reacción'],
                ].map(([id, name]) => (
                  <button
                    key={id}
                    aria-pressed={mode === id}
                    onClick={() => setMode(id)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div className="studio-caption">
              <div>
                <h2>{s.name}</h2>
                <p>{profile.description}</p>
              </div>
              <div className="studio-next">
                <button aria-label="Elemento anterior" onClick={() => next(-1)}>
                  <ChevronLeft />
                </button>
                <button aria-label="Siguiente elemento" onClick={() => next(1)}>
                  <ChevronRight />
                </button>
              </div>
            </div>
          </section>
          <aside
            className="studio-catalog"
            aria-label={`Elementos de ${STAGES[stage].short}`}
          >
            {species.map((e) => (
              <button
                key={e.id}
                aria-pressed={e.id === s.id}
                onClick={() => choose(e.id)}
              >
                <Thumbnail id={e.id} images={images} />
                <span>
                  {e.name}
                  <small>
                    {'edibleMatter' in e && e.edibleMatter
                      ? 'Materia comestible'
                      : ANIMATIONS[e.id].revision === 2
                        ? 'Nueva revisión'
                        : ANIMATIONS[e.id].revised
                          ? 'Animación revisada'
                          : seen.has(e.id)
                            ? 'Visto'
                            : 'Ver animación'}
                  </small>
                </span>
              </button>
            ))}
          </aside>
        </div>
      )}
      <p className="studio-note">
        La misma animación se usa en el juego. Las ilustraciones conservan su
        estilo: animales articulados, plantas que se balancean y objetos sólidos
        que conservan su forma.
      </p>
    </main>
  );
}
