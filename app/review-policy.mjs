export function reviewEligible(s) {
  return s.started && !s.testMode && s.stage >= 2;
}
export function reviewQuiet(s, blocked = false, visible = true) {
  return reviewEligible(s) && visible && !blocked && !s.paused && !s.dead &&
    !s.complete && !s.ending && !s.transition && !s.offer.length &&
    s.assetsReady && !s.assetError && !s.hurt && !s.hint;
}
