// Keep a fixed vertical field of view. Wider windows reveal more world laterally,
// never stretch the original portrait render or shrink the organism to fit it.
export function desktopViewport(width, height, dpr = 1) {
  const logicalHeight = 720;
  const scale = Math.max(1, height) / logicalHeight;
  return {
    width: Math.max(1, width) / scale, height: logicalHeight, scale,
    pixelRatio: Math.min(Math.max(1, dpr), 1.5, Math.sqrt(2400000 / Math.max(1, width * height))),
  };
}
export function visibleChunkRadius(width, height, zoom) {
  return Math.ceil((Math.max(width / 2, height * .55) / Math.max(.01, zoom) + 300) / 600);
}
