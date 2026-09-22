'use client';
import { useEffect, useRef, useState } from 'react';
import { registerPlugin } from '@capacitor/core';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getLanguage, t } from './language.mjs';

type ReviewResult = { attempted: boolean; finished: boolean };
const NativeReview = registerPlugin<{
  request(options: { language: string }): Promise<ReviewResult>;
}>('VoroReview');

export function ReviewMilestone({ held, onContinue }: { held: boolean; onContinue: () => void }) {
  const [ready, setReady] = useState(false);
  const pending = useRef<Promise<ReviewResult> | null>(null);
  const continuation = useRef(onContinue);
  continuation.current = onContinue;
  useEffect(() => {
    if (!held) { pending.current = null; setReady(false); return; }
    let cancelled = false;
    // Keep one request even when React replays an effect in development.
    pending.current ??= NativeReview.request({language:getLanguage()});
    pending.current.then(result => {
      if (cancelled) return;
      if (result.finished) continuation.current();
      else setReady(true); // StoreKit gives no dismissal callback; player resumes explicitly.
    }).catch(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, [held]);
  return <Dialog open={held} onOpenChange={open => { if (!open && ready) onContinue(); }}>
    <DialogContent showCloseButton={false}>
      <DialogTitle>{t('Segundo entorno completado')}</DialogTitle>
      <DialogDescription>{t('La partida está en pausa. Continúa cuando quieras.')}</DialogDescription>
      <button className="primary-button" disabled={!ready} onClick={onContinue}>{t('Continuar')}</button>
    </DialogContent>
  </Dialog>;
}
