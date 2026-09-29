import {spawn} from 'node:child_process';
import {mkdirSync,openSync,closeSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const out=resolve(process.argv[2]||'design/duration-simulation-2026-09-29');
mkdirSync(out,{recursive:true});
const profiles=['precise','direct','explorer'],seeds=[41,73,127,409,930];
const jobs=seeds.flatMap(seed=>profiles.map(profile=>({profile,seed,hz:30})));
jobs.push(...profiles.map(profile=>({profile,seed:41,hz:60,contrast:true})));
const state={started:new Date().toISOString(),concurrency:3,jobs:jobs.map(j=>({...j,status:'queued'}))};
const save=()=>writeFileSync(`${out}/batch.json`,JSON.stringify(state,null,2)+'\n');
save();let cursor=0,failed=false;
async function worker(){
 while(cursor<state.jobs.length){
  const job=state.jobs[cursor++],name=`${job.profile}-${job.seed}-${job.hz}`;
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
