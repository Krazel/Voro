// Only the real boundary after Water (second environment), never a later save.
export function shouldHoldReview({ enabled, handled, stage, testMode }) {
  return enabled && !handled && !testMode && stage === 1;
}
