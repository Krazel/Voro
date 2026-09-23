'use client';
import { t as tr } from './language.mjs';
import { LanguagePicker, useLanguage } from './language-picker';

import { MUSIC } from './music.mjs';
import { finaleState } from './universe-finale.mjs';
import { sharePerformanceFile } from './share-performance';
import { RELEASE } from './release.mjs';
import { performanceSummaryText } from './performance-report.mjs';
import { TRANSITION_ROUTES } from './journey-transitions.mjs';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { readLeftHanded, writeLeftHanded, subscribeControls, serverLeftHanded } from './control-preferences';
import Link from 'next/link';
import { AdaptationChoices, CristalPreview } from './cristal-ui';
import { ReviewMilestone } from './review-milestone';
import { Capacitor } from '@capacitor/core';
import { useBenchmarkAwake } from './benchmark-awake';
import { FinalSettings } from './final-settings';
import { JourneyComplete } from './journey-complete';
import { isTabletDevice, wideScreenEnabled } from './desktop-viewport.mjs';
import './wide-screen.css';
import './cristal.css';
import './final-ui.css';
import { initialUiMode, writeUiMode } from './ui-mode.mjs';
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
import { UPGRADES, levelOf, MAX_UPGRADE_CHOICES } from './mutations.mjs';
import {
  STAGES,
  STAGE_SPECIES,
  stageStartMass,
  formatSize,
} from './journey-data.mjs';
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
  const [settings, setSettings] = useState(false),
    [confirmReset, setConfirmReset] = useState(false);
  const [testPanel, setTestPanel] = useState(false);
  const [uiMode,setUiMode]=useState('final');
  const finalUI=uiMode==='final';
  const [uiModeSaved,setUiModeSaved]=useState(true);
  useEffect(()=>{
    setUiMode(initialUiMode(window.localStorage, window.location.search));
  },[]);
  const [zoomControls, setZoomControls] = useState(true);
  const [finalZoomControls,setFinalZoomControls]=useState(false);
  const showZoomControls=finalUI?finalZoomControls:zoomControls;
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
  const movementChoice = <div className="movement-choice">
    <span>{tr("Cómo quieres moverte")}</span>
    <div>
      <button aria-pressed={!tilt && !tiltPending} onClick={() => selectMovement(false)}>{tr("Con el dedo")}</button>
      <button aria-pressed={tilt} disabled={tiltPending} onClick={() => selectMovement(true)}>{tr(tiltPending ? 'Conectando…' : 'Inclinando el móvil')}</button>
    </div>
    {tr(tiltMessage && <output>{tr(tiltMessage)}</output>)}
  </div>;
  const [reportText, setReportText] = useState('');
  const [reportCopied, setReportCopied] = useState(false);
  const [sharingReport, setSharingReport] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [tourNoticeDismissed,setTourNoticeDismissed]=useState(false);
  const shareReport=async()=>{
    const report=engine.current?.performanceReport();
    if(!report?.summary.frames && report?.format!=='voro-performance-tour-v1'){setShareMessage('Primero mide una partida de 30 s.');return;}
    setSharingReport(true);setShareMessage('');
    try {
      const result=await sharePerformanceFile(report);
      setShareMessage(result==='downloaded'?'Archivo descargado. Puedes adjuntarlo en WhatsApp.':'Archivo preparado. Puedes volver a compartirlo cuando quieras.');
    } catch(error){
      const message=error instanceof Error?error.message:String(error);
      setShareMessage(/cancel|abort/i.test(message)?'No se ha compartido el archivo.':'No se pudo compartir. Puedes copiar el resumen y volver a intentarlo.');
    } finally {setSharingReport(false);}
  };
  const [uiPreview, setUiPreview] = useState(false);
  const [testStage, setTestStage] = useState(0);
  const [testSize, setTestSize] = useState(0);
  const [keepUpgrades, setKeepUpgrades] = useState(true);
  const [testSafe, setTestSafe] = useState(false);
  const [testEvolution, setTestEvolution] = useState(true);
  const testMass =
    stageStartMass(testStage) *
    ((STAGES[testStage].goal * 1.5) / stageStartMass(testStage)) **
      (testSize / 100);
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
    return () => {
      game.destroy();
      engine.current = null;
    };
  }, []);
  const action = (
    name: 'start' | 'pause' | 'restart' | 'retry' | 'dash' | 'sound',
  ) => engine.current?.action(name);
  useLayoutEffect(() => { engine.current?.recordUiCommit(); }, [state]);
  useBenchmarkAwake(!!state.automated?.running && !state.automated.paused);
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
    setConfirmReset(false);
    engine.current?.setAudio();
    setSettings(open);
  };
  const toggleUiMode=()=>{
    const mode=finalUI?'development':'final';
    setUiMode(mode);setUiModeSaved(writeUiMode(window.localStorage,mode));
    setTestPanel(false);setUiPreview(false);
    if(mode==='final')engine.current?.setDiagnostics(false);
  };
  const modeButton=<button type="button" className="ui-mode-toggle" data-ui-mode-toggle aria-pressed={finalUI} onClick={toggleUiMode}>
    {tr(finalUI?'Volver a UI de desarrollo':'Pasar a UI final')}<span>{tr(finalUI?'Final':'Desarrollo')}</span>
  </button>;
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
    <main className={'voro-shell' + (finale ? ' universe-ended' : '')} data-wide={wideScreen} data-ui="cristal" data-ui-mode={uiMode}>
      <section
        className={'viewport' + (finale ? ' universe-finale' : '') + (state.automated?.running?' auto-testing':'')}
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
              {tr(state.testMode ? finalUI?'VISTA PREVIA · ':'PRUEBA · ' : '')}
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
          {tr(!finalUI && movementChoice)}
            <button
              className="primary-button"
              disabled={!state.assetsReady}
              onClick={() => { engine.current?.tilt.calibrate(); action('start'); }}
            >
              {tr(!state.assetsReady
                ? 'Preparando tu mundo…'
                : state.saved
                  ? 'Continuar partida'
                  : 'Despertar')}
              <ArrowUpRight size={20} />
            </button>
            {tr(modeButton)}
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
                'hint micro-hint cristal-toast membrane-control ' +
                (state.hint ? 'show' : '')
              }
            >
              {tr(state.hint)}
            </output>
            </div>
            {tr(showZoomControls && !state.paused && !state.offer.length && !state.transition && <fieldset className="zoom-controls" aria-label={tr("Zoom de cámara")}>
              <button aria-label={tr("Alejar cámara")} disabled={state.zoomFactor <= .75} onClick={() => engine.current?.setZoom(state.zoomFactor - .1)}>{tr("−")}</button>
              <button aria-label={tr("Restablecer zoom automático")} onClick={() => engine.current?.setZoom(1)}>{tr(Math.round(state.zoomFactor * 100))}{tr(" %")}</button>
              <button aria-label={tr("Acercar cámara")} disabled={state.zoomFactor >= 1.75} onClick={() => engine.current?.setZoom(state.zoomFactor + .1)}>{tr("+")}</button>
            </fieldset>)}
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
              className="primary-button membrane-control"
              onClick={() => action('pause')}
            >{tr(" Continuar ")}</button>
            <button
              className="primary-button membrane-control"
              onClick={() => changeSettings(true)}
            >{tr(" Configuración ")}</button>
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
          <JourneyComplete eaten={state.eaten} elapsed={state.elapsed} adaptations={state.level}
            onClose={() => setFinalDetails(false)}
            onRestart={() => { setFinalDetails(false); action('restart'); }} />
        ))}
        {tr(state.automated && (!tourNoticeDismissed || state.automated.running) && <section className="automatic-benchmark" aria-label={tr('Prueba automática de rendimiento')}>
          <strong>{tr(state.automated.running?'Prueba automática de rendimiento':state.automated.status==='completed'?'Prueba terminada':'Prueba cancelada')}</strong>
          {state.automated.running ? <>
            <p>{tr(state.automated.stage)} · {tr(state.automated.size==='entry'?'Tamaño inicial':'Tamaño grande')} · {state.automated.step}/{state.automated.total}</p>
            <p>{tr(state.automated.paused?'Prueba en pausa':state.automated.status==='loading'?'Cargando entorno…':state.automated.status==='warmup'?'Preparando escena…':'Midiendo')}{state.automated.status==='recording' && !state.automated.paused?' · '+state.automated.remaining+' s':''}</p>
            <div>{state.automated.paused && <button onClick={()=>engine.current?.resumeAutomaticBenchmark()}>{tr('Continuar prueba')}</button>}
            <button onClick={()=>engine.current?.finishAutomaticBenchmark()}>{tr('Cancelar y volver')}</button></div>
          </> : <>
            <p>{state.automated.step}/{state.automated.total} · {tr('Tu partida se ha restaurado.')}</p>
            {state.automated.failed>0 && <p>{tr('Escenarios incompletos')}: {state.automated.failed}</p>}
            <div><button disabled={sharingReport} onClick={shareReport}>{tr(sharingReport?'Preparando…':'Compartir informe como archivo')}</button>
            <button onClick={()=>{setTourNoticeDismissed(true);if(engine.current?.paused)action('pause');}}>{tr('Volver')}</button></div>
            {shareMessage && <p>{tr(shareMessage)}</p>}
          </>}
        </section>)}
        {tr(!finalUI && state.performance && !finale && !state.automated?.running && (
          <output className="performance-readout">
            {tr(state.performance.recording ? state.performance.remaining ? `Midiendo · ${state.performance.remaining} s` : 'Rendimiento' : 'Medición terminada')}
            <br />{tr(state.performance.fps || '—')}{tr(" FPS · P95 ")}{tr(state.performance.p95)}{tr(" ms · pico ")}{tr(state.performance.peak)}{tr(" ms ")}<br />{tr("CPU ")}{tr(state.performance.cpu)}{tr(" ms · lentos ")}{tr(state.performance.slowFrames)}
            <br />{tr("Cargas ")}{tr(state.performance.loading)}{tr(" · poses ")}{tr(state.performance.pending)}{tr(" · ")}{tr(state.performance.cacheMB)}{tr(" MB ")}</output>
        ))}
      </section>
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
      {tr(uiPreview && <CristalPreview
        key={uiPreview ? 'open' : 'closed'}
        onProtagonist={connectProtagonist}
        open={uiPreview}
        onClose={() => setUiPreview(false)}
      />)}
      {tr(settings && <Dialog open={!uiPreview} onOpenChange={changeSettings}>
        <DialogContent
          className={'voro-settings cristal-dialog'+(finalUI?' final-ui':'')}
          initialFocus={finalUI?()=>document.querySelector<HTMLElement>('.membrane-heading'):undefined}
          style={finalUI?{inset:0,translate:'none',transform:'none'}:undefined}
          showCloseButton={false}
        >
          {finalUI && <button className="settings-development-access" onClick={toggleUiMode}>{tr('Modo de desarrollo')}</button>}
          {tr(finalUI && <FinalSettings
            wide={wideSettings}
            stage={state.stage}
            complete={state.complete}
            eaten={state.eaten}
            elapsed={state.elapsed}
            tilt={tilt}
            leftHanded={leftHanded}
            sound={state.sound}
            testMode={state.testMode}
            onMovement={selectMovement}
            onLeftHanded={() => setControlsSaveError(!writeLeftHanded(!leftHanded))}
            onSound={() => action('sound')}
            onRestart={() => { resume.current = false; action('restart'); changeSettings(false); }}
          />)}
          <DialogClose className="settings-close icon-button" aria-label={tr("Cerrar configuración")}><X size={20}/></DialogClose>
          <p className="eyebrow">{tr("VORO · ABISAL")}</p>
          <DialogTitle>{tr("Configuración")}</DialogTitle>
          <DialogDescription>{tr(state.stageName)}{tr(!finalUI && ` · VORO ${RELEASE.version} (${RELEASE.build})`)}</DialogDescription>
          {!finalUI && <LanguagePicker />}
          {tr(modeButton)}
          {tr(!uiModeSaved && <p role="status" className="save-note">{tr("La vista ha cambiado; no se ha podido recordar para la próxima sesión.")}</p>)}
          <details className="camera-details" open={finalUI?undefined:true}><summary>{tr("Encuadre y zoom")}</summary>
            <div className="camera-settings">
            <label htmlFor="camera-zoom">{tr("Zoom de cámara ")}<output>{tr(Math.round(state.zoomFactor * 100))}{tr(" %")}</output></label>
            <input id="camera-zoom" type="range" min="75" max="175" step="5" value={Math.round(state.zoomFactor * 100)} onChange={e => engine.current?.setZoom(Number(e.target.value) / 100)} />
            <button className="settings-row" onClick={() => engine.current?.setZoom(1)}>{tr("Restablecer encuadre")}<span>{tr("Automático")}</span></button>
            <button className="settings-row" aria-pressed={showZoomControls} onClick={() => finalUI?setFinalZoomControls(!finalZoomControls):setZoomControls(!zoomControls)}>{tr("Botones de zoom al jugar")}<span>{tr(showZoomControls ? 'Activados' : 'Desactivados')}</span></button>
            <p className="save-note">{tr("Pellizca con dos dedos para ajustar el zoom. En ordenador puedes usar la rueda o los botones. El ajuste se mantiene entre entornos durante esta sesión.")}</p>
          </div></details>
          {tr(movementChoice)}
          <button className="settings-row"
            aria-pressed={state.uniformVisualSpeed}
            onClick={() => engine.current?.setUniformVisualSpeed(!state.uniformVisualSpeed)}>{tr(" Velocidad visual entre entornos")}<span>{tr(state.uniformVisualSpeed ? 'Uniforme' : 'Clásica')}</span>
          </button>
          <p className="save-note">{tr("Uniforme compensa la escala de cada entorno. Clásica conserva el movimiento anterior.")}</p>
          {tr(tilt && <button className="settings-row" onClick={() => { engine.current?.tilt.calibrate(); setTiltMessage('Posición centrada. Mantén el móvil cómodo al continuar.'); }}>{tr("Centrar inclinación")}<span>{tr("Recalibrar")}</span></button>)}
          <button className="settings-row"
            aria-pressed={leftHanded}
            onClick={() => {
              setControlsSaveError(!writeLeftHanded(!leftHanded));
            }}>{tr(" Impulso a la izquierda")}<span>{tr(leftHanded ? 'Activado' : 'Desactivado')}</span>
          </button>
          {tr(controlsSaveError && <output className="save-note">{tr("El cambio funciona ahora, pero no se ha podido guardar para la próxima sesión.")}</output>)}
          {tr(!finalUI && <>
          <button className="settings-row"
            onClick={() => engine.current?.setDiagnostics(!state.performance)}
            aria-pressed={!!state.performance}>{tr(" Mostrar rendimiento")}<span>{tr(state.performance ? 'Activado' : 'Desactivado')}</span>
          </button>
          <button className="settings-row" onClick={() => {
            setReportText(''); setReportCopied(false); setShareMessage('');
            engine.current?.startBenchmark(); changeSettings(false);
          }}>{tr("Medir una partida de 30 s")}<span>{tr("Iniciar")}</span></button>
          <button className="settings-row" onClick={()=>{
            setReportText('');setReportCopied(false);setShareMessage('');setTourNoticeDismissed(false);
            if(engine.current?.startAutomaticBenchmark()){resume.current=false;changeSettings(false);}
          }}>{tr('Probar todos los entornos automáticamente')}<span>{tr('Iniciar')}</span></button>
          <p className="save-note">{tr('Unos 2 minutos más las cargas. Prueba dos tamaños por entorno, moviéndose y usando el impulso. Mantén el juego abierto. Puedes cancelar y recuperar tu partida en cualquier momento.')}</p>
          <button className="settings-row" onClick={async () => {
            const report = engine.current?.performanceReport();
            if (!report) return;
            if (!report.summary.frames && report.format!=='voro-performance-tour-v1') { setShareMessage('Primero mide una partida de 30 s.'); return; }
            const text = performanceSummaryText(report);
            setReportText(text); setReportCopied(false);
            try { await navigator.clipboard.writeText(text); setReportCopied(true); } catch { /* selectable fallback below */ }
          }}>{tr("Copiar resumen de rendimiento")}<span>{tr(reportCopied ? 'Copiado' : 'Copiar')}</span></button>
          <button className="settings-row" disabled={sharingReport} onClick={shareReport}>{tr("Compartir informe como archivo")}<span>{tr(sharingReport ? 'Preparando…' : 'Compartir')}</span></button>
          {tr(shareMessage && <output className="save-note">{tr(shareMessage)}</output>)}
          <p className="save-note">{tr("Elige WhatsApp en el menú de compartir. El archivo incluye el resumen y los peores tirones. La prueba cuenta solo mientras juegas. Incluye FPS, fotogramas lentos, cargas y tiempos por sistema. El informe se queda en tu dispositivo hasta que lo compartas.")}</p>
          {tr(reportText && <label className="performance-report-label">{tr("Informe de rendimiento ")}<textarea className="performance-report" readOnly rows={5} value={reportText}
              onFocus={event => event.currentTarget.select()} />
          </label>)}
          </>)}
          <button
            className="settings-row"
            onClick={() => action('sound')}
            aria-pressed={state.sound}
          >{tr(" Sonido")}<span>{tr(state.sound ? 'Activado' : 'Desactivado')}</span>
          </button>
          <details className="music-credits">
            <summary>{tr("Créditos musicales")}</summary>
            <p>{tr("Música de Scott Buckley · ")}<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">{tr("CC BY 4.0")}</a></p>
            <ul>{tr(MUSIC.map(track=><li key={track.id}><a href={track.source} target="_blank" rel="noopener noreferrer">{tr(track.title)}</a>{tr(" — Scott Buckley")}</li>))}</ul>
            <p>{tr("Composiciones completas. Volumen normalizado, conversión MP3 y fundidos de entrada, salida y repetición. Sin recortes de secciones.")}</p>
            <a href="https://www.scottbuckley.com.au/library/using-this-music/" target="_blank" rel="noopener noreferrer">{tr("Fuentes y condiciones del autor")}</a>
          </details>
          <div className="micro-stat-row">
            <span>{tr(state.eaten)}{tr(" absorciones")}</span>
            <span>{tr(Math.floor(state.elapsed / 60))}{tr(" min de vida")}</span>
          </div>
          <p className="save-note">
            {tr(state.testMode
              ? 'Modo de pruebas. Tu partida está a salvo.'
              : state.storageAvailable
                ? 'La partida se guarda en este dispositivo.'
                : 'El guardado no está disponible en este navegador.')}
          </p>
          {tr(!finalUI && <>
          <button
            className="settings-row"
            aria-expanded={testPanel}
            aria-controls="environment-tests"
            onClick={() => {
              setTestPanel(!testPanel);
              if (!testPanel) {
                setTestStage(state.stage);
                setTestSize(0);
              }
            }}
          >{tr(" Probar entornos y tamaños ")}<ChevronsRight size={17} />
          </button>
          {tr(testPanel && (
            <div id="environment-tests" className="environment-tests">
              <label htmlFor="test-environment">{tr("Entorno")}</label>
              <select
                id="test-environment"
                value={testStage}
                onChange={(e) => setTestStage(Number(e.target.value))}
              >
                {tr(STAGES.map((s, i) => (
                  <option key={s.id} value={i}>
                    {tr(String(i + 1).padStart(2, '0'))}{tr(" · ")}{tr(s.short)}
                  </option>
                )))}
              </select>
              <label htmlFor="test-size">{tr(" Tamaño")}{tr(' ')}
                <output htmlFor="test-size">
                  {tr(formatSize(testStage, testMass))}
                </output>
              </label>
              <input
                id="test-size"
                type="range"
                min="0"
                max="100"
                step="1"
                value={testSize}
                aria-valuetext={formatSize(testStage, testMass)}
                onChange={(e) => setTestSize(Number(e.target.value))}
              />
              <div className="test-presets">
                {tr([
                  ['Pequeño', 0],
                  ['Mediano', 40],
                  ['Grande', 75],
                  ['Gigante', 100],
                ].map(([label, size]) => (
                  <button
                    key={label}
                    aria-pressed={testSize === size}
                    onClick={() => setTestSize(Number(size))}
                  >
                    {tr(label)}
                  </button>
                )))}
              </div>
              <label className="test-check">
                <input
                  type="checkbox"
                  checked={keepUpgrades}
                  onChange={(e) => setKeepUpgrades(e.target.checked)}
                />{tr(" Usar mis adaptaciones ")}</label>
              <label className="test-check">
                <input
                  type="checkbox"
                  checked={testSafe}
                  onChange={(e) => setTestSafe(e.target.checked)}
                />{tr(" Invulnerabilidad ")}</label>
              <label className="test-check">
                <input type="checkbox" checked={testEvolution} onChange={e => {
                  setTestEvolution(e.target.checked);
                  if (engine.current?.testMode) engine.current.testEvolution = e.target.checked;
                }} />{tr(" Permitir pasar al siguiente entorno ")}</label>
              <p className="save-note">{tr("Prueba crecimiento, adaptaciones y transiciones sin cambiar tu partida guardada.")}</p>
              {tr(state.testMode && <div className="test-boosts">
                <p className="save-note">{tr("Biomasa de prueba: ")}{tr(state.biomass.toFixed(1))}{tr(" / ")}{tr(state.target)}</p>
                <button className="settings-row" onClick={() => engine.current?.boostTest('biomass')}>{tr("Añadir biomasa ")}<span>{tr("+25 % de la meta")}</span></button>
                <button className="settings-row" onClick={() => engine.current?.boostTest('goal')}>{tr("Llenar la barra de biomasa ")}<span>{tr("100 %")}</span></button>
                <button className="settings-row" disabled={state.level >= MAX_UPGRADE_CHOICES} onClick={() => {
                  if (engine.current?.boostTest('adaptation')) { resume.current = false; if(engine.current) engine.current.paused = false; changeSettings(false); }
                }}>{tr("Conseguir una adaptación ")}<span>{tr("Elegir ahora")}</span></button>
              </div>)}

              <button
                className="primary-button"
                onClick={() => {
                  if (
                    engine.current?.startTest(
                      testStage,
                      testMass,
                      keepUpgrades,
                      testSafe,
                      testEvolution,
                    )
                  ) {
                    resume.current = false;
                    changeSettings(false);
                  }
                }}
              >
                {tr(state.testMode ? 'Reiniciar prueba elegida' : 'Entrar en la prueba')} <Play size={18} />
              </button>
            </div>
          ))}
          </>)}
          {tr(state.testMode && (
            <button
              className="settings-row"
              onClick={() => {
                engine.current?.exitTest();
                resume.current = false;
                changeSettings(false);
              }}
            >
              {tr(finalUI?'Volver a mi partida':'Salir de pruebas y volver a mi partida')} <ArrowUpRight size={17} />
            </button>
          ))}
          <details className="route-details" open={finalUI?undefined:true}><summary>{tr("Tu recorrido")}</summary>
          <ol className="journey-route" aria-label={tr("Tu recorrido")}>
            {tr(STAGES.map((s, i) => (
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
                <span>{tr(String(i + 1).padStart(2, '0'))}</span>
                <b>{tr(s.short)}</b>
                <small>
                  {tr(state.complete || i < state.stage
                    ? 'Superado'
                    : i === state.stage
                      ? 'Aquí estás'
                      : 'Por descubrir')}
                </small>
              </li>
            )))}
          </ol></details>
          {tr(!finalUI && <>
          <button className="settings-row" onClick={() => setUiPreview(true)}>{tr(" Probar interfaz Cristal ")}<Sparkles size={17} />
          </button>
          <Link className="settings-row" href="/interfaz">{tr(" Probar diseños de interfaz ")}<ArrowUpRight size={17} />
          </Link>
          <Link className="settings-row" href="/animaciones">{tr(" Galería de animaciones ")}<ArrowUpRight size={17} />
          </Link>
          <Link className="settings-row" href="/orilla">{tr(" Probar la nueva orilla ")}<ArrowUpRight size={17} />
          </Link>
          </>)}
          {tr(state.level > 0 && (
            <div className="micro-upgrade-list">
              {tr(UPGRADES.map((u) => {
                const n = levelOf(state.mutations, u.id);
                return n ? (
                  <div key={u.id}>
                    <span>{tr(u.name)}</span>
                    <b>
                      {tr(n)}{tr(" / ")}{tr(u.max)}
                      {tr(n === u.max ? ' · Completa' : ' adquiridas')}
                    </b>
                  </div>
                ) : null;
              }))}
            </div>
          ))}
          {tr(!state.testMode &&
            (confirmReset ? (
              <div className="reset-confirm">
                <p>{tr("Se borrará esta partida y sus adaptaciones.")}</p>
                <button
                  className="primary-button"
                  onClick={() => {
                    resume.current = false;
                    action('restart');
                    changeSettings(false);
                  }}
                >{tr(" Sí, volver a nacer ")}<RotateCcw size={16} />
                </button>
                <button
                  className="text-button"
                  onClick={() => setConfirmReset(false)}
                >{tr(" Cancelar ")}</button>
              </div>
            ) : (
              <button
                className="settings-row"
                onClick={() => setConfirmReset(true)}
              >{tr(" Volver a nacer ")}<RotateCcw size={16} />
              </button>
            )))}
          <DialogClose className="primary-button">{tr(" Volver al juego ")}<Play size={18} />
          </DialogClose>
        </DialogContent>
      </Dialog>)}
      <ReviewMilestone held={state.reviewHold} onContinue={() => engine.current?.finishReview()} />
      {tr(!finalUI && !finale && <aside className="desktop-note">
        <span>
          {tr(String(state.stage + 1).padStart(2, '0'))}{tr(" —")}{tr(' ')}
          {tr(state.stageName.toUpperCase())}
        </span>
        <p>{tr(" Arrastra para moverte ")}<br />{tr(" WASD / flechas · espacio para impulso ")}<br />{tr(" Mando · stick izquierdo + A ")}</p>
        <small>
          {tr(STAGE_SPECIES[state.stage].length)}{tr(" habitantes en esta escala ")}<br />
          {tr(UPGRADES.length)}{tr(" adaptaciones · mundo infinito ")}</small>
      </aside>)}
    </main>
  );
}
