import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import manifest from '../app/animation-sheets.json' with {type:'json'};
import {SPECIES_BY_ID} from '../app/journey-data.mjs';
import {ANIMATIONS} from '../app/animation-catalog.mjs';
import {simpleAnimation} from '../app/inhabitant-animation.mjs';

test('Every deforming inhabitant ships bounded, content-addressed local sheets; rigid rigs remain live',()=>{
  const files=new Set();
  for(const s of Object.values(SPECIES_BY_ID)) {
    if(simpleAnimation(ANIMATIONS[s.id])) {assert.equal(manifest[s.id],undefined);continue;}
    assert.ok(manifest[s.id],s.id);
    for(const energy of [1,1.5]) {
      const m=manifest[s.id][energy];
      assert.ok(m.frames>=24 && m.frames<=64);
      assert.ok(m.bytes<6*1048576);assert.equal(m.bytes,m.cols*m.w*Math.ceil(m.frames/m.cols)*m.h*4);
      assert.ok(m.x>=0&&m.y>=0&&m.x+m.w<=m.size&&m.y+m.h<=m.size);
      assert.match(m.url,/^\.\/animation-sheets\/[a-f0-9]{16}\.webp$/);
      if(files.has(m.url))continue;
      files.add(m.url);
      const data=readFileSync(new URL('../public/'+m.url.slice(2),import.meta.url));
      assert.equal(data.length,m.encodedBytes);assert.equal(data.toString('ascii',8,12),'WEBP');
      assert.equal(m.url.split('/').at(-1).slice(0,16),createHash('sha256').update(data).digest('hex').slice(0,16));
    }
  }
  assert.equal(readdirSync(new URL('../public/animation-sheets',import.meta.url)).length,files.size,'Do not ship obsolete exports');
});
