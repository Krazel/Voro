'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowUpRight,
  ChevronsRight,
  Settings,
  Shield,
  Sparkles,
  Waves,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { VoroEngine, type Snapshot } from './engine';
import { UPGRADES, levelOf } from './mutations.mjs';
import { STAGES, STAGE_SPECIES } from './journey-data.mjs';
export default function Home() {
  const canvas = useRef<HTMLCanvasElement>(null),
    engine = useRef<VoroEngine | null>(null);
  const [settings, setSettings] = useState(false),
    [confirmReset, setConfirmReset] = useState(false);
  const resume = useRef(false);
  const [state, setState] = useState<Snapshot>({
    stage: 0,
    stageName: STAGES[0].name,
    scale: '40 µm',
    evolutionFrom: 0,
    ending: 0,
    finalReady: false,
    assetError: false,
    mutations: [],
    offer: [],
    level: 0,
    adaptation: 0,
    adaptationStart: 0,
    adaptationTarget: 6,
    saved: false,
    storageAvailable: true,
    transition: 0,
    deaths: 0,
    biomass: 8,
    target: 150,
    hurt: 0,
    dead: false,
    protected: false,
    eaten: 0,
    size: 40,
    elapsed: 0,
    dash: 0,
    evolved: false,
    complete: false,
    paused: false,
    started: false,
    sound: true,
    hint: '',
    shield: -1,
    combo: false,
    assetsReady: false,
  });
  useEffect(() => {
    const game = new VoroEngine(canvas.current!, setState);
    engine.current = game;
    return () => {
      game.destroy();
      engine.current = null;
    };
  }, []);
  const action = (
    name: 'start' | 'pause' | 'restart' | 'retry' | 'dash' | 'sound',
  ) => engine.current?.action(name);
  const changeSettings = (open: boolean) => {
    if (engine.current) engine.current.settingsOpen = open;
    if (open) {
      resume.current =
        state.started && !state.paused && !state.offer.length && !state.dead;
      if (resume.current) action('pause');
    } else if (resume.current) {
      if (engine.current?.paused) action('pause');
      resume.current = false;
    }
    setConfirmReset(false);
    setSettings(open);
  };
  const active =
    state.started && !state.dead && !state.complete && state.ending === 0;
  const xp = Math.min(
    1,
    Math.max(
      0,
      (state.adaptation - state.adaptationStart) /
        (state.adaptationTarget - state.adaptationStart),
    ),
  );
  return (
    <main className="voro-shell">
      <aside className="outside-caption">
        <span className="side-line" />
        UN UNIVERSO POR DENTRO
      </aside>
      <section className="viewport" aria-label="VORO: del origen al universo">
        <canvas
          ref={canvas}
          tabIndex={0}
          aria-label="Arrastra para moverte. También puedes usar WASD, flechas o un mando. Espacio para impulsarte."
        />
        <div className="shade" />
        <header className="game-header">
          <div className="brand">
            VORO<span>ABISAL</span>
          </div>
          <div className="header-actions">
            <button
              className="icon-button"
              onClick={() => changeSettings(true)}
              aria-label="Configuración"
            >
              <Settings size={19} />
            </button>
            <button
              className="icon-button"
              onClick={() => action('sound')}
              aria-label={state.sound ? 'Silenciar sonido' : 'Activar sonido'}
            >
              {state.sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
            </button>
            {active && !state.offer.length && (
              <button
                className="icon-button"
                onClick={() => action('pause')}
                aria-label={state.paused ? 'Reanudar' : 'Pausar'}
              >
                {state.paused ? <Play size={19} /> : <Pause size={19} />}
              </button>
            )}
          </div>
        </header>
        <div
          className={
            'biomass-hud ' +
            (state.hurt > 0 ? 'damaged ' : '') +
            (state.biomass <= 4 ? 'critical' : '')
          }
        >
          <div className="size">
            <strong className="journey-size">{state.scale}</strong>
            <span>{STAGES[state.stage].short}</span>
          </div>
          <div className="growth">
            <div className="growth-label">
              <span>BIOMASA</span>
              <span>
                {state.biomass.toFixed(1)} / {state.target}
              </span>
            </div>
            <progress
              className="sr-only"
              aria-label="Biomasa"
              value={Math.min(state.biomass, state.target)}
              max={state.target}
            />
            <div className="growth-track" aria-hidden="true">
              <i
                className="growth-trail"
                style={{
                  width: Math.min(state.biomass / state.target, 1) * 100 + '%',
                }}
              />
              <span
                style={{
                  width: Math.min(state.biomass / state.target, 1) * 100 + '%',
                }}
              />
            </div>
          </div>
        </div>
        <div className="micro-adaptation">
          <div>
            <span>
              {state.level >= 43
                ? 'ADAPTACIONES COMPLETAS'
                : 'ADAPTACIÓN ' + (state.level + 1)}
            </span>
            <span>{state.level} mejoras</span>
          </div>
          <progress
            className="sr-only"
            aria-label="Experiencia para la siguiente adaptación"
            value={xp}
            max={1}
          />
          <i aria-hidden="true">
            <b style={{ width: xp * 100 + '%' }} />
          </i>
        </div>
        {!state.started && (
          <div className="intro">
            <p className="eyebrow">
              {String(state.stage + 1).padStart(2, '0')} /{' '}
              {state.stageName.toUpperCase()}
            </p>
            <h1>
              {state.saved ? (
                <>
                  La vida
                  <br />
                  te espera.
                </>
              ) : (
                <>
                  Todo empieza
                  <br />
                  con hambre.
                </>
              )}
            </h1>
            <p className="intro-instruction">
              {STAGES[state.stage].intro}
              <br />
              {state.saved
                ? 'Tu evolución continúa.'
                : 'Todo un universo espera fuera de la gota.'}
            </p>
            <button
              className="primary-button"
              disabled={!state.assetsReady}
              onClick={() => action('start')}
            >
              {!state.assetsReady
                ? 'Preparando tu mundo…'
                : state.saved
                  ? 'Continuar partida'
                  : 'Despertar'}
              <ArrowUpRight size={20} />
            </button>
            <span className="short-note">
              Del origen al universo · guardado automático
            </span>
            {state.assetError && !state.assetsReady && (
              <button
                className="text-button"
                onClick={() => window.location.reload()}
              >
                Reintentar carga
              </button>
            )}
          </div>
        )}
        {active && (
          <>
            <output className={'hint micro-hint ' + (state.hint ? 'show' : '')}>
              {state.hint}
            </output>
            <div className="bottom-controls">
              <div className="movement-guide">
                <span className="guide-dot" />
                <span>ARRASTRA PARA MOVERTE</span>
              </div>
              <button
                className={'dash-button ' + (state.dash > 0 ? 'cooldown' : '')}
                disabled={
                  state.dash > 0 ||
                  state.paused ||
                  state.offer.length > 0 ||
                  state.transition > 0
                }
                onPointerDown={(e) => {
                  e.preventDefault();
                  action('dash');
                }}
                onClick={(e) => {
                  if (e.detail === 0) action('dash');
                }}
                aria-label="Impulso"
              >
                <ChevronsRight size={31} />
                <span>
                  {state.dash > 0 ? state.dash.toFixed(1) + ' s' : 'IMPULSO'}
                </span>
              </button>
            </div>
            <div className="micro-buffs">
              {state.shield >= 0 && (
                <span>
                  <Shield size={12} />
                  {state.shield > 0
                    ? 'Escudo · ' + Math.ceil(state.shield) + ' s'
                    : 'Escudo listo'}
                </span>
              )}
              {state.combo && (
                <span>
                  <Sparkles size={12} />
                  Hambre encadenada
                </span>
              )}
            </div>
          </>
        )}
        {active && state.paused && !settings && (
          <div className="pause-panel">
            <p className="eyebrow">EN SUSPENSIÓN</p>
            <h2>Respira.</h2>
            <p className="pause-copy">Tu progreso queda guardado.</p>
            <button className="primary-button" onClick={() => action('pause')}>
              Continuar
              <Play size={18} />
            </button>
          </div>
        )}
        {state.started && state.dead && (
          <div className="finish-panel death-panel" aria-live="polite">
            <p className="eyebrow">BIOMASA AGOTADA</p>
            <h2>La vida insiste.</h2>
            <p>
              Vuelves a ser pequeño.
              <br />
              Conservas tu escala y tus adaptaciones.
            </p>
            <div className="finish-stats">
              <span>
                <b>{state.eaten}</b>absorciones
              </span>
              <span>
                <b>{state.level}</b>mejoras
              </span>
            </div>
            <button className="primary-button" onClick={() => action('retry')}>
              Reintentar
              <RotateCcw size={18} />
            </button>
          </div>
        )}
        {state.transition > 0 && (
          <div
            className="stage-transition journey-transition"
            aria-live="polite"
          >
            <span>
              EVOLUCIÓN · {STAGES[state.evolutionFrom].short.toUpperCase()}
            </span>
            <h2>{STAGES[state.evolutionFrom].evolution}</h2>
            <p>{STAGES[Math.min(8, state.evolutionFrom + 1)].name}</p>
          </div>
        )}
        {state.started && !state.assetsReady && (
          <div className="journey-loading">
            <p>El siguiente mundo está despertando…</p>
            {state.assetError && (
              <button
                className="primary-button"
                onClick={() => window.location.reload()}
              >
                Reintentar carga
              </button>
            )}
          </div>
        )}
        {state.ending > 0 && (
          <div className="ending-caption" aria-live="polite">
            <span>EL ÚLTIMO HORIZONTE</span>
            <p>
              {state.ending > 7
                ? 'Toda la materia converge.'
                : state.ending > 3
                  ? 'Toda la luz vuelve a casa.'
                  : 'Ya no queda nada fuera de ti.'}
            </p>
          </div>
        )}
        {state.started && state.complete && (
          <div className="finish-panel journey-finish" aria-live="polite">
            <p className="eyebrow">UNIVERSO ABSORBIDO</p>
            <h2>
              Todo estaba
              <br />
              dentro de ti.
            </h2>
            <p>De una única célula al último punto de luz.</p>
            <div className="finish-stats">
              <span>
                <b>{state.eaten}</b>absorciones
              </span>
              <span>
                <b>{Math.floor(state.elapsed / 60)}</b>minutos
              </span>
              <span>
                <b>{state.level}</b>adaptaciones
              </span>
            </div>
            <button
              className="primary-button"
              onClick={() => changeSettings(true)}
            >
              Ver tu recorrido
              <Sparkles size={18} />
            </button>
            <span className="short-note">FIN · VORO</span>
          </div>
        )}
        {state.protected && active && !state.paused && !state.offer.length && (
          <div className="protection-badge">MEMBRANA PROTEGIDA · ESCAPA</div>
        )}
        <div className="scale-marker">
          <span>
            {String(state.stage + 1).padStart(2, '0')} / 09 ·{' '}
            {STAGES[state.stage].short.toUpperCase()}
          </span>
        </div>
      </section>
      <Dialog
        open={active && state.offer.length > 0 && !settings}
        onOpenChange={() => {}}
      >
        <DialogContent className="micro-upgrade-dialog" showCloseButton={false}>
          <p className="eyebrow">ADAPTACIÓN {state.level + 1}</p>
          <DialogTitle>
            La vida encuentra
            <br />
            otra forma.
          </DialogTitle>
          <DialogDescription>
            Elige una mejora. Tu evolución continúa en esta escala.
          </DialogDescription>
          <div className="mutation-choices">
            {state.offer.map((id) => {
              const u = UPGRADES.find((u) => u.id === id)!;
              const Icon =
                u.group === 'Defenderse'
                  ? Shield
                  : u.group === 'Moverse'
                    ? Waves
                    : Sparkles;
              return (
                <button key={id} onClick={() => engine.current?.choose(id)}>
                  <Icon size={23} />
                  <span>
                    <strong>{u.name}</strong>
                    <small>{u.detail}</small>
                    <em>
                      {u.group} · nivel {levelOf(state.mutations, id) + 1}/
                      {u.max}
                    </em>
                  </span>
                  <ArrowUpRight size={17} />
                </button>
              );
            })}
          </div>
          <span className="short-note">
            El tiempo se detiene mientras eliges.
          </span>
        </DialogContent>
      </Dialog>
      <Dialog open={settings} onOpenChange={changeSettings}>
        <DialogContent className="voro-settings" showCloseButton={false}>
          <p className="eyebrow">VORO · ABISAL</p>
          <DialogTitle>Configuración</DialogTitle>
          <DialogDescription>{state.stageName}</DialogDescription>
          <button
            className="settings-row"
            onClick={() => action('sound')}
            aria-pressed={state.sound}
          >
            Sonido<span>{state.sound ? 'Activado' : 'Desactivado'}</span>
          </button>
          <div className="micro-stat-row">
            <span>{state.eaten} absorciones</span>
            <span>{Math.floor(state.elapsed / 60)} min de vida</span>
          </div>
          <p className="save-note">
            {state.storageAvailable
              ? 'La partida se guarda en este dispositivo.'
              : 'El guardado no está disponible en este navegador.'}
          </p>
          <ol className="journey-route" aria-label="Tu recorrido">
            {STAGES.map((s, i) => (
              <li
                key={s.id}
                className={
                  state.complete || i < state.stage
                    ? 'done'
                    : i === state.stage
                      ? 'current'
                      : 'locked'
                }
              >
                <span>{String(i + 1).padStart(2, '0')}</span>
                <b>{s.short}</b>
                <small>
                  {state.complete || i < state.stage
                    ? 'Superado'
                    : i === state.stage
                      ? 'Aquí estás'
                      : 'Por descubrir'}
                </small>
              </li>
            ))}
          </ol>
          {state.level > 0 && (
            <div className="micro-upgrade-list">
              {UPGRADES.map((u) => {
                const n = levelOf(state.mutations, u.id);
                return n ? (
                  <div key={u.id}>
                    <span>{u.name}</span>
                    <b>
                      {n}/{u.max}
                    </b>
                  </div>
                ) : null;
              })}
            </div>
          )}
          {confirmReset ? (
            <div className="reset-confirm">
              <p>Se borrará esta partida y sus adaptaciones.</p>
              <button
                className="primary-button"
                onClick={() => {
                  resume.current = false;
                  action('restart');
                  changeSettings(false);
                }}
              >
                Sí, volver a nacer
                <RotateCcw size={16} />
              </button>
              <button
                className="text-button"
                onClick={() => setConfirmReset(false)}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              className="settings-row"
              onClick={() => setConfirmReset(true)}
            >
              Volver a nacer
              <RotateCcw size={16} />
            </button>
          )}
          <DialogClose className="primary-button">
            Volver al juego
            <Play size={18} />
          </DialogClose>
        </DialogContent>
      </Dialog>
      <aside className="desktop-note">
        <span>
          {String(state.stage + 1).padStart(2, '0')} —{' '}
          {state.stageName.toUpperCase()}
        </span>
        <p>
          Arrastra para moverte
          <br />
          WASD / flechas · espacio para impulso
          <br />
          Mando · stick izquierdo + A
        </p>
        <small>
          {STAGE_SPECIES[state.stage].length} habitantes en esta escala
          <br />
          15 adaptaciones · mundo infinito
        </small>
      </aside>
    </main>
  );
}
