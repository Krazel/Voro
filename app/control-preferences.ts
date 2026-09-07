const key = 'voro-dash-side';
const changeEvent = 'voro-controls-change';
let sessionLeftHanded = false;
let loaded = false;

export function readLeftHanded() {
  if (!loaded) {
    try { sessionLeftHanded = localStorage.getItem(key) === 'left'; } catch { /* Session fallback. */ }
    loaded = true;
  }
  return sessionLeftHanded;
}

export function writeLeftHanded(left: boolean) {
  sessionLeftHanded = left;
  loaded = true;
  let saved = true;
  try { localStorage.setItem(key, left ? 'left' : 'right'); } catch { saved = false; }
  window.dispatchEvent(new Event(changeEvent));
  return saved;
}

export function subscribeControls(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) {
      loaded = false;
      onChange();
    }
  };
  window.addEventListener(changeEvent, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(changeEvent, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

export const serverLeftHanded = () => false;
