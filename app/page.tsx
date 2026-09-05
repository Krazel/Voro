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
  Waves,
  Sparkles,
  Check,
  Orbit,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { VoroEngine, type Snapshot } from './engine';
import { STAGES, MUTATIONS } from './campaign.mjs';
const mutationIcons = [Waves, Shield, Sparkles];
export default function Home() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<VoroEngine | null>(null);
  const [settings, setSettings] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const resumeAfterSettings = useRef(false);
  const [state, setState] = useState<Snapshot>({
    stage: 0,
    mutations: [],
    won: false,
    saved: false,
    storageAvailable: true,
    transition: 0,
    deaths: 0,
    biomass: 8,
    target: 26,
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
    name:
      | 'start'
      | 'pause'
      | 'restart'
      | 'retry'
      | 'dash'
      | 'sound'
      | 'continue',
  ) => engine.current?.action(name);
  const changeSettings = (open: boolean) => {
    if (engine.current) engine.current.settingsOpen = open;
    if (open) {
      resumeAfterSettings.current =
        state.started && !state.paused && !state.complete && !state.dead;
      if (resumeAfterSettings.current) action('pause');
    } else if (resumeAfterSettings.current) {
      if (engine.current?.paused) action('pause');
      resumeAfterSettings.current = false;
    }
    setConfirmReset(false);
    setSettings(open);
  };
  const stage = STAGES[state.stage];
  const number = String(state.stage + 1).padStart(2, '0');
  const active = state.started && !state.complete && !state.dead;
  const minutes = Math.floor(state.elapsed / 60),
    seconds = String(Math.floor(state.elapsed % 60)).padStart(2, '0');
  return (
    <main className="voro-shell">
      <aside className="outside-caption">
        <span className="side-line" />
        UN UNIVERSO POR DENTRO
      </aside>
      <section className="viewport" aria-label={'VORO: ' + stage.name}>
        <canvas
          ref={canvas}
          aria-label="Arrastra para moverte. También puedes usar WASD, flechas o mando. Espacio para impulsarte."
          tabIndex={0}
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
            {active && (
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
            <strong>{state.size.toLocaleString('es-ES')}</strong>
            <span>{stage.unit}</span>
          </div>
          <div className="growth">
            <div className="growth-label">
              <span>{stage.form.toUpperCase()}</span>
              <span>
                {Math.min(
                  100,
                  Math.round((state.biomass / state.target) * 100),
                )}
                %
              </span>
            </div>
            <progress
              className="sr-only"
              aria-label="Biomasa para evolucionar"
              max={state.target}
              value={Math.min(state.target, state.biomass)}
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
        <div className="chapter-hud">
          <span>
            {number} / {stage.world.toUpperCase()}
          </span>
          <div
            className="chapter-dots"
            aria-label={'Etapa ' + (state.stage + 1) + ' de 6'}
          >
            {STAGES.map((s, i) => (
              <i key={s.name} className={i <= state.stage ? 'lit' : ''} />
            ))}
          </div>
        </div>
        {!state.started && (
          <div className="intro">
            <p className="eyebrow">
              {state.saved
                ? number + ' / ' + stage.name.toUpperCase()
                : 'DE UNA CÉLULA AL UNIVERSO'}
            </p>
            <h1>
              {state.saved ? (
                <>
                  Tu hambre
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
              {state.saved ? (
                'Tu evolución continúa donde la dejaste.'
              ) : (
                <>
                  Absorbe. Crece. Evoluciona.
                  <br />
                  Un día, te comerás los planetas.
                </>
              )}
            </p>
            <button className="primary-button" onClick={() => action('start')}>
              {state.saved ? 'Continuar partida' : 'Despertar'}
              <ArrowUpRight size={20} />
            </button>
            <span className="short-note">
              6 mundos ·{' '}
              {state.storageAvailable
                ? 'guardado automático'
                : 'partida sin guardado'}
            </span>
          </div>
        )}
        {active && (
          <>
            <output className={'hint ' + (state.hint ? 'show' : '')}>
              {state.hint}
            </output>
            <div className="bottom-controls">
              <div className="movement-guide">
                <span className="guide-dot" />
                <span>ARRASTRA PARA MOVERTE</span>
              </div>
              <button
                className={'dash-button ' + (state.dash > 0 ? 'cooldown' : '')}
                onPointerDown={(e) => {
                  e.preventDefault();
                  action('dash');
                }}
                onClick={(e) => {
                  if (e.detail === 0) action('dash');
                }}
                disabled={
                  state.dash > 0 || state.paused || state.transition > 0
                }
                aria-label="Impulso, también con espacio o botón A"
              >
                <ChevronsRight size={31} />
                <span>
                  {state.dash > 0 ? state.dash.toFixed(1) + ' s' : 'IMPULSO'}
                </span>
              </button>
            </div>
            {state.stage === 5 && (
              <div className="final-objective">
                <Orbit size={13} />
                {state.biomass < 56
                  ? 'GAIA · ' + state.biomass.toFixed(0) + ' / 56 BIOMASA'
                  : 'GAIA ESTÁ A TU ALCANCE'}
              </div>
            )}
          </>
        )}
        {state.started && state.complete && !state.won && (
          <div
            className="finish-panel evolution-panel"
            aria-label="Elige una mutación"
          >
            <p className="eyebrow">EVOLUCIÓN {number} / 05</p>
            <h2>La vida se abre paso.</h2>
            <p>{stage.transition}</p>
            <div className="next-world">
              SIGUIENTE ·{' '}
              {STAGES[Math.min(state.stage + 1, 5)].name.toUpperCase()}
            </div>
            <div className="mutation-choices">
              {MUTATIONS.map((m, i) => {
                const Icon = mutationIcons[i];
                return (
                  <button
                    key={m.id}
                    onClick={() => engine.current?.evolve(m.id)}
                  >
                    <Icon size={21} />
                    <span>
                      <strong>{m.name}</strong>
                      <small>{m.detail}</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                );
              })}
            </div>
            <span className="short-note">
              Elige una mutación. Su efecto se acumula.
            </span>
          </div>
        )}
        {active && state.paused && !settings && (
          <div className="pause-panel">
            <p className="eyebrow">EN SUSPENSIÓN</p>
            <h2>Respira.</h2>
            <p className="pause-copy">
              {stage.name} · {minutes}:{seconds}
            </p>
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
              Tu membrana no ha resistido.
              <br />
              Conservas las mutaciones y las etapas anteriores.
            </p>
            <div className="finish-stats">
              <span>
                <b>{number}</b>etapa
              </span>
              <span>
                <b>{state.mutations.length}</b>mutaciones
              </span>
            </div>
            <button className="primary-button" onClick={() => action('retry')}>
              Reintentar etapa
              <RotateCcw size={18} />
            </button>
          </div>
        )}
        {state.started && state.won && (
          <div className="finish-panel ending-panel" aria-live="polite">
            <Orbit size={30} className="ending-icon" />
            <p className="eyebrow">EL ÚLTIMO MUNDO</p>
            <h2>
              Todo vive
              <br />
              dentro de ti.
            </h2>
            <p>
              Empezaste en una gota de agua.
              <br />
              Ahora, un planeta late en tu núcleo.
            </p>
            <div className="finish-stats">
              <span>
                <b>{state.eaten}</b>absorciones
              </span>
              <span>
                <b>
                  {minutes}:{seconds}
                </b>
                de evolución
              </span>
            </div>
            <div className="ending-seal">
              <Check size={14} />
              CAMPAÑA COMPLETADA
            </div>
            <button
              className="text-button"
              onClick={() => changeSettings(true)}
            >
              Tu evolución
              <Settings size={14} />
            </button>
          </div>
        )}
        {state.transition > 0 && (
          <div
            className="stage-transition"
            key={state.stage}
            aria-live="polite"
          >
            <span>{number} / 06</span>
            <h2>{stage.name}</h2>
            <p>{stage.world} · una nueva escala</p>
          </div>
        )}
        {state.protected && active && !state.paused && (
          <div className="protection-badge">MEMBRANA PROTEGIDA · ESCAPA</div>
        )}
        <div className="scale-marker">
          <i />
          <span>
            {stage.baseSize / 2} {stage.unit}
          </span>
        </div>
      </section>
      <Dialog open={settings} onOpenChange={changeSettings}>
        <DialogContent className="voro-settings" showCloseButton={false}>
          <p className="eyebrow">VORO · ABISAL</p>
          <DialogTitle>Configuración</DialogTitle>
          <DialogDescription>Una pausa en tu evolución.</DialogDescription>
          <button
            className="settings-row"
            onClick={() => action('sound')}
            aria-pressed={state.sound}
          >
            Sonido<span>{state.sound ? 'Activado' : 'Desactivado'}</span>
          </button>
          <div className="journey-list" aria-label="Etapas de la evolución">
            {STAGES.map((s, i) => (
              <div key={s.name} className={i <= state.stage ? 'unlocked' : ''}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                {s.name}
                {i < state.stage || state.won ? (
                  <Check size={13} />
                ) : i === state.stage ? (
                  <i />
                ) : null}
              </div>
            ))}
          </div>
          <p className="save-note">
            {state.storageAvailable
              ? 'La partida se guarda en este dispositivo.'
              : 'No se puede guardar en este navegador. La partida durará mientras siga abierta.'}
          </p>
          {state.mutations.length > 0 && (
            <div className="mutation-summary">
              {MUTATIONS.map((m) => {
                const n = state.mutations.filter((x) => x === m.id).length;
                return n ? (
                  <span key={m.id}>
                    {m.name} ×{n}
                  </span>
                ) : null;
              })}
            </div>
          )}
          {confirmReset ? (
            <div className="reset-confirm">
              <p>
                Se borrará esta evolución. Empezarás desde el primer organismo.
              </p>
              <button
                className="primary-button"
                onClick={() => {
                  resumeAfterSettings.current = false;
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
          {number} — {stage.name.toUpperCase()}
        </span>
        <p>
          Arrastra para moverte
          <br />
          WASD / flechas · espacio para impulso
          <br />
          Mando · stick izquierdo + A
        </p>
        <small>VORO · 6 etapas de evolución</small>
      </aside>
    </main>
  );
}
