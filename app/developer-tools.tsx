'use client';
import {useRef,useState} from 'react';
import type {VoroEngine,Snapshot} from './engine';
import {STAGES,stageStartMass} from './journey-data.mjs';
import {sharePerformanceFile} from './share-performance';
import {useBenchmarkAwake} from './benchmark-awake';
import {RELEASE} from './release.mjs';
import {t} from './language.mjs';

export default function DeveloperTools({engine:g,state:s}:{engine:VoroEngine|null;state:Snapshot}){
 const [open,setOpen]=useState(false),[stage,setStage]=useState(0),[size,setSize]=useState(0);
 const [safe,setSafe]=useState(true),[evolve,setEvolve]=useState(true),[keep,setKeep]=useState(true),[message,setMessage]=useState('');
 const resume=useRef(false);
 useBenchmarkAwake(!!s.automated?.running);
 if(!g)return null;
 const mass=stageStartMass(stage)*(STAGES[stage].goal*1.5/stageStartMass(stage))**(size/100);
 const show=()=>{resume.current=!g.paused;g.paused=true;g.settingsOpen=true;g.keys.clear();g.pointer=null;g.setAudio();setOpen(true);};
 const close=(play=false)=>{g.settingsOpen=false;if(play||resume.current)g.paused=false;g.setAudio();g.publish();setOpen(false);};
 const run=(fn:()=>unknown)=>{if(fn()!==false)close(true);};
 const share=async()=>{try{await sharePerformanceFile(g.performanceReport());setMessage('Informe preparado.');}catch{setMessage('No se pudo compartir el informe.');}};
 const buttonStyle={padding:'10px 14px',border:'1px solid #568a94',borderRadius:8,background:'#102c35',color:'#e9ffff',fontSize:14,cursor:'pointer'};
 return <>
  <button data-developer-tools style={{...buttonStyle,position:'fixed',right:12,top:'calc(env(safe-area-inset-top) + 78px)',zIndex:80}} onClick={show}>{t('Pruebas')}</button>
  {!open&&s.automated?.running&&<div style={{position:'fixed',left:12,bottom:90,zIndex:80,background:'#061a25ed',padding:12,color:'#fff'}}>
   <p>{t('Prueba automática en curso')} · {s.stageName}</p>
   <button style={buttonStyle} onClick={()=>g.finishAutomaticBenchmark()}>{t('Detener prueba')}</button>
   <button style={buttonStyle} onClick={()=>g.markAudioGlitch()}>{t('He oído un fallo')}</button>
  </div>}
  {open&&<section role="dialog" aria-modal="true" aria-label={t('Modo desarrollador')} style={{position:'fixed',inset:0,zIndex:100,background:'#04141cf7',color:'#e9ffff',overflowY:'auto',padding:'max(24px, env(safe-area-inset-top)) 20px max(24px, env(safe-area-inset-bottom))'}}>
   <div style={{maxWidth:650,margin:'auto',display:'grid',gap:12}}>
    <h2>{t('Modo desarrollador')} · VORO {RELEASE.version} ({RELEASE.build})</h2>
    <button style={buttonStyle} onClick={()=>close()}>{t('Volver al juego')}</button>
    <p>{t('Prueba crecimiento, adaptaciones y transiciones sin cambiar tu partida guardada.')}</p>
    <label>{t('Entorno')} <select style={buttonStyle} value={stage} onChange={e=>setStage(+e.target.value)}>{STAGES.map((v,i)=><option value={i} key={v.id}>{t(v.short)}</option>)}</select></label>
    <label>{t('Tamaño')} · {mass.toFixed(1)} / {STAGES[stage].goal}<input aria-label={t('Tamaño de prueba')} type="range" min="0" max="100" value={size} onChange={e=>setSize(+e.target.value)} style={{width:'100%'}}/></label>
    <label><input type="checkbox" checked={safe} onChange={e=>setSafe(e.target.checked)}/> {t('Invulnerabilidad')}</label>
    <label><input type="checkbox" checked={evolve} onChange={e=>setEvolve(e.target.checked)}/> {t('Permitir pasar al siguiente entorno')}</label>
    <label><input type="checkbox" checked={keep} onChange={e=>setKeep(e.target.checked)}/> {t('Usar mis adaptaciones')}</label>
    <button style={buttonStyle} onClick={()=>run(()=>g.startTest(stage,mass,keep,safe,evolve))}>{t('Entrar en la prueba')}</button>
    {s.testMode&&<>
     <button style={buttonStyle} onClick={()=>g.boostTest('biomass')}>{t('Añadir biomasa')} +25 %</button>
     <button style={buttonStyle} onClick={()=>g.boostTest('goal')}>{t('Llenar la barra de biomasa')}</button>
     <button style={buttonStyle} onClick={()=>run(()=>g.boostTest('adaptation'))}>{t('Conseguir una adaptación')}</button>
     <button style={buttonStyle} onClick={()=>run(()=>g.exitTest())}>{t('Volver a mi partida')}</button>
    </>}
    <button style={buttonStyle} onClick={()=>run(()=>g.startBenchmark())}>{t('Medir rendimiento')} · 30 s</button>
    <button style={buttonStyle} disabled={!!s.automated?.running} onClick={()=>run(()=>g.startAutomaticBenchmark())}>{t('Prueba automática de todos los entornos')}</button>
    <button style={buttonStyle} disabled={!!s.automated?.running} onClick={()=>run(()=>g.startAutomaticBenchmark(true))}>{t('Prueba automática de sonido y música')}</button>
    {s.automated?.running&&<button style={buttonStyle} onClick={()=>run(()=>g.finishAutomaticBenchmark())}>{t('Detener prueba')}</button>}
    <button style={buttonStyle} onClick={share}>{t('Compartir informe')}</button>
    {s.performance&&<output>{s.performance.fps} FPS · P95 {s.performance.p95} ms</output>}
    {message&&<output>{message}</output>}
   </div>
  </section>}
 </>;
}
