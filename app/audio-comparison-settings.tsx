'use client';
import {useEffect,useRef,useState} from 'react';
import {AudioComparison} from './audio-comparison.mjs';
import {t} from './language.mjs';
type State=ReturnType<AudioComparison['snapshot']>;
export function AudioComparisonSettings({getComparison,sound}:{getComparison:()=>AudioComparison|null,sound:boolean}){
  const controller=useRef<AudioComparison|null>(null);
  const [state,setState]=useState<State>({phase:'idle',route:null,error:null,ready:false,trials:[]});
  useEffect(()=>{
    const player=sound?getComparison():null;controller.current=player;
    if(player){player.onChange=setState;setState(player.snapshot());void player.prepare();}
    else setState(previous=>({...previous,phase:'idle',ready:false}));
    return()=>{const current=controller.current;if(current){current.onChange=()=>{};current.stop('settings-closed');}controller.current=null;};
  },[getComparison,sound]);
  const active=['playing','starting'].includes(state.phase);
  const latest=state.trials.at(-1);
  const retry=()=>{
    const player=getComparison();if(!player)return;
    controller.current=player;player.onChange=setState;void player.prepare();setState(player.snapshot());
  };
  const play=(route:'A'|'B')=>{
    const player=getComparison();if(!player)return;
    if(controller.current!==player){controller.current=player;player.onChange=setState;setState(player.snapshot());void player.prepare();}
    void player.play(route);
  };
  return <div className="audio-comparison">
    <h3>{t('Comparar audio A/B')}</h3>
    <p>{t('Escucha A y B: son los mismos 12 segundos de Microscopio. Mantén el volumen del iPhone igual. Puedes repetirlos.')}</p>
    {!sound&&<p role="status">{t('Activa el sonido del juego para comparar.')}</p>}
    {sound&&!state.ready&&<p role="status">{t(state.phase==='loading'?'Preparando el fragmento…':'Pulsa Preparar para cargar la prueba.')}</p>}
    <div className="audio-comparison-buttons">
      <button disabled={!sound||!state.ready} onClick={()=>play('A')}>{t('Escuchar A')}</button>
      <button disabled={!sound||!state.ready} onClick={()=>play('B')}>{t('Escuchar B')}</button>
    </div>
    {sound&&(!state.ready||state.phase==='error')&&<button disabled={state.phase==='loading'} onClick={retry}>{t('Preparar')}</button>}
    {active&&<button onClick={()=>controller.current?.stop('user')}>{t('Parar prueba')}</button>}
    <p role="status" aria-live="polite">{state.phase==='playing'?`${t('Escuchando')} ${state.route}…`:state.phase==='starting'?t('Iniciando…'):state.phase==='complete'?t('Fragmento terminado. Marca lo que oíste.'):state.phase==='stopped'?t('Prueba detenida. Puedes repetir A o B.'):state.phase==='error'?t('No se pudo reproducir. Pulsa Preparar y vuelve a intentarlo.'):''}</p>
    {latest?.startedAt!=null&&<label>{t('Lo que escuché en')} {latest.route}
      <select aria-label={`${t('Resultado de')} ${latest.route}`} value={latest.heard??''} onChange={e=>controller.current?.answer(latest.id,e.target.value)}>
        <option value="">{t('Sin indicar')}</option><option value="good">{t('Sonaba bien')}</option><option value="crackle">{t('Había petardeo')}</option><option value="silent">{t('Estaba en silencio')}</option><option value="unsure">{t('No pude distinguirlo')}</option>
      </select>
    </label>}
    {state.trials.some(trial=>trial.heard)&&<p>{t('Respuestas guardadas')}</p>}
    {(['A','B'] as const).map(route=>{
      const trial=[...state.trials].reverse().find(item=>item.route===route&&item.heard);
      if(!trial)return null;
      const label=({good:'Sonaba bien',crackle:'Había petardeo',silent:'Estaba en silencio',unsure:'No pude distinguirlo'} as Record<string,string>)[trial.heard];
      return <p className="audio-comparison-result" key={route}>{route}: {t(label)}</p>;
    })}
    <p>{t('Si una suena bien y otra mal, repítelas para comprobarlo. Después comparte el diagnóstico de abajo: incluye tus respuestas.')}</p>
  </div>;
}
