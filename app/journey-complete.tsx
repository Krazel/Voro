'use client';
import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { t } from './language.mjs';
import { STAGES } from './journey-data.mjs';
import './journey-complete.css';

const art = ['micro','pond','shore','sea','city','orbit','planets','stars','galaxies','universe'];
const count = (value: number) => Number.isFinite(value) ? value.toLocaleString() : '—';

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
          <DialogDescription className="sr-only">{STAGES.length} {t('etapas completadas')}</DialogDescription>
        </header>
        <ol className="journey-horizons" aria-label={t('Evolución de Voro')}>
          {STAGES.map((stage, index) => <li key={stage.id}>
            <img src={`./ui/journey/d3/${art[index]}.webp`} alt="" aria-hidden="true" draggable={false}/>
            <span>{t(stage.short)}</span>
          </li>)}
        </ol>
        <dl className="journey-complete-stats">
          <div><dt>{t('Absorciones')}</dt><dd>{count(eaten)}</dd></div>
          <div><dt>{t('Tiempo')}</dt><dd>{count(Math.floor(elapsed / 60))}{Number.isFinite(elapsed) && <small> {t('min')}</small>}</dd></div>
          <div><dt>{t('Adaptaciones')}</dt><dd>{count(adaptations)}</dd></div>
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
