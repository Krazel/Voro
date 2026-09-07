import { TiltInput } from './tilt-input.mjs';
type OrientationPermission = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
export class TiltControl {
  enabled = false;
  sensor = new TiltInput();
  private generation = 0;
  private cleanup: (() => void) | null = null;
  private active = false;
  calibrate() { this.sensor.reset(); }
  stop() { this.generation++; this.cleanup?.(); this.cleanup = null; this.enabled = false; this.active = false; this.calibrate(); }
  async enable() {
    this.stop();
    const generation = this.generation;
    if (!window.isSecureContext || typeof DeviceOrientationEvent === 'undefined') return false;
    try {
      const api = DeviceOrientationEvent as OrientationPermission;
      if (api.requestPermission && await api.requestPermission() !== 'granted') return false;
    } catch { return false; }
    if (generation !== this.generation) return false;
    return new Promise<boolean>(resolve => {
      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true; clearTimeout(timer);
        if (ok) this.enabled = true;
        resolve(ok);
      };
      const handler = (e: DeviceOrientationEvent) => {
        if (document.hidden) return;
        // iOS WebViews predating Screen Orientation still expose window.orientation.
        // oxlint-disable-next-line typescript/no-deprecated
        const angle = screen.orientation?.angle ?? (window as Window & { orientation?: number }).orientation ?? 0;
        if (this.sensor.sample(e.beta, e.gamma, angle, performance.now())) finish(true);
      };
      const timer = setTimeout(() => { this.stop(); finish(false); }, 3000);
      window.addEventListener('deviceorientation', handler);
      this.cleanup = () => { window.removeEventListener('deviceorientation', handler); finish(false); };
    });
  }
  read(active: boolean) {
    if (!active || !this.active) this.calibrate();
    this.active = active;
    return this.enabled && active ? (this.sensor.read(performance.now()) ?? { x: 0, y: 0 }) : { x: 0, y: 0 };
  }
}
