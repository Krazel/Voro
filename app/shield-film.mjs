// Película viva: rendering only. Gameplay owns charge, cooldown and hit timing.
export const SHIELD_FILM_DURATION = 0.78;
export const SHIELD_FILM_REDUCED_DURATION = 0.18;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const delta = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

/** No clocks, timers, random state, particles or gameplay mutations are retained. */
export function shieldFilmPhase({ ready = false, hitAge = Infinity, reduced = false, dead = false } = {}) {
  if (dead) return 'off';
  if (Number.isFinite(hitAge) && hitAge >= 0 && hitAge < (reduced ? SHIELD_FILM_REDUCED_DURATION : SHIELD_FILM_DURATION))
    return reduced || hitAge < 0.19 ? 'impact' : 'dissolve';
  return ready ? 'ready' : 'off';
}

/** Canvas must already be translated/scaled to the same local coordinates as drawCell.
 * @param {CanvasRenderingContext2D} c
 * @param {{radius?:number,points?:Array<{x:number,y:number}>,time?:number,ready?:boolean,hitAge?:number,hitAngle?:number,reduced?:boolean,dead?:boolean}} options
 */
export function drawShieldFilm(c, {
  radius: r = 0, points = [], time = 0, ready = false, hitAge = Infinity,
  hitAngle = 0, reduced = false, dead = false,
} = {}) {
  const phase = shieldFilmPhase({ ready, hitAge, reduced, dead });
  if (phase === 'off' || !Number.isFinite(r) || r < 0.8) return;
  const t = reduced ? 0 : (Number.isFinite(time) ? time : 0);
  const angle = Number.isFinite(hitAngle) ? hitAngle : 0;
  const activeHit = phase !== 'ready';
  const impact = activeHit ? Math.max(0, 1 - hitAge / 0.23) : 0;
  const dissolve = phase === 'dissolve' ? clamp((hitAge - 0.19) / (SHIELD_FILM_DURATION - 0.19), 0, 1) : 0;
  const opacity = reduced && activeHit ? 1 - hitAge / SHIELD_FILM_REDUCED_DURATION : 1 - dissolve;
  const stroke = clamp(r * 0.022, 0.65, 2.1);
  // A softly rounded envelope. It follows protruding lobes without redrawing the cell.
  const contour = (a, extra = 0) => {
    let body = r;
    if (points.length) {
      const index = Math.round((((a % TAU) + TAU) % TAU) / TAU * points.length);
      body = 0;
      for (let k = -2; k <= 2; k++) {
        const p = points[(index + k + points.length) % points.length];
        if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) body = Math.max(body, Math.hypot(p.x, p.y));
      }
    }
    // Feeding/hunting arms may reach far outside the body. Do not let those
    // cosmetic extensions inflate the shield or suggest an enlarged hitbox.
    let radius = Math.max(r * 1.17, Math.min(body, r * 1.38) + r * 0.1);
    radius += r * (0.014 * Math.sin(a * 3 + t * 0.55) + 0.01 * Math.cos(a * 2 - t * 0.4));
    if (activeHit && !reduced) {
      const d = delta(a, angle);
      radius -= r * 0.075 * impact * Math.exp(-d * d / 0.055);
      radius += r * 0.022 * impact * Math.sin(Math.abs(d) * 16 - hitAge * 30) * Math.exp(-Math.abs(d) * 2);
    }
    radius += r * (extra + dissolve * 0.2);
    return [Math.cos(a) * radius, Math.sin(a) * radius];
  };
  const path = (start = 0, end = TAU, extra = 0, close = true) => {
    const count = Math.max(8, Math.ceil((end - start) / TAU * 80));
    c.beginPath();
    for (let i = 0; i <= count; i++) {
      const p = contour(start + (end - start) * i / count, extra);
      if (!i) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]);
    }
    if (close) c.closePath();
  };
  c.save();
  c.globalAlpha *= opacity;
  c.lineCap = 'round'; c.lineJoin = 'round';
  if (phase !== 'dissolve') {
    const film = c.createRadialGradient(-r * 0.25, -r * 0.3, r * 0.15, 0, 0, r * 1.32);
    film.addColorStop(0, 'rgba(130,211,232,0)');
    film.addColorStop(0.72, 'rgba(121,203,228,0.008)');
    film.addColorStop(0.88, 'rgba(174,232,244,0.045)');
    film.addColorStop(1, 'rgba(167,225,244,0.1)');
    path(); c.fillStyle = film; c.fill();
    path(); c.strokeStyle = 'rgba(95,182,215,0.12)'; c.lineWidth = stroke * 4.5; c.stroke();
    const pearl = c.createLinearGradient(-r, -r, r, r);
    pearl.addColorStop(0, 'rgba(231,252,255,0.95)');
    pearl.addColorStop(0.23, 'rgba(183,232,248,0.83)');
    pearl.addColorStop(0.47, 'rgba(99,172,198,0.38)');
    pearl.addColorStop(0.75, 'rgba(208,243,250,0.8)');
    pearl.addColorStop(1, 'rgba(131,209,231,0.46)');
    path(); c.strokeStyle = pearl; c.lineWidth = stroke; c.stroke();
    path(0, TAU, -0.026); c.strokeStyle = 'rgba(170,224,242,0.28)'; c.lineWidth = stroke * 0.5; c.stroke();
    // Tapered pearly reflections suggest wet film, not a uniform neon circle.
    for (const [start, end] of [[3.55, 4.75], [0.28, 0.83]]) {
      path(start, end, 0.006, false);
      for (let i = 24; i >= 0; i--) {
        const a = start + (end - start) * i / 24;
        const p = contour(a, -0.04 * Math.sin(i / 24 * Math.PI));
        c.lineTo(p[0], p[1]);
      }
      c.closePath(); c.fillStyle = 'rgba(221,246,252,0.2)'; c.fill();
    }
    // Two restrained specular sweeps, never a halo that obscures nearby threats.
    for (const [a, b] of [[3.5, 4.45], [0.32, 0.68]]) {
      path(a, b, 0.003, false); c.strokeStyle = 'rgba(238,252,255,0.75)'; c.lineWidth = stroke * 1.35; c.stroke();
    }
  } else {
    // Two finite ribbons: the protective circle opens, leaving the player intact.
    for (const offset of [0, Math.PI]) {
      const start = angle + offset + 0.25 + dissolve * 0.48;
      const end = start + Math.PI * (0.78 - dissolve * 0.28);
      path(start, end, 0, false);
      for (let i = 24; i >= 0; i--) {
        const a = start + (end - start) * i / 24;
        const width = Math.sin(i / 24 * Math.PI) * 0.065 * (1 - dissolve * 0.5);
        const p = contour(a, -width); c.lineTo(p[0], p[1]);
      }
      c.closePath(); c.fillStyle = 'rgba(166,222,242,0.14)'; c.fill();
      c.strokeStyle = 'rgba(194,235,250,0.78)'; c.lineWidth = stroke * 0.75; c.stroke();
    }
  }
  if (activeHit && impact > 0) {
    const p = contour(angle);
    const glow = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], r * 0.22);
    glow.addColorStop(0, 'rgba(244,254,255,0.86)'); glow.addColorStop(0.3, 'rgba(155,226,248,0.38)'); glow.addColorStop(1, 'rgba(111,210,238,0)');
    c.save(); c.globalAlpha *= impact; c.fillStyle = glow;
    c.beginPath(); c.arc(p[0], p[1], r * 0.22, 0, TAU); c.fill();
    c.beginPath(); c.arc(p[0], p[1], Math.max(0.85,r * 0.026), 0, TAU);
    c.fillStyle = 'rgba(242,254,255,0.95)'; c.fill();
    if (!reduced) {
      c.strokeStyle = 'rgba(207,244,254,0.7)'; c.lineWidth = stroke * 0.6;
      for (let i = -1; i <= 1; i++) {
        const a = angle + i * 0.5;
        c.beginPath(); c.moveTo(p[0] + Math.cos(a) * r * 0.045, p[1] + Math.sin(a) * r * 0.045);
        c.lineTo(p[0] + Math.cos(a) * r * (i ? 0.105 : 0.16), p[1] + Math.sin(a) * r * (i ? 0.105 : 0.16)); c.stroke();
      }
    }
    c.restore();
    path(angle - 0.32, angle + 0.32, 0.015, false); c.strokeStyle = 'rgba(235,251,255,0.9)'; c.lineWidth = stroke * 1.4; c.stroke();
  }
  if (activeHit && !reduced) {
    for (let i = 0; i < 4; i++) {
      const a = angle + (i - 1.5) * 0.28 + (i % 2 ? Math.PI : 0);
      const distance = r * (1.23 + hitAge * (0.22 + i * 0.045));
      const x = Math.cos(a) * distance, y = Math.sin(a) * distance;
      const size = Math.max(0.55, r * (0.013 + (i % 3) * 0.004)) * (1 - dissolve * 0.45);
      c.beginPath(); c.arc(x, y, size, 0, TAU);
      c.fillStyle = 'rgba(170,224,244,0.18)'; c.fill();
      c.strokeStyle = 'rgba(211,242,252,0.72)'; c.lineWidth = stroke * 0.45; c.stroke();
    }
  }
  c.restore();
}
