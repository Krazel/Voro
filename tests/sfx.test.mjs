import test from 'node:test';
import assert from 'node:assert/strict';
import { INGEST_SOUNDS, SfxPlayer } from '../app/sfx.mjs';

test('Approved ingest variants decode, rate-limit and never repeat consecutively', async () => {
  let time = 1000, random = 0, starts = 0;
  const decoded = [];
  const context = {
    resume: async () => {},
    decodeAudioData: async data => { decoded.push(data.byteLength); return { id: decoded.length }; },
    createBufferSource: () => ({
      buffer: null, playbackRate: { value: 1 },
      connect() {},
      disconnect() {},
      start() { starts++; },
    }),
  };
  const requested = [];
  const player = new SfxPlayer(context, {}, {
    fetcher: async url => { requested.push(url); return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) }; },
    random: () => random,
    now: () => time,
  });
  await player.unlock();
  assert.deepEqual(requested, INGEST_SOUNDS);
  assert.equal(player.playIngest(), true);
  assert.equal(player.last, 0);
  time += 100;
  assert.equal(player.playIngest(), false);
  time += 300; random = 0;
  assert.equal(player.playIngest(), true);
  assert.equal(player.last, 1);
  assert.equal(starts, 2);
  player.destroy();
  time += 400;
  assert.equal(player.playIngest(), false);
});

test('Digest completion no longer calls the legacy chime', async () => {
  const source = await import('node:fs/promises').then(fs => fs.readFile(new URL('../app/engine.ts', import.meta.url), 'utf8'));
  const finished = source.slice(source.indexOf('if (finished) {'), source.indexOf('if (p.eaten === 1)'));
  assert.doesNotMatch(finished, /this\.chime\(\)/);
});

test('Ingest pitch varies over a broad range and changes the full sample duration', () => {
  const sources = [];
  let time = 0, roll = 0;
  const player = new SfxPlayer({ createBufferSource() {
    const source = { playbackRate: { value: 1 }, connect() {}, disconnect() {}, start() {} };
    sources.push(source); return source;
  } }, {}, { now: () => time, random: () => roll });
  player.buffers = [{ duration: 1 }, { duration: 1 }, { duration: 1 }];
  player.playIngest();
  time += 400; roll = .999999;
  player.playIngest();
  assert.ok(sources[0].playbackRate.value < .75);
  assert.ok(sources[1].playbackRate.value > 1.4);
  for (const source of sources) {
    const duration = source.buffer.duration / source.playbackRate.value;
    assert.ok(duration > .70 && duration < 1.34);
  }
});