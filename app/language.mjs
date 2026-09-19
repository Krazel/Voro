import { ENGLISH } from './english.mjs';

const KEY = 'voro-language-v1';
let preference = 'auto';
let language = 'en';
let initialized = false;
const listeners = new Set();
export function deviceLanguage(languages = []) {
  const first = languages.find(value => typeof value === 'string' && value.length);
  return /^es(?:[-_]|$)/i.test(first ?? '') ? 'es' : 'en';
}
export function resolveLanguage(value, languages = []) {
  return value === 'es' || value === 'en' ? value : deviceLanguage(languages);
}
function refresh() {
  language = resolveLanguage(preference, typeof navigator === 'undefined' ? [] : navigator.languages?.length ? navigator.languages : [navigator.language]);
  if (typeof document !== 'undefined') document.documentElement.lang = language;
  listeners.forEach(fn => fn());
}
export function initializeLanguage() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  try { const saved = localStorage.getItem(KEY); if (['auto', 'en', 'es'].includes(saved)) preference = saved; } catch { /* Session-only choice still works. */ }
  refresh();
  window.addEventListener('languagechange', refresh);
  window.addEventListener('storage', event => {
    if (event.key === KEY || event.key === null) {
      preference = ['es', 'en'].includes(event.newValue) ? event.newValue : 'auto';
      refresh();
    }
  });
}
export function getLanguage() { return language; }
export function getLanguagePreference() { return preference; }
export function subscribeLanguage(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function setLanguage(value) {
  if (!['auto', 'en', 'es'].includes(value)) return false;
  preference = value;
  refresh();
  try { localStorage.setItem(KEY, value); return true; } catch { return false; }
}
const dictionary = { ...ENGLISH };
for (const [key, value] of Object.entries(ENGLISH)) dictionary[key.toUpperCase()] ??= value.toUpperCase();
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const fragments = new RegExp('(^|[^\\p{L}])(' + Object.keys(dictionary).sort((a, b) => b.length - a.length).map(escape).join('|') + ')(?![\\p{L}])', 'gu');
/** Translate display strings only. React nodes, numbers and game data pass through. */
export function t(value) {
  if (language !== 'en' || typeof value !== 'string') return value;
  if (Object.hasOwn(dictionary, value)) return dictionary[value];
  const trimmed = value.trim();
  if (Object.hasOwn(dictionary, trimmed)) return value.replace(trimmed, dictionary[trimmed]);
  // Composite labels include numbers, stage names and upgrade descriptions.
  // A single longest-match pass prevents translated text being translated again.
  return value.replace(fragments, (_match, prefix, text) => prefix + dictionary[text]);
}
