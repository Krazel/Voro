'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { getLanguage, getLanguagePreference, initializeLanguage, setLanguage, subscribeLanguage, t } from './language.mjs';
import './language.css';

export function useLanguage() {
  const current = useSyncExternalStore(subscribeLanguage, getLanguage, () => 'en');
  useEffect(initializeLanguage, []);
  return current;
}
export function LanguagePicker() {
  useLanguage();
  const preference = useSyncExternalStore(subscribeLanguage, getLanguagePreference, () => 'auto');
  const [saved, setSaved] = useState(true);
  return <div className="language-preference">
    <label htmlFor="voro-language">{t('Idioma')}</label>
    <select id="voro-language" value={preference} onChange={event => setSaved(setLanguage(event.target.value))}>
      <option value="auto">{t('Automático')}</option>
      <option value="es" lang="es">Español</option>
      <option value="en" lang="en">English</option>
    </select>
    {!saved && <small role="status">{t('El cambio funciona ahora, pero no se ha podido guardar para la próxima sesión.')}</small>}
  </div>;
}
