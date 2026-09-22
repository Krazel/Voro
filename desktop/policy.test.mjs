import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import policy from './policy.cjs';
const root = path.resolve('game');
test('local assets resolve within packaged game', () => {
  assert.equal(policy.assetPath(root, 'voro://game/'), path.join(root, 'index.html'));
  assert.equal(policy.assetPath(root, 'voro://game/music/song.mp3'), path.join(root, 'music/song.mp3'));
});
test('reject other origins and encoded path escapes', () => {
  for (const url of ['file:///secret', 'https://game/', 'voro://elsewhere/file', 'voro://user@game/file', 'voro://game/%2e%2e%2fsecret', 'voro://game/%5csecret', 'voro://game/C%3A/file', 'voro://game/%00'])
    assert.equal(policy.assetPath(root, url), null, url);
});
test('only approved HTTPS destinations may open externally', () => {
  assert.equal(policy.externalAllowed('https://www.instagram.com/krazelgames/'), true);
  assert.equal(policy.externalAllowed('https://www.scottbuckley.com.au/library/'), true);
  for (const url of ['file:///C:/Windows', 'javascript:alert(1)', 'https://www.instagram.com.evil.test/', 'https://user@www.instagram.com/', 'http://www.instagram.com/'])
    assert.equal(policy.externalAllowed(url), false, url);
});
