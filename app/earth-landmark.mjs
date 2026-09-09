// The orbital arena and its painting use the same world coordinates.
export const ORBITAL_EARTH = { x: 700, y: 1750, radius: 620, softLimit: 1200, limit: 1550 };
export function constrainOrbit(p, dt) {
  const e = ORBITAL_EARTH, dx = p.x - e.x, dy = p.y - e.y;
  const d = Math.hypot(dx, dy), nx = d ? dx / d : 0, ny = d ? dy / d : -1;
  // A broad free ring, then increasingly strong inward drift. The final bound
  // also handles upgraded dash, knockback and saves from the old endless orbit.
  const pull = Math.max(0, d - e.softLimit) * (1 - Math.exp(-dt * 2.5));
  const distance = Math.max(e.radius + p.radius * .45, Math.min(e.limit, d - pull));
  p.x = e.x + nx * distance; p.y = e.y + ny * distance;
  if (d >= e.limit || d < e.radius + p.radius * .45) {
    const radial = p.vx * nx + p.vy * ny;
    if ((d >= e.limit && radial > 0) || (d < e.radius + p.radius * .45 && radial < 0)) {
      p.vx -= radial * nx; p.vy -= radial * ny;
    }
  }
}
export function canAbsorbEarth(p) {
  return p.biomass >= p.goalMass && Math.hypot(p.x - ORBITAL_EARTH.x, p.y - ORBITAL_EARTH.y)
    <= ORBITAL_EARTH.radius + p.radius + 65;
}
/** @param {{x:number,y:number,biomass:number,goalMass:number}|null} life */
export function drawOrbitalEarth(c, image, camera, height, zoom = 1, life = null, absorption = 0) {
  if (!image?.naturalWidth) return;
  const t = Math.max(0, Math.min(1, absorption)), ease = t * t * (3 - 2 * t);
  const wx = ORBITAL_EARTH.x + ((life?.x ?? ORBITAL_EARTH.x) - ORBITAL_EARTH.x) * ease;
  const wy = ORBITAL_EARTH.y + ((life?.y ?? ORBITAL_EARTH.y) - ORBITAL_EARTH.y) * ease;
  const x = 240 + (wx - camera.x) * zoom;
  const y = height * .48 + (wy - camera.y) * zoom;
  const r = ORBITAL_EARTH.radius * zoom * (1 - ease * .98);
  if (x + r < 0 || x - r > 480 || y + r < 0 || y - r > height) {
    const dx = x - 240, dy = y - height * .48;
    const angle = Math.atan2(dy, dx);
    const arrow = ['→','↘','↓','↙','←','↖','↑','↗'][(Math.round(angle / (Math.PI / 4)) + 8) % 8];
    c.save(); c.fillStyle = '#e0eef4'; c.font = '12px Arial'; c.textAlign = 'center';
    c.fillText(`TIERRA ${arrow}`, Math.max(70,Math.min(410,x)), Math.max(165,Math.min(height-125,y)));
    c.restore(); return;
  }
  c.save();
  c.drawImage(image, x - r, y - r, r * 2, r * 2);
  c.fillStyle = '#e0eef4';
  c.textAlign = 'center';
  c.font = '11px Arial';
  c.fillText(t > 0 ? 'TU MUNDO VUELVE A TI' : life?.biomass >= life?.goalMass
    ? 'LA TIERRA · ACÉRCATE PARA ABSORBERLA' : 'LA TIERRA · REÚNE BIOMASA EN SU ÓRBITA',
    240, Math.max(110, Math.min(height - 120, y - r + 28)));
  c.restore();
}
