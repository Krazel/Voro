'use client';
import {useState} from 'react';
import {VoroEngine} from './engine';
import {STAGES,stageStartMass} from './journey-data.mjs';
import {ORBITAL_EARTH} from './earth-landmark.mjs';
import {journeyEntity} from './journey-world.mjs';
import {SPECIES_BY_ID} from './journey-data.mjs';
import './cosmic-lab.css';

// Opt-in localhost tooling, never displayed on the public site or in iOS builds.
export function CosmicLab({game}:{game:VoroEngine}) {
 const [folded,setFolded]=useState(false);
 const [invulnerable,setInvulnerable]=useState(false);
 const [evolution,setEvolution]=useState(true);
 const scene=(id:string)=>{
  game.settingsOpen=false;
  const stage=STAGES.findIndex(s=>s.id===id);
  game.startTest(stage,stageStartMass(stage),false,invulnerable,evolution);
  game.setDiagnostics(true);
 };
 const earth=()=>{
  const stage=STAGES.findIndex(s=>s.id==='orbit');
  game.startTest(stage,STAGES[stage].goal,false,true,true);
  game.life.x=ORBITAL_EARTH.x;game.life.y=ORBITAL_EARTH.y-1300;
  game.camera={x:game.life.x,y:game.life.y};game.beginEvolution();
 };
 const hole=()=>{
  scene('galaxies');
  // Review specimen replaces a resident; ordinary generation remains rare.
  const e=journeyEntity(SPECIES_BY_ID['galaxies-black-hole'],game.life.x+170,game.life.y-70,0,'lab-black-hole');
  game.world.entities.splice(0,1,e);game.food=[...game.world.entities];
 };
 const effect=async(kind:'damage'|'ingest')=>{
  if(!game.testMode)scene('orbit');
  game.initAudio();
  try {await game.audio?.resume();await game.sfx?.unlock();}catch{return;}
  if(game.prepareEffects())kind==='damage'?game.sfx?.playDamage():game.sfx?.playIngest();
 };
 const decoy=()=>{
  // Always grant inside a disposable test scene, never the saved campaign.
  if(!game.testMode || game.life.dead || game.transition || game.earthAbsorption || game.progress.completed)
   scene(STAGES[game.progress.stage].id);
  game.settingsOpen=false;game.paused=false;
  if(!game.progress.mutations.includes('decoy')) {
   game.progress.offer=['decoy'];game.choose('decoy');
  }
  game.progress.offer=[];game.life.cooldown=0;
  game.toast('Señuelo activado. Muévete y usa el impulso para verlo.',6);
  game.publish();
  game.canvas.focus({preventScroll:true});
 };
 return <aside className="cosmic-lab" aria-label="Pruebas locales">
  <button onClick={()=>setFolded(!folded)}>{folded?'Mostrar pruebas':'Ocultar pruebas'} · solo local</button>
  {!folded&&<>
   <p>Escenas temporales. Tu partida queda guardada aparte.</p>
   <div>
    <label><input type="checkbox" checked={invulnerable} onChange={e=>{setInvulnerable(e.target.checked);if(game.testMode)game.testInvulnerable=e.target.checked;}}/> Invulnerabilidad</label>
    <label><input type="checkbox" checked={evolution} onChange={e=>{setEvolution(e.target.checked);if(game.testMode)game.testEvolution=e.target.checked;}}/> Cambiar de entorno al crecer</label>
   </div>
   <div>{STAGES.map(s=><button key={s.id} onClick={()=>scene(s.id)}>{s.short}</button>)}</div>
   <div><button onClick={earth}>Comer Tierra</button><button onClick={hole}>Ver agujero negro</button></div>
   <div><button onClick={()=>game.boostTest('biomass')}>Crecer</button><button onClick={()=>game.boostTest('adaptation')}>Adaptación</button><button onClick={decoy}>Probar señuelo</button></div>
   <div><button onClick={()=>effect('damage')}>Oír daño</button><button onClick={()=>effect('ingest')}>Oír comer</button><button onClick={()=>game.exitTest()}>Volver a partida</button></div>
  </>}
 </aside>;
}
