import test from 'node:test';
import assert from 'node:assert/strict';
import { deviceLanguage, resolveLanguage, setLanguage, t } from '../app/language.mjs';
import { ENGLISH } from '../app/english.mjs';
import { UPGRADES } from '../app/mutations.mjs';
import { STAGES, STAGE_SPECIES } from '../app/journey-data.mjs';
import { ANIMATIONS } from '../app/animation-catalog.mjs';
import { ADAPTATION_CAPTIONS } from '../app/journey-captions.mjs';

test('device language and manual override resolve independently', () => {
  for (const locale of ['es', 'es-ES', 'es-MX', 'ES_ar']) assert.equal(deviceLanguage([locale]), 'es');
  for (const locales of [[], ['en-US'], ['fr-FR', 'es-ES'], ['ja-JP']]) assert.equal(deviceLanguage(locales), 'en');
  assert.equal(resolveLanguage('en', ['es-ES']), 'en');
  assert.equal(resolveLanguage('es', ['en-US']), 'es');
});
test('all player upgrades, stages and adaptation captions have English entries', () => {
  for (const upgrade of UPGRADES) for (const key of ['name','detail','group']) assert.ok(ENGLISH[upgrade[key]], upgrade[key]);
  for (const stage of STAGES) for (const key of ['name','short','intro','evolution']) assert.ok(ENGLISH[stage[key]], stage[key]);
  for (const line of Object.values(ADAPTATION_CAPTIONS).flat()) assert.ok(ENGLISH[line], line);
  for (const species of STAGE_SPECIES.flat()) assert.ok(ENGLISH[species.name], species.name);
  for (const profile of Object.values(ANIMATIONS)) if (profile.description) assert.ok(ENGLISH[profile.description], profile.description);
});
test('translation keeps data identities, numbers, React nodes and whitespace', () => {
  setLanguage('en');
  const data = structuredClone(UPGRADES);
  assert.equal(t('ADAPTACIÓN 3'), 'ADAPTATION 3');
  assert.equal(t('Pseudópodos largos. +7,5 % de alcance. 0 de 6 adquiridas'), 'Long pseudopods. +7.5% reach. 0 of 6 acquired');
  assert.equal(t(' Comer '), ' Eat ');
  assert.equal(t(12), 12);
  const node = { type: 'span' }; assert.equal(t(node), node);
  assert.deepEqual(UPGRADES, data);
  setLanguage('es');
  assert.equal(t('Pseudópodos largos'), 'Pseudópodos largos');
  setLanguage('en');
});
