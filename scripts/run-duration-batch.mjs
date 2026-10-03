import {spawn} from 'node:child_process';
import {mkdirSync,openSync,closeSync,writeFileSync,existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const out=resolve(process.argv[2]||'design/duration-simulation-2026-09-29');
mkdirSync(out,{recursive:true});
const pilot=process.argv[3]==='pilot';
const extended=process.argv[3]==='extended';
const profiles=['precise','direct','explorer'],seeds=pilot?[41]:extended?
 [41,73,127,409,930,1013,1061,1103,1151,1201,1259,1301,1361,1409,1453,1511,1559,1601,1657,1709,1753,1801,1861,1907,1951,2003,2053,2111,2153,2203]:[41,73,127,409,930];
const jobs=seeds.flatMap(seed=>profiles.map(profile=>({profile,seed,hz:30})));
if(!pilot)jobs.push(...(extended?[41,1013,2203]:[41]).flatMap(seed=>profiles.map(profile=>({profile,seed,hz:60,contrast:true}))));
const resuming=process.env.VORO_SIM_RESUME==='1'&&existsSync(`${out}/batch.json`);
const state=resuming?JSON.parse(readFileSync(`${out}/batch.json`,'utf8')):{started:new Date().toISOString(),jobs:jobs.map(j=>({...j,status:'queued'}))};
if(resuming){
 if(JSON.stringify(state.jobs.map(({profile,seed,hz})=>({profile,seed,hz})))!==JSON.stringify(jobs.map(({profile,seed,hz})=>({profile,seed,hz}))))throw Error('Cannot resume a different protocol');
 state.resumptions??=[];state.resumptions.push({at:new Date().toISOString(),interrupted:state.jobs.filter(j=>j.status==='running').map(({profile,seed,hz})=>({profile,seed,hz}))});
 for(const j of state.jobs){
  if(j.status==='finished'&&j.exitCode===0){
   const r=JSON.parse(readFileSync(`${out}/${j.profile}-${j.seed}-${j.hz}.json`,'utf8'));
   if(r.profile!==j.profile||r.seed!==j.seed||r.hz!==j.hz)throw Error('Mismatched completed result');
  }else{j.status='queued';delete j.exitCode;}
 }
 delete state.finished;
}
state.concurrency=Number(process.env.VORO_SIM_WORKERS)|| (extended?6:3);
if(!Number.isInteger(state.concurrency)||state.concurrency<1||state.concurrency>12)throw Error('Workers must be 1–12');
const save=()=>writeFileSync(`${out}/batch.json`,JSON.stringify(state,null,2)+'\n');
save();let cursor=0,failed=false;
async function worker(){
 while(cursor<state.jobs.length){
  const job=state.jobs[cursor++],name=`${job.profile}-${job.seed}-${job.hz}`;
  if(job.status==='finished'&&job.exitCode===0)continue;
  job.status='running';job.started=new Date().toISOString();save();console.log('START',name);
  const log=openSync(`${out}/${name}.log`,'w');
  const code=await new Promise(resolveDone=>{
   const child=spawn(process.execPath,['scripts/simulate-duration.mjs',job.profile,String(job.seed),String(job.hz),out],{stdio:['ignore',log,log],windowsHide:true});
   child.once('error',error=>{job.error=String(error);resolveDone(-1);});child.once('exit',resolveDone);
  });closeSync(log);
  job.status=code===0?'finished':'error';job.exitCode=code;job.finished=new Date().toISOString();failed ||=code!==0;save();console.log('END',name,code);
 }
}
await Promise.all(Array.from({length:state.concurrency},worker));
state.finished=new Date().toISOString();save();process.exitCode=failed?1:0;
