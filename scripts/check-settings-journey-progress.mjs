import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {newJourney,journeyLife,saveJourney} from '../app/journey-progress.mjs';
const {chromium}=createRequire(process.env.VORO_PLAYWRIGHT_RUNTIME)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const results=[];
try{
 for(const complete of [false,true]){
  const progress=newJourney(453);progress.stage=complete?9:4;progress.completed=complete;progress.totalEaten=2345;progress.totalTime=4680;
  progress.absorptionsByStage=progress.absorptionsByStage.map((_,i)=>i<=progress.stage?(i+1)*100:0);
  progress.totalEaten=progress.absorptionsByStage.reduce((sum,n)=>sum+n,0);
  const life=journeyLife(progress);life.eaten=17;
  const save=saveJourney(progress,life,{journal:new Map()},false);
  const context=await browser.newContext({viewport:{width:390,height:844},locale:'en-US'});
  await context.addInitScript(save=>{localStorage.setItem('voro-journey-v1',save);localStorage.setItem('voro-pc-demo-journey-v1',save);},save);
  const page=await context.newPage();await page.goto('http://127.0.0.1:5211/?ui=final',{waitUntil:'networkidle'});
  await (complete?page.locator('.final-survivor-actions'):page.locator('.game-header')).getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('button',{name:'Journey',exact:true}).click();
  const rows=page.locator('.journey-horizons li');await rows.first().waitFor();assert.equal(await rows.count(),complete?10:5);
  assert.equal(await page.locator('.journey-horizons [aria-current=step]').count(),complete?0:1);
  const counts=await page.locator('.journey-stage-count').allTextContents();
  assert.deepEqual(counts,progress.absorptionsByStage.slice(0,progress.stage+1).map((n,i)=>(n+(i===progress.stage?17:0)).toLocaleString('en-US')));
  await page.screenshot({path:`design/journey-settings-2026-09-23/compiled-${complete?'complete':'partial'}.png`});
  await page.getByRole('button',{name:'Be born again',exact:true}).click();
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await page.getByRole('button',{name:'Back to settings',exact:true}).click();
  await page.locator('.membrane-controls').waitFor();
  results.push({complete,rows:complete?10:5,counts,cancelPreservedSave:true});await context.close();
 }
}finally{await browser.close();}
await writeFile('design/journey-settings-2026-09-23/progress-qa.json',JSON.stringify(results,null,2));console.log(results);
