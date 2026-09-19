'use client';
import { useId, useEffect, useRef, type CSSProperties } from 'react';
import { ChevronsUp, Shield, Sparkles } from 'lucide-react';
import { UPGRADES, levelOf } from './mutations.mjs';
import './adaptation-constellation.css';

// A living outline, separate from the text and from the real player canvas.
function membranePath(time: number, phase: number, scale = 1) {
  // Approved B1: five slow extensions, with ten smaller independent tips.
  const t = time + phase * 1.7, tau = Math.PI * 2;
  const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
  const points = Array.from({length: 240}, (_, i) => {
    const a = i / 240 * tau;
    let r = 82, twist = 0;
    for (let j = 0; j < 5; j++) {
      const p = t * .8 - j * 1.35, pulse = (.5 + .5 * Math.sin(p)) ** 2;
      const dist = wrap(a - j * tau / 5 - .08 * Math.sin(p));
      const lobe = Math.exp(-dist * dist / .025);
      r += 32 * pulse * lobe;
      twist += .15 * lobe * pulse * Math.sin(p * .5 + j);
    }
    for (let j = 0; j < 10; j++) {
      const offset = j % 2 === 0 ? .32 : .68;
      const p = t * (.63 + (j % 4) * .065) - j * 1.73;
      const pulse = .22 + .78 * (.5 + .5 * Math.sin(p)) ** 2;
      const center = (Math.floor(j / 2) + offset) * tau / 5 + .026 * Math.sin(p * .7 + j);
      const dist = wrap(a - center), lobe = Math.exp(-dist * dist / .0038);
      r += (10 + (j % 3) * 2) * pulse * lobe;
      twist += .032 * lobe * pulse * Math.sin(p + j * .8);
    }
    r = (r + 1.5 * Math.sin(a * 3 + t * .35)) * scale;
    return [120 + Math.cos(a + twist) * r, 120 + Math.sin(a + twist) * r];
  });
  const last = points.at(-1)!;
  return `M${(last[0]+points[0][0])/2},${(last[1]+points[0][1])/2}` + points.map((p,i) => {
    const n = points[(i+1)%points.length];
    return `Q${p[0]},${p[1]} ${(p[0]+n[0])/2},${(p[1]+n[1])/2}`;
  }).join('') + 'Z';
}
function Membrane({ index }: { index: number }) {
  const uid = useId().replace(/:/g, '');
  const outline = useRef<SVGGElement>(null);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, last = 0;
    const paint = (stamp: number) => {
      if (stamp-last > 32) {
        outline.current?.querySelectorAll('path').forEach((p,i) => p.setAttribute('d',membranePath(stamp/1000,index,i ? .975 : 1)));
        last=stamp;
      }
      if (!media.matches) frame=requestAnimationFrame(paint);
    };
    const start = () => {cancelAnimationFrame(frame); if(!media.matches)frame=requestAnimationFrame(paint);};
    start(); media.addEventListener('change',start);
    return () => {cancelAnimationFrame(frame);media.removeEventListener('change',start);};
  }, [index]);
  return <svg className="adaptation-membrane" viewBox="0 0 240 240" aria-hidden="true">
    <defs><radialGradient id={uid}><stop offset="65%" stopColor="currentColor" stopOpacity="0"/><stop offset="96%" stopColor="currentColor" stopOpacity=".22"/></radialGradient></defs>
    <g ref={outline} stroke="currentColor">
      <path d={membranePath(0,index)} fill={`url(#${uid})`} strokeWidth="1.5"/>
      <path d={membranePath(0,index,.975)} fill="none" strokeWidth=".6" opacity=".6"/>
    </g>
    <g className="adaptation-satellites" fill="currentColor">
      {Array.from({length:10},(_,i)=><circle key={i} cx={120+Math.cos(i*Math.PI/5)*108} cy={120+Math.sin(i*Math.PI/5)*108} r={i%3?1.2:2.8} opacity=".7"/>)}
    </g>
  </svg>;
}
function Protagonist({ connect }: { connect?: (canvas: HTMLCanvasElement | null) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const node=canvas.current!;
    const resize=()=>{const r=node.getBoundingClientRect();const d=Math.min(devicePixelRatio||1,3);node.width=Math.round(r.width*d);node.height=Math.round(r.height*d);};
    resize(); const observer=new ResizeObserver(resize);observer.observe(node);
    connect?.(node);
    return()=>{observer.disconnect();connect?.(null);};
  },[connect]);
  return <canvas ref={canvas} className="adaptation-organism" aria-hidden="true" data-renderer="live-protagonist"/>;
}

export function AdaptationChoices({ offer, mutations, onChoose, onProtagonist }: {
  offer: string[]; mutations: string[]; onChoose: (id: string) => void; onProtagonist?: (canvas: HTMLCanvasElement | null) => void;
}) {
  // Keep three selectable positions even at the final capped upgrades. Repeated
  // positions grant the same remaining upgrade, never an extra level or reroll.
  const slots = offer.length ? Array.from({ length: 3 }, (_, i) => offer[i % offer.length]) : [];
  const symbols = [ChevronsUp, Sparkles, Shield];
  return <div className="adaptation-constellation" data-choice-count={slots.length}>
    <svg className="adaptation-connections" viewBox="0 0 400 500" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" strokeWidth="1.4">
        <path stroke="#5aeae5" d="M200 238 C163 206 230 192 200 144 M200 238 C222 203 183 197 200 144" />
        <path stroke="#ffc26d" d="M191 255 C132 254 156 305 102 326 M191 255 C171 293 117 273 102 326" />
        <path stroke="#ae99ff" d="M209 255 C268 254 244 305 298 326 M209 255 C229 293 283 273 298 326" />
      </g>
    </svg>
    <Protagonist connect={onProtagonist} />
    {slots.map((id, index) => {
      const upgrade = UPGRADES.find((item) => item.id === id)!;
      const Symbol = symbols[index];
      return <div className={`adaptation-position adaptation-position-${index}`} key={`${index}-${id}`} style={{ '--arrival-delay': `${index * 110}ms` } as CSSProperties}>
        <button type="button" className="adaptation-bubble" onClick={() => onChoose(id)} aria-label={`${upgrade.name}. ${upgrade.detail}. ${levelOf(mutations, id)} de ${upgrade.max} adquiridas`} data-upgrade={id}>
          <Membrane index={index} />
          <span className="adaptation-copy">
            <span className="mutation-art" aria-hidden="true" style={{ backgroundPosition: `${(upgrade.artIndex % 5) * 25}% ${Math.floor(upgrade.artIndex / 5) * 50}%` }} />
            <strong>{upgrade.name}</strong>
            <small>{upgrade.detail}</small>
            <span className="adaptation-level"><Symbol size={17} aria-hidden="true" />{levelOf(mutations, id)} / {upgrade.max}</span>
          </span>
        </button>
        <span className="adaptation-intent" aria-hidden="true">{upgrade.group}</span>
      </div>;
    })}
  </div>;
}
