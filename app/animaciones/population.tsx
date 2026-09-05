'use client';
import { useMemo } from 'react';
import { populationReport } from '../population-report.mjs';
import { STAGES } from '../journey-data.mjs';
export default function Population({
  stage,
  onSelect,
}: {
  stage: number;
  onSelect: (id: string) => void;
}) {
  const report = useMemo(() => populationReport(stage), [stage]);
  const number = (n: number) =>
    new Intl.NumberFormat('es', { maximumFractionDigits: 2 }).format(n);
  return (
    <section className="population-view">
      <h2>{STAGES[stage].short} · reparto de encuentros</h2>
      <p>{report.plan.note}</p>
      <p>
        <strong>{number(report.average)} elementos por zona, de media.</strong>{' '}
        Cada zona es una superficie fija del mundo; la cámara puede mostrar
        varias cuando creces.
      </p>
      <div className="population-table-wrap">
        <table className="population-table">
          <caption>
            Estimación sobre {number(report.zones)} zonas generadas con las
            reglas del juego. Las cantidades varían entre zonas.
          </caption>
          <thead>
            <tr>
              <th scope="col">Elemento</th>
              <th scope="col">Por cada 100</th>
              <th scope="col">Por 10 zonas</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">
                  <button onClick={() => onSelect(row.id)}>{row.name}</button>
                  {row.matter && <small>Planta, objeto o materia</small>}
                </th>
                <td>
                  {row.final
                    ? 'Encuentro final'
                    : row.count
                      ? number(row.per100)
                      : 'Muy ocasional'}
                </td>
                <td>
                  {row.final ? '1 en toda la partida' : number(row.per10Zones)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="studio-note">
        Los alimentos pequeños tienen espacios reservados para que siempre
        puedas empezar a crecer. El anillo de comida inicial se añade aparte.
        Toca un nombre para ver su imagen y animación.
      </p>
    </section>
  );
}
