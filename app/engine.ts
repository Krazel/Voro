// Canvas2D rendering and input. The simulation stays independent of frame rendering.
// @ts-ignore JavaScript simulation is shared with the Node regression checks.
import {
  WORLD,
  GOAL,
  clamp,
  random,
  createLife,
  integrate,
  impulse,
  digest,
  beginAbsorb,
  takeDamage,
  sizeForMass,
  EVOLUTION_MASS,
  MAX_MASS,
  springNode,
} from './simulation.mjs';

export type Snapshot = {
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
};
type Food = {
  x: number;
  y: number;
  seed: number;
  eaten: boolean;
  rod: boolean;
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
  life = createLife();
  started = false;
  paused = false;
  sound = true;
  time = 0;
  last = 0;
  raf = 0;
  destroyed = false;
  width = 480;
  height = 850;
  pixelRatio = 1;
  scale = 1;
  camera = { x: 700, y: 970 };
  heading = -Math.PI / 2;
  food: Food[] = [];
  motes: Mote[] = [];
  particles: Particle[] = [];
  organs: { a: number; d: number; r: number; phase: number }[] = [];
  background = new Image();
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
  predator = { x: 970, y: 620, r: 82 };
  audioStarted = false;
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  constructor(canvas: HTMLCanvasElement, emit: (s: Snapshot) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.emit = emit;
    this.background.src = '/abyssal-background.png';
    this.seed();
    this.resize();
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    const opt = { signal: this.lifecycle.signal };
    canvas.addEventListener(
      'pointerdown',
      (e) => {
        if (
          !this.started ||
          this.paused ||
          this.life.complete ||
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
        if (document.hidden && this.started) {
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
    this.publish();
    this.raf = requestAnimationFrame(this.frame);
  }
  seed() {
    const rand = random(288);
    this.food = [];
    this.motes = [];
    this.organs = [];
    this.particles = [];
    this.floating = [];
    this.membrane.fill(1);
    this.membraneVelocity.fill(0);
    this.wobble = 0;
    this.wobbleVelocity = 0;
    this.nucleus = { x: 0, y: 0 };
    this.foodClock = 0;
    this.hitFlash = 0;
    this.heading = -Math.PI / 2;
    // A nearby spiral makes the first meal discoverable, followed by a wider living field.
    for (let i = 0; i < 42; i++) {
      const a = i * 2.399;
      const d = 95 + Math.sqrt(i) * 43;
      this.food.push({
        x: 700 + Math.cos(a) * d,
        y: 970 + Math.sin(a) * d,
        seed: rand() * TAU,
        eaten: false,
        rod: i % 3 === 0,
      });
    }
    for (let i = 0; i < 65; i++)
      this.food.push({
        x: 140 + rand() * 1120,
        y: 160 + rand() * 1380,
        seed: rand() * TAU,
        eaten: false,
        rod: i % 4 === 0,
      });
    for (let i = 0; i < 270; i++)
      this.motes.push({
        x: rand() * WORLD.width,
        y: rand() * WORLD.height,
        r: 0.5 + rand() * 1.3,
        phase: rand() * TAU,
      });
    for (let i = 0; i < 58; i++)
      this.organs.push({
        a: rand() * TAU,
        d: 0.25 + Math.sqrt(rand()) * 0.7,
        r: 1 + rand() * 4,
        phase: rand() * TAU,
      });
  }
  resize() {
    const b = this.canvas.getBoundingClientRect();
    this.scale = b.width / 480;
    this.width = 480;
    this.height = b.height / this.scale;
    this.pixelRatio = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(b.width * this.pixelRatio);
    this.canvas.height = Math.round(b.height * this.pixelRatio);
  }
  point(e: PointerEvent) {
    const b = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - b.left) / this.scale,
      y: (e.clientY - b.top) / this.scale,
    };
  }
  initAudio() {
    if (this.audioStarted) return;
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
    if (this.audio && this.master)
      this.master.gain.setTargetAtTime(
        this.sound && !this.paused ? 0.055 : 0,
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
  action(name: 'start' | 'pause' | 'restart' | 'dash' | 'sound' | 'continue') {
    if (name === 'start' && !this.life.dead && !this.life.complete) {
      this.started = true;
      this.paused = false;
      this.initAudio();
      this.toast('Acércate al dorado. Absorbes al tocar.', 6);
      this.canvas.focus({ preventScroll: true });
    }
    if (name === 'restart') {
      this.life = createLife();
      this.camera = { x: 700, y: 970 };
      this.seed();
      this.started = true;
      this.paused = false;
      this.keys.clear();
      this.pointer = null;
      this.flash = 0;
      this.toast('Una nueva vida.', 3);
      this.initAudio();
    }
    if (
      name === 'pause' &&
      this.started &&
      !this.life.dead &&
      !this.life.complete
    ) {
      this.paused = !this.paused;
      this.keys.clear();
      this.pointer = null;
    }
    if (name === 'sound') {
      this.sound = !this.sound;
      if (this.started) this.initAudio();
    }
    if (name === 'dash' && this.started && !this.paused && impulse(this.life)) {
      if (Math.hypot(this.life.vx, this.life.vy) < 10) {
        this.life.vx = Math.cos(this.heading) * 180;
        this.life.vy = Math.sin(this.heading) * 180;
      }
      this.burst(this.life.x, this.life.y, 12, false);
    }
    if (name === 'continue' && !this.life.dead) {
      this.life.free = true;
      this.life.complete = false;
      this.paused = false;
      this.toast('Membrana expandida · sigue explorando', 4);
      this.canvas.focus({ preventScroll: true });
    }
    this.setAudio();
    this.publish();
  }
  toast(text: string, seconds = 3) {
    this.hint = text;
    this.hintUntil = this.time + seconds;
  }
  publish() {
    this.emit({
      eaten: this.life.eaten,
      biomass: this.life.biomass,
      target: this.life.free ? MAX_MASS : EVOLUTION_MASS,
      hurt: this.life.hurt,
      dead: this.life.dead,
      protected: this.life.invulnerable > 0,
      size: Math.round(sizeForMass(this.life.biomass)),
      elapsed: this.life.elapsed,
      dash: this.life.cooldown,
      evolved: this.life.evolved,
      complete: this.life.complete,
      paused: this.paused,
      started: this.started,
      sound: this.sound,
      hint: this.hint,
    });
  }
  input() {
    let x =
        (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) -
        (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0),
      y =
        (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0) -
        (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0);
    if (this.pointer) {
      if (this.pointer.touch) {
        x = (this.pointer.x - this.pointer.sx) / 48;
        y = (this.pointer.y - this.pointer.sy) / 48;
      } else {
        x = (this.pointer.x - (this.life.x - this.camera.x + 240)) / 65;
        y =
          (this.pointer.y -
            (this.life.y - this.camera.y + this.height * 0.48)) /
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
    const dt = this.last ? Math.min((stamp - this.last) / 1000, 0.035) : 0.016;
    this.last = stamp;
    if (!document.hidden) {
      if (!this.paused) {
        this.time += dt;
        this.update(dt);
      }
      this.render();
    }
    this.raf = requestAnimationFrame(this.frame);
  };
  update(dt: number) {
    const p = this.life;
    if (this.started && !p.complete && !p.dead) {
      integrate(p, dt, this.input());
      if (Math.hypot(p.vx, p.vy) > 8) {
        const target = Math.atan2(p.vy, p.vx);
        this.heading +=
          Math.atan2(
            Math.sin(target - this.heading),
            Math.cos(target - this.heading),
          ) * Math.min(1, dt * 3);
      }
      for (const f of this.food) {
        if (f.eaten) continue;
        const d = Math.hypot(f.x - p.x, f.y - p.y);
        if (d < p.radius + 34) {
          const pull = (1 - d / (p.radius + 34)) * 62 * dt;
          f.x += ((p.x - f.x) / Math.max(d, 1)) * pull;
          f.y += ((p.y - f.y) / Math.max(d, 1)) * pull;
        }
        if (beginAbsorb(p, f)) {
          this.wobbleVelocity += 0.42;
          this.slurp();
        }
      }
      const before = p.evolved;
      const finished = digest(p, dt);
      if (finished) {
        this.burst(p.x, p.y, 7, true);
        this.chime();
        this.wobbleVelocity += 0.7;
        this.floating.push({
          x: p.x,
          y: p.y - p.radius * 0.6,
          text: '+' + finished + ' biomasa',
          life: 1.3,
          damage: false,
        });
        if (p.eaten === 1)
          this.toast('La comida alimenta tu núcleo y te hace crecer.', 4);
        if (p.eaten === 6)
          this.toast(
            'Cuidado con las espinas: pierdes biomasa al golpearte.',
            4,
          );
        if (p.eaten === 12 && !p.evolved)
          this.toast('Sigue alimentándote para expandir tu membrana.', 4);
      }
      if (!before && p.evolved) {
        this.flash = 1;
        this.burst(p.x, p.y, 65, true);
        this.chime(true);
        this.toast('EVOLUCIÓN · Membrana expandida', 4);
      }
      const pred = this.predator,
        dist = Math.hypot(p.x - pred.x, p.y - pred.y);
      if (!p.complete && dist < p.radius + pred.r * 0.99) {
        const lost = takeDamage(p, pred);
        if (lost > 0) {
          this.hitFlash = 0.65;
          this.wobbleVelocity -= 2.7;
          this.floating.push({
            x: p.x,
            y: p.y - p.radius * 0.8,
            text: '−' + lost.toFixed(1) + ' biomasa',
            life: 1.8,
            damage: true,
          });
          this.toast(
            p.dead
              ? 'Tu membrana se ha deshecho.'
              : 'Has perdido biomasa. Aléjate y vuelve a comer.',
            3.2,
          );
          this.burst(
            p.x + Math.cos(p.hitAngle) * p.radius * 0.6,
            p.y + Math.sin(p.hitAngle) * p.radius * 0.6,
            26,
            true,
          );
          this.impact();
          this.publish();
        }
      }
      this.trailClock += dt;
      if (this.trailClock > 0.045 && Math.hypot(p.vx, p.vy) > 25) {
        this.trailClock = 0;
        this.particles.push({
          x: p.x - Math.cos(this.heading) * p.radius * 0.65,
          y: p.y - Math.sin(this.heading) * p.radius * 0.65,
          vx: -p.vx * 0.12,
          vy: -p.vy * 0.12,
          life: 1.5,
          max: 1.5,
          gold: false,
        });
      }
      this.foodClock += dt;
      if (this.foodClock > 2.5) {
        this.foodClock = 0;
        this.food = this.food.filter((f) => !f.eaten);
        let attempts = 0;
        while (this.food.length < 85 && attempts++ < 140) {
          const x = 135 + this.rng() * 1130,
            y = 165 + this.rng() * 1370;
          if (
            Math.hypot(x - p.x, y - p.y) < 245 ||
            Math.hypot(x - pred.x, y - pred.y) < 170
          )
            continue;
          this.food.push({
            x,
            y,
            seed: this.rng() * TAU,
            eaten: false,
            rod: this.rng() > 0.7,
          });
        }
      }
    }
    if (p.dead) integrate(p, dt, { x: 0, y: 0 });
    if (!this.started) {
      p.x = 700 + Math.sin(this.time * 0.3) * 12;
      p.y = 970 + Math.cos(this.time * 0.35) * 9;
      this.camera.y = p.y + this.height * 0.11;
    } else {
      this.camera.x += (p.x - this.camera.x) * (1 - Math.exp(-dt * 3));
      const targetY = p.complete ? p.y + this.height * 0.12 : p.y;
      this.camera.y += (targetY - this.camera.y) * (1 - Math.exp(-dt * 3));
    }
    this.animateMembrane(dt);
    this.predator.x = 990 + Math.sin(this.time * 0.21) * 80;
    this.predator.y = 585 + Math.cos(this.time * 0.16) * 70;
    this.flash = Math.max(0, this.flash - dt * 0.38);
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    for (const q of this.particles) {
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.life -= dt;
    }
    this.particles = this.particles.filter((q) => q.life > 0).slice(-160);
    for (const f of this.floating) {
      f.y -= dt * 22;
      f.life -= dt;
    }
    this.floating = this.floating.filter((f) => f.life > 0).slice(-8);
    if (this.hint && this.time > this.hintUntil) this.hint = '';
    if (this.time - this.lastEmit > 0.12) {
      this.lastEmit = this.time;
      this.publish();
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
      if (f.eaten) continue;
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
  render() {
    const c = this.ctx,
      k = this.pixelRatio * this.scale;
    c.setTransform(k, 0, 0, k, 0, 0);
    c.fillStyle = '#041423';
    c.fillRect(0, 0, 480, this.height);
    if (this.background.complete && this.background.naturalWidth) {
      const im = this.background;
      const factor = Math.max(530 / im.width, (this.height + 65) / im.height);
      const w = im.width * factor,
        h = im.height * factor;
      const px = (this.camera.x - 700) * 0.035,
        py = (this.camera.y - 970) * 0.035;
      c.drawImage(im, (480 - w) / 2 - px, (this.height - h) / 2 - py, w, h);
    }
    const shake = this.reduced ? 0 : this.hitFlash * 3;
    const ox = 240 - this.camera.x + Math.sin(this.time * 55) * shake,
      oy =
        this.height * 0.48 - this.camera.y + Math.cos(this.time * 62) * shake;
    c.save();
    c.translate(ox, oy);
    for (const m of this.motes) {
      const x = m.x + Math.sin(this.time * 0.12 + m.phase) * 10,
        y = m.y + Math.sin(this.time * 0.16 + m.phase) * 14;
      if (
        x + ox < -10 ||
        x + ox > 490 ||
        y + oy < -10 ||
        y + oy > this.height + 10
      )
        continue;
      this.circle(
        x,
        y,
        m.r,
        `rgba(133,209,223,${0.08 + 0.13 * (0.5 + 0.5 * Math.sin(this.time * 0.7 + m.phase))})`,
      );
    }
    this.drawPredator();
    for (const f of this.food) {
      if (
        f.eaten ||
        f.x + ox < -20 ||
        f.x + ox > 500 ||
        f.y + oy < -20 ||
        f.y + oy > this.height + 20
      )
        continue;
      const yy = f.y + Math.sin(this.time * 1.2 + f.seed) * 2;
      const pulse = 1 + Math.sin(this.time * 2 + f.seed) * 0.1;
      this.halo(f.x, yy, 17 * pulse, 'rgba(255,177,48,.22)');
      c.save();
      c.translate(f.x, yy);
      c.rotate(f.seed + Math.sin(this.time * 0.4 + f.seed) * 0.3);
      const g = c.createRadialGradient(-1, -2, 0, 0, 0, 7);
      g.addColorStop(0, '#fff5bb');
      g.addColorStop(0.28, '#efc46c');
      g.addColorStop(0.65, '#c67c25');
      g.addColorStop(1, '#613710');
      c.fillStyle = g;
      c.strokeStyle = '#f7cf8aa0';
      c.lineWidth = 0.7;
      c.beginPath();
      c.ellipse(0, 0, f.rod ? 8 : 4.5, 4, 0, 0, TAU);
      c.fill();
      c.stroke();
      this.circle(-2, -1, 1.1, '#fff5cabb');
      c.restore();
    }
    for (const q of this.particles) {
      const a = q.life / q.max;
      this.circle(
        q.x,
        q.y,
        (q.gold ? 2.1 : 1.8) * a,
        q.gold
          ? `rgba(248,195,100,${a * 0.7})`
          : `rgba(139,225,233,${a * 0.4})`,
      );
    }
    this.drawCell();
    for (const f of this.floating) {
      c.save();
      c.globalAlpha = Math.min(1, f.life * 1.8);
      c.font = '12px Arial';
      c.textAlign = 'center';
      c.fillStyle = f.damage ? '#ffb29b' : '#f6d793';
      c.shadowColor = '#00121c';
      c.shadowBlur = 8;
      c.fillText(f.text, f.x, f.y);
      c.restore();
    }
    c.restore();
    if (this.pointer?.touch) {
      const p = this.pointer;
      const dx = p.x - p.sx,
        dy = p.y - p.sy,
        d = Math.hypot(dx, dy),
        s = Math.min(1, 40 / Math.max(d, 1));
      c.strokeStyle = '#b0e0e544';
      c.lineWidth = 1;
      c.beginPath();
      c.arc(p.sx, p.sy, 47, 0, TAU);
      c.stroke();
      this.circle(p.sx, p.sy, 47, '#5e9ead0d');
      this.circle(p.sx + dx * s, p.sy + dy * s, 19, '#afd8dc44');
    }
    if (this.flash > 0) {
      c.fillStyle = `rgba(144,226,241,${this.flash * 0.14})`;
      c.fillRect(0, 0, 480, this.height);
    }
    if (this.hitFlash > 0) {
      c.fillStyle = `rgba(197,85,84,${this.hitFlash * 0.18})`;
      c.fillRect(0, 0, 480, this.height);
    }
    if (this.started && !this.life.complete && !this.life.dead)
      this.drawFoodGuide(ox, oy);
  }
  drawFoodGuide(ox: number, oy: number) {
    let nearest: Food | null = null,
      d = Infinity;
    for (const f of this.food) {
      if (f.eaten) continue;
      const dist = Math.hypot(f.x - this.life.x, f.y - this.life.y);
      if (dist < d) {
        d = dist;
        nearest = f;
      }
    }
    if (!nearest) return;
    const x = nearest.x + ox,
      y = nearest.y + oy;
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
    return this.membrane.map((rr, i) => {
      const a = (i / 100) * TAU;
      return {
        x: Math.cos(a) * r * rr + Math.cos(this.heading) * speed * 4,
        y: Math.sin(a) * r * rr + Math.sin(this.heading) * speed * 4,
      };
    });
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
      const len = r * (0.8 + p.evolution * 0.65) * (i > 1 ? p.evolution : 1);
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
        c.arc(0, 0, 12, opening, TAU - opening);
        c.strokeStyle = 'rgba(179,235,239,.72)';
        c.lineWidth = 1.2;
        c.stroke();
        this.halo(0, 0, 16, 'rgba(75,181,211,.16)');
        c.rotate(-angle);
      } else {
        const sac = 10 * (1 - travel * 0.55);
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
        const g = c.createRadialGradient(-1, -1, 0, 0, 0, 7);
        g.addColorStop(0, '#ffefb1');
        g.addColorStop(0.35, '#eaba59');
        g.addColorStop(1, '#99521b');
        c.fillStyle = g;
        c.beginPath();
        c.ellipse(
          0,
          0,
          (f.rod ? 7 : 4.5) * (1 - broken * 0.6),
          4 * (1 - broken * 0.4),
          0,
          0,
          TAU,
        );
        c.fill();
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
  drawPredator() {
    const c = this.ctx,
      p = this.predator,
      t = this.time;
    c.save();
    c.translate(p.x, p.y);
    c.rotate(t * 0.045);
    this.halo(0, 0, 115, 'rgba(30,87,134,.15)');
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * TAU,
        r = p.r * 0.85;
      const x = Math.cos(a) * r,
        y = Math.sin(a) * r;
      c.strokeStyle = 'rgba(117,169,202,.45)';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(x * 0.8, y * 0.8);
      c.quadraticCurveTo(
        x * 1.1 - 5 * Math.sin(a),
        y * 1.1 + 5 * Math.cos(a),
        x * 1.28,
        y * 1.28,
      );
      c.stroke();
      this.circle(x * 1.28, y * 1.28, 2.5, '#6e9ab7');
    }
    const g = c.createRadialGradient(-22, -24, 3, 0, 0, p.r);
    g.addColorStop(0, '#28546d');
    g.addColorStop(0.65, '#113146');
    g.addColorStop(1, '#41687c');
    this.circle(0, 0, p.r * 0.85, g as unknown as string);
    for (let i = 0; i < 55; i++) {
      const a = i * 2.399,
        d = Math.sqrt((i * 0.618) % 1) * p.r * 0.77;
      this.circle(Math.cos(a) * d, Math.sin(a) * d, 2 + (i % 4), '#7bafbe25');
    }
    this.circle(-12, -8, 17, '#081c29');
    c.restore();
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
      ['start_voro', 'Start or resume the VORO microscopic game.', 'start'],
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
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.lifecycle.abort();
    this.observer.disconnect();
    this.audio?.close().catch(() => {});
  }
}
