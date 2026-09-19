'use client';
import { t as tr } from '../language.mjs';

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
      <h2>{tr(STAGES[stage].short)}{tr(" · reparto de encuentros")}</h2>
      <p>{tr(report.plan.note)}</p>
      <p>
        <strong>{tr(number(report.average))}{tr(" elementos por zona, de media.")}</strong>{tr(' ')}{tr(" Cada zona es una superficie fija del mundo; la cámara puede mostrar varias cuando creces. ")}</p>
      <div className="population-table-wrap">
        <table className="population-table">
          <caption>{tr(" Estimación sobre ")}{tr(number(report.zones))}{tr(" zonas generadas con las reglas del juego. Las cantidades varían entre zonas. ")}</caption>
          <thead>
            <tr>
              <th scope="col">{tr("Elemento")}</th>
              <th scope="col">{tr("Por cada 100")}</th>
              <th scope="col">{tr("Por 10 zonas")}</th>
            </tr>
          </thead>
          <tbody>
            {tr(report.rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">
                  <button onClick={() => onSelect(row.id)}>{tr(row.name)}</button>
                  {tr(row.matter && <small>{tr("Planta, objeto o materia")}</small>)}
                </th>
                <td>
                  {tr(row.final
                    ? 'Encuentro final'
                    : row.count
                      ? number(row.per100)
                      : 'Muy ocasional')}
                </td>
                <td>
                  {tr(row.final ? '1 en toda la partida' : number(row.per10Zones))}
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
      <p className="studio-note">{tr(" Los alimentos pequeños tienen espacios reservados para que siempre puedas empezar a crecer. El anillo de comida inicial se añade aparte. Toca un nombre para ver su imagen y animación. ")}</p>
    </section>
  );
}
