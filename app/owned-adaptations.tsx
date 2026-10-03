'use client';
import { ArrowLeft } from 'lucide-react';
import { useRef, useState, type RefObject } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from './language-picker';
import { t } from './language.mjs';
import { ownedAdaptations, ownedEffect } from './owned-adaptations-data.mjs';
import './owned-adaptations.css';

// Reuse the same 5 × 3 atlas and artIndex as the adaptation choice screen.
const artBounds = (index: number) => [(index % 5) * 1619 / 5, Math.floor(index / 5) * 324, 1619 / 5, 324];
// Optical offsets in atlas pixels: center the visible painted subject, not its
// square source cell. Keep image and edge fade together; no scaling or new art.
const ART_OFFSETS = [
  [-11.2,-18.2],[-15.9,-6.4],[-18,-10.7],[-1.6,-3.8],[-22.4,-4.4],
  [9.2,2.3],[39.1,3.1],[14.8,1.4],[14.9,13.8],[18.5,8.3],
  [-15.7,18.9],[14,37.9],[28.7,31],[6,26.8],[21.9,37.4],
];

// Painted silhouettes, clipped at their actual contours so the sheet background
// never forms a rectangle around the approved organic frames.
const FRAME_BOUNDS = [[30,85,480,416],[536,86,467,416],[1018,88,507,416],[28,550,480,393],[532,533,469,410],[1020,531,490,412]];
const FRAME_PATHS = [
  'M88 168 C135 123 252 108 371 93 C458 79 491 107 499 178 C500 230 509 339 496 394 C488 469 449 495 342 491 C236 490 146 487 96 462 C48 439 33 382 36 301 C36 239 50 201 88 168Z',
  'M583 177 C628 128 701 111 839 97 C929 84 972 94 983 169 C991 218 984 316 987 384 C990 459 961 491 855 493 C752 496 641 494 589 473 C551 455 541 411 546 313 C547 250 554 212 583 177Z',
  'M1082 180 C1130 136 1223 112 1377 96 C1464 86 1496 102 1504 175 C1512 238 1514 319 1505 391 C1495 464 1464 490 1361 494 C1246 502 1121 495 1071 474 C1036 458 1021 418 1028 337 C1032 260 1047 214 1082 180Z',
  'M82 587 C117 559 159 555 197 566 C259 579 306 616 373 628 C442 639 485 646 499 701 C511 756 499 818 476 861 C450 909 381 919 283 927 C190 937 120 929 80 906 C41 884 35 846 37 766 C40 692 42 632 82 587Z',
  'M587 667 C632 629 690 615 746 593 C803 569 856 536 909 540 C961 542 981 577 990 638 C999 700 1002 773 990 827 C974 899 937 924 846 930 C746 938 638 933 591 910 C548 890 538 851 541 786 C543 733 555 697 587 667Z',
  'M1082 625 C1126 582 1211 548 1341 541 C1437 533 1474 550 1491 611 C1506 671 1506 758 1504 810 C1501 887 1467 924 1371 930 C1267 935 1139 930 1085 912 C1042 898 1028 862 1030 800 C1032 717 1048 665 1082 625Z',
];
function CapsuleFrame({ index, id }: { index: number; id: string }) {
  return <svg className="owned-shell" viewBox={FRAME_BOUNDS[index].join(' ')} preserveAspectRatio="none" aria-hidden="true">
    <defs><clipPath id={`owned-shell-${id}`}><path d={FRAME_PATHS[index]} /></clipPath></defs>
    <image href="/ui/owned-adaptations/capsules.png" width="1536" height="1024" clipPath={`url(#owned-shell-${id})`} />
  </svg>;
}

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
          <ArrowLeft size={22} strokeWidth={2} aria-hidden="true" />
        </button>
        <p className="owned-wordmark" aria-hidden="true">VORO</p>
        <DialogTitle ref={heading} tabIndex={-1}>{t('Tus adaptaciones')}</DialogTitle>
        <DialogDescription>{owned.length} {en ? (owned.length === 1 ? 'type' : 'types') : (owned.length === 1 ? 'tipo' : 'tipos')} · {total} {en ? (total === 1 ? 'acquisition' : 'acquisitions') : (total === 1 ? 'adquisición' : 'adquisiciones')}</DialogDescription>
      </header>
      <div className="owned-scroll">
        {owned.length ? <div className="owned-grid" role="group" aria-label={t('Tus adaptaciones')}>
          {owned.map(item => <button key={item.id} type="button"
            className="owned-capsule" data-owned-id={item.id} data-frame={selected?.id === item.id ? 5 : item.artIndex % 5} aria-pressed={selected?.id === item.id}
            aria-label={`${t(item.name)}, ×${item.count}`} aria-controls="owned-effect"
            onClick={() => setSelectedId(item.id)}>
            <CapsuleFrame index={selected?.id === item.id ? 5 : item.artIndex % 5} id={item.id} />
            <span className="owned-counter" aria-hidden="true">×{item.count}</span>
            <svg className="owned-art" aria-hidden="true" data-art-index={item.artIndex} viewBox={artBounds(item.artIndex).join(' ')}>
              <defs>
                <radialGradient id={`owned-fade-${item.id}`} r="52%"><stop offset="58%" stopColor="white" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient>
                <mask id={`owned-art-${item.id}`} maskUnits="userSpaceOnUse" x={artBounds(item.artIndex)[0]} y={artBounds(item.artIndex)[1]} width={1619 / 5} height="324">
                  <rect x={artBounds(item.artIndex)[0]} y={artBounds(item.artIndex)[1]} width={1619 / 5} height="324" fill={`url(#owned-fade-${item.id})`} />
                </mask>
              </defs>
              <g transform={`translate(${ART_OFFSETS[item.artIndex].join(' ')})`}>
                <image href="/upgrades/biological-adaptations.png" width="1619" height="972" mask={`url(#owned-art-${item.id})`} />
              </g>
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
        <button type="button" className="owned-return" onClick={onClose}>
          <ArrowLeft size={22} strokeWidth={2} aria-hidden="true" />
          <span>{back}</span>
        </button>
      </footer>
    </DialogContent>
  </Dialog>;
}
