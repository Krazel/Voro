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
  // Pseudopods are a continuous part of the existing cell outline. Every
  // membrane fill, rim, cytoplasm clip and internal fibre follows this shape.
  deform(points, p, time) {
    if (!this.arms.length || p.dead) return points;
    return points.map((point) => {
      let x = point.x,
        y = point.y;
      const theta = Math.atan2(y, x);
      for (const arm of this.arms) {
        const dx = arm.x - p.x,
          dy = arm.y - p.y,
          d = Math.hypot(dx, dy);
        const extension = Math.max(0, d - p.radius * 0.92);
        if (extension < 0.5) continue;
        const angle = Math.atan2(dy, dx);
        const delta = Math.atan2(
          Math.sin(theta - angle),
          Math.cos(theta - angle),
        );
        const spread = 0.22,
          weight = Math.exp((-delta * delta) / (spread * spread));
        const sweep =
          Math.sin(time * 4 + (arm.phase || 0)) *
          extension *
          0.1 *
          weight *
          (1 - weight);
        const preyRadius = arm.target?.r || 5;
        const cup = arm.grip * Math.min(preyRadius * 0.9, p.radius * 0.25);
        // A pair of soft lips closes around the food as the lobe reaches it.
        const notch = cup * Math.exp((-delta * delta) / 0.005);
        const stretch = extension * weight - notch;
        x += Math.cos(angle) * stretch - Math.sin(angle) * sweep;
        y += Math.sin(angle) * stretch + Math.cos(angle) * sweep;
      }
      return { x, y };
    });
  }
}
