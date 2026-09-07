export class TiltInput {
  constructor() { this.reset(); }
  reset() { this.neutral = null; this.target = { x: 0, y: 0 }; this.output = { x: 0, y: 0 }; this.lastSample = 0; this.lastRead = 0; this.angle = null; }
  sample(beta, gamma, angle, now) {
    if (!Number.isFinite(beta) || !Number.isFinite(gamma)) return false;
    if (angle !== this.angle) { this.reset(); this.angle = angle; }
    if (!this.neutral) this.neutral = { beta, gamma };
    const wrap = v => ((v + 540) % 360) - 180;
    const a = angle * Math.PI / 180, b = wrap(beta - this.neutral.beta), g = wrap(gamma - this.neutral.gamma);
    const x = g * Math.cos(a) + b * Math.sin(a), y = b * Math.cos(a) - g * Math.sin(a);
    const length = Math.hypot(x, y), speed = Math.min(1, Math.max(0, (length - 3) / 17));
    this.target = length ? { x: x / length * speed, y: y / length * speed } : { x: 0, y: 0 };
    this.lastSample = now;
    return true;
  }
  read(now) {
    if (now - this.lastSample > 500) { this.reset(); return this.output; }
    const dt = this.lastRead ? Math.min(0.1, (now - this.lastRead) / 1000) : 1 / 60;
    this.lastRead = now;
    const f = 1 - Math.exp(-dt * 14);
    this.output.x += (this.target.x - this.output.x) * f;
    this.output.y += (this.target.y - this.output.y) * f;
    return this.output;
  }
}
