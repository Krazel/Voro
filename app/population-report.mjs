import { JourneyWorld } from './journey-world.mjs';
import { STAGE_SPECIES, STAGES } from './journey-data.mjs';
import { POPULATION_PLANS } from './population.mjs';
/** @type {Map<number, {rows: Array<{id:string,name:string,final:boolean,matter:boolean,per100:number,per10Zones:number,count:number}>, zones:number, average:number, plan:typeof POPULATION_PLANS.micro}>} */
const cache = new Map();
export function populationReport(stage) {
  const cached = cache.get(stage);
  if (cached) return cached;
  const world = new JourneyWorld(63281, [], stage),
    counts = new Map(),
    zones = 1200;
  let total = 0;
  // Away from the safe starting ring; includes both dry and wet coastal zones.
  for (let i = 0; i < zones; i++)
    for (const e of world.generate(10 + (i % 40), 10 + Math.floor(i / 40), 0)
      .entities) {
      counts.set(e.kind, (counts.get(e.kind) || 0) + 1);
      total++;
    }
  const rows = STAGE_SPECIES[stage]
    .map((s) => ({
      id: s.id,
      name: s.name,
      final: s.kind === 'final',
      matter: !!s.edibleMatter,
      per100: ((counts.get(s.id) || 0) * 100) / total,
      per10Zones: ((counts.get(s.id) || 0) * 10) / zones,
      count: counts.get(s.id) || 0,
    }))
    .sort((a, b) => b.per100 - a.per100);
  const report = {
    rows,
    zones,
    average: total / zones,
    plan: POPULATION_PLANS[STAGES[stage].id],
  };
  cache.set(stage, report);
  return report;
}
