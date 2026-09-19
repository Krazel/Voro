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
      buffer: null,
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
