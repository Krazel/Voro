'use client';
import { useId, type CSSProperties } from 'react';
import { ChevronsUp, Shield, Sparkles } from 'lucide-react';
import { UPGRADES, levelOf } from './mutations.mjs';
import './adaptation-constellation.css';

// Vector filaments stay crisp at every device size and animate independently of copy.
function Membrane({ index }: { index: number }) {
  const uid = useId().replace(/:/g, '');
  return <svg className="adaptation-membrane" viewBox="0 0 240 240" aria-hidden="true">
    <defs>
      <radialGradient id={uid}><stop offset="70%" stopColor="currentColor" stopOpacity="0" /><stop offset="94%" stopColor="currentColor" stopOpacity=".24" /><stop offset="100%" stopColor="currentColor" stopOpacity="0" /></radialGradient>
    </defs>
    <circle cx="120" cy="120" r="112" fill={`url(#${uid})`} />
    <g className="adaptation-filaments" fill="none" stroke="currentColor">
      {[0, 45, 90, 135].map((angle, i) => <path key={angle} transform={`rotate(${angle} 120 120)`} strokeWidth={i === 0 ? 1.7 : .65} opacity={i === 0 ? .95 : .65} d="M120 13 C163 3 215 59 222 106 S186 224 130 224 S16 190 15 128 S62 29 120 13Z" />)}
      <ellipse cx="120" cy="120" rx="108" ry="97" strokeWidth=".55" strokeDasharray="1 5 12 8" />
    </g>
    <g className="adaptation-satellites" fill="currentColor">
      {Array.from({ length: 12 }, (_, n) => {
        const a = n * Math.PI / 6 + index;
        return <circle key={n} cx={120 + Math.cos(a) * (n % 2 ? 110 : 102)} cy={120 + Math.sin(a) * (n % 2 ? 110 : 102)} r={n % 3 === 0 ? 2.9 : 1.2} opacity={n % 2 ? .55 : .95} />;
      })}
    </g>
  </svg>;
}

function Organism() {
  return <svg className="adaptation-organism" viewBox="0 0 200 200" aria-hidden="true">
    <circle className="adaptation-orbit" cx="100" cy="100" r="91" fill="none" stroke="#79daee" strokeWidth=".55" strokeDasharray="1 4 30 5" />
    <circle cx="100" cy="100" r="82" fill="none" stroke="#67c3d8" strokeOpacity=".35" strokeWidth=".6" />
    <g className="adaptation-cell">
      <path d="M90 41 C101 20 118 29 119 48 C123 65 139 64 147 52 C159 39 170 54 160 71 C149 91 165 98 174 109 C187 127 169 139 153 129 C134 117 133 140 132 154 C129 177 109 170 108 150 C104 130 88 141 79 157 C64 174 48 158 60 141 C74 121 56 118 41 122 C16 129 18 105 41 101 C67 94 52 84 39 73 C22 58 39 41 54 56 C71 73 83 62 90 41Z" fill="#7fd9ef30" stroke="#b4f5ff" strokeWidth="2" />
      <path d="M90 41L82 80 41 101 92 114 79 157 113 117 153 129 127 96 160 71 112 77Z M82 80L112 77 127 96 113 117 92 114Z" fill="#c4f2f01a" stroke="#c8ecf3" strokeOpacity=".6" strokeWidth=".8" />
      <circle cx="103" cy="98" r="26" fill="#e9a54135" stroke="#ffd480" strokeWidth="1.5" />
      <circle cx="103" cy="98" r="14" fill="#ffd17580" stroke="#ffe7a1" />
      <path d="M103 77L106 94 121 98 106 102 103 121 99 103 86 98 99 94Z" fill="#fff5ca" />
      {[ [77,83], [126,73], [139,111], [72,122], [108,136], [56,69] ].map(([x,y]) => <circle key={x} cx={x} cy={y} r="3.5" fill="#b5eaff50" stroke="#e4faff" strokeWidth=".65" />)}
    </g>
  </svg>;
}

export function AdaptationChoices({ offer, mutations, onChoose }: {
  offer: string[]; mutations: string[]; onChoose: (id: string) => void;
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
    <Organism />
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
