import {writeFile} from 'node:fs/promises';
import {makeEngine} from '../tests/engine-fixture.mjs';
import {STAGES,SPECIES_BY_ID as S} from '../app/journey-data.mjs';
import {journeyEntity,JourneyWorld} from '../app/journey-world.mjs';
import {POPULATION_PLANS} from '../app/population.mjs';
import {projectileThreatMass} from '../app/threat-scale.mjs';
const out='design/pond-camera-audio-2026-09-23',city=STAGES.find(s=>s.id==='city'),result={runs:[],weapons:[],populations:[]};
const weapons=Object.values(S).filter(s=>s.id.startsWith('city-')&&s.shot).map(s=>({s,shot:{...s.shot}}));
for(const s of Object.values(S).filter(s=>s.id.startsWith('city-')&&s.shot)){
 const e=journeyEntity(s,0,0,0,s.id);
 result.weapons.push({id:s.id,name:s.name,edibleMass:e.requiredMass,before:projectileThreatMass(e.requiredMass,s.shot.damage),after:Math.min(s.shot.edibleAt,projectileThreatMass(e.requiredMass,s.shot.damage,s.shot.threatScale))});
}
for(const [stage,oldSlots] of [[1,[7,5,1]],[5,[5,8,1]],[6,[4,7,1]],[7,[4,7,1]]]){
 const plan=POPULATION_PLANS[STAGES[stage].id],newSlots=plan.slots,counts={};
 for(const [label,slots] of [['before',oldSlots],['after',newSlots]]){
  plan.slots=slots;let total=0,fauna=0;const kinds={};
  for(let x=10;x<30;x++)for(let y=10;y<30;y++)for(const e of new JourneyWorld(1834,[],stage).generate(x,y,0).entities){total++;if(!S[e.kind].edibleMatter&&e.kind!=='pond-0')fauna++;kinds[e.kind]=(kinds[e.kind]||0)+1;}
  counts[label]={zones:400,total,average:total/400,faunaPerZone:fauna/400,kinds};
 }plan.slots=newSlots;result.populations.push({stage:STAGES[stage].id,...counts});
}
for(const seed of [11,33,77])for(const label of ['before','after']){
 city.goal=label==='before'?210:300;city.growth=label==='before'?.33:.22;
 for(const {s,shot} of weapons)Object.assign(s.shot,shot,label==='before'?{threatScale:1,edibleAt:({'city-1':26,'city-3':44,'city-7':78,'city-8':120,'city-9':96})[s.id]}:{});
 const {game:g}=makeEngine();g.progress.seed=seed;g.startTest(4,2,false,true,false);
 let target=null,attemptedHits=0;const hit=g.receiveHit.bind(g);g.receiveHit=(...args)=>{attemptedHits++;return hit(...args);};
 g.input=()=>target?{x:(target.x-g.life.x)/Math.max(1,Math.hypot(target.x-g.life.x,target.y-g.life.y)),y:(target.y-g.life.y)/Math.max(1,Math.hypot(target.x-g.life.x,target.y-g.life.y))}:{x:1,y:0};
 let seconds=0;const curve=[];
 for(let step=0;step<24000&&g.life.biomass<city.goal;step++){
  if(step%4===0){let best=Infinity;target=null;for(const e of g.world.entities){if(e.eaten||e.requiredMass>g.life.biomass)continue;const score=Math.hypot(e.x-g.life.x,e.y-g.life.y)/(1+e.value/12);if(score<best){best=score;target=e;}}}
  g.progress.offer=[];g.progress.xp=0;g.update(.05);seconds+=.05;
  if(step%400===0)curve.push({seconds:+seconds.toFixed(2),mass:g.life.biomass,eaten:g.life.eaten});
 }
 result.runs.push({seed,label,seconds:+seconds.toFixed(2),reached:g.life.biomass>=city.goal,mass:g.life.biomass,eaten:g.life.eaten,attemptedHits,curve});g.destroy();
}
await writeFile(`${out}/city-populations.json`,JSON.stringify(result,null,2));console.log(JSON.stringify({...result,runs:result.runs.map(({curve,...r})=>r),populations:result.populations.map(({stage,before,after})=>({stage,before:before.average,after:after.average,faunaBefore:before.faunaPerZone,faunaAfter:after.faunaPerZone}))}));
