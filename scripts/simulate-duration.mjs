// Headless real-engine campaign run. No reward, movement or invulnerability cheats.
// Usage: node scripts/simulate-duration.mjs direct 41 [30]
import {mkdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {makeEngine} from '../tests/engine-fixture.mjs';
import {newJourney,journeyLife} from '../app/journey-progress.mjs';
import {JourneyWorld} from '../app/journey-world.mjs';
import {STAGES,SPECIES_BY_ID,isDanger} from '../app/journey-data.mjs';
import {MAX_UPGRADE_CHOICES} from '../app/mutations.mjs';
import {RELEASE} from '../app/release.mjs';

const profiles={
 precise:{reaction:0,exploration:0,choiceSeconds:5,priority:['yield','speed','digest','slots','shield','pull','tentacleReach','tentacles','combo','decoy','dash','turn','recycle','spikes']},
 direct:{reaction:.10,exploration:0,choiceSeconds:5,priority:['speed','digest','slots','tentacles','tentacleReach','pull','shield','combo','dash','turn','decoy','recycle','spikes','yield']},
 explorer:{reaction:.25,exploration:.15,choiceSeconds:10,priority:['shield','speed','digest','tentacles','decoy','slots','dash','pull','recycle','spikes','tentacleReach','combo','turn','yield']},
};
const profile=process.argv[2]||'direct',seed=Number(process.argv[3]||41),hz=Number(process.argv[4]||30);
if(!profiles[profile]||!Number.isSafeInteger(seed)||![30,60].includes(hz))throw new Error('Usage: simulate-duration.mjs precise|direct|explorer SEED [30|60]');
const config=profiles[profile],out='design/duration-simulation-2026-09-28';mkdirSync(out,{recursive:true});
// Freeze ambient randomness as well as the world seed, for repeatable runs.
let randomState=seed>>>0;
Math.random=()=>{randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;};
const started=performance.now(),dt=1/hz,maxSeconds=3*3600;
const {game:g}=makeEngine();g.progress=newJourney(seed);g.life=journeyLife(g.progress);g.world=new JourneyWorld(seed,[],0);g.seed();g.action('start');
const stages=[],choices=[];
let simulated=0,active=0,cinematic=0,deaths=0,lastStage=-1,target=null,nextDecision=0,nextTarget=0,finishedAt=null;

function steer(){
 const p=g.life;
 if(!target||target.eaten||simulated>=nextTarget){
  nextTarget=simulated+1;
  const enemies=g.world.entities.filter(e=>!e.eaten&&e.requiredMass>p.biomass&&isDanger(SPECIES_BY_ID[e.kind]));
  const score=e=>{
   let value=Math.hypot(e.x-p.x,e.y-p.y);
   for(const other of enemies){const distance=Math.hypot(e.x-other.x,e.y-other.y),danger=p.radius+other.r+90;if(distance<danger)value+=(danger-distance)*5;}
   return value;
  };
  const eligible=g.world.entities.filter(e=>!e.eaten&&e.requiredMass<=p.biomass);
  target=eligible.find(e=>e.final)||eligible.sort((a,b)=>score(a)-score(b))[0];
 }
 if(!target){g.padInput={x:Math.cos(simulated*.05),y:Math.sin(simulated*.05)};return;}
 const dx=target.x-p.x,dy=target.y-p.y,len=Math.max(1,Math.hypot(dx,dy));
 let x=dx/len,y=dy/len;
 // Explicit sensitivity scenario, not a calibrated average human: spend 15%
 // of active navigation heading elsewhere, still exposed to normal dangers.
 if(config.exploration&&active%30<30*config.exploration){const angle=Math.floor(active/30)*2.399+seed;x=Math.cos(angle);y=Math.sin(angle);}
 for(const enemy of g.world.entities){
  if(enemy.eaten||enemy.requiredMass<=p.biomass||!isDanger(SPECIES_BY_ID[enemy.kind]))continue;
  const ex=p.x-enemy.x,ey=p.y-enemy.y,d=Math.max(1,Math.hypot(ex,ey)),safe=p.radius+enemy.r+120;
  if(d<safe){const avoid=3*(1-d/safe);x+=ex/d*avoid;y+=ey/d*avoid;if(d<safe-65)g.action('dash');}
 }
 if(Math.hypot(x,y)<.4){const a=Math.atan2(dy,dx)+Math.PI/2;x=Math.cos(a);y=Math.sin(a);}
 for(const b of g.world.projectiles){
  const distance=Math.hypot(p.x-b.x,p.y-b.y);
  if(distance<p.radius+70&&p.biomass<b.edibleAt){const speed=Math.max(1,Math.hypot(b.vx,b.vy));x+=-b.vy/speed*1.2;y+=b.vx/speed*1.2;}
 }
 g.padInput={x,y};
}

for(let frame=0;frame<maxSeconds*hz;frame++){
 if(g.progress.stage!==lastStage){
  if(stages.length)stages.at(-1).end=simulated;
  lastStage=g.progress.stage;target=null;
  stages.push({id:STAGES[lastStage].id,start:simulated,choices:0,deaths:0});
  console.log(`${profile}/${seed}/${hz}Hz: ${STAGES[lastStage].id} at ${(simulated/60).toFixed(1)} min`);
 }
 if(g.life.dead){deaths++;stages.at(-1).deaths++;if(deaths>=10)break;g.action('retry');target=null;}
 if(g.progress.offer.length){
  const id=config.priority.find(id=>g.progress.offer.includes(id))||g.progress.offer[0];
  choices.push({at:simulated,stage:STAGES[lastStage].id,id});stages.at(-1).choices++;g.choose(id);
 }
 const inCinematic=!!(g.birth||g.transition||g.earthAbsorption||g.ending);
 if(!inCinematic&&!g.progress.completed&&simulated>=nextDecision){steer();nextDecision=simulated+config.reaction;}
 if(inCinematic)cinematic+=dt;else active+=dt;
 g.time+=dt;g.update(dt);simulated+=dt;
 if(g.progress.completed&&finishedAt===null)finishedAt=simulated;
 if(g.progress.completed&&g.ending<=0)break;
}
stages.at(-1).end=simulated;
const completed=g.progress.completed&&g.ending<=0,wallSeconds=(performance.now()-started)/1000;
const menuSeconds=choices.length*config.choiceSeconds+deaths*5;
const result={
 version:RELEASE,source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),profile,seed,hz,config,
 completed,stoppedReason:completed?'completed':deaths>=10?'death-limit':'time-limit',
 simulationSeconds:simulated,activeSeconds:active,cinematicSeconds:cinematic,menuSeconds,
 estimatedSessionSeconds:simulated+menuSeconds,wallSeconds,speedup:simulated/wallSeconds,
 finalConsumptionAt:finishedAt,deaths,upgrades:g.progress.level,remainingChoices:MAX_UPGRADE_CHOICES-g.progress.level,
 stages:stages.map(s=>({...s,seconds:s.end-s.start,menuSeconds:s.choices*config.choiceSeconds+s.deaths*5})),choices,
 assumptions:[
  'Real update/feeding/damage/spawn/adaptation logic with fixed small steps; no modified balance or invulnerability.',
  'Rendering and audio are stubbed; this estimates pacing, never device FPS or loading time.',
  'Pilot can inspect all loaded entities and their edible thresholds. Profiles are synthetic, not calibrated human skill groups.',
  'Choice reading time and 5 seconds per retry are explicit added assumptions; breaks, loading and optional menus are excluded.',
  'Total simulation clock includes birth, evolution, Earth absorption, ending and failed attempts.',
  'At most three simulated hours / ten deaths. Incomplete runs are censored, never reported as completion times.',
 ],
};
g.destroy();writeFileSync(`${out}/${profile}-${seed}-${hz}.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({profile,seed,hz,completed,minutes:result.estimatedSessionSeconds/60,deaths,wallSeconds,speedup:result.speedup}));
