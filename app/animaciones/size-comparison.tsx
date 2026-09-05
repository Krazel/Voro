/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The overflowing size table must be keyboard-scrollable. */
'use client';
import { useEffect, useRef, useState } from 'react';
import { STAGES, STAGE_SPECIES, formatSize } from '../journey-data.mjs';
import { animationCrop } from '../animation-catalog.mjs';
import { drawInhabitant } from '../inhabitant-animation.mjs';
import { comparisonScale, sizeRange } from '../entity-sizes.mjs';

type Species = (typeof STAGE_SPECIES)[number][number];
type Images = Record<string, HTMLImageElement>;
function SizePair({
  species: s,
  images,
  scale,
  zoom,
}: {
  species: Species;
  images: Images;
  scale: number;
  zoom: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const img = images[s.imageAtlas || s.atlas];
  const range = sizeRange(s);
  const aspect = img ? animationCrop(s, img)[3] / animationCrop(s, img)[2] : 1;
  const height = Math.ceil(Math.max(80, range.max * scale * aspect * 2.5 + 32));
  useEffect(() => {
    if (!img || !ref.current) return;
    const c = ref.current.getContext('2d')!;
    c.clearRect(0, 0, 680, height);
    c.strokeStyle = '#608c9926';
    c.lineWidth = 1;
    for (let x = 0; x <= 680; x += 20 * scale) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, height);
      c.stroke();
    }
    c.beginPath();
    c.moveTo(0, height / 2);
    c.lineTo(680, height / 2);
    c.stroke();
    for (const [x, r] of [
      [170, range.min],
      [510, range.max],
    ]) {
      c.save();
      c.translate(x, height / 2);
      drawInhabitant(c, img, s, r * scale, 0, 0.2, {
        cache: false,
        detail: true,
      });
      c.restore();
    }
  }, [img, s, scale, height, range.min, range.max]);
  return (
    <canvas
      ref={ref}
      width={680}
      height={height}
      style={{ width: 680 * zoom, height: height * zoom }}
      aria-label={`${s.name}: tamaño mínimo a la izquierda y máximo a la derecha`}
    />
  );
}
export default function SizeComparison({
  stage,
  images,
  error,
  onSelect,
}: {
  stage: number;
  images: Images;
  error: boolean;
  onSelect: (id: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const species = [...STAGE_SPECIES[stage]].sort(
    (a, b) => Number(a.r) - Number(b.r),
  );
  const scale = comparisonScale(species);
  const ready = species.every((s) => images[s.imageAtlas || s.atlas]);
  return (
    <section className="size-comparison" aria-label="Comparación de tamaños">
      <div className="size-intro">
        <div>
          <h2>{STAGES[stage].short}: del más pequeño al más grande</h2>
          <p>
            Los mínimos y máximos del juego, todos a la misma escala dentro de
            este entorno. Variación de ±12 %; el universo final tiene tamaño
            fijo.
          </p>
        </div>
        <label htmlFor="comparison-zoom">
          Ampliación · {Math.round(zoom * 100)} %
          <input
            id="comparison-zoom"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </label>
      </div>
      {!ready ? (
        <output className="size-loading">
          {error ? (
            <>
              <span>No se han podido cargar las ilustraciones.</span>
              <button onClick={() => location.reload()}>Reintentar</button>
            </>
          ) : (
            'Cargando las ilustraciones…'
          )}
        </output>
      ) : (
        <>
          <p className="size-scroll-hint">
            Desliza la tabla hacia los lados para comparar. La ampliación se
            aplica a todos por igual.
          </p>
          <section
            className="size-scroll"
            tabIndex={0}
            aria-label="Tabla de tamaños, desplazable horizontalmente"
          >
            <table className="size-table" style={{ width: 200 + 680 * zoom }}>
              <caption>
                Tamaños de {species.length} elementos de {STAGES[stage].short}
              </caption>
              <colgroup>
                <col style={{ width: 200 }} />
                <col style={{ width: 340 * zoom }} />
                <col style={{ width: 340 * zoom }} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">Habitante</th>
                  <th scope="col">Mínimo</th>
                  <th scope="col">Máximo</th>
                </tr>
              </thead>
              {species.map((s) => {
                const range = sizeRange(s);
                return (
                  <tbody key={s.id}>
                    <tr>
                      <th scope="rowgroup" rowSpan={2}>
                        <button onClick={() => onSelect(s.id)}>
                          {s.name}
                          <span>Ver animación →</span>
                        </button>
                      </th>
                      <td colSpan={2} className="size-art">
                        <SizePair
                          species={s}
                          images={images}
                          scale={scale}
                          zoom={zoom}
                        />
                      </td>
                    </tr>
                    <tr className="size-values">
                      <td>{formatSize(stage, 8 * (range.min / 48) ** 2)}</td>
                      <td>{formatSize(stage, 8 * (range.max / 48) ** 2)}</td>
                    </tr>
                  </tbody>
                );
              })}
            </table>
          </section>
        </>
      )}
    </section>
  );
}
