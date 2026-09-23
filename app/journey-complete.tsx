'use client';
import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { t } from './language.mjs';
import { STAGES } from './journey-data.mjs';
import './journey-complete.css';

// Coordinates follow the approved A · Espiral illustration (853 × 1844).
// The map occupies y=324..1268; labels remain live, translated text.
const labels = [
  [46, 60, 'Microscopio'], [59, 54.7, 'Charca'], [52, 33.7, 'Orilla'],
  [73.7, 42.2, 'Mar'], [90.4, 61.4, 'Ciudad'], [83.5, 83.6, 'Órbita'],
  [60.8, 93.4, 'Planetas'], [32.4, 89.2, 'Estrellas'], [10.8, 69.5, 'Galaxias'],
  [15.8, 29.8, 'Universo'],
] as const;

export function JourneyComplete({ eaten, elapsed, adaptations, onClose, onRestart }: {
  eaten: number; elapsed: number; adaptations: number; onClose: () => void; onRestart: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const popup = useRef<HTMLDivElement>(null);
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent ref={popup} className="journey-complete-dialog" showCloseButton={false} initialFocus={popup}>
      <article className="journey-complete-card">
        <header className="journey-complete-heading">
          <p className="journey-brand">VORO · <span>{t('ABISAL')}</span></p>
          <DialogTitle>{t('Tu recorrido')}</DialogTitle>
          <DialogDescription>{STAGES.length} {t('etapas completadas')}</DialogDescription>
        </header>
        <ol className="journey-spiral-map" aria-label={t('Evolución de Voro')}>
          {labels.map(([x, y, name]) => <li key={name} style={{left: `${x}%`, top: `${y}%`}}>{t(name)}</li>)}
        </ol>
        <dl className="journey-complete-stats">
          <div><dt>{t('Absorciones')}</dt><dd>{eaten.toLocaleString()}</dd></div>
          <div><dt>{t('Tiempo')}</dt><dd>{Math.floor(elapsed / 60)} <small>{t('min')}</small></dd></div>
          <div><dt>{t('Adaptaciones')}</dt><dd>{adaptations}</dd></div>
        </dl>
        <footer className="journey-complete-actions">
          <button className="journey-rebirth-control" onClick={() => setConfirm(true)}>{t('Volver a nacer')}</button>
          <button className="journey-silence-control" onClick={onClose}>{t('Volver al silencio')}</button>
        </footer>
      </article>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent className="journey-reset-confirm" showCloseButton={false}>
          <DialogTitle>{t('Confirmar nueva vida')}</DialogTitle>
          <DialogDescription>{t('Se borrará esta partida y sus adaptaciones.')}</DialogDescription>
          <button onClick={() => setConfirm(false)}>{t('Cancelar')}</button>
          <button onClick={onRestart}>{t('Sí, volver a nacer')}</button>
        </DialogContent>
      </Dialog>
    </DialogContent>
  </Dialog>;
}
