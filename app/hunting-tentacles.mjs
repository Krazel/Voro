// Target selection and contact live in the simulation, never in rendering.
export class HuntingTentacles {
  arms = [];
  clear() {
    this.arms = [];
  }
  update(dt, p, food, count) {
    if (p.dead || count === 0) {
      this.clear();
      return;
    }
    const reach = p.radius * 2.15 + 24;
    while (this.arms.length < count)
      this.arms.push({
        target: null,
        x: p.x,
        y: p.y,
        angle: 0,
        grip: 0,
        retract: false,
      });
    this.arms.length = count;
    const occupied = new Set(this.arms.map((a) => a.target).filter(Boolean));
    for (const [index, a] of this.arms.entries()) {
      let f = a.target;
      if (
        f &&
        (f.eaten ||
          !food.includes(f) ||
          p.biomass < (f.requiredMass || 0) ||
          Math.hypot(f.x - p.x, f.y - p.y) > reach * 1.15)
      ) {
        occupied.delete(f);
        a.target = null;
        a.grip = 0;
        a.retract = true;
        f = null;
      }
      if (!f && !a.retract) {
        f = food
          .filter(
            (e) =>
              !e.eaten &&
              !occupied.has(e) &&
              p.biomass >= (e.requiredMass || 0) &&
              Math.hypot(e.x - p.x, e.y - p.y) > p.radius * 0.85 &&
              Math.hypot(e.x - p.x, e.y - p.y) < reach,
          )
          .sort(
            (a, b) =>
              Math.hypot(a.x - p.x, a.y - p.y) -
              Math.hypot(b.x - p.x, b.y - p.y),
          )[0];
        if (f) {
          a.target = f;
          occupied.add(f);
        }
      }
      const targetAngle = f ? Math.atan2(f.y - p.y, f.x - p.x) : a.angle;
      a.angle +=
        Math.atan2(
          Math.sin(targetAngle - a.angle),
          Math.cos(targetAngle - a.angle),
        ) * Math.min(1, dt * 7);
      const rootX = p.x + Math.cos(a.angle) * p.radius * 0.76,
        rootY = p.y + Math.sin(a.angle) * p.radius * 0.76;
      if (f) {
        const dx = f.x - a.x,
          dy = f.y - a.y,
          d = Math.hypot(dx, dy),
          step = Math.min(d, dt * (160 + p.radius * 3));
        a.x += (dx / Math.max(1, d)) * step;
        a.y += (dy / Math.max(1, d)) * step;
        if (d < Math.max(5, (f.r || 6) * 0.6) || a.grip > 0) {
          a.grip = Math.min(1, a.grip + dt * 5);
          // The grip closes visibly before hauling. Do not teleport or consume remotely.
          if (a.grip > 0.55) {
            const d = Math.hypot(f.x - p.x, f.y - p.y),
              step = Math.min(
                Math.max(0, d - p.radius * 0.8),
                (110 + p.radius * 0.5) * dt * a.grip,
              );
            f.x += ((p.x - f.x) / Math.max(1, d)) * step;
            f.y += ((p.y - f.y) / Math.max(1, d)) * step;
          }
          a.x = f.x;
          a.y = f.y;
        }
      } else {
        const rest = a.retract ? 0 : 0.2 * p.radius;
        const tx = rootX + Math.cos(a.angle) * rest,
          ty = rootY + Math.sin(a.angle) * rest;
        a.x += (tx - a.x) * Math.min(1, dt * 10);
        a.y += (ty - a.y) * Math.min(1, dt * 10);
        if (Math.hypot(a.x - rootX, a.y - rootY) < 3) a.retract = false;
      }
      // A fast player or a moving target cannot leave an arm stretched across the world.
      const d = Math.hypot(a.x - p.x, a.y - p.y);
      if (d > reach * 1.2) {
        a.x = p.x + ((a.x - p.x) / d) * reach;
        a.y = p.y + ((a.y - p.y) / d) * reach;
      }
      a.phase = index * 2.4;
    }
  }
  draw(c, p, time, reduced = false) {
    for (const a of this.arms) {
      const root = {
        x: p.x + Math.cos(a.angle) * p.radius * 0.72,
        y: p.y + Math.sin(a.angle) * p.radius * 0.72,
      };
      const dx = a.x - root.x,
        dy = a.y - root.y,
        len = Math.hypot(dx, dy);
      if (len < 2) continue;
      const nx = -dy / len,
        ny = dx / len,
        bend =
          Math.sin((reduced ? 0 : time * 5) + (a.phase || 0)) *
          Math.min(22, len * 0.23);
      const points = [];
      for (let i = 0; i <= 24; i++) {
        const u = i / 24,
          wave = Math.sin(u * Math.PI) * bend;
        let x = root.x + dx * u + nx * wave,
          y = root.y + dy * u + ny * wave;
        if (a.grip > 0 && u > 0.68) {
          const v = (u - 0.68) / 0.32,
            rad = Math.min(p.radius * 0.32, (a.target?.r || 6) * 0.8) * a.grip;
          x += Math.cos(a.angle + v * Math.PI * 1.4) * rad * v;
          y += Math.sin(a.angle + v * Math.PI * 1.4) * rad * v;
        }
        points.push({
          x,
          y,
          width: Math.max(0.8, p.radius * 0.17 * (1 - u) ** 1.1),
        });
      }
      const gradient = c.createLinearGradient(root.x, root.y, a.x, a.y);
      gradient.addColorStop(0, '#6cbbcce6');
      gradient.addColorStop(0.6, '#599fbadf');
      gradient.addColorStop(1, '#aad6c6ee');
      c.save();
      c.beginPath();
      for (let side = 0; side < 2; side++)
        for (let j = 0; j < points.length; j++) {
          const i = side ? points.length - 1 - j : j,
            q = points[i],
            before = points[Math.max(0, i - 1)],
            after = points[Math.min(24, i + 1)];
          const d = Math.max(
              1,
              Math.hypot(after.x - before.x, after.y - before.y),
            ),
            sign = side ? -1 : 1;
          const x = q.x - ((after.y - before.y) / d) * q.width * sign,
            y = q.y + ((after.x - before.x) / d) * q.width * sign;
          if (!side && !j) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
      c.closePath();
      c.fillStyle = gradient;
      c.fill();
      c.strokeStyle = '#c1eef075';
      c.lineWidth = 0.7;
      c.stroke();
      c.beginPath();
      points.forEach((q, i) =>
        i
          ? c.lineTo(q.x - nx * q.width * 0.3, q.y - ny * q.width * 0.3)
          : c.moveTo(q.x, q.y),
      );
      c.strokeStyle = '#d5f8ee62';
      c.lineWidth = Math.max(0.8, p.radius * 0.022);
      c.stroke();
      // Organic nodules run along the inner surface and curl with the grip.
      for (let i = 5; i < 22; i += 3) {
        const q = points[i];
        c.beginPath();
        c.arc(q.x, q.y, Math.max(0.7, q.width * 0.3), 0, Math.PI * 2);
        c.fillStyle = '#d4eacb88';
        c.fill();
      }
      c.restore();
    }
  }
}
