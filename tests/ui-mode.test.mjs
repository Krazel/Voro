import test from 'node:test';
import assert from 'node:assert/strict';
import { initialUiMode, readUiMode, UI_MODE_KEY, writeUiMode } from '../app/ui-mode.mjs';

const storage = value => ({
  value,
  getItem(key) { return key === UI_MODE_KEY ? this.value : null; },
  setItem(key, next) { if (key === UI_MODE_KEY) this.value = next; },
});

test('UI mode defaults to final but restores an explicit saved choice', () => {
  assert.equal(initialUiMode(storage(null)), 'final');
  assert.equal(initialUiMode(storage('development')), 'development');
  assert.equal(initialUiMode(storage('final')), 'final');
});

test('UI query override works without preventing later saved changes', () => {
  const saved = storage('final');
  assert.equal(initialUiMode(saved, '?ui=development'), 'development');
  assert.equal(saved.value, 'final');
  assert.equal(writeUiMode(saved, 'development'), true);
  assert.equal(readUiMode(saved), 'development');
  assert.equal(initialUiMode(saved), 'development');
  assert.equal(initialUiMode(saved, '?ui=final'), 'final');
});
