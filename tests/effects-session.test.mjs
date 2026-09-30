import test from 'node:test';
import assert from 'node:assert/strict';
import {configureEffectsSession} from '../app/audio-health.mjs';

test('effects request media playback once and restore it after a session reset',()=>{
  let type='auto',writes=0;
  const session={get type(){return type;},set type(value){writes++;type=value;}};
  assert.equal(configureEffectsSession(session),true);
  assert.equal(type,'playback');
  for(let i=0;i<100;i++)assert.equal(configureEffectsSession(session),true);
  assert.equal(writes,1,'Repeated health checks must not reconfigure the session');
  type='auto';assert.equal(configureEffectsSession(session),true);
  assert.equal(writes,2);
});

test('unsupported or rejecting session APIs do not break effects initialization',()=>{
  assert.equal(configureEffectsSession(null),false);
  assert.equal(configureEffectsSession({get type(){return 'auto';},set type(_value){throw Error('Unavailable');}}),false);
});
