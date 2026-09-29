// Prefer a modest output buffer over the browser's minimum interactive buffer.
// Browsers may ignore this hint; report their actual latency instead of claiming
// that the requested buffering is guaranteed on a particular iPhone.
export const AUDIO_CONTEXT_OPTIONS = Object.freeze({ latencyHint: 'balanced' });
export const EFFECT_LEAD_SECONDS = 0.012;

export function audioPlaybackStats(context) {
  if (!context) return null;
  const finite = n => Number.isFinite(n) ? n : null;
  let playback = null;
  try {
    const s = context.playbackStats;
    if (s) playback = {
      ...Object.fromEntries(['totalDuration','averageLatency','minimumLatency','maximumLatency'].map(key => [key,finite(s[key])])),
      underrunDuration: finite(s.underrunDuration ?? s.fallbackFramesDuration),
      underrunEvents: finite(s.underrunEvents ?? s.fallbackFramesEvents),
    };
  } catch { /* Optional experimental API; absence is not zero underruns. */ }
  return { requestedLatencyHint: AUDIO_CONTEXT_OPTIONS.latencyHint, sampleRate: finite(context.sampleRate), baseLatency: finite(context.baseLatency), outputLatency: finite(context.outputLatency), playback };
}
