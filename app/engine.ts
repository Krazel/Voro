import { UniverseFinale, FINALE_SECONDS, drawVoidSurvivor } from './universe-finale.mjs';
import { WorldGround } from './world-ground.mjs';
import { RELEASE } from './release.mjs';
import { TiltControl } from './tilt-control.ts';
import { drawOrbitalEarth, constrainOrbit, canAbsorbEarth } from './earth-landmark.mjs';
import { StageAssets } from './stage-assets.mjs';
import { FrameMonitor } from './frame-monitor.mjs';
import { AnimationSheets } from './animation-sheets.mjs';
import { transitionScene } from './journey-transitions.mjs';
// Canvas2D rendering and input. The simulation stays independent of frame rendering.
import {
  clamp,
  radiusForMass,
  random,
  integrate,
  impulse,
  digest,
  beginAbsorb,
  takeDamage,
  springNode,
} from './simulation.mjs';
import { JourneyWorld } from './journey-world.mjs';
import {
  STAGE_SPECIES,
  STAGES,
  SPECIES_BY_ID,
  stageOf,
  formatSize,
  isDanger,
} from './journey-data.mjs';
import { drawJourneySprite, journeyHeading } from './journey-sprites.mjs';
import {
  beginAnimationFrame,
  endAnimationFrame,
  clearAnimationCache,
  animationCacheStats,
  retainAnimationSpecies,
} from './inhabitant-animation.mjs';
import { gameplayZoom, followGameplayZoom } from './camera.mjs';
import {
  shedBiomass,
  moveFragments,
  drawBiomassFragment,
} from './biomass-fragments.mjs';
import { HuntingTentacles } from './hunting-tentacles.mjs';
import { syncShields, consumeShield } from './shields.mjs';
import {
  upgradeStats,
  journeyAdaptation as nextAdaptation,
  levelOf,
  UPGRADES,
} from './mutations.mjs';
import {
  MICRO_SAVE,
  JOURNEY_SAVE,
  newJourney,
  journeyLife,
  refreshOffer,
  chooseUpgrade,
  rerollAdaptation,
  canReroll,
  saveJourney,
  loadJourney,
  migrateMicro,
  advanceJourney,
  loseAdaptationProgress,
} from './journey-progress.mjs';

export type Snapshot = {
  performance?: ReturnType<FrameMonitor['summary']> & { loading: number; pending: number; cacheMB: number;
    recording: boolean; remaining: number; sheetErrors: number };
  testMode: boolean;
  stage: number;
  stageName: string;
  scale: string;
  evolutionFrom: number;
  ending: number;
  finalReady: boolean;
  assetError: boolean;
  mutations: string[];
  offer: string[];
  canReroll: boolean;
  rerollUsed: boolean;
  level: number;
  adaptation: number;
  adaptationStart: number;
  adaptationTarget: number;
  saved: boolean;
  birth: number;
  storageAvailable: boolean;
  transition: number;
  deaths: number;
  biomass: number;
  target: number;
  hurt: number;
  dead: boolean;
  protected: boolean;
  eaten: number;
  size: number;
  elapsed: number;
  dash: number;
  evolved: boolean;
  complete: boolean;
  paused: boolean;
  started: boolean;
  sound: boolean;
  hint: string;
  shield: number;
  shieldReady: number;
  combo: boolean;
  assetsReady: boolean;
};
type Food = {
  x: number;
  y: number;
  seed: number;
  eaten: boolean;
  rod: boolean;
  kind?: string;
  r?: number;
  value?: number;
  requiredMass?: number;
  final?: boolean;
  id?: string;
  heading?: number;
  flash?: number;
  recycled?: boolean;
  collectDelay?: number;
  vx?: number;
  vy?: number;
  age?: number;
  shotClock?: number;
  escape?: number;
  attack?: number;
};
type Mote = { x: number; y: number; r: number; phase: number };
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  gold: boolean;
};
const TAU = Math.PI * 2;

export class VoroEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  emit: (s: Snapshot) => void;
  progress = newJourney();
  life = journeyLife(this.progress);
  world = new JourneyWorld(this.progress.seed, [], this.progress.stage);
  stats = upgradeStats([]);
  huntingTentacles = new HuntingTentacles();
  spriteAtlas = new Image();
  atlasImages: Record<string, HTMLImageElement> = {};
  environments = new Image();
  assetError = false;
  transitionFrom = 0;
  transitionAdvanced = false;
  transitionFrame: HTMLCanvasElement | null = null;
  ending = 0;
  universeFinale: UniverseFinale | null = null;
  comboClock = 0;
  comboMeals = 0;
  lastMeal = -100;
  trail: { x: number; y: number; r: number; life: number }[] = [];
  fragments: Food[] = [];
  saved = false;
  storageAvailable = true;
  settingsOpen = false;
  transition = 0;
  saveClock = 0;
  gamepadButtons = [false, false];
  padInput = { x: 0, y: 0 };
  started = false;
  birth = 0;
  paused = false;
  sound = true;
  time = 0;
  last = 0;
  renderDirty = true;
  lastVoidFrame = 0;
  raf = 0;
  destroyed = false;
  width = 480;
  height = 850;
  pixelRatio = 1;
  scale = 1;
  zoom = 1;
  testMode = false;
  testInvulnerable = false;
  testEvolution = false;
  earthAbsorption = 0;
  testBackup: {
    progress: VoroEngine['progress'];
    life: VoroEngine['life'];
    world: JourneyWorld;
    fragments: Food[];
    started: boolean;
    saved: boolean;
    transition: number;
    transitionAdvanced: boolean;
    transitionFrom: number;
    transitionStartZoom: number;
    transitionFrame: VoroEngine['transitionFrame'];
    universeFinale: UniverseFinale | null;
    ending: number;
    earthAbsorption: number;
  } | null = null;
  camera = { x: 700, y: 970 };
  heading = -Math.PI / 2;
  food: Food[] = [];
  motes: Mote[] = [];
  particles: Particle[] = [];
  organs: { a: number; d: number; r: number; phase: number }[] = [];
  background = new Image();
  shoreBackground = new Image();
  seaBackground = new Image();
  worldGround = new WorldGround();
  groundImages: Record<string, HTMLImageElement> = {};
  assets = new StageAssets(this.atlasImages, this.groundImages, () => {
    if (this.atlasImages.micro) this.spriteAtlas = this.atlasImages.micro;
    if (this.groundImages.micro) this.background = this.groundImages.micro;
    if (!this.destroyed) this.publish();
  });
  assetStages = '';
  diagnosticsEnabled = false;
  frameMonitor = new FrameMonitor();
  animationSheets = new AnimationSheets({ changed: () => { this.renderDirty = true; },
    event: (name, ms, detail) => { if (this.diagnosticsEnabled) this.frameMonitor.event(name, ms, detail); } });
  lastPerformanceReport: ReturnType<FrameMonitor['export']> | null = null;
  diagnosticCompleted = false;
  benchmarkSeconds = 0;
  saveJob: { id: number; idle: boolean } | null = null;
  measuredLastFrame = false;
  uiPublishCount = 0;
  uiQueuedAt: number | null = null;
  uiCommitDelay = 0;
  groundAtCapture = 0;
  diagnosticSnapshot: ReturnType<FrameMonitor['summary']> | null = null;
  diagnosticSnapshotAt = 0;
  recordUiCommit() {
    if (this.diagnosticsEnabled && this.uiQueuedAt !== null)
      this.uiCommitDelay = Math.max(this.uiCommitDelay, performance.now() - this.uiQueuedAt);
    this.uiQueuedAt = null;
  }
  setDiagnostics(enabled: boolean) {
    this.diagnosticsEnabled = enabled;
    this.diagnosticCompleted = false;
    this.benchmarkSeconds = 0;
    // Showing the overlay must not erase an existing capture.
    this.measuredLastFrame = false;
    this.diagnosticSnapshot = null;
    this.publish();
  }
  startBenchmark() {
    this.lastPerformanceReport = null;
    this.frameMonitor.reset();
    this.groundAtCapture = this.worldGround.redraws;
    this.setDiagnostics(true);
    this.benchmarkSeconds = 30;
    this.publish();
  }
  performanceReport() {
    if (this.lastPerformanceReport) return this.lastPerformanceReport;
    return this.frameMonitor.export({ ...RELEASE,
      date: new Date().toISOString(), userAgent: typeof navigator === 'undefined' ? '' : navigator.userAgent,
      viewport: { width: this.canvas.width, height: this.canvas.height, pixelRatio: this.pixelRatio },
      animationSheets: this.animationSheets.stats(), animationCache: animationCacheStats(),
      backgroundRebuilds: this.worldGround.redraws,
      background: this.backgroundStatus(),
      backgroundRebuildsDuringCapture: this.worldGround.redraws - this.groundAtCapture });
  }
  measured<T>(name: string, run: () => T): T {
    return this.diagnosticsEnabled ? this.frameMonitor.measure(name, run) : run();
  }
  backgroundStatus() {
    const stage = STAGES[this.progress.stage].id;
    const image = this.groundImages[stage];
    const entry = this.assets.entries.get(`ground:${stage}`);
    const view = this.worldGround.views.get(stage);
    return { stage, mode: this.testMode ? 'test' : 'campaign', renderer: stage === 'land' ? 'tidal-shore-v1' : 'approved-atlas-v1', loaded: !!entry?.ready, error: !!entry?.error,
      width: image?.naturalWidth || 0, height: image?.naturalHeight || 0,
      prepared: stage === 'micro' ? !!entry?.ready : !!view && view.view.image === image,
      surfaceWidth: view?.surface.width || 0, surfaceHeight: view?.surface.height || 0 };
  }
  syncStageAssets() {
    const stages = this.transition > 0
      ? [this.transitionFrom, Math.min(STAGES.length - 1, this.transitionFrom + 1)]
      : [this.progress.stage];
    const key = stages.join(':');
    if (key === this.assetStages) return;
    this.assetStages = key;
    const species = stages.flatMap<{ id: string }>(stage => STAGE_SPECIES[stage]);
    retainAnimationSpecies(species);
    this.animationSheets.setSpecies(species);
    this.assets.setStages(stages);
    if (this.atlasImages.micro) this.spriteAtlas = this.atlasImages.micro;
    if (this.groundImages.micro) this.background = this.groundImages.micro;
  }
  transitionStartZoom = 1;
  keys = new Set<string>();
  pointer: {
    id: number;
    x: number;
    y: number;
    sx: number;
    sy: number;
    touch: boolean;
  } | null = null;
  observer: ResizeObserver;
  lifecycle = new AbortController();
  audio: AudioContext | null = null;
  master: GainNode | null = null;
  hint = '';
  hintUntil = 0;
  lastEmit = 0;
  flash = 0;
  hitFlash = 0;
  trailClock = 0;
  modeBeforeHide = false;
  membrane = Array(100).fill(1) as number[];
  membraneVelocity = Array(100).fill(0) as number[];
  wobble = 0;
  wobbleVelocity = 0;
  nucleus = { x: 0, y: 0 };
  foodClock = 0;
  floating: {
    x: number;
    y: number;
    text: string;
    life: number;
    damage: boolean;
  }[] = [];
  rng = random(834);
  audioStarted = false;
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  constructor(canvas: HTMLCanvasElement, emit: (s: Snapshot) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.emit = emit;
    let restoredFragments: Food[] = [];
    try {
      const loaded =
        loadJourney(localStorage.getItem(JOURNEY_SAVE)) ||
        migrateMicro(localStorage.getItem(MICRO_SAVE));
      if (loaded) {
        restoredFragments = loaded.fragments;
        this.progress = loaded.progress;
        this.life = loaded.life;
        this.sound = loaded.sound;
        this.saved = true;
        this.world = new JourneyWorld(
          this.progress.seed,
          loaded.journal,
          this.progress.stage,
        );
      }
    } catch {
      this.storageAvailable = false;
    }
    this.stats = upgradeStats(this.progress.mutations);
    this.seed();
    this.fragments = restoredFragments;
    this.food = [...this.world.entities, ...this.fragments];
    this.camera = { x: this.life.x, y: this.life.y };
    this.zoom = gameplayZoom(this.life.radius);
    this.resize();
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    const opt = { signal: this.lifecycle.signal };
    canvas.parentElement?.addEventListener('contextmenu', (event) => event.preventDefault(), opt);
    canvas.parentElement?.addEventListener('dragstart', (event) => event.preventDefault(), opt);
    canvas.addEventListener(
      'pointerdown',
      (e) => {
        if (
          !this.started ||
          this.paused ||
          this.life.complete ||
          this.progress.offer.length > 0 ||
          this.life.dead
        )
          return;
        canvas.focus({ preventScroll: true });
        const p = this.point(e);
        this.pointer = {
          id: e.pointerId,
          x: p.x,
          y: p.y,
          sx: p.x,
          sy: p.y,
          touch: e.pointerType === 'touch',
        };
        canvas.setPointerCapture(e.pointerId);
        e.preventDefault();
      },
      opt,
    );
    canvas.addEventListener(
      'pointermove',
      (e) => {
        if (this.pointer?.id === e.pointerId) {
          const p = this.point(e);
          this.pointer.x = p.x;
          this.pointer.y = p.y;
        }
      },
      opt,
    );
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture'])
      canvas.addEventListener(
        event,
        () => {
          this.pointer = null;
        },
        opt,
      );
    window.addEventListener(
      'keydown',
      (e) => {
        if (this.settingsOpen || this.progress.offer.length) return;
        if (
          (e.target as HTMLElement)?.tagName === 'BUTTON' &&
          ['Space', 'Enter'].includes(e.code)
        )
          return;
        if (
          [
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'Space',
            'KeyW',
            'KeyA',
            'KeyS',
            'KeyD',
          ].includes(e.code)
        ) {
          e.preventDefault();
          this.keys.add(e.code);
          if (!e.repeat && e.code === 'Space') this.action('dash');
        }
        if (e.code === 'Escape' && !e.repeat) this.action('pause');
      },
      opt,
    );
    window.addEventListener('keyup', (e) => this.keys.delete(e.code), opt);
    window.addEventListener(
      'blur',
      () => {
        this.tilt.read(false);
        this.save();
        this.keys.clear();
        this.pointer = null;
        if (this.started && !this.life.complete) {
          this.paused = true;
          this.setAudio();
          this.publish();
        }
      },
      opt,
    );
    document.addEventListener(
      'visibilitychange',
      () => {
        this.tilt.read(false);
        if (document.hidden && this.started) {
          this.save();
          this.paused = true;
          this.keys.clear();
          this.pointer = null;
          this.setAudio();
          this.publish();
        }
        this.last = 0;
      },
      opt,
    );
    this.registerTools();
    this.syncStageAssets();
    this.publish();
    this.raf = requestAnimationFrame(this.frame);
  }
  seed() {
    this.huntingTentacles.clear();
    this.world.stream(this.life.x, this.life.y, this.life.elapsed, true);
    this.food = this.world.entities;
    this.motes = this.world.motes;
    this.organs = [];
    const rand = random(288);
    for (let i = 0; i < 58; i++)
      this.organs.push({
        a: rand() * TAU,
        d: 0.25 + Math.sqrt(rand()) * 0.7,
        r: 1 + rand() * 4,
        phase: rand() * TAU,
      });
    this.particles = [];
    this.floating = [];
    this.trail = [];
    this.fragments = [];
    this.membrane.fill(1);
    this.membraneVelocity.fill(0);
    this.wobble = 0;
    this.wobbleVelocity = 0;
    this.nucleus = { x: 0, y: 0 };
    this.foodClock = 0;
    this.hitFlash = 0;
    this.heading = -Math.PI / 2;
  }
  resize() {
    this.renderDirty = true;
    const b = this.canvas.getBoundingClientRect();
    this.scale = b.width / 480;
    this.width = 480;
    this.height = b.height / this.scale;
    // Raster resolution is independent of the world camera and edible sizes.
    this.pixelRatio = Math.min(
      devicePixelRatio || 1,
      matchMedia('(pointer: coarse)').matches ? 1.5 : 2,
    );
    const width = Math.round(b.width * this.pixelRatio), height = Math.round(b.height * this.pixelRatio);
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      if (this.diagnosticsEnabled) this.frameMonitor.event('canvas-resize', 0, { width, height });
    }
  }
  point(e: PointerEvent) {
    const b = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - b.left) / this.scale,
      y: (e.clientY - b.top) / this.scale,
    };
  }
  initAudio() {
    if (this.audioStarted) {
      this.audio?.resume().catch(() => {});
      return;
    }
    this.audioStarted = true;
    try {
      this.audio = new AudioContext();
      this.master = this.audio.createGain();
      this.master.gain.value = this.sound ? 0.055 : 0;
      this.master.connect(this.audio.destination);
      for (const f of [55, 82.41]) {
        const osc = this.audio.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        const g = this.audio.createGain();
        g.gain.value = 0.2;
        osc.connect(g);
        g.connect(this.master);
        osc.start();
      }
      this.audio.resume().catch(() => {});
    } catch {
      this.audio = null;
    }
  }
  setAudio() {
    if (this.sound && !this.paused && (!this.progress.completed || this.ending > 0) && this.audio?.state === 'suspended')
      this.audio.resume().catch(() => {});
    if (this.progress.completed && this.ending === 0 && this.audio?.state === 'running')
      this.audio.suspend().catch(() => {});
    if (this.audio && this.master)
      this.master.gain.setTargetAtTime(
        this.sound &&
          !this.paused &&
          !this.progress.offer.length &&
          (!this.progress.completed || this.ending > FINALE_SECONDS * .2)
          ? 0.055
          : 0,
        this.audio.currentTime,
        0.12,
      );
  }
  chime(evolve = false) {
    if (!this.audio || !this.master || !this.sound) return;
    const now = this.audio.currentTime;
    for (let i = 0; i < (evolve ? 4 : 1); i++) {
      const o = this.audio.createOscillator(),
        g = this.audio.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(
        evolve
          ? [220, 330, 440, 660][i]
          : 460 + Math.min(this.life.eaten, 30) * 18,
        now + i * 0.12,
      );
      o.frequency.exponentialRampToValueAtTime(
        evolve ? 880 : 220,
        now + i * 0.12 + 0.6,
      );
      g.gain.setValueAtTime(0, now + i * 0.12);
      g.gain.linearRampToValueAtTime(
        evolve ? 0.65 : 0.4,
        now + i * 0.12 + 0.025,
      );
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 1);
      o.connect(g);
      g.connect(this.master);
      o.start(now + i * 0.12);
      o.stop(now + i * 0.12 + 1.1);
    }
  }
  save() {
    this.cancelSaveJob();
    if (this.testMode || (!this.started && !this.saved)) return;
    const startedAt = this.diagnosticsEnabled ? performance.now() : 0;
    try {
      localStorage.setItem(
        JOURNEY_SAVE,
        saveJourney(
          this.progress,
          this.life,
          this.world,
          this.sound,
          this.fragments,
        ),
      );
      this.saved = true;
      this.storageAvailable = true;
    } catch {
      this.storageAvailable = false;
    } finally {
      if (this.diagnosticsEnabled) this.frameMonitor.event('save', performance.now() - startedAt,
        { ok: this.storageAvailable, stage: this.progress.stage });
    }
  }
  cancelSaveJob() {
    if (!this.saveJob) return;
    if (this.saveJob.idle) window.cancelIdleCallback(this.saveJob.id);
    else clearTimeout(this.saveJob.id);
    this.saveJob = null;
  }
  scheduleSave() {
    if (this.saveJob || this.testMode) return;
    const flush = () => { this.saveJob = null; if (!this.destroyed) this.save(); };
    this.saveJob = typeof window.requestIdleCallback === 'function'
      ? { id: window.requestIdleCallback(flush, { timeout: 1000 }), idle: true }
      : { id: setTimeout(flush, 0) as unknown as number, idle: false };
  }
  startTest(
    stage: number,
    biomass: number,
    keepUpgrades = true,
    invulnerable = false,
    allowEvolution = false,
  ) {
    if (
      !Number.isInteger(stage) ||
      !STAGES[stage] ||
      !Number.isFinite(biomass) ||
      biomass <= 0
    )
      return false;
    this.birth = 0;
    if (!this.testBackup) {
      this.save();
      this.testBackup = {
        progress: this.progress,
        life: this.life,
        world: this.world,
        fragments: this.fragments,
        started: this.started,
        saved: this.saved,
        transition: this.transition,
        transitionAdvanced: this.transitionAdvanced,
        transitionFrom: this.transitionFrom,
        transitionStartZoom: this.transitionStartZoom,
        transitionFrame: this.transitionFrame,
        ending: this.ending,
        universeFinale: this.universeFinale,
        earthAbsorption: this.earthAbsorption,
      };
    }
    if(this.testMode) this.universeFinale?.destroy();
    this.universeFinale = null;
    this.testMode = true;
    this.testInvulnerable = invulnerable;
    this.testEvolution = allowEvolution;
    this.earthAbsorption = 0;
    this.progress = newJourney(this.testBackup.progress.seed);
    this.progress.stage = stage;
    this.progress.mutations = keepUpgrades
      ? [...this.testBackup.progress.mutations]
      : [];
    this.progress.level = this.progress.mutations.length;
    this.progress.xp = this.progress.level
      ? nextAdaptation(this.progress.level - 1)
      : 0;
    this.life = journeyLife(this.progress);
    this.life.biomass = clamp(biomass, 0.01, this.life.maxMass);
    this.life.radius = radiusForMass(this.life.biomass);
    this.stats = upgradeStats(this.progress.mutations);
    this.world = new JourneyWorld(this.progress.seed, [], stage);
    this.seed();
    this.transition = 0;
    this.transitionFrame = null;
    this.transitionAdvanced = false;
    this.ending = 0;
    this.comboClock = 0;
    this.comboMeals = 0;
    this.lastMeal = -100;
    this.camera = { x: this.life.x, y: this.life.y };
    this.zoom = gameplayZoom(this.life.radius);
    this.started = true;
    this.paused = false;
    this.keys.clear();
    this.pointer = null;
    this.padInput = { x: 0, y: 0 };
    if (stage === STAGES.length - 1 && this.life.biomass >= STAGES[stage].goal)
      this.world.spawnFinal(this.life);
    this.toast(
      'Prueba de entorno. Vuelve a tu partida desde Configuración.',
      6,
    );
    this.initAudio();
    this.setAudio();
    this.publish();
    return true;
  }
  boostTest(kind: 'biomass' | 'adaptation' | 'goal') {
    if (!this.testMode || this.life.dead || this.transition || this.earthAbsorption || this.progress.completed) return false;
    if (kind === 'adaptation') {
      this.progress.xp = Math.max(this.progress.xp, nextAdaptation(this.progress.level));
      refreshOffer(this.progress);
    } else if (kind === 'biomass' || kind === 'goal') {
      const goal = stageOf(this.progress).goal;
      this.life.biomass = kind === 'goal' ? Math.max(this.life.biomass, goal)
        : Math.min(this.life.maxMass, this.life.biomass + goal * .25);
      this.life.feedPulse = 1;
    } else return false;
    this.publish();
    return true;
  }
  exitTest() {
    if (!this.testBackup) return false;
    this.universeFinale?.destroy();
    const backup = this.testBackup;
    Object.assign(this, backup);
    this.testBackup = null;
    this.testMode = false;
    this.testInvulnerable = false;
    this.testEvolution = false;
    this.stats = upgradeStats(this.progress.mutations);
    this.food = [...this.world.entities, ...this.fragments];
    this.motes = this.world.motes;
    this.huntingTentacles.clear();
    this.particles = [];
    this.floating = [];
    this.comboClock = 0;
    this.comboMeals = 0;
    this.lastMeal = -100;
    this.camera = { x: this.life.x, y: this.life.y };
    this.zoom = gameplayZoom(this.life.radius);
    this.keys.clear();
    this.pointer = null;
    this.padInput = { x: 0, y: 0 };
    this.paused = false;
    this.toast('Has vuelto a tu partida.', 4);
    this.setAudio();
    this.publish();
    return true;
  }
  get assetsReady() {
    this.syncStageAssets();
    return this.assets.ready(this.progress.stage);
  }
  reroll() {
    if (
      !this.started ||
      this.life.dead ||
      this.settingsOpen ||
      !rerollAdaptation(this.progress)
    )
      return;
    this.keys.clear();
    this.pointer = null;
    this.save();
    this.publish();
  }
  choose(id: string) {
    if (this.life.dead || !chooseUpgrade(this.progress, id)) return;
    this.stats = upgradeStats(this.progress.mutations, this.comboClock > 0);
    Object.assign(this.life, this.stats);
    this.keys.clear();
    this.pointer = null;
    this.flash = 0.35;
    this.chime(true);
    this.toast(
      UPGRADES.find((u) => u.id === id)!.name + ' · adaptación adquirida',
      4,
    );
    this.save();
    this.setAudio();
    this.publish();
    this.canvas.focus({ preventScroll: true });
  }
  action(
    name:
      | 'start'
      | 'pause'
      | 'restart'
      | 'retry'
      | 'dash'
      | 'sound'
      | 'continue',
  ) {
    if (name === 'start') {
      if (!this.assetsReady) return;
      if (!this.started && !this.saved) this.beginBirth();
      this.started = true;
      this.paused = false;
      this.initAudio();
      if (!this.birth) this.toast(stageOf(this.progress).intro, 6);
      this.canvas.focus({ preventScroll: true });
    }
    if (name === 'restart' || (name === 'retry' && this.life.dead)) {
      if (name === 'restart') this.progress = newJourney();
      else {
        this.progress.deaths++;
        this.progress.totalEaten += this.life.eaten;
        this.progress.totalTime += this.life.elapsed;
      }
      this.life = journeyLife(this.progress);
      this.world = new JourneyWorld(
        this.progress.seed,
        this.progress.earthConsumed ? [['landmark:earth', Number.MAX_SAFE_INTEGER]] : [],
        this.progress.stage,
      );
      this.stats = upgradeStats(this.progress.mutations);
      this.seed();
      this.camera = { x: 700, y: 970 };
      this.zoom = gameplayZoom(this.life.radius);
      this.started = true;
      this.paused = false;
      this.keys.clear();
      this.pointer = null;
      this.flash = 0;
      this.transition = 0;
      this.earthAbsorption = 0;
      this.comboClock = 0;
      this.comboMeals = 0;
      this.progress.shieldRecharge = 0;
      this.progress.shieldTimers = [];
      this.progress.pendingEvolution = false;
      this.progress.finalReady = false;
      this.ending = 0;
      this.universeFinale?.destroy(); this.universeFinale = null;
      this.transitionFrame = null;
      if (name === 'restart') this.beginBirth();
      this.toast(
        name === 'restart' ? 'Una nueva vida.' : 'Conservas tus adaptaciones.',
        4,
      );
      this.initAudio();
    }
    if (
      name === 'pause' &&
      this.started &&
      !this.life.dead &&
      !this.progress.offer.length &&
      !this.progress.completed
    ) {
      this.paused = !this.paused;
      this.keys.clear();
      this.pointer = null;
    }
    if (name === 'sound') {
      this.sound = !this.sound;
      if (this.started) this.initAudio();
    }
    if (
      name === 'dash' &&
      this.started &&
      !this.progress.completed &&
      !this.paused &&
      !this.settingsOpen &&
      !this.progress.offer.length &&
      this.birth === 0 &&
      this.transition === 0 &&
      impulse(this.life)
    ) {
      if (Math.hypot(this.life.vx, this.life.vy) < 10) {
        this.life.vx = Math.cos(this.heading) * 180;
        this.life.vy = Math.sin(this.heading) * 180;
      }
      this.burst(this.life.x, this.life.y, 12, false);
    }
    this.save();
    this.setAudio();
    this.publish();
  }
  toast(text: string, seconds = 3) {
    this.hint = text;
    this.hintUntil = this.time + seconds;
  }
  beginBirth() {
    this.birth = this.reduced ? .8 : 2.8;
    this.keys.clear(); this.pointer = null;
    this.hint = ''; this.hintUntil = 0;
  }
  publish() {
    this.syncStageAssets();
    this.renderDirty = true;
    if (this.diagnosticsEnabled) {
      this.uiPublishCount++;
      this.uiQueuedAt ??= performance.now();
    }
    // Avoid re-sorting a completed 30-second capture every HUD update.
    if (this.diagnosticCompleted && this.lastPerformanceReport)
      this.diagnosticSnapshot = this.lastPerformanceReport.summary;
    else if (this.diagnosticsEnabled && (!this.diagnosticSnapshot || this.time - this.diagnosticSnapshotAt >= 0.5)) {
      this.diagnosticSnapshot = this.frameMonitor.summary();
      this.diagnosticSnapshotAt = this.time;
    }
    this.emit({
      performance: this.diagnosticsEnabled || this.diagnosticCompleted ? {
        ...(this.diagnosticSnapshot || this.frameMonitor.summary(this.diagnosticCompleted)),
        loading: this.assets.stats().loading + this.animationSheets.stats().pending,
        pending: animationCacheStats().pending + Number(animationCacheStats().active),
        cacheMB: Math.round((animationCacheStats().bytes + this.animationSheets.stats().bytes) / 1048576),
        recording: this.diagnosticsEnabled,
        remaining: this.benchmarkSeconds ? Math.max(0, Math.ceil(this.benchmarkSeconds - this.frameMonitor.elapsed / 1000)) : 0,
        sheetErrors: this.animationSheets.stats().errors,
      } : undefined,
      testMode: this.testMode,
      birth: this.birth,
      stage: this.progress.stage,
      stageName: stageOf(this.progress).name,
      scale: formatSize(this.progress.stage, this.life.biomass),
      evolutionFrom: this.transitionFrom,
      ending: this.ending,
      finalReady: this.progress.finalReady,
      assetError: this.assets.failed(this.progress.stage),
      mutations: [...this.progress.mutations],
      offer: [...this.progress.offer],
      canReroll: canReroll(this.progress),
      rerollUsed: this.progress.rerollUsed,
      level: this.progress.level,
      adaptation: this.progress.xp,
      adaptationStart: this.progress.level
        ? nextAdaptation(this.progress.level - 1)
        : 0,
      adaptationTarget: nextAdaptation(this.progress.level),
      saved: this.saved,
      storageAvailable: this.storageAvailable,
      transition: this.transition,
      deaths: this.progress.deaths,
      biomass: this.life.biomass,
      target: stageOf(this.progress).goal,
      hurt: this.life.hurt,
      dead: this.life.dead,
      protected: this.life.invulnerable > 0,
      eaten: this.progress.totalEaten + this.life.eaten,
      size: Math.round(40 * Math.sqrt(this.life.biomass / 8)),
      elapsed: this.progress.totalTime + this.life.elapsed,
      dash: this.life.cooldown,
      evolved: this.progress.maturitySeen,
      complete: this.progress.completed && this.ending <= 0,
      paused: this.paused,
      started: this.started,
      sound: this.sound,
      hint: this.hint,
      shield: this.stats.shieldCooldown ? this.progress.shieldRecharge : -1,
      shieldReady: this.progress.shieldTimers.length
        ? this.progress.shieldTimers.filter((t) => t === 0).length
        : this.stats.shieldCapacity,
      combo: this.comboClock > 0,
      assetsReady: this.assetsReady,
    });
  }
  tilt = new TiltControl();
  input() {
    let x =
        (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) -
        (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0),
      y =
        (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0) -
        (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0);
    if (Math.hypot(this.padInput.x, this.padInput.y) > 0.15) {
      x = this.padInput.x;
      y = this.padInput.y;
    }
    if (this.tilt.enabled && !x && !y) {
      const tilt = this.tilt.read(true);
      x = tilt.x; y = tilt.y;
    }
    if (this.pointer && !this.tilt.enabled) {
      if (this.pointer.touch) {
        x = (this.pointer.x - this.pointer.sx) / 48;
        y = (this.pointer.y - this.pointer.sy) / 48;
      } else {
        x =
          (this.pointer.x - ((this.life.x - this.camera.x) * this.zoom + 240)) /
          65;
        y =
          (this.pointer.y -
            ((this.life.y - this.camera.y) * this.zoom + this.height * 0.48)) /
          65;
      }
      const d = Math.hypot(x, y);
      if (d < 0.1) {
        x = 0;
        y = 0;
      }
    }
    return { x, y };
  }
  frame = (stamp: number) => {
    if (this.destroyed) return;
    if (this.paused || !this.started || this.settingsOpen || this.progress.offer.length || this.transition || this.life.dead || document.hidden)
      this.tilt.read(false);
    const frameStart = this.diagnosticsEnabled ? performance.now() : 0;
    const groundBefore = this.worldGround.redraws, uiBefore = this.uiPublishCount;
    const interval = this.last ? stamp - this.last : 0;
    let measured = false;
    if (this.diagnosticsEnabled) this.frameMonitor.beginFrame();
    this.syncStageAssets();
    const dt = this.last ? Math.min((stamp - this.last) / 1000, 0.035) : 0.016;
    this.last = stamp;
    this.padInput = { x: 0, y: 0 };
    if (
      typeof navigator !== 'undefined' &&
      navigator.getGamepads &&
      !this.settingsOpen
    ) {
      const pad = Array.from(navigator.getGamepads()).find(Boolean);
      if (pad) {
        this.padInput = {
          x: Math.abs(pad.axes[0] || 0) > 0.18 ? pad.axes[0] : 0,
          y: Math.abs(pad.axes[1] || 0) > 0.18 ? pad.axes[1] : 0,
        };
        const pressed = [!!pad.buttons[0]?.pressed, !!pad.buttons[9]?.pressed];
        if (pressed[0] && !this.gamepadButtons[0])
          this.action(this.started ? 'dash' : 'start');
        if (pressed[1] && !this.gamepadButtons[1]) this.action('pause');
        this.gamepadButtons = pressed;
      } else this.gamepadButtons = [false, false];
    }
    if (!document.hidden) {
      // Only the solitary cell breathes after the ending. No world simulation,
      // streaming or HUD updates; keep this quiet screen at most 20 fps.
      if (this.progress.completed && this.ending === 0 && !this.paused && !this.settingsOpen
        && !this.reduced && stamp - this.lastVoidFrame >= 50) {
        this.time += Math.min(.1, (stamp - this.lastVoidFrame) / 1000);
        this.lastVoidFrame = stamp; this.renderDirty = true;
      }
      if (
        !this.paused &&
        !this.settingsOpen &&
        !this.progress.offer.length &&
        (!this.progress.completed || this.ending > 0) &&
        (!this.started || this.assetsReady)
      ) {
        this.time += dt;
        this.measured('simulation', () => this.update(dt));
        this.renderDirty = true;
        measured = this.started && this.diagnosticsEnabled;
      }
      if (this.renderDirty) {
        this.measured('render', () => this.render());
        this.renderDirty = false;
      }
    }
    if (measured && this.measuredLastFrame) {
      this.frameMonitor.add(interval, performance.now() - frameStart, {
        stage: this.progress.stage, radius: +this.life.radius.toFixed(1), zoom: +this.zoom.toFixed(3),
        entities: this.food.length, transition: this.transition > 0,
        loading: this.assets.stats().loading + this.animationSheets.stats().pending,
        queuedPoses: animationCacheStats().pending, groundRebuilds: this.worldGround.redraws,
        groundRebuilt: this.worldGround.redraws > groundBefore,
        uiPublished: this.uiPublishCount > uiBefore,
        rafDelay: +Math.max(0, frameStart - stamp).toFixed(2), uiCommitDelay: +this.uiCommitDelay.toFixed(2),
      });
      if (this.benchmarkSeconds && this.frameMonitor.elapsed >= this.benchmarkSeconds * 1000) {
        this.lastPerformanceReport = this.performanceReport();
        this.diagnosticsEnabled = false; this.diagnosticCompleted = true;
        this.publish();
      }
    }
    this.measuredLastFrame = measured;
    this.uiCommitDelay = 0;
    this.raf = requestAnimationFrame(this.frame);
  };
  update(dt: number) {
    if (this.earthAbsorption > 0) {
      this.earthAbsorption = Math.min(1, this.earthAbsorption + dt / (this.reduced ? 1 : 3.2));
      this.animateMembrane(dt);
      this.life.feedPulse = .8;
      if (this.earthAbsorption >= 1) {
        this.progress.earthConsumed = true;
        this.burst(this.life.x, this.life.y, 24, true);
        this.beginEvolution();
        this.earthAbsorption = 0;
      }
      return;
    }
    if (this.birth > 0) {
      this.birth = Math.max(0, this.birth - dt);
      this.camera.x += (this.life.x - this.camera.x) * (1 - Math.exp(-dt * 3));
      this.camera.y += (this.life.y - this.camera.y) * (1 - Math.exp(-dt * 3));
      this.animateMembrane(dt);
      // No movement, consumption, damage or progression during the reveal.
      if (!this.birth) { this.keys.clear(); this.pointer = null; this.hint = ''; }
      if (!this.birth || this.time - this.lastEmit > .12) { this.lastEmit = this.time; this.publish(); }
      return;
    }
    if (this.transition > 0) {
      this.transition = Math.max(0, this.transition - dt);
      if (this.transition < 3.6 && !this.transitionAdvanced) {
        this.transitionAdvanced = true;
        this.life = advanceJourney(this.progress, this.life);
        this.world = new JourneyWorld(
          this.progress.seed,
          this.progress.earthConsumed ? [['landmark:earth', Number.MAX_SAFE_INTEGER]] : [],
          this.progress.stage,
        );
        this.seed();
        this.camera = { x: this.life.x, y: this.life.y };
        // Keep the camera continuous while the next local scale is revealed.
        this.comboClock = 0;
        this.comboMeals = 0;
        this.lastMeal = -100;
        this.toast(stageOf(this.progress).intro, 7);
        this.save();
        this.publish();
      }
      if (this.transition === 0) {
        this.transitionFrame = null;
        this.publish();
      }
    }
    if (this.ending > 0) {
      const before = this.ending;
      this.ending = Math.max(0, this.ending - dt);
      this.animateMembrane(dt);
      if (before > FINALE_SECONDS * .2 && this.ending <= FINALE_SECONDS * .2) this.setAudio();
      if (!this.ending) { this.universeFinale?.destroy(); this.universeFinale = null; this.setAudio(); }
      if (!this.ending || this.time - this.lastEmit > .12) { this.lastEmit=this.time; this.publish(); }
      return;
    }
    const p = this.life;
    if (
      this.started &&
      !p.dead &&
      !this.progress.completed &&
      this.transition === 0
    ) {
      if (this.progress.pendingEvolution) {
        this.beginEvolution();
        return;
      }
      this.comboClock = Math.max(0, this.comboClock - dt);
      this.stats = upgradeStats(this.progress.mutations, this.comboClock > 0);
      Object.assign(p, this.stats);
      syncShields(this.progress, this.stats, dt);
      integrate(p, dt, this.input());
      if (stageOf(this.progress).id === 'orbit') constrainOrbit(p, dt);
      const speed = Math.hypot(p.vx, p.vy);
      if (speed > 8) {
        const target = Math.atan2(p.vy, p.vx);
        this.heading +=
          Math.atan2(
            Math.sin(target - this.heading),
            Math.cos(target - this.heading),
          ) * Math.min(1, dt * 3);
      }
      this.world.stream(
        p.x,
        p.y,
        p.elapsed,
        false,
        Math.ceil(((this.height * 0.55) / this.zoom + 300) / 600),
      );
      moveFragments(this.fragments, dt);
      this.food = [...this.world.entities, ...this.fragments];
      this.motes = this.world.motes;
      this.world.move(dt, p.elapsed, p, this.stats, this.trail);
      this.huntingTentacles.update(
        dt,
        p,
        this.food,
        this.stats.tentacles,
        this.stats.tentacleReach,
      );
      for (const f of this.food) {
        if (
          f.eaten ||
          (f.collectDelay || 0) > 0 ||
          p.biomass < (f.requiredMass || 0)
        )
          continue;
        const d = Math.hypot(f.x - p.x, f.y - p.y),
          reach = p.radius * p.reachFactor + 22 + p.attraction;
        if (d < reach) {
          const pull = (1 - d / reach) * 70 * dt;
          f.x += ((p.x - f.x) / Math.max(d, 1)) * pull;
          f.y += ((p.y - f.y) / Math.max(d, 1)) * pull;
        }
        if (beginAbsorb(p, f)) {
          if (f.id) this.world.eat(f, p.elapsed);
          this.wobbleVelocity += 0.4;
          this.slurp();
        }
      }
      const massBefore = p.biomass,
        xpBefore = p.adaptationGained,
        finished = digest(p, dt);
      if (finished) {
        this.progress.xp += (p.adaptationGained - xpBefore) * 0.85 * this.stats.adaptationFactor;
        this.comboMeals =
          p.elapsed - this.lastMeal < 4 ? this.comboMeals + finished : finished;
        this.lastMeal = p.elapsed;
        if (levelOf(this.progress.mutations, 'combo') && this.comboMeals >= 3)
          this.comboClock = 4;
        this.burst(p.x, p.y, 7, true);
        this.chime();
        this.wobbleVelocity += 0.7;
        this.floating.push({
          x: p.x,
          y: p.y - p.radius * 0.6,
          text: '+' + (p.biomass - massBefore).toFixed(1),
          life: 1.3,
          damage: false,
        });
        if (p.eaten === 1)
          this.toast(
            'La biomasa te hace crecer. La adaptación desbloquea mejoras.',
            5,
          );
        if (this.progress.stage === STAGES.length - 1 && (!this.testMode || this.testEvolution)
          && (p.biomass >= stageOf(this.progress).goal || p.finalEaten)) {
          this.beginUniverseFinale(); return;
        }
        refreshOffer(this.progress);
        if (this.progress.offer.length && !p.finalEaten) {
          this.keys.clear();
          this.pointer = null;
          this.save();
          this.setAudio();
          this.publish();
          return;
        }
      }
      for (const e of this.world.entities) {
        if (e.eaten || p.biomass >= e.requiredMass || p.invulnerable > 0)
          continue;
        const spec = SPECIES_BY_ID[e.kind];
        if (!isDanger(spec)) continue;
        if (Math.hypot(p.x - e.x, p.y - e.y) > p.radius * 0.85 + e.r * 0.76)
          continue;
        this.receiveHit(e, 0.22);
        if (this.stats.spikeFraction) {
          e.wound += this.stats.spikeFraction;
          e.escape = 3;
          e.flash = 1;
          if (e.wound >= 1) {
            e.requiredMass = 0;
            e.value *= 0.5;
            e.escape = 999;
          }
        }
        this.save();
        this.publish();
      }
      for (const shot of this.world.projectiles) {
        shot.x += shot.vx * dt;
        shot.y += shot.vy * dt;
        shot.life -= dt;
        if (Math.hypot(shot.x - p.x, shot.y - p.y) < p.radius * 0.88 + shot.r) {
          shot.life = 0;
          if (p.biomass >= shot.edibleAt) {
            p.biomass = Math.min(p.maxMass, p.biomass + 0.025);
            p.feedPulse = Math.max(p.feedPulse, 0.18);
            this.burst(shot.x, shot.y, 2, true);
          } else this.receiveHit(shot, shot.damage, 0.6);
        }
      }
      this.world.projectiles = this.world.projectiles.filter(
        (b) => b.life > 0 && Math.hypot(b.x - p.x, b.y - p.y) < 1300,
      );
      this.foodClock += dt;
      if (this.foodClock > 8) {
        this.foodClock = 0;
        this.world.replenish(p.x, p.y, p.elapsed);
        this.fragments = this.fragments
          .filter((f) => !f.eaten && Math.hypot(f.x - p.x, f.y - p.y) < 1300)
          .slice(-24);
      }
      if ((!this.testMode || this.testEvolution) && (p.biomass >= stageOf(this.progress).goal || p.finalEaten)) {
        if (this.progress.stage < STAGES.length - 1) this.beginEvolution();
        else this.beginUniverseFinale();
      }

    }
    if (p.dead) integrate(p, dt, { x: 0, y: 0 });
    if (!this.started && !this.saved && this.progress.stage === 0) {
      p.x = 700 + Math.sin(this.time * 0.3) * 12;
      p.y = 970 + Math.cos(this.time * 0.35) * 9;
    }
    const cameraY = !this.started ? p.y + this.height * 0.11 : p.y;
    this.camera.x += (p.x - this.camera.x) * (1 - Math.exp(-dt * 3));
    this.camera.y += (cameraY - this.camera.y) * (1 - Math.exp(-dt * 3));
    this.animateMembrane(dt);
    if (this.transition > 0) {
      const scene = transitionScene(
        STAGES[this.transitionFrom].id,
        (7.2 - this.transition) / 7.2,
        this.reduced,
      );
      const target =
        this.transition > 3.6
          ? Math.max(gameplayZoom(p.radius) * 0.96, this.transitionStartZoom * (scene.coastal ? 1 : 0.96))
          : gameplayZoom(p.radius);
      this.zoom += (target - this.zoom) * (1 - Math.exp(-dt * 1.2));
    } else this.zoom = followGameplayZoom(this.zoom, p.radius, dt);
    this.flash = Math.max(0, this.flash - dt * 0.6);
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    for (const q of this.particles) {
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.life -= dt;
    }
    this.particles = this.particles.filter((q) => q.life > 0).slice(-120);
    for (const q of this.trail) q.life -= dt;
    this.trail = this.trail.filter((q) => q.life > 0).slice(-24);
    for (const f of this.floating) {
      f.y -= dt * 22;
      f.life -= dt;
    }
    this.floating = this.floating.filter((f) => f.life > 0).slice(-8);
    this.saveClock += dt;
    if (this.saveClock > 5) {
      this.saveClock = 0;
      this.scheduleSave();
    }
    if (this.hint && this.time > this.hintUntil) this.hint = '';
    if (this.time - this.lastEmit > 0.12) {
      this.lastEmit = this.time;
      this.publish();
    }
  }
  beginUniverseFinale() {
    if (this.progress.completed || this.life.dead || this.progress.stage !== STAGES.length - 1
      || (this.testMode && !this.testEvolution)
      || (this.life.biomass < stageOf(this.progress).goal && !this.life.finalEaten)) return false;
    let frame = null;
    if ('createElement' in document) {
      this.renderScene(true);
      frame = document.createElement('canvas');
      frame.width = this.canvas.width; frame.height = this.canvas.height;
      const captured = frame.getContext('2d');
      if (captured) {
        captured.drawImage(this.canvas,0,0);
        // Feather the captured universe once, so contraction never exposes
        // rectangular screenshot edges behind the transparent membrane.
        captured.save(); captured.scale(frame.width,frame.height);
        captured.globalCompositeOperation = 'destination-in';
        const edge = captured.createRadialGradient(.5,.48,.24,.5,.48,.5);
        edge.addColorStop(0,'#fff'); edge.addColorStop(1,'transparent');
        captured.fillStyle = edge; captured.fillRect(0,0,1,1); captured.restore();
      }
    }
    this.universeFinale?.destroy(); this.universeFinale = new UniverseFinale(frame);
    this.progress.completed = true; this.progress.finalReady = true;
    this.progress.offer = []; this.life.finalEaten = true;
    this.life.digestion = []; this.life.hurt = this.life.boost = 0;
    this.huntingTentacles.arms = [];
    this.ending = FINALE_SECONDS; this.hint = ''; this.flash = this.hitFlash = 0;
    this.life.vx = this.life.vy = 0; this.keys.clear(); this.pointer = null;
    this.tilt.read(false); this.paused = false;
    this.tone(100,24,8,.35); this.setAudio(); this.save(); this.publish();
    return true;
  }
  beginEvolution() {
    if (
      (this.testMode && !this.testEvolution) ||
      this.transition > 0 ||
      this.progress.stage >= STAGES.length - 1
    )
      return;
    if (stageOf(this.progress).id === 'orbit' && !this.progress.earthConsumed) {
      this.progress.pendingEvolution = false;
      if (!this.earthAbsorption && canAbsorbEarth(this.life)) {
        this.earthAbsorption = .001;
        this.keys.clear(); this.pointer = null;
        this.life.vx = this.life.vy = 0;
        this.toast('Tu mundo vuelve a ti.', 4);
        this.publish();
      }
      return;
    }
    this.progress.pendingEvolution = true;
    this.progress.maturitySeen = true;
    this.transitionFrom = this.progress.stage;
    this.transitionStartZoom = this.zoom;
    this.transitionAdvanced = false;
    if ('createElement' in document) {
      this.render();
      const frame = document.createElement('canvas');
      frame.width = this.canvas.width;
      frame.height = this.canvas.height;
      frame.getContext('2d')?.drawImage(this.canvas, 0, 0);
      this.transitionFrame = frame;
    }
    this.transition = 7.2;
    this.keys.clear();
    this.pointer = null;
    this.chime(true);
    this.save();
    this.publish();
  }
  receiveHit(
    source: { x: number; y: number },
    fraction: number,
    minimum = 0.6,
  ) {
    const p = this.life;
    if (this.testMode && this.testInvulnerable) return 0;
    if (p.dead || p.invulnerable > 0 || this.progress.completed) return 0;
    if (consumeShield(this.progress, this.stats)) {
      p.invulnerable = 0.8;
      this.flash = 0.3;
      this.toast('Tu escudo ha absorbido el golpe.', 2);
      this.impact();
      this.publish();
      return 0;
    }
    const massBeforeHit = p.biomass;
    const lost = takeDamage(p, source, fraction, minimum);
    if (!lost) return 0;
    loseAdaptationProgress(this.progress, lost / massBeforeHit);
    this.huntingTentacles.clear();
    this.hitFlash = 0.65;
    this.wobbleVelocity -= 2.7;
    this.comboClock = 0;
    this.comboMeals = 0;
    this.floating.push({
      x: p.x,
      y: p.y - p.radius * 0.8,
      text: '−' + lost.toFixed(1),
      life: 1.8,
      damage: true,
    });
    this.burst(p.x, p.y, 24, true);
    this.impact();
    this.toast(
      p.dead
        ? 'Tu membrana se ha deshecho.'
        : 'Has perdido biomasa y progreso de adaptación. Come para recuperarte.',
      3,
    );
    if (this.stats.recycleFraction && !p.dead) {
      this.fragments.push(
        ...shedBiomass(
          p,
          lost * this.stats.recycleFraction,
          STAGE_SPECIES[this.progress.stage][0].id,
        ),
      );
      this.food = [...this.world.entities, ...this.fragments];
      this.toast(
        'Partes de tu membrana se han desprendido. Cómetelas para recuperar biomasa.',
        5,
      );
    }
    this.save();
    this.publish();
    return lost;
  }
  drawEvolution() {
    const c = this.ctx;
    if (this.transition > 0) {
      const u = (7.2 - this.transition) / 7.2;
      const scene = transitionScene(
        STAGES[this.transitionFrom].id,
        u,
        this.reduced,
      );
      if (this.transitionFrame) {
        c.save();
        c.globalAlpha = scene.outgoing;
        c.drawImage(
          this.transitionFrame,
          (480 - 480 * scene.scale) / 2 + scene.panX,
          (this.height - this.height * scene.scale) / 2 + scene.panY,
          480 * scene.scale,
          this.height * scene.scale,
        );
        c.restore();
      }
      c.fillStyle = 'rgba(8,38,48,' + scene.wash + ')';
      c.fillRect(0, 0, 480, this.height);
      if (!this.reduced && !scene.coastal) {
        c.save();
        c.translate(240, this.height * 0.48);
        c.strokeStyle = 'rgba(181,222,228,' + Math.sin(u * Math.PI) * 0.3 + ')';
        c.lineWidth = 0.7;
        for (let i = 0; i < 28; i++) {
          const a = (i * TAU) / 28,
            d = 40 + u * u * 600;
          c.beginPath();
          c.moveTo(Math.cos(a) * d, Math.sin(a) * d);
          c.lineTo(Math.cos(a) * (d + 90), Math.sin(a) * (d + 90));
          c.stroke();
        }
        c.restore();
      }
    }
  }
  slurp() {
    this.tone(180, 65, 0.3, 0.25);
  }
  impact() {
    this.tone(85, 28, 0.5, 0.9);
  }
  tone(from: number, to: number, duration: number, gain: number) {
    if (!this.audio || !this.master || !this.sound) return;
    const at = this.audio.currentTime,
      o = this.audio.createOscillator(),
      g = this.audio.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(from, at);
    o.frequency.exponentialRampToValueAtTime(to, at + duration);
    g.gain.setValueAtTime(0.001, at);
    g.gain.linearRampToValueAtTime(gain, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, at + duration);
    o.connect(g);
    g.connect(this.master);
    o.start(at);
    o.stop(at + duration + 0.03);
  }
  animateMembrane(dt: number) {
    const p = this.life,
      t = this.time * (this.reduced ? 0.35 : 1),
      speed = Math.min(1, Math.hypot(p.vx, p.vy) / 180);
    this.wobbleVelocity += (-this.wobble * 65 - this.wobbleVelocity * 9) * dt;
    this.wobble += this.wobbleVelocity * dt;
    this.nucleus.x +=
      (-p.vx * 0.03 - p.knockX * 0.014 - this.nucleus.x) *
      (1 - Math.exp(-dt * 3.5));
    this.nucleus.y +=
      (-p.vy * 0.03 - p.knockY * 0.014 - this.nucleus.y) *
      (1 - Math.exp(-dt * 3.5));
    let target: Food | null = null,
      dist = Infinity;
    for (const f of this.food) {
      if (
        f.eaten ||
        (f.collectDelay || 0) > 0 ||
        p.biomass < (f.requiredMass || 0)
      )
        continue;
      const d = Math.hypot(f.x - p.x, f.y - p.y);
      if (d < dist) {
        target = f;
        dist = d;
      }
    }
    for (let i = 0; i < 100; i++) {
      const a = (i / 100) * TAU,
        movement = Math.cos(2 * (a - this.heading));
      let rr =
        0.91 +
        0.17 * Math.cos(a * 5 + 0.15 * Math.sin(t * 0.45)) +
        0.07 * Math.sin(a * 3 - t * 0.8) +
        0.022 * Math.sin(a * 11 + t * 1.8);
      rr += p.evolution * 0.095 * Math.cos(a * 7 - t * 0.25);
      rr +=
        speed * 0.14 * movement +
        Math.sin(t * (2.4 + speed * 2) - a * 2) * speed * 0.04;
      rr +=
        this.wobble * Math.cos(a * 2 - t * 1.5) +
        (p.boost > 0 ? 0.08 * movement : 0);
      if (target && dist < p.radius + 60) {
        const angle = Math.atan2(target.y - p.y, target.x - p.x),
          delta = Math.atan2(Math.sin(a - angle), Math.cos(a - angle));
        rr +=
          Math.exp((-delta * delta) / 0.17) *
          Math.max(0, 1 - dist / (p.radius + 60)) *
          0.32;
      }
      for (const f of p.digestion) {
        const angle = Math.atan2(f.dy, f.dx),
          delta = Math.atan2(Math.sin(a - angle), Math.cos(a - angle));
        if (f.progress < 0.48) {
          const u = f.progress / 0.48,
            spread = 0.31 * (1 - u) + 0.045,
            reach = 0.12 + 0.36 * Math.sin(u * Math.PI);
          rr +=
            reach *
            (Math.exp(-((delta - spread) ** 2) / 0.018) +
              Math.exp(-((delta + spread) ** 2) / 0.018));
          rr -= 0.11 * (1 - u) * Math.exp((-delta * delta) / 0.009);
        } else {
          const pulse = Math.sin(((f.progress - 0.48) / 0.52) * Math.PI);
          rr +=
            0.11 * pulse * Math.cos(a * 3 - angle) * Math.exp(-Math.abs(delta));
        }
      }
      const hitDelta = Math.atan2(
        Math.sin(a - p.hitAngle),
        Math.cos(a - p.hitAngle),
      );
      rr -= p.hurt * 0.34 * Math.exp((-hitDelta * hitDelta) / 0.27);
      rr += p.hurt * 0.1 * Math.cos(2 * (a - p.hitAngle));
      const node = springNode(
        this.membrane[i],
        this.membraneVelocity[i],
        clamp(rr, 0.45, 1.6),
        dt,
      );
      this.membrane[i] = node.value;
      this.membraneVelocity[i] = node.velocity;
    }
  }
  burst(x: number, y: number, n: number, gold: boolean) {
    for (let i = 0; i < n; i++) {
      const a = this.rng() * TAU,
        v = 20 + this.rng() * 75,
        l = 0.6 + this.rng();
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: l,
        max: l,
        gold,
      });
    }
  }
  circle(x: number, y: number, r: number, fill: string) {
    const c = this.ctx;
    c.beginPath();
    c.arc(x, y, Math.max(0.01, r), 0, TAU);
    c.fillStyle = fill;
    c.fill();
  }
  halo(x: number, y: number, r: number, color: string) {
    const c = this.ctx,
      g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'transparent');
    this.circle(x, y, r, g as unknown as string);
  }
  drawBackground(index: number) {
    return this.measured('background', () => this.paintBackground(index));
  }
  paintBackground(index: number) {
    const c = this.ctx;
    const stage = STAGES[index];
    // Direct test jumps can render while another asset finishes loading. An
    // Image may report complete before decode() resolves; never bake that
    // intermediate result into the persistent terrain cache.
    const entry = this.assets.entries.get(`ground:${stage.id}`);
    if (!entry?.ready || entry.image !== this.groundImages[stage.id]) return;
    this.worldGround.draw(c, this.groundImages[stage.id], stage.id, this.camera,
      this.zoom, this.height, this.progress.seed, this.time, !this.reduced);
  }
  render() {
    this.measured('animationPreparation', () => {
      this.animationSheets.beginFrame();
      beginAnimationFrame();
    });
    try {
      this.renderScene();
    } finally {
      endAnimationFrame();
    }
  }
  renderScene(skipProtagonist = false) {
    const c = this.ctx,
      k = this.pixelRatio * this.scale,
      p = this.life;
    c.setTransform(k, 0, 0, k, 0, 0);
    if (this.progress.completed) {
      c.fillStyle = '#000'; c.fillRect(0,0,480,this.height);
      const protagonist = (growth: number, survivor = false) => {
        // Pull the camera back as the body grows: its membrane must remain
        // readable while the captured universe visibly enters it.
        const scale = survivor ? Math.min(66,this.height*.1) / Math.max(.8,p.radius) * growth
          : Math.min(this.zoom * growth, 194 / Math.max(.8,p.radius));
        c.save(); c.translate(240,this.height*.48); c.scale(scale,scale);
        c.translate(-p.x,-p.y); this.drawCell(); c.restore();
      };
      if (this.ending > 0 && this.universeFinale)
        this.universeFinale.draw(c,480,this.height,this.ending,this.reduced,protagonist,this.time);
      else drawVoidSurvivor(c,480,this.height,this.time,this.reduced,protagonist);
      return;
    }
    c.fillStyle = '#041423';
    c.fillRect(0, 0, 480, this.height);
    if (this.transition > 0) {
      const scene = transitionScene(
        STAGES[this.transitionFrom].id,
        (7.2 - this.transition) / 7.2,
        this.reduced,
      );
      this.drawBackground(this.transitionFrom);
      c.save();
      c.globalAlpha = scene.incoming;
      this.drawBackground(Math.min(STAGES.length - 1, this.transitionFrom + 1));
      c.restore();
    } else this.drawBackground(this.progress.stage);
    if (this.transition > 3.6 && this.transitionFrame) {
      this.drawEvolution();
      return;
    }
    if (STAGES[this.progress.stage].id === 'orbit' && !this.progress.earthConsumed) {
      c.save();
      c.globalAlpha = this.transition > 0 ? clamp((3.6 - this.transition) / 1.1, 0, 1) : 1;
      drawOrbitalEarth(c, this.atlasImages.earth, this.camera, this.height, this.zoom, this.life, this.earthAbsorption);
      c.restore();
    }
    const shake = this.reduced ? 0 : this.hitFlash * 3,
      ox = 240 / this.zoom - this.camera.x + Math.sin(this.time * 55) * shake,
      oy =
        (this.height * 0.48) / this.zoom -
        this.camera.y +
        Math.cos(this.time * 62) * shake;
    c.save();
    c.scale(this.zoom, this.zoom);
    c.translate(ox, oy);
    const visible = (x: number, y: number, r: number) =>
      x + ox > -r &&
      x + ox < 480 / this.zoom + r &&
      y + oy > -r &&
      y + oy < this.height / this.zoom + r;
    for (const m of this.motes)
      if (visible(m.x, m.y, 10))
        this.circle(
          m.x + Math.sin(this.time * 0.12 + m.phase) * 10,
          m.y + Math.cos(this.time * 0.16 + m.phase) * 12,
          m.r,
          '#9bd3dc35',
        );
    const inhabitantsStarted = this.diagnosticsEnabled ? performance.now() : 0;
    for (const f of this.food) {
      if (f.eaten || !visible(f.x, f.y, (f.r || 8) * 1.3)) continue;
      const edible = p.biomass >= (f.requiredMass || 0),
        r = f.r || 8,
        d = Math.hypot(f.x - p.x, f.y - p.y);
      const danger = !edible && isDanger(SPECIES_BY_ID[f.kind || 'nutrient']);
      if (danger) this.halo(f.x, f.y, r * 1.25, 'rgba(166,77,86,.065)');
      c.save();
      c.translate(f.x, f.y);
      c.rotate(journeyHeading(f.kind || 'nutrient', f.heading ?? f.seed));
      if (f.recycled)
        drawBiomassFragment(c, r, f.seed, this.reduced ? 0 : this.time);
      else
        drawJourneySprite(
          c,
          this.atlasImages,
          f.kind || 'nutrient',
          r,
          f.seed,
          this.reduced ? 0 : this.time,
          (f.escape || 0) > 0 || (f.attack || 0) > 0 ? 1.5 : 1,
          f.flash || 0,
          this.animationSheets,
        );
      c.restore();
      const spec = SPECIES_BY_ID[f.kind || 'nutrient'];
      if (spec?.shot && (f.shotClock ?? 10) < 0.55 && d < 410) {
        c.strokeStyle = 'rgba(238,143,111,.38)';
        c.lineWidth = 1;
        c.setLineDash([5, 7]);
        c.beginPath();
        c.moveTo(f.x, f.y);
        c.lineTo(p.x, p.y);
        c.stroke();
        c.setLineDash([]);
      }
      if (danger && d < 220) {
        c.fillStyle = '#d7aab2';
        c.font = 10 / this.zoom + 'px Arial';
        c.textAlign = 'center';
        c.fillText('DEMASIADO GRANDE', f.x, f.y + r + 14 / this.zoom);
      }
    }
    if (this.diagnosticsEnabled)
      this.frameMonitor.frameParts.inhabitants = performance.now() - inhabitantsStarted;
    for (const b of this.world.projectiles) {
      if (!visible(b.x, b.y, 10)) continue;
      c.strokeStyle = b.plasma ? '#b9e6ff' : '#ffda9c';
      c.lineWidth = b.r;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(b.x - b.vx * 0.035, b.y - b.vy * 0.035);
      c.lineTo(b.x, b.y);
      c.stroke();
    }
    for (const q of this.particles) {
      const a = q.life / q.max;
      this.circle(
        q.x,
        q.y,
        2 * a,
        q.gold
          ? 'rgba(245,193,98,' + a * 0.7 + ')'
          : 'rgba(140,220,230,' + a * 0.35 + ')',
      );
    }
    c.save();
    if (!this.reduced && (this.birth > 0 || (!this.started && !this.saved))) {
      const t = this.started ? Math.max(0, Math.min(1, (2.8 - this.birth) / 2.2)) : 0;
      const size = .06 + .94 * (1 - (1 - t) ** 3) + Math.sin(t * Math.PI * 4) * .06 * Math.sin(t * Math.PI);
      c.translate(p.x, p.y); c.scale(size, size); c.translate(-p.x, -p.y);
      c.globalAlpha = .25 + .75 * t;
    }
    if (!skipProtagonist) this.measured('protagonist', () => this.drawCell());
    c.restore();
    for (const f of this.floating) {
      c.save();
      c.globalAlpha = Math.min(1, f.life * 1.8);
      c.font = 12 / this.zoom + 'px Arial';
      c.textAlign = 'center';
      c.fillStyle = f.damage ? '#ffb29b' : '#f6d793';
      c.fillText(f.text, f.x, f.y);
      c.restore();
    }
    c.restore();
    if (this.flash > 0) {
      c.fillStyle = 'rgba(144,226,241,' + this.flash * 0.14 + ')';
      c.fillRect(0, 0, 480, this.height);
    }
    if (this.hitFlash > 0) {
      c.fillStyle = 'rgba(197,85,84,' + this.hitFlash * 0.18 + ')';
      c.fillRect(0, 0, 480, this.height);
    }
    if (
      this.started &&
      !p.dead &&
      !this.progress.offer.length &&
      !this.progress.completed &&
      !this.transition
      && !this.birth
    )
      this.drawFoodGuide(ox, oy);
    this.drawEvolution();
  }

  drawFoodGuide(ox: number, oy: number) {
    let nearest: Food | null = null,
      d = Infinity;
    for (const f of this.food) {
      if (f.eaten || this.life.biomass < (f.requiredMass || 0)) continue;
      const dist = Math.hypot(f.x - this.life.x, f.y - this.life.y);
      if (f.final && this.life.biomass >= 56) {
        nearest = f;
        break;
      }
      if (dist < d) {
        d = dist;
        nearest = f;
      }
    }
    if (!nearest) return;
    const x = (nearest.x + ox) * this.zoom,
      y = (nearest.y + oy) * this.zoom;
    if (x > 25 && x < 455 && y > 190 && y < this.height - 130) return;
    const a = Math.atan2(nearest.y - this.life.y, nearest.x - this.life.x),
      r = Math.min(175, this.height * 0.23);
    const cx = 240 + Math.cos(a) * r,
      cy = this.height * 0.48 + Math.sin(a) * r;
    const c = this.ctx;
    c.save();
    c.translate(cx, cy);
    c.rotate(a);
    c.strokeStyle = '#e9c58a99';
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(-4, -4);
    c.lineTo(2, 0);
    c.lineTo(-4, 4);
    c.stroke();
    c.restore();
  }
  shape(r: number) {
    const p = this.life,
      speed = Math.min(1, Math.hypot(p.vx, p.vy) / 180);
    const points = this.membrane.map((rr, i) => {
      const a = (i / 100) * TAU;
      return {
        x: Math.cos(a) * r * rr + Math.cos(this.heading) * speed * 4,
        y: Math.sin(a) * r * rr + Math.sin(this.heading) * speed * 4,
      };
    });
    return this.huntingTentacles.deform(
      points,
      p,
      this.reduced ? 0 : this.time,
    );
  }
  trace(points: { x: number; y: number }[], factor = 1) {
    const c = this.ctx,
      first = points[0],
      last = points[points.length - 1];
    c.beginPath();
    c.moveTo(
      ((first.x + last.x) / 2) * factor,
      ((first.y + last.y) / 2) * factor,
    );
    for (let i = 0; i < points.length; i++) {
      const p = points[i],
        next = points[(i + 1) % points.length];
      c.quadraticCurveTo(
        p.x * factor,
        p.y * factor,
        ((p.x + next.x) / 2) * factor,
        ((p.y + next.y) / 2) * factor,
      );
    }
    c.closePath();
  }
  drawCell() {
    const c = this.ctx,
      p = this.life,
      t = this.time;
    if (p.radius < 0.8) return;
    const r = p.radius * (1 + Math.sin(t * 2.2) * 0.017),
      pts = this.shape(r);
    c.save();
    c.translate(p.x, p.y);
    if (p.dead) c.globalAlpha = Math.min(1, p.radius / 35);
    this.halo(0, 0, r * 1.75, 'rgba(39,173,213,.095)');
    if (
      !p.dead &&
      this.stats.shieldCooldown &&
      this.progress.shieldRecharge === 0
    ) {
      c.beginPath();
      c.arc(0, 0, r * (1.16 + Math.sin(t * 1.7) * 0.02), 0, TAU);
      c.strokeStyle = 'rgba(142,219,231,.3)';
      c.lineWidth = 1.3;
      c.stroke();
    }
    if (this.stats.spikeFraction && p.hurt > 0) {
      c.strokeStyle = 'rgba(220,206,153,.65)';
      c.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const a = (i * TAU) / 12;
        const node = pts[Math.floor((i * pts.length) / 12)];
        c.beginPath();
        c.moveTo(node.x, node.y);
        c.lineTo(
          node.x + Math.cos(a) * r * 0.22 * p.hurt,
          node.y + Math.sin(a) * r * 0.22 * p.hurt,
        );
        c.stroke();
      }
    }
    // Transparent double membrane with an independently moving cytoplasm.
    this.trace(pts);
    const fill = c.createRadialGradient(-r * 0.28, -r * 0.3, 2, 0, 0, r * 1.4);
    fill.addColorStop(0, 'rgba(25,99,129,.48)');
    fill.addColorStop(0.5, 'rgba(12,65,102,.28)');
    fill.addColorStop(0.83, 'rgba(74,173,201,.24)');
    fill.addColorStop(1, 'rgba(162,230,239,.38)');
    c.fillStyle = fill;
    c.fill();
    c.save();
    this.trace(pts);
    c.clip();
    // Fine cytoskeleton fibres flow from the nucleus into the lobes.
    for (let i = 0; i < 33; i++) {
      const a = (i / 33) * TAU + Math.sin(t * 0.3 + i) * 0.06;
      const end = pts[Math.floor((i / 33) * pts.length)];
      c.strokeStyle =
        i % 3 === 0 ? 'rgba(213,206,140,.17)' : 'rgba(152,225,237,.2)';
      c.lineWidth = i % 3 === 0 ? 0.65 : 0.45;
      c.beginPath();
      c.moveTo(Math.cos(a) * r * 0.17, Math.sin(a) * r * 0.17);
      c.bezierCurveTo(
        Math.cos(a + 0.4) * r * 0.55 + Math.sin(t + i) * 3,
        Math.sin(a + 0.4) * r * 0.55,
        end.x * 0.6,
        end.y * 0.8,
        end.x * 0.98,
        end.y * 0.98,
      );
      c.stroke();
      if (i % 2 === 0) {
        c.beginPath();
        c.moveTo(end.x * 0.6, end.y * 0.72);
        c.lineTo(
          end.x * 0.8 + 8 * Math.sin(i),
          end.y * 0.9 + 5 * Math.cos(t + i),
        );
        c.stroke();
      }
    }
    for (let i = 0; i < this.organs.length; i++) {
      const o = this.organs[i],
        a = o.a + Math.sin(t * 0.24 + o.phase) * 0.1,
        x = Math.cos(a) * o.d * r + Math.sin(t * 0.6 + o.phase) * 2,
        y = Math.sin(a) * o.d * r + Math.cos(t * 0.5 + o.phase) * 2,
        rad = o.r * (r / 48);
      const g = c.createRadialGradient(
        x - rad * 0.25,
        y - rad * 0.3,
        0,
        x,
        y,
        rad,
      );
      g.addColorStop(
        0,
        i % 7 === 0 ? 'rgba(228,179,78,.65)' : 'rgba(164,215,218,.24)',
      );
      g.addColorStop(0.5, 'rgba(20,82,109,.06)');
      g.addColorStop(
        1,
        i % 7 === 0 ? 'rgba(241,186,104,.4)' : 'rgba(138,212,226,.45)',
      );
      this.circle(x, y, rad, g as unknown as string);
      c.strokeStyle = 'rgba(195,227,221,.18)';
      c.lineWidth = 0.55;
      c.beginPath();
      c.arc(x, y, rad, 0.6, 4.5);
      c.stroke();
      this.circle(x - rad * 0.35, y - rad * 0.5, 0.6, '#c6e9e785');
    }
    for (let i = 0; i < 105; i++) {
      const a = i * 2.399 + Math.sin(t * 0.25 + i) * 0.07,
        d = Math.sqrt((i * 0.618) % 1) * r * 0.99;
      this.circle(
        Math.cos(a) * d,
        Math.sin(a) * d,
        0.35 + (i % 3) * 0.18,
        i % 5 === 0 ? '#e9c88550' : '#a4e4ef38',
      );
    }
    this.drawDigestion(false);
    c.restore();
    this.drawDigestion(true);
    this.trace(pts);
    c.strokeStyle =
      p.hurt > 0 ? 'rgba(255,168,145,.85)' : 'rgba(155,223,239,.72)';
    c.lineWidth = 1.25;
    c.shadowColor = '#78daf3';
    c.shadowBlur = 5;
    c.stroke();
    c.shadowBlur = 0;
    if (p.invulnerable > 0 && !p.dead) {
      this.trace(pts, 1.045);
      c.strokeStyle =
        'rgba(156,229,242,' +
        (0.16 + 0.18 * (0.5 + 0.5 * Math.sin(t * 9))) +
        ')';
      c.lineWidth = 1;
      c.stroke();
    }
    this.trace(pts, 0.965);
    c.strokeStyle = 'rgba(109,185,214,.4)';
    c.lineWidth = 0.7;
    c.stroke();
    for (let i = 0; i < pts.length; i += 3) {
      const q = pts[i],
        next = pts[(i + 2) % pts.length];
      const bright = 0.2 + 0.35 * (0.5 + 0.5 * Math.cos((i / 100) * TAU + 2));
      c.strokeStyle = `rgba(218,251,255,${bright})`;
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(q.x, q.y);
      c.lineTo(next.x, next.y);
      c.stroke();
    }
    // Flagella bend behind the direction of travel, growing with the first evolution.
    for (let i = 0; i < 5; i++) {
      if (i > 1 && p.evolution < 0.02) continue;
      const a = this.heading + Math.PI + (i - 2) * 0.34;
      const sx = Math.cos(a) * r * 0.72,
        sy = Math.sin(a) * r * 0.72;
      const morph = Math.min(1, p.evolution);
      const len = r * (0.8 + morph * 0.65) * (i > 1 ? morph : 1);
      c.beginPath();
      c.moveTo(sx, sy);
      for (let j = 1; j <= 24; j++) {
        const u = j / 24,
          wave = Math.sin(u * 8 - t * 3.2 + i) * u * 9;
        c.lineTo(
          sx + Math.cos(a) * len * u - Math.sin(a) * wave,
          sy + Math.sin(a) * len * u + Math.cos(a) * wave,
        );
      }
      c.strokeStyle = 'rgba(135,222,234,.48)';
      c.lineWidth = 0.75;
      c.stroke();
    }
    const nx = this.nucleus.x + Math.sin(t * 0.6) * 2,
      ny = this.nucleus.y + Math.cos(t * 0.65) * 2,
      nr = r * (0.205 + Math.sin(t * 3) * 0.008 + p.feedPulse * 0.025);
    this.halo(nx, ny, nr * 3.2, 'rgba(242,164,39,.16)');
    const g = c.createRadialGradient(
      nx - nr * 0.3,
      ny - nr * 0.35,
      0,
      nx,
      ny,
      nr,
    );
    g.addColorStop(0, '#fff0ad');
    g.addColorStop(0.17, '#f7ce6d');
    g.addColorStop(0.37, '#d79930');
    g.addColorStop(0.68, '#8b4c15');
    g.addColorStop(0.85, '#b37423');
    g.addColorStop(1, '#f0c778');
    this.circle(nx, ny, nr, g as unknown as string);
    c.strokeStyle = '#ffe5a899';
    c.lineWidth = 0.8;
    c.beginPath();
    c.arc(nx, ny, nr + 2, 0, TAU);
    c.stroke();
    for (let i = 0; i < 19; i++) {
      const a = i * 2.399 + t * 0.06,
        d = Math.sqrt((i * 0.618) % 1) * nr * 0.8;
      this.circle(
        nx + Math.cos(a) * d,
        ny + Math.sin(a) * d,
        1 + (i % 3) * 0.4,
        i % 2 ? '#ffdf785c' : '#6b410d88',
      );
    }
    c.globalCompositeOperation = 'screen';
    this.halo(nx - nr * 0.2, ny - nr * 0.25, nr * 0.65, 'rgba(255,232,155,.8)');
    c.strokeStyle = '#ffe6b688';
    c.lineWidth = 0.6;
    c.beginPath();
    c.moveTo(nx - nr * 1.25, ny);
    c.lineTo(nx + nr * 1.25, ny);
    c.moveTo(nx, ny - nr * 1.25);
    c.lineTo(nx, ny + nr * 1.25);
    c.stroke();
    c.globalCompositeOperation = 'source-over';
    c.restore();
  }
  drawDigestion(outside: boolean) {
    if (this.progress.completed) return;
    const c = this.ctx,
      p = this.life;
    for (const f of p.digestion) {
      const u = f.progress;
      if (u < 0.44 !== outside) continue;
      const engulf = clamp(u / 0.44, 0, 1),
        travel = clamp((u - 0.35) / 0.55, 0, 1),
        ease = travel * travel * (3 - 2 * travel);
      const x =
        f.dx * (1 - ease) * (0.99 - 0.15 * engulf) + this.nucleus.x * ease;
      const y =
        f.dy * (1 - ease) * (0.99 - 0.15 * engulf) + this.nucleus.y * ease;
      c.save();
      c.translate(x, y);
      if (outside) {
        const opening = (1 - engulf) * 1.4 + 0.05,
          angle = Math.atan2(f.dy, f.dx);
        c.rotate(angle);
        c.beginPath();
        c.arc(0, 0, f.r + 6, opening, TAU - opening);
        c.strokeStyle = 'rgba(179,235,239,.72)';
        c.lineWidth = 1.2;
        c.stroke();
        this.halo(0, 0, 16, 'rgba(75,181,211,.16)');
        c.rotate(-angle);
      } else {
        const sac = (f.r + 5) * (1 - travel * 0.55);
        c.beginPath();
        c.ellipse(
          0,
          0,
          sac * (1 + Math.sin(this.time * 7) * 0.08),
          sac,
          Math.atan2(f.dy, f.dx),
          0,
          TAU,
        );
        c.fillStyle = 'rgba(47,126,151,.1)';
        c.fill();
        c.strokeStyle = 'rgba(151,220,233,.48)';
        c.lineWidth = 0.7;
        c.stroke();
      }
      const broken = clamp((u - 0.62) / 0.38, 0, 1);
      this.halo(0, 0, 18 * (1 - broken) + 4, 'rgba(242,178,55,.22)');
      if (broken < 0.95) {
        c.rotate(f.rotation + travel * 1.6);
        c.globalAlpha *= 1 - broken;
        if (f.recycled)
          drawBiomassFragment(
            c,
            f.r * (1 - broken * 0.7),
            f.rotation,
            this.time,
          );
        else
          drawJourneySprite(
            c,
            this.atlasImages,
            f.kind,
            f.r * (1 - broken * 0.7),
            f.rotation,
            this.time,
            1,
            0,
            this.animationSheets,
          );
      }
      c.restore();
      if (broken > 0) {
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * TAU + f.rotation,
            spread = Math.sin(broken * Math.PI) * 12;
          this.circle(
            x + Math.cos(a) * spread,
            y + Math.sin(a) * spread,
            1.1 * (1 - broken) + 0.4,
            'rgba(255,205,113,' + (1 - broken) * 0.85 + ')',
          );
        }
      }
    }
  }

  registerTools() {
    const context = (
      document as unknown as {
        modelContext?: {
          registerTool: (tool: unknown, options: unknown) => unknown;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const common = {
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
    };
    for (const [name, description, action] of [
      ['start_voro', 'Start or resume the VORO evolution game.', 'start'],
      ['restart_voro', 'Restart VORO and clear this run.', 'restart'],
    ] as const) {
      try {
        Promise.resolve(
          context.registerTool(
            {
              ...common,
              name,
              description,
              execute: (input: unknown) => {
                if (
                  !input ||
                  typeof input !== 'object' ||
                  Object.keys(input).length
                )
                  throw new Error('Expected an empty object');
                this.action(action);
                return { started: this.started, eaten: this.life.eaten };
              },
            },
            { signal: this.lifecycle.signal },
          ),
        ).catch(() => {});
      } catch {}
    }
  }
  destroy() {
    this.universeFinale?.destroy();
    this.testBackup?.universeFinale?.destroy();
    this.tilt.stop();
    this.save();
    this.destroyed = true;
    this.assets.destroy();
    this.animationSheets.destroy();
    clearAnimationCache();
    cancelAnimationFrame(this.raf);
    this.lifecycle.abort();
    this.observer.disconnect();
    this.audio?.close().catch(() => {});
  }
}
