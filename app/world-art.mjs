const TAU = Math.PI * 2;
function ellipse(c, x, y, rx, ry, color) {
  c.beginPath();
  c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), 0, 0, TAU);
  if (color) c.fillStyle = color;
  c.fill();
}
function sphere(c, r, colors) {
  const g = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.03, 0, 0, r);
  colors.forEach((color, i) => g.addColorStop(i / (colors.length - 1), color));
  ellipse(c, 0, 0, r, r, g);
}
/** Render edible bodies both in the world and intact inside the membrane. */
export function drawEntity(c, kind, r, seed, time) {
  c.save();
  const wave = Math.sin(time * 3 + seed);
  if (kind === 'nutrient' || kind === 'bacteria') {
    c.scale(kind === 'bacteria' ? 1.5 : 1, 0.85);
    sphere(c, r, ['#fff1bd', '#edbd64', '#92501e']);
    ellipse(c, -r * 0.28, -r * 0.3, r * 0.2, r * 0.13, '#fff5d1aa');
  } else if (kind === 'fish' || kind === 'krill') {
    c.fillStyle = kind === 'fish' ? '#bcb59a' : '#dca584';
    c.beginPath();
    c.moveTo(-r * 0.5, 0);
    c.lineTo(-r * 1.35, -r * 0.55 + wave * r * 0.12);
    c.quadraticCurveTo(-r * 0.8, 0, -r * 1.35, r * 0.55 + wave * r * 0.12);
    c.closePath();
    c.fill();
    c.save();
    c.scale(1, 0.48);
    sphere(c, r, ['#fff0ba', '#a99065', '#314955']);
    c.restore();
    c.strokeStyle = '#dbd7b577';
    c.lineWidth = 0.7;
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      c.ellipse((i - 2) * r * 0.18, 0, r * 0.15, r * 0.34, 0, -1.5, 1.5);
      c.stroke();
    }
    ellipse(c, r * 0.58, -r * 0.12, r * 0.095, r * 0.095, '#0d202b');
    ellipse(c, r * 0.6, -r * 0.14, r * 0.028, r * 0.028, '#e9f1d4');
  } else if (kind === 'jelly') {
    c.strokeStyle = '#cedaab88';
    c.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      const x = (i - 3) * r * 0.2;
      c.beginPath();
      c.moveTo(x, 0);
      c.bezierCurveTo(
        x + wave * r * 0.3,
        r * 0.6,
        x - wave * r * 0.25,
        r,
        x + Math.sin(time * 2 + i) * r * 0.3,
        r * 1.65,
      );
      c.stroke();
    }
    const g = c.createRadialGradient(-r * 0.2, -r * 0.4, 0, 0, 0, r);
    g.addColorStop(0, '#c8d5a9cc');
    g.addColorStop(0.65, '#7aa19b99');
    g.addColorStop(1, '#b4e6cdcc');
    c.beginPath();
    c.arc(0, 0, r, Math.PI, 0);
    c.quadraticCurveTo(0, r * 0.45, -r, 0);
    c.fillStyle = g;
    c.fill();
    ellipse(c, 0, -r * 0.2, r * 0.22, r * 0.14, '#edc287cc');
  } else if (kind === 'mushroom') {
    c.fillStyle = '#bdb3a4';
    c.fillRect(-r * 0.13, 0, r * 0.26, r * 0.8);
    c.save();
    c.scale(1, 0.7);
    sphere(c, r, ['#e4c298', '#95724f', '#453a30']);
    c.restore();
    for (let i = 0; i < 7; i++) {
      const a = i * 2.399;
      ellipse(
        c,
        Math.cos(a) * r * 0.65,
        Math.sin(a) * r * 0.43,
        r * 0.08,
        r * 0.055,
        '#d8c6a283',
      );
    }
  } else if (kind === 'beetle') {
    c.strokeStyle = '#b49975';
    c.lineWidth = Math.max(0.8, r * 0.07);
    for (let i = 0; i < 6; i++) {
      const s = i % 2 ? 1 : -1,
        y = (Math.floor(i / 2) - 1) * r * 0.5;
      c.beginPath();
      c.moveTo(s * r * 0.3, y);
      c.lineTo(s * r * 0.8, y + Math.sin(time * 9 + i) * r * 0.15);
      c.lineTo(s * r, y + r * 0.3);
      c.stroke();
    }
    c.save();
    c.scale(0.6, 1);
    sphere(c, r, ['#beac78', '#5f6351', '#192d28']);
    c.restore();
    c.strokeStyle = '#142f2a';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, -r);
    c.lineTo(0, r);
    c.stroke();
    ellipse(c, 0, -r * 0.9, r * 0.29, r * 0.24, '#344d42');
  } else if (kind === 'fern') {
    c.strokeStyle = '#a7b180';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(0, r);
    c.quadraticCurveTo(wave * r * 0.1, 0, 0, -r);
    c.stroke();
    for (let i = 0; i < 9; i++) {
      const y = r * 0.8 - i * r * 0.19,
        w = r * (0.65 - i * 0.05);
      for (const s of [-1, 1]) {
        c.save();
        c.translate(s * w * 0.5, y);
        c.rotate(s * -0.4);
        ellipse(c, 0, 0, w * 0.65, r * 0.12, i % 2 ? '#586d47' : '#879267');
        c.restore();
      }
    }
  } else if (kind === 'car') {
    c.fillStyle = '#171f26';
    for (const x of [-0.5, 0.5])
      for (const y of [-0.55, 0.55])
        c.fillRect(x * r - r * 0.12, y * r, r * 0.24, r * 0.25);
    const g = c.createLinearGradient(-r, 0, r, 0);
    g.addColorStop(0, '#6c7477');
    g.addColorStop(0.5, '#c5b99c');
    g.addColorStop(1, '#4a616a');
    c.fillStyle = g;
    c.fillRect(-r * 0.48, -r, r * 0.96, r * 2);
    c.fillStyle = '#284454';
    c.fillRect(-r * 0.34, -r * 0.56, r * 0.68, r * 0.35);
    c.fillRect(-r * 0.34, r * 0.34, r * 0.68, r * 0.29);
    for (const x of [-0.36, 0.26]) c.fillRect(x * r, -r, r * 0.1, r * 0.12);
  } else if (kind === 'building' || kind === 'tower') {
    c.fillStyle = '#06131daa';
    c.fillRect(-r * 0.6 + 6, -r + 8, r * 1.2, r * 2);
    const g = c.createLinearGradient(-r, -r, r, r);
    g.addColorStop(0, '#a7afa9');
    g.addColorStop(0.45, '#6a7a7c');
    g.addColorStop(1, '#304551');
    c.fillStyle = g;
    c.fillRect(-r * 0.62, -r, r * 1.24, r * 2);
    c.strokeStyle = '#bcc9ba99';
    c.lineWidth = 1;
    c.strokeRect(-r * 0.62, -r, r * 1.24, r * 2);
    c.fillStyle = '#334952';
    c.fillRect(-r * 0.44, -r * 0.75, r * 0.88, r * 1.5);
    for (let i = 0; i < 8; i++) {
      c.fillStyle = i % 3 ? '#d3b97799' : '#7096a4';
      c.fillRect(-r * 0.3, -r * 0.63 + i * r * 0.18, r * 0.22, r * 0.08);
      c.fillRect(r * 0.12, -r * 0.63 + i * r * 0.18, r * 0.22, r * 0.08);
    }
    if (kind === 'tower') {
      c.strokeStyle = '#b7c5bf';
      c.beginPath();
      c.moveTo(0, -r);
      c.lineTo(0, -r * 1.4);
      c.stroke();
      ellipse(c, 0, -r * 1.4, 2, 2, '#efb67b');
    }
  } else if (kind === 'satellite' || kind === 'drone') {
    c.save();
    c.rotate(time * 0.2);
    c.strokeStyle = '#afc1c9';
    c.lineWidth = r * 0.12;
    c.beginPath();
    c.moveTo(-r, 0);
    c.lineTo(r, 0);
    c.stroke();
    for (const s of [-1, 1]) {
      c.fillStyle = '#355f79';
      c.fillRect(s * r * 0.65 - r * 0.23, -r * 0.65, r * 0.46, r * 1.3);
      c.strokeStyle = '#89a9b9';
      c.lineWidth = 0.7;
      c.strokeRect(s * r * 0.65 - r * 0.23, -r * 0.65, r * 0.46, r * 1.3);
      for (let i = 0; i < 4; i++) {
        c.beginPath();
        c.moveTo(s * r * 0.65 - r * 0.23, (-0.4 + i * 0.28) * r);
        c.lineTo(s * r * 0.65 + r * 0.23, (-0.4 + i * 0.28) * r);
        c.stroke();
      }
    }
    c.save();
    c.scale(0.35, 0.65);
    sphere(c, r, ['#f1dbc0', '#9a947a', '#495764']);
    c.restore();
    c.restore();
  } else if (kind === 'asteroid' || kind === 'moon') {
    sphere(c, r, ['#c9c0aa', '#787a73', '#293643']);
    c.save();
    c.beginPath();
    c.arc(0, 0, r, 0, TAU);
    c.clip();
    for (let i = 0; i < 11; i++) {
      const a = i * 2.399 + seed,
        d = Math.sqrt((i * 0.618) % 1) * r,
        rr = r * (0.07 + (i % 3) * 0.04);
      ellipse(c, Math.cos(a) * d, Math.sin(a) * d, rr, rr, '#303c4355');
      c.strokeStyle = '#d2c5a744';
      c.lineWidth = 0.7;
      c.beginPath();
      c.arc(Math.cos(a) * d, Math.sin(a) * d, rr, -2.7, 0.2);
      c.stroke();
    }
    c.restore();
  } else if (kind === 'planet' || kind === 'gaia' || kind === 'gas') {
    const gas = kind === 'gas';
    sphere(
      c,
      r,
      gas
        ? ['#e8ce9e', '#a28466', '#303750']
        : ['#98d1d6', '#367794', '#102940'],
    );
    c.save();
    c.beginPath();
    c.arc(0, 0, r, 0, TAU);
    c.clip();
    for (let i = 0; i < 7; i++) {
      const y = (i - 3) * r * 0.27;
      c.strokeStyle = gas ? (i % 2 ? '#dfb68677' : '#80695988') : '#d8e2cc66';
      c.lineWidth = r * (gas ? 0.1 : 0.045);
      c.beginPath();
      c.moveTo(-r, y);
      c.bezierCurveTo(
        -r * 0.3,
        y - r * 0.17,
        r * 0.25,
        y + r * 0.18,
        r,
        y + r * 0.05,
      );
      c.stroke();
    }
    if (!gas) {
      for (let i = 0; i < 5; i++) {
        const a = i * 2.399 + seed + time * 0.015,
          x = Math.cos(a) * r * 0.55,
          y = Math.sin(a * 1.7) * r * 0.62;
        c.fillStyle = i % 2 ? '#82986b' : '#97a780';
        c.beginPath();
        for (let j = 0; j < 9; j++) {
          const b = (j * TAU) / 9,
            rr = r * (0.13 + Math.sin(j * 2 + i) * 0.055);
          const xx = x + Math.cos(b) * rr,
            yy = y + Math.sin(b) * rr * 1.7;
          if (j === 0) c.moveTo(xx, yy);
          else c.lineTo(xx, yy);
        }
        c.closePath();
        c.fill();
      }
    }
    const shade = c.createLinearGradient(-r, -r, r, r);
    shade.addColorStop(0, '#ffffff09');
    shade.addColorStop(0.5, '#07132400');
    shade.addColorStop(1, '#020916dd');
    c.fillStyle = shade;
    c.fillRect(-r, -r, r * 2, r * 2);
    c.restore();
    c.strokeStyle = '#b9e4ee80';
    c.lineWidth = 1;
    c.beginPath();
    c.arc(0, 0, r, -2.7, 0.8);
    c.stroke();
    if (gas) {
      c.save();
      c.rotate(-0.35);
      c.strokeStyle = '#c4b19788';
      c.lineWidth = r * 0.14;
      c.beginPath();
      c.ellipse(0, 0, r * 1.5, r * 0.4, 0, 0, Math.PI);
      c.stroke();
      c.restore();
    }
  } else if (kind === 'storm') {
    for (let i = 0; i < 8; i++) {
      c.strokeStyle = `rgba(242,153,102,${0.15 + i * 0.035})`;
      c.lineWidth = 1 + i * 0.3;
      c.beginPath();
      c.arc(
        0,
        0,
        r * (0.3 + i * 0.08),
        time * (i % 2 ? 0.6 : -0.7) + i,
        time * (i % 2 ? 0.6 : -0.7) + i + 4.2,
      );
      c.stroke();
    }
    sphere(c, r * 0.35, ['#fff1b3', '#de944b', '#533657']);
  }
  c.restore();
}
