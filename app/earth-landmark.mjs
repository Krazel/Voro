
import { t as tr } from './language.mjs';
// The orbital arena and its painting use the same world coordinates.
export const ORBITAL_EARTH = { x: 700, y: 1750, radius: 1200, softLimit: 1780, limit: 2130 };
export function earthConsumptionPose(life, absorption=0) {
  const t=Math.max(0,Math.min(1,absorption)),ease=t*t*(3-2*t),e=ORBITAL_EARTH;
  const reach=e.radius+Math.hypot(life.x-e.x,life.y-e.y)+100;
  const radius=life.radius+(Math.max(life.radius,reach)-life.radius)*ease;
  return {scale:radius/Math.max(.01,life.radius),radius,
    cameraX:life.x+(e.x-life.x)*ease*.5,cameraY:life.y+(e.y-life.y)*ease*.5};
}
// The cell first envelops the planet, then its captured material travels all
// the way into the same moving nucleus used by the protagonist renderer.
export function earthMealPose(life, absorption=0, nucleus={x:0,y:0}) {
  const u=Math.max(0,Math.min(1,(absorption-.38)/.62)),ease=u*u*(3-2*u);
  const growth=earthConsumptionPose(life,absorption);
  const targetX=life.x+nucleus.x*growth.scale,targetY=life.y+nucleus.y*growth.scale;
  return {x:ORBITAL_EARTH.x+(targetX-ORBITAL_EARTH.x)*ease,
    y:ORBITAL_EARTH.y+(targetY-ORBITAL_EARTH.y)*ease,
    radius:ORBITAL_EARTH.radius*(1-ease),alpha:1-Math.max(0,(u-.96)/.04)};
}
export function orbitHintOpacity(elapsed = 0) {
  const fade = Math.max(0, Math.min(1, (elapsed - 5) / 3));
  return 1 - fade * fade * (3 - 2 * fade);
}
export function constrainOrbit(p, dt) {
  const e = ORBITAL_EARTH, dx = p.x - e.x, dy = p.y - e.y;
  const d = Math.hypot(dx, dy), nx = d ? dx / d : 0, ny = d ? dy / d : -1;
  // A broad free ring, then increasingly strong inward drift. The final bound
  // also handles upgraded dash, knockback and saves from the old endless orbit.
  const pull = Math.max(0, d - e.softLimit) * (1 - Math.exp(-dt * 2.5));
  const distance = Math.max(0, Math.min(e.limit, d - pull));
  p.x = e.x + nx * distance; p.y = e.y + ny * distance;
  if (d >= e.limit) {
    const radial = p.vx * nx + p.vy * ny;
    if (radial > 0) {
      p.vx -= radial * nx; p.vy -= radial * ny;
    }
  }
}
export function canAbsorbEarth(p) {
  return p.biomass >= p.goalMass && Math.hypot(p.x - ORBITAL_EARTH.x, p.y - ORBITAL_EARTH.y)
    <= ORBITAL_EARTH.radius + p.radius + 65;
}
/** @param {{x:number,y:number,biomass:number,goalMass:number,elapsed?:number}|null} life */
export function drawOrbitalEarth(c, image, camera, height, zoom = 1, life = null, absorption = 0, width = 480, nucleus={x:0,y:0}) {
  if (!image?.naturalWidth) return;
  const t = Math.max(0, Math.min(1, absorption));
  // Painting, absorption and gravity share one world-space planet.
  const meal=life && t>0?earthMealPose(life,t,nucleus):{x:ORBITAL_EARTH.x,y:ORBITAL_EARTH.y,radius:ORBITAL_EARTH.radius,alpha:1};
  const originX = width/2 + (meal.x - camera.x) * zoom;
  const originY = height * .48 + (meal.y - camera.y) * zoom;
  const x = originX, y = originY;
  const r = meal.radius * zoom;
  if(r<.001)return;
  if (x + r < 0 || x - r > width || y + r < 0 || y - r > height) {
    const dx = x - width/2, dy = y - height * .48;
    const angle = Math.atan2(dy, dx);
    const arrow = ['→','↘','↓','↙','←','↖','↑','↗'][(Math.round(angle / (Math.PI / 4)) + 8) % 8];
    c.save(); c.fillStyle = '#e0eef4'; c.font = '12px Arial'; c.textAlign = 'center';
    c.fillText(tr(`TIERRA ${arrow}`), Math.max(70,Math.min(width-70,x)), Math.max(165,Math.min(height-125,y)));
    c.restore(); return;
  }
  c.save();
  c.globalAlpha *= meal.alpha;
  // Use the photographic source's complete globe, avoiding a rectangular
  // backdrop. The 8000px original supplies real detail at orbital scale.
  c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.clip();
  const n=image.naturalWidth;
  c.drawImage(image,n*.073125,n*.064375,n*.85375,n*.85375,x-r,y-r,r*2,r*2);
  c.restore();c.save();
  // The framed cinematic caption already announces the absorption.
  if(t>0){c.restore();return;}
  c.globalAlpha *= t > 0 ? 1 : orbitHintOpacity(life?.elapsed);
  c.fillStyle = '#e0eef4';
  c.textAlign = 'center';
  c.font = '11px Arial';
  c.fillText(tr(t > 0 ? 'TU MUNDO VUELVE A TI' : life?.biomass >= life?.goalMass
    ? 'LA TIERRA · ACÉRCATE PARA ABSORBERLA' : 'LA TIERRA · REÚNE BIOMASA EN SU ÓRBITA'),
    width/2, Math.max(110, Math.min(height - 120, y - r + 28)));
  c.restore();
}
