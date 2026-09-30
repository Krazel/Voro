import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEngine} from './engine-fixture.mjs';

for (const type of ['pointerdown', 'keydown']) {
  test(`${type} on Continue waits for the saved scene before starting music`, () => {
    const {game} = makeEngine();
    const commands = [];
    game.saved = true;
    Object.defineProperty(game, 'assetsReady', {value: true});
    game.progress.stage = 3; // A saved aquatic run, not the menu or Microscope.
    game.initAudio = () => {
      game.music ??= {setState(track, active) { commands.push({track, active}); }, unlock() {}, destroy() {}};
      game.setAudio();
    };
    const event = new Event(type);
    Object.defineProperty(event, 'target', {value: {tagName: 'BUTTON', closest: () => ({})}});
    Object.defineProperty(event, 'code', {value: 'Enter'});
    try {
      window.dispatchEvent(event);
      assert.equal(commands.length, 0, 'Press must not start menu music before click');
      game.action('start');
      assert.ok(commands.some(c => c.track === 'water' && c.active));
      assert.ok(commands.every(c => c.track === 'water'), 'Only the restored environment may start');
    } finally { game.destroy(); }
  });
}

test('other menu gestures retain menu music', () => {
  const {game} = makeEngine();
  const commands = [];
  game.initAudio = () => {
    game.music ??= {setState(track) { commands.push(track); }, unlock() {}, destroy() {}};
    game.setAudio();
  };
  try {
    window.dispatchEvent(new Event('pointerdown'));
    assert.ok(commands.length > 0);
    assert.ok(commands.every(track => track === 'menu'));
  } finally { game.destroy(); }
});
