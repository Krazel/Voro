import { COAST_TILE } from './population.mjs';
// The same world coordinates drive the painted shore and habitat placement.
// Alternating mirrored tiles meet on identical edges in both directions.
export function drawCoastalGround(c, image, camera, zoom, height) {
  const tw = COAST_TILE,
    th = (COAST_TILE * image.height) / image.width;
  const x0 = Math.floor((camera.x - 240 / zoom) / tw),
    x1 = Math.floor((camera.x + 240 / zoom) / tw);
  const y0 = Math.floor((camera.y - (height * 0.48) / zoom) / th),
    y1 = Math.floor((camera.y + (height * 0.52) / zoom) / th);
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const fx = Math.abs(x % 2) === 1,
        fy = Math.abs(y % 2) === 1;
      c.save();
      c.translate(
        (x * tw - camera.x) * zoom + 240 + (fx ? tw * zoom : 0),
        (y * th - camera.y) * zoom + height * 0.48 + (fy ? th * zoom : 0),
      );
      c.scale(fx ? -1 : 1, fy ? -1 : 1);
      c.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        0,
        0,
        tw * zoom + 0.5,
        th * zoom + 0.5,
      );
      c.restore();
    }
}
