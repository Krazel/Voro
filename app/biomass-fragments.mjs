import { radiusForMass } from './simulation.mjs';

export function shedBiomass(p, mass, kind) {
  return Array.from({ length: 5 }, (_, i) => {
    const a = p.hitAngle + (i - 2) * 0.68;
    const speed = 150 + p.radius * 0.8 + i * 13;
    return {
      x: p.x + Math.cos(a) * p.radius * 0.86,
      y: p.y + Math.sin(a) * p.radius * 0.86,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      seed: i * 1.71,
      heading: a,
      age: 0,
      collectDelay: 0.85,
      eaten: false,
      rod: false,
      kind,
      recycled: true,
      requiredMass: 0,
      r: Math.max(4, radiusForMass(mass / 5) * 0.8),
      value: mass / 5,
    };
  });
}

export function moveFragments(fragments, dt) {
  for (const f of fragments) {
    if (f.eaten) continue;
    f.age += dt;
    f.collectDelay = Math.max(0, f.collectDelay - dt);
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    f.vx *= Math.exp(-dt * 2.2);
    f.vy *= Math.exp(-dt * 2.2);
    f.heading += dt * 0.45 * Math.exp(-f.age);
  }
}

// The same transparent blue membrane, fibres and organelles as the protagonist.
// These are torn lobes of cytoplasm, without a second nucleus.
export function drawBiomassFragment(c, r, seed, time) {
  c.save();
  const path = (scale = 1) => {
    c.beginPath();
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const edge =
        r *
        scale *
        (0.88 +
          0.13 * Math.sin(a * 3 + seed) +
          0.07 * Math.sin(a * 5 - time * 2));
      const x = Math.cos(a) * edge,
        y = Math.sin(a) * edge * 0.78;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.closePath();
  };
  path();
  const fill = c.createRadialGradient(-r * 0.28, -r * 0.3, 0, 0, 0, r * 1.2);
  fill.addColorStop(0, 'rgba(25,99,129,.62)');
  fill.addColorStop(0.5, 'rgba(12,65,102,.38)');
  fill.addColorStop(1, 'rgba(162,230,239,.55)');
  c.fillStyle = fill;
  c.fill();
  c.strokeStyle = 'rgba(155,223,239,.9)';
  c.lineWidth = 1.25;
  c.shadowColor = '#78daf3';
  c.shadowBlur = 4;
  c.stroke();
  c.shadowBlur = 0;
  path(0.9);
  c.strokeStyle = 'rgba(109,185,214,.5)';
  c.lineWidth = 0.6;
  c.stroke();
  for (let i = 0; i < 8; i++) {
    const a = i * 2.399 + seed;
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(
      Math.cos(a + 0.4) * r * 0.4,
      Math.sin(a + 0.4) * r * 0.3,
      Math.cos(a) * r * 0.75,
      Math.sin(a) * r * 0.55,
    );
    c.strokeStyle = 'rgba(152,225,237,.3)';
    c.stroke();
    c.beginPath();
    c.ellipse(
      Math.cos(a) * r * 0.4,
      Math.sin(a) * r * 0.3,
      r * 0.09,
      r * 0.065,
      a,
      0,
      Math.PI * 2,
    );
    c.fillStyle = i % 3 === 0 ? 'rgba(228,179,78,.6)' : 'rgba(164,215,218,.45)';
    c.fill();
  }
  c.restore();
}
