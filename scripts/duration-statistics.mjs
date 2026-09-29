export const STAGE_IDS=['micro','pond','land','water','city','orbit','planets','stars','galaxies','universe'];
export function descriptive(values){
 const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b),n=sorted.length;
 if(!n)return {n:0,mean:null,median:null,min:null,max:null};
 return {n,mean:sorted.reduce((a,b)=>a+b,0)/n,median:n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2,min:sorted[0],max:sorted[n-1]};
}
export function durationSummary(runs){
 const main=runs.filter(r=>r.hz===30);
 const result={attempted:main.length,completed:main.filter(r=>r.completed).length,
  sessionMinutes:descriptive(main.filter(r=>r.completed).map(r=>r.estimatedSessionSeconds/60)),
  profiles:{},stages:[]};
 for(const profile of ['precise','direct','explorer']){
  const group=main.filter(r=>r.profile===profile);
  result.profiles[profile]={attempted:group.length,completed:group.filter(r=>r.completed).length,
   sessionMinutes:descriptive(group.filter(r=>r.completed).map(r=>r.estimatedSessionSeconds/60))};
 }
 for(const id of STAGE_IDS){
  const observations=main.flatMap(r=>r.stages.filter(s=>s.id===id).map(s=>({...s,profile:r.profile,seed:r.seed})));
  const finished=observations.filter(s=>s.completed);
  result.stages.push({id,reached:observations.length,completed:finished.length,censored:observations.filter(s=>!s.completed).map(s=>({profile:s.profile,seed:s.seed,elapsedMinutes:(s.seconds+s.menuSeconds)/60})),
   minutes:descriptive(finished.map(s=>(s.seconds+s.menuSeconds)/60)),simulationMinutes:descriptive(finished.map(s=>s.seconds/60)),
   assumedChoiceMinutes:descriptive(finished.map(s=>s.menuSeconds/60)),hits:descriptive(finished.map(s=>s.hits)),
   byProfile:Object.fromEntries(['precise','direct','explorer'].map(profile=>[profile,descriptive(finished.filter(s=>s.profile===profile).map(s=>(s.seconds+s.menuSeconds)/60))]))});
 }
 result.contrasts=runs.filter(r=>r.hz===60).map(r=>{
  const base=main.find(b=>b.seed===r.seed&&b.profile===r.profile);
  return {profile:r.profile,seed:r.seed,baseCompleted:base?.completed,completed:r.completed,minutes30:base?.estimatedSessionSeconds/60,minutes60:r.estimatedSessionSeconds/60,
   stages:r.stages.map(s=>({id:s.id,completed:s.completed,minutes60:(s.seconds+s.menuSeconds)/60,minutes30:base?.stages.find(b=>b.id===s.id)?.completed?((base.stages.find(b=>b.id===s.id).seconds+base.stages.find(b=>b.id===s.id).menuSeconds)/60):null}))};
 });
 return result;
}
