'use client';
import { useEffect, useRef } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import type { Snapshot } from './engine';
import { reviewEligible, reviewQuiet } from './review-policy.mjs';

const NativeReview = registerPlugin<{
  reach(): Promise<void>;
  request(): Promise<{ attempted: boolean }>;
}>('VoroReview');

export function ReviewMilestone({ state, blocked }: { state: Snapshot; blocked: boolean }) {
  const latest = useRef({ state, blocked });
  latest.current = { state, blocked };
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'ios') return;
    let reached = false, done = false, busy = false, cancelled = false, quietSince = 0;
    const tick = async () => {
      const { state: s, blocked: b } = latest.current;
      if (!reviewQuiet(s, b, document.visibilityState === 'visible')) quietSince = 0;
      else if (!quietSince) quietSince = performance.now();
      if (done || busy || !reviewEligible(s)) return;
      busy = true;
      try {
        if (!reached) { await NativeReview.reach(); reached = true; }
        if (!cancelled && quietSince && performance.now() - quietSince >= 8000) {
          // Recheck the latest snapshot after the bridge await.
          const current = latest.current;
          if (reviewQuiet(current.state, current.blocked, document.visibilityState === 'visible')) {
            done = (await NativeReview.request()).attempted;
          }
        }
      } catch { /* Retry later if the native bridge/scene is temporarily unavailable. */ }
      finally { busy = false; }
    };
    const interval = window.setInterval(tick, 500);
    const resetQuiet = () => { quietSince = 0; };
    document.addEventListener('visibilitychange', resetQuiet);
    return () => { cancelled = true; clearInterval(interval); document.removeEventListener('visibilitychange', resetQuiet); };
  }, []);
  return null;
}
