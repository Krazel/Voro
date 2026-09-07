import test from 'node:test';
import assert from 'node:assert/strict';
import { TiltControl } from '../app/tilt-control.ts';

test('Tilt only activates after permission and a valid sample; cancellation removes the sensor listener', async () => {
  const saved = Object.fromEntries(['window', 'document', 'screen', 'DeviceOrientationEvent'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  try {
    globalThis.window = Object.assign(new EventTarget(), { isSecureContext: true });
    globalThis.document = { hidden: false };
    Object.defineProperty(globalThis,'screen',{ configurable:true, value:{ orientation:{angle:0} }});
    let permissionCalls = 0;
    globalThis.DeviceOrientationEvent = { requestPermission: async () => { permissionCalls++; return 'denied'; } };
    const control = new TiltControl();
    assert.equal(permissionCalls, 0);
    assert.equal(await control.enable(), false);
    assert.equal(control.enabled, false);
    globalThis.DeviceOrientationEvent.requestPermission = async () => 'granted';
    const enabled = control.enable();
    await Promise.resolve();
    window.dispatchEvent(Object.assign(new Event('deviceorientation'), { beta: 30, gamma: 0 }));
    assert.equal(await enabled, true);
    control.read(false);
    assert.deepEqual(control.read(true), { x: 0, y: 0 });
    control.stop();
    window.dispatchEvent(Object.assign(new Event('deviceorientation'), { beta: 70, gamma: 50 }));
    assert.equal(control.sensor.lastSample, 0);
    const pending = control.enable();
    await Promise.resolve();
    control.stop();
    assert.equal(await pending, false);
    assert.equal(control.enabled, false);
  } finally {
    for (const [key, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(globalThis,key,descriptor); else delete globalThis[key];
    }
  }
});
