// Analytical food budget: not an AI playthrough. No damage, surplus feeding,
// deaths, batching or XP upgrades. Food size brackets discarded XP overflow.
import {mkdirSync,writeFileSync} from 'node:fs';
import {newJourney,journeyLife,advanceJourney} from '../app/journey-progress.mjs';
import {STAGES} from '../app/journey-data.mjs';
import {adaptationYield} from '../app/campaign-pacing.mjs';
import {journeyAdaptation,MAX_UPGRADE_CHOICES} from '../app/mutations.mjs';
const rows=[];
for(const coefficient of [.85,.65])for(const bonus of [1,1.1,1.2,1.4])for(const meal of [1,5,10,20,40]) {
 const p=newJourney(41);let l=journeyLife(p),level=0,xp=0;const stages=[];
 for(let i=0;i<STAGES.length;i++){
  const s=STAGES[i],start=l.biomass;
  while(l.biomass<s.goal){
   l.biomass+=meal*l.growthFactor;xp+=meal*coefficient*adaptationYield(s.id)*bonus;
   if(xp>=journeyAdaptation(level)){level++;xp=journeyAdaptation(level-1);}
  }
  stages.push({stage:s.id,startMass:start,choices:level});
  if(i<STAGES.length-1)l=advanceJourney(p,l);
 }
 rows.push({coefficient,bonus,meal,demand:level,remaining:MAX_UPGRADE_CHOICES-level,stages});
}
const summary=[];
for(const coefficient of [.85,.65])for(const bonus of [1,1.1,1.2,1.4]) {
 const r=rows.filter(r=>r.coefficient===coefficient&&r.bonus===bonus);
 summary.push({coefficient,bonus,choices:[Math.min(...r.map(r=>r.demand)),Math.max(...r.map(r=>r.demand))],
 remaining:[Math.min(...r.map(r=>r.remaining)),Math.max(...r.map(r=>r.remaining))]});
}
const out='design/adaptation-surplus-2026-09-28';mkdirSync(out,{recursive:true});
writeFileSync(out+'/budget.json',JSON.stringify({source:'2993110',available:MAX_UPGRADE_CHOICES,
 assumptions:'No damage, immediate evolution, one meal at a time, no extra feeding. Bonuses above1 apply from the start as sensitivity bounds, not attainable acquisition histories. Negative remaining is unmet demand, not actual extra upgrades.',summary,rows},null,2));
console.log(JSON.stringify(summary));
