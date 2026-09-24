const KEY = 'voro-menu-theme-v1';
const THEMES = new Set(['current', 'organic', 'mixed']);
const listeners = new Set();
let sessionTheme = null;

export function normalizeMenuTheme(value) {
  return THEMES.has(value) ? value : 'current';
}

export function readMenuTheme() {
  if (sessionTheme !== null) return sessionTheme;
  if (typeof localStorage === 'undefined') return 'current';
  try { return normalizeMenuTheme(localStorage.getItem(KEY)); }
  catch { return 'current'; }
}

export function serverMenuTheme() { return 'current'; }
export function subscribeMenuTheme(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function writeMenuTheme(theme) {
  if (!THEMES.has(theme)) return false;
  sessionTheme = theme;
  let saved = false;
  try { localStorage.setItem(KEY, theme); saved = true; }
  catch { /* The visual change still applies for this open menu. */ }
  listeners.forEach(listener => listener());
  return saved;
}

if (typeof window !== 'undefined') window.addEventListener('storage', event => {
  if (event.key === KEY || event.key === null) {
    sessionTheme = null;
    listeners.forEach(listener => listener());
  }
});
