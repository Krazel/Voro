import test from 'node:test';
import assert from 'node:assert/strict';
import { shoreDepth, coastHabitat } from '../app/shore-geography.mjs';
test('Infinite shore mixes sand and tidal water in both axes without old tile seams', () => {
  let sand = 0, water = 0;
  for (let y = -6000; y <= 6000; y += 73) for (let x = -6000; x <= 6000; x += 89) {
    const d = shoreDepth(x,y);
    if(d > 0) water++; else sand++;
    assert.ok(Math.abs(shoreDepth(x+.01,y)-shoreDepth(x-.01,y)) < .1);
    assert.ok(Math.abs(shoreDepth(x,y+.01)-shoreDepth(x,y-.01)) < .1);
  }
  assert.ok(water / (water+sand) > .3 && water / (water+sand) < .6);
  assert.equal(coastHabitat(700,970),'Arena seca');
  assert.notEqual(shoreDepth(0,0),shoreDepth(2400,0));
  assert.notEqual(shoreDepth(0,0),shoreDepth(0,2400));
});
