'use client';
import { t as tr } from './language.mjs';



import { finaleState } from './universe-finale.mjs';

import { observeNativeAudio } from './audio-session';



import { TRANSITION_ROUTES } from './journey-transitions.mjs';
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { DEVELOPMENT_TOOLS } from './build-flavor.mjs';
const DeveloperTools = DEVELOPMENT_TOOLS ? lazy(()=>import('./developer-tools')) : null;
import { readLeftHanded, writeLeftHanded, subscribeControls, serverLeftHanded } from './control-preferences';

import { AdaptationChoices } from './cristal-ui';
import { useLanguage } from './language-picker';
import { ReviewMilestone } from './review-milestone';
import { Capacitor } from '@capacitor/core';

import { FinalSettings } from './final-settings';
import { JourneyComplete } from './journey-complete';

import { MembraneRim } from './membrane-rim';
import { OwnedAdaptations } from './owned-adaptations.tsx';
import { isTabletDevice, wideScreenEnabled } from './desktop-viewport.mjs';
import './wide-screen.css';
import './cristal.css';
import './final-ui.css';

import {
  X,
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
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { VoroEngine, type Snapshot } from './engine';
import { MAX_UPGRADE_CHOICES } from './mutations.mjs';
import { STAGES } from './journey-data.mjs';
export default function Home({ desktop = false }: { desktop?: boolean } = {}) {
  const [wideScreen, setWideScreen] = useState(desktop);
  const [wideSettings, setWideSettings] = useState(false);
  useLayoutEffect(() => {
    const update = () => {
      const wide = wideScreenEnabled(desktop, isTabletDevice(navigator), window.innerWidth, window.innerHeight);
      setWideScreen(wide);
      setWideSettings(wide && window.innerWidth >= 760 && window.innerHeight >= 520 && window.innerWidth > window.innerHeight);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [desktop]);
  useLanguage();
  const canvas = useRef<HTMLCanvasElement>(null),
    engine = useRef<VoroEngine | null>(null);
  const connectProtagonist = useCallback((node: HTMLCanvasElement | null) => engine.current?.setAdaptationCanvas(node), []);
  const [settings, setSettings] = useState(false);
  const [ownedOpen, setOwnedOpen] = useState(false);
  const ownedTrigger = useRef<HTMLButtonElement>(null);
  const changeOwned = (open: boolean) => {
    // Treat this as a modal pause screen, including keyboard/gamepad/audio gates.
    if (engine.current) {
      engine.current.settingsOpen = open;
      engine.current.keys.clear();
      engine.current.setAudio();
    }
    setOwnedOpen(open);
  };
  const [finalDetails, setFinalDetails] = useState(false);
  const leftHanded = useSyncExternalStore(subscribeControls, readLeftHanded, serverLeftHanded);
  const [controlsSaveError, setControlsSaveError] = useState(false);
  const [tilt, setTilt] = useState(false);
  const [tiltPending, setTiltPending] = useState(false);
  const [tiltMessage, setTiltMessage] = useState('');
  const selectMovement = async (useTilt: boolean) => {
    const game = engine.current;
    if (!game) return;
    if (!useTilt) { game.tilt.stop(); setTilt(false); setTiltMessage(''); }
    else {
      setTiltPending(true);
      setTiltMessage('Sujeta el móvil en una posición cómoda…');
      const ok = await game.tilt.enable();
      setTilt(ok); setTiltPending(false);
      setTiltMessage(ok ? 'Inclina suavemente. Puedes recalibrar en Configuración.' : 'No se reciben datos de inclinación. Puedes seguir jugando con el dedo.');
    }
  };

  const resume = useRef(false);
  const adaptationHeading = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<Snapshot>({
    zoomFactor: 1,
    uniformVisualSpeed: true,
    testMode: false,
    stage: 0,
    stageName: STAGES[0].name,
    scale: '20 µm',
    evolutionFrom: 0,
    ending: 0,
    finalReady: false,
    assetError: false,
    mutations: [],
    offer: [],
    level: 0,
    adaptation: 0,
    adaptationStart: 0,
    adaptationTarget: 18,
    saved: false,
    birth: 0,
    storageAvailable: true,
    transition: 0,
    reviewHold: false,
    deaths: 0,
    biomass: 2,
    target: 150,
    hurt: 0,
    dead: false,
    protected: false,
    eaten: 0,
    absorptionsByStage: [],
    hitsReceived: 0,
    hitsPartial: false,
    size: 20,
    elapsed: 0,
    dash: 0,
    evolved: false,
    complete: false,
    paused: false,
    started: false,
    sound: true,
    hint: '',
    shield: -1,
    shieldReady: 0,
    combo: false,
    assetsReady: false,
  });
  useEffect(() => {
    const game = new VoroEngine(canvas.current!, setState, desktop);
    game.reviewEnabled = Capacitor.getPlatform() === 'ios';
    engine.current = game;
    const stopAudioObservation=observeNativeAudio((kind,detail)=>game.audioJournal?.event(kind,detail),active=>game.setNativeAudioActive(active));
    game.recheckNativeAudio=stopAudioObservation.recheck;
    return () => {
      stopAudioObservation();
      game.destroy();
      engine.current = null;
    };
  }, []);
  const action = (
    name: 'start' | 'pause' | 'restart' | 'retry' | 'dash' | 'sound',
  ) => engine.current?.action(name);
  useLayoutEffect(() => { engine.current?.recordUiCommit(); }, [state]);
  const changeSettings = (open: boolean) => {
    if (engine.current) engine.current.settingsOpen = open;
    if (open) {
      setFinalDetails(false);
      resume.current =
        state.started && !state.paused && !state.offer.length && !state.dead;
      if (resume.current) action('pause');
    } else if (resume.current) {
      if (engine.current?.paused) action('pause');
      resume.current = false;
    }
    engine.current?.setAudio();
    setSettings(open);
  };
  const finale = state.started && (state.ending > 0 || state.complete);
  const finalCaption = finaleState(state.ending).caption;
  const active =
    state.started && !state.dead && !state.complete && state.ending === 0;
  const xp =
    state.level >= MAX_UPGRADE_CHOICES
      ? 1
      : Math.min(
          1,
          Math.max(
            0,
            (state.adaptation - state.adaptationStart) /
              (state.adaptationTarget - state.adaptationStart),
          ),
        );
  return (
    <main className={'voro-shell' + (finale ? ' universe-ended' : '')} data-wide={wideScreen} data-ui="cristal" data-ui-mode="final">
      <section
        className={'viewport' + (finale ? ' universe-finale' : '')}
        data-event={
          state.birth > 0 ? 'birth' : !state.started ? 'intro' : state.offer.length
            ? 'adaptation'
            : state.transition > 0
              ? 'evolution'
              : state.paused
                ? 'pause'
                : 'play'
        }
        aria-label={tr("VORO: del origen al universo")}
      >
        <canvas
          ref={canvas}
          tabIndex={state.ending>0 ? -1 : 0}
          aria-label={tr(finale ? state.ending>0 ? 'El universo se apaga.' : 'Mueve al superviviente con el dedo, las flechas o un mando.' : 'Arrastra para moverte. También puedes usar WASD, flechas o un mando. Espacio para impulsarte.')}
        />
        <div className="shade" />
        <header className="game-header">
          <div className="brand">{tr(" VORO")}<span>{tr("ABISAL")}</span>
          </div>
          <div className="header-actions">
            <button
              className="icon-button"
              onClick={() => changeSettings(true)}
              aria-label={tr("Configuración")}
            >
              <Settings size={19} />
            </button>
            <button
              className="icon-button"
              onClick={() => action('sound')}
              aria-label={tr(state.sound ? 'Silenciar sonido' : 'Activar sonido')}
            >
              {tr(state.sound ? <Volume2 size={19} /> : <VolumeX size={19} />)}
            </button>
            {tr(active && !state.offer.length && (
              <button
                className="icon-button"
                onClick={() => action('pause')}
                aria-label={tr(state.paused ? 'Reanudar' : 'Pausar')}
              >
                {tr(state.paused ? <Play size={19} /> : <Pause size={19} />)}
              </button>
            ))}
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
            <strong className="journey-size">{tr(state.scale)}</strong>
            <span>
              {tr(STAGES[state.stage].short)}
            </span>
          </div>
          <div className="growth">
            <div className="growth-label">
              <span>{tr("BIOMASA")}</span>
              <span>
                {tr(state.biomass.toFixed(1))}{tr(" / ")}{tr(state.target)}
              </span>
            </div>
            <progress
              className="sr-only"
              aria-label={tr("Biomasa")}
              value={Math.min(state.biomass, state.target)}
              max={state.target}
            />
            <div className="growth-track" aria-hidden="true">
              <i
                className="growth-trail"
                style={{
                  transform: `scaleX(${Math.min(state.biomass / state.target, 1)})`,
                }}
              />
              <span
                style={{
                  transform: `scaleX(${Math.min(state.biomass / state.target, 1)})`,
                }}
              />
            </div>
          </div>
        <div className="micro-adaptation">
          <div>
            <span>
              {tr(state.level >= MAX_UPGRADE_CHOICES
                ? 'ADAPTACIONES COMPLETAS'
                : 'ADAPTACIÓN ' + (state.level + 1))}
            </span>
            <span>{tr(state.level)}{tr(" mejoras")}</span>
          </div>
          <progress
            className="sr-only"
            aria-label={tr("Experiencia para la siguiente adaptación")}
            value={xp}
            max={1}
          />
          <i aria-hidden="true">
            <b style={{ transform: `scaleX(${xp})` }} />
          </i>
        </div>
        </div>
        {tr(!state.started && !finale && (
          <div className="intro">
            <p className="eyebrow">{tr(state.saved ? 'TU EVOLUCIÓN' : 'EL ORIGEN')}</p>
            <h1>
              {tr(state.saved ? (
                <>{tr(" La vida ")}<br />{tr(" te espera. ")}</>
              ) : (
                <>{tr(" Antes de todo, ")}<br />{tr(" una vida. ")}</>
              ))}
            </h1>
            <p className="intro-instruction">
              {tr(state.saved
                ? 'Tu evolución continúa.'
                : 'De una célula a todo lo que existe.')}
            </p>
            <button
              className="primary-button"
              disabled={!state.assetsReady}
              data-voro-action="start"
              onClick={() => { engine.current?.tilt.calibrate(); action('start'); }}
            >
              {tr(!state.assetsReady
                ? 'Preparando tu mundo…'
                : state.saved
                  ? 'Continuar partida'
                  : 'Despertar')}
              <ArrowUpRight size={20} />
            </button>
            {tr(state.assetError && !state.assetsReady && (
              <button
                className="text-button"
                onClick={() => window.location.reload()}
              >{tr(" Reintentar carga ")}</button>
            ))}
          </div>
        ))}
        {tr(state.birth > 0 && <div className="birth-reveal" aria-live="polite"><p>{tr(state.birth > 1.4 ? 'Un latido.' : 'La vida despierta.')}</p></div>)}
        {tr(active && state.birth === 0 && (
          <>
            <div className="notice-region">
            <output
              className={
                'hint micro-hint cristal-toast membrane-control has-membrane-rim ' +
                (state.hint ? 'show' : '')
              }
            >
              <MembraneRim />{tr(state.hint)}
            </output>
            </div>
            <div className="bottom-controls" data-dash-side={leftHanded ? 'left' : 'right'}>
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
                aria-label={tr("Impulso")}
              >
                <ChevronsRight size={31} />
                <span>
                  {tr(state.dash > 0 ? state.dash.toFixed(1) + ' s' : 'IMPULSO')}
                </span>
              </button>
            </div>
            <div className="micro-buffs" data-dash-side={leftHanded ? 'left' : 'right'}>
              {tr(state.protected && !state.paused && !state.offer.length && <span>{tr("MEMBRANA PROTEGIDA · ESCAPA")}</span>)}
              {tr(state.shield >= 0 && (
                <span>
                  <Shield size={12} />
                  {tr(state.shield > 0
                    ? 'Escudo · ' + Math.ceil(state.shield) + ' s'
                    : state.shieldReady === 1
                      ? '1 escudo listo'
                      : state.shieldReady + ' escudos listos')}
                </span>
              ))}
              {tr(state.combo && (
                <span>
                  <Sparkles size={12} />{tr(" Hambre encadenada ")}</span>
              ))}
            </div>
          </>
        ))}
        {tr((active || state.complete) && state.paused && !settings && (
          <div className="pause-panel">
            <p className="eyebrow">{tr("EN SUSPENSIÓN")}</p>
            <h2>{tr("Respira.")}</h2>
            <p className="pause-copy">{tr("Tu progreso queda guardado.")}</p>
            <button
              className="primary-button membrane-control has-membrane-rim"
              onClick={() => action('pause')}
            ><MembraneRim />{tr(" Continuar ")}</button>
            <button ref={ownedTrigger}
              className="primary-button membrane-control has-membrane-rim"
              onClick={() => changeOwned(true)}
            ><MembraneRim />{tr('Tus adaptaciones')}</button>
          </div>
        ))}
        {tr(state.started && state.dead && (
          <div className="finish-panel death-panel" aria-live="polite">
            <p className="eyebrow">{tr("BIOMASA AGOTADA")}</p>
            <h2>{tr("La vida insiste.")}</h2>
            <p>{tr(" Vuelves a ser pequeño. ")}<br />{tr(" Conservas tu escala y tus adaptaciones. ")}</p>
            <div className="finish-stats">
              <span>
                <b>{tr(state.eaten)}</b>{tr("absorciones ")}</span>
              <span>
                <b>{tr(state.level)}</b>{tr("mejoras ")}</span>
            </div>
            <button className="primary-button" onClick={() => action('retry')}>{tr(" Reintentar ")}<RotateCcw size={18} />
            </button>
          </div>
        ))}
        {tr(state.transition > 0 && (
          <div
            className="stage-transition journey-transition"
            aria-live="polite"
          >
            <span>{tr(" EVOLUCIÓN · ")}{tr(STAGES[state.evolutionFrom].short.toUpperCase())}
            </span>
            <div className="cristal-evolution-halo" aria-hidden="true" />
            <h2>{tr(STAGES[state.evolutionFrom].evolution)}</h2>
            <div className="cristal-stage-route">
              {tr(STAGES[state.evolutionFrom].short)}{tr(' ')}
              <span aria-hidden="true">{tr("→")}</span>{tr(' ')}
              {
                tr(STAGES[Math.min(state.evolutionFrom + 1, STAGES.length - 1)]
                  .short)
              }
            </div>
            <p>{tr(TRANSITION_ROUTES[STAGES[state.evolutionFrom].id])}</p>
          </div>
        ))}
        {tr(state.started && !state.assetsReady && (
          <div className="journey-loading">
            <p>{tr("El siguiente mundo está despertando…")}</p>
            {tr(state.assetError && (
              <button
                className="primary-button"
                onClick={() => window.location.reload()}
              >{tr(" Reintentar carga ")}</button>
            ))}
          </div>
        ))}
        {tr(state.ending > 0 && finalCaption && <div className="ending-caption" aria-live="polite"><p>{tr(finalCaption)}</p></div>)}
        {tr(state.complete && state.ending===0 && !finalDetails && <div className="final-survivor-actions">
          <button className="icon-button" aria-label={tr("Configuración")} onClick={()=>changeSettings(true)}><Settings size={19}/></button>
          <button className="icon-button" aria-label={tr(state.paused?'Reanudar':'Pausar')} onClick={()=>action('pause')}>{tr(state.paused?<Play size={19}/>:<Pause size={19}/>)}</button>
        </div>)}
        {tr(state.complete && state.ending === 0 && !finalDetails && <button className="universe-survivor-control" aria-label={tr("VORO permanece solo en el vacío. Ver el final y tu recorrido")} onClick={() => setFinalDetails(true)}>{tr("Recorrido")}</button>)}
        {tr(state.complete && finalDetails && (
          <JourneyComplete eaten={state.eaten} absorptionsByStage={state.absorptionsByStage} hitsReceived={state.hitsReceived} hitsPartial={state.hitsPartial} elapsed={state.elapsed} adaptations={state.level}
            onClose={() => setFinalDetails(false)}
            onRestart={() => { setFinalDetails(false); action('restart'); }} />
        ))}
      </section>
      {ownedOpen && <OwnedAdaptations mutations={state.mutations} onClose={() => changeOwned(false)} returnFocus={ownedTrigger} />}
      {tr(active && state.offer.length > 0 && <Dialog
        open={active && state.offer.length > 0 && !settings}
        onOpenChange={() => {}}
      >
        <DialogContent
          className="micro-upgrade-dialog cristal-dialog adaptation-dialog"
          initialFocus={adaptationHeading}
          showCloseButton={false}
        >
          <p className="adaptation-count">{tr("ADAPTACIÓN ")}{tr(state.level + 1)}</p>
          <div className="adaptation-heading" ref={adaptationHeading} tabIndex={-1} style={{ outline: 'none' }}>
            <DialogTitle>{tr("Adaptación emergente")}</DialogTitle>
            <DialogDescription>{tr("El tiempo se detiene. Elige tu evolución.")}</DialogDescription>
          </div>
          <AdaptationChoices
            key={state.level}
            onProtagonist={connectProtagonist}
            offer={state.offer}
            mutations={state.mutations}
            onChoose={(id) => engine.current?.choose(id)}
          />
        </DialogContent>
      </Dialog>)}
      {tr(settings && <Dialog open onOpenChange={changeSettings}>
        <DialogContent className="voro-settings cristal-dialog final-ui"
          initialFocus={()=>document.querySelector<HTMLElement>('.membrane-heading')}
          style={{inset:0,translate:'none',transform:'none'}} showCloseButton={false}>
          <FinalSettings wide={wideSettings} stage={state.stage} complete={state.complete}
            eaten={state.eaten} elapsed={state.elapsed} adaptations={state.level}
            absorptionsByStage={state.absorptionsByStage} hitsReceived={state.hitsReceived} hitsPartial={state.hitsPartial}
            tilt={tilt} leftHanded={leftHanded} sound={state.sound} testMode={state.testMode}
            onMovement={selectMovement}
            onLeftHanded={() => setControlsSaveError(!writeLeftHanded(!leftHanded))}
            onSound={() => action('sound')}
            onRestart={() => { resume.current = false; action('restart'); changeSettings(false); }} />
          {controlsSaveError && <output className="save-note" role="status">{tr('El cambio funciona ahora, pero no se ha podido guardar para la próxima sesión.')}</output>}
        </DialogContent>
      </Dialog>)}
      <ReviewMilestone held={state.reviewHold} onContinue={() => engine.current?.finishReview()} />
      {DEVELOPMENT_TOOLS && DeveloperTools && <Suspense fallback={null}><DeveloperTools engine={engine.current} state={state}/></Suspense>}

    </main>
  );
}
