'use client';
import { useRef, useState, type RefObject } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from './language-picker';
import { t } from './language.mjs';
import { ownedAdaptations, ownedEffect } from './owned-adaptations-data.mjs';
import './owned-adaptations.css';

// Tight source rectangles preserve each painted silhouette and its padding.
// The last two subjects are not aligned to the generator's nominal grid.
const ART_BOUNDS = [
  [32,70,276,270], [344,72,295,266], [650,66,322,280],
  [5,365,325,264], [335,406,310,216], [646,383,316,239],
  [16,672,314,264], [342,674,302,263], [650,670,314,270],
  [10,963,320,303], [337,980,310,272], [651,979,321,274],
  [9,1270,340,273], [356,1328,301,188],
];

export function OwnedAdaptations({ mutations, onClose, returnFocus }: {
  mutations: string[]; onClose: () => void; returnFocus: RefObject<HTMLButtonElement | null>;
}) {
  const language = useLanguage();
  const owned = ownedAdaptations(mutations);
  const [selectedId, setSelectedId] = useState(owned[0]?.id ?? '');
  const selected = owned.find(item => item.id === selectedId) ?? owned[0];
  const total = owned.reduce((sum, item) => sum + item.count, 0);
  const heading = useRef<HTMLHeadingElement>(null);
  const en = language === 'en';
  const back = en ? 'Back to pause' : 'Volver a la pausa';
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="owned-adaptations translate-x-0 translate-y-0" showCloseButton={false} initialFocus={heading} finalFocus={returnFocus}>
      <header className="owned-header">
        <button className="owned-back" type="button" onClick={onClose} aria-label={back}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 4-8 8 8 8" /></svg>
        </button>
        <p className="owned-wordmark" aria-hidden="true">VORO</p>
        <DialogTitle ref={heading} tabIndex={-1}>{t('Tus adaptaciones')}</DialogTitle>
        <DialogDescription>{owned.length} {en ? (owned.length === 1 ? 'type' : 'types') : (owned.length === 1 ? 'tipo' : 'tipos')} · {total} {en ? (total === 1 ? 'acquisition' : 'acquisitions') : (total === 1 ? 'adquisición' : 'adquisiciones')}</DialogDescription>
      </header>
      <div className="owned-scroll">
        {owned.length ? <div className="owned-grid" role="group" aria-label={t('Tus adaptaciones')}>
          {owned.map(item => <button key={item.id} type="button"
            className="owned-capsule" data-owned-id={item.id} aria-pressed={selected?.id === item.id}
            aria-label={`${t(item.name)}, ×${item.count}`} aria-controls="owned-effect"
            onClick={() => setSelectedId(item.id)}>
            <span className="owned-counter" aria-hidden="true">×{item.count}</span>
            <svg className="owned-art" aria-hidden="true" viewBox={ART_BOUNDS[item.art].join(' ')}>
              <defs><clipPath id={`owned-art-${item.id}`}><rect x={ART_BOUNDS[item.art][0]} y={ART_BOUNDS[item.art][1]} width={ART_BOUNDS[item.art][2]} height={ART_BOUNDS[item.art][3]} /></clipPath></defs>
              <image href="/ui/owned-adaptations/organisms.png" width="972" height="1619" clipPath={`url(#owned-art-${item.id})`} />
            </svg>
            <span className="owned-name">{t(item.name).split(' ').map((word: string,i: number) => <span key={i}>{word}{' '}</span>)}</span>
          </button>)}
        </div> : <div className="owned-empty"><p>{en ? 'Your evolution begins here.' : 'Tu evolución empieza aquí.'}</p><span>{en ? 'The adaptations you choose will appear here.' : 'Aquí aparecerán las adaptaciones que elijas.'}</span></div>}
      </div>
      <footer className="owned-footer">
        {selected && <section id="owned-effect" className="owned-detail" aria-live="polite" aria-atomic="true">
          <div><h3>{t(selected.name)}</h3><span>×{selected.count}{selected.count === selected.max ? ` · ${en ? 'Max' : 'Máximo'}` : ''}</span></div>
          <p>{ownedEffect(selected.id, selected.count, language)}</p>
        </section>}
        <button type="button" className="owned-return" onClick={onClose}>{back}</button>
      </footer>
    </DialogContent>
  </Dialog>;
}
