'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  ChevronsRight,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Shuffle,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { UPGRADES } from '../mutations.mjs';
import './interfaz.css';

type Look = 'abyss' | 'core' | 'scope';
type Scene =
  | 'play'
  | 'adaptation'
  | 'acquired'
  | 'evolution'
  | 'caption'
  | 'damage'
  | 'pause'
  | 'settings'
  | 'death'
  | 'ending';
const LOOKS: { id: Look; name: string; number: string; description: string }[] =
  [
    {
      id: 'abyss',
      name: 'Abisal',
      number: '01',
      description:
        'Cristal oscuro, bordes suaves y avisos que flotan sobre el mundo.',
    },
    {
      id: 'core',
      name: 'Núcleo',
      number: '02',
      description:
        'Imágenes grandes, luz ámbar y decisiones que se sienten importantes.',
    },
    {
      id: 'scope',
      name: 'Observatorio',
      number: '03',
      description:
        'Paneles compactos, información ordenada y más espacio para el entorno.',
    },
  ];
const SCENES: { id: Scene; name: string }[] = [
  { id: 'adaptation', name: 'Adaptación' },
  { id: 'evolution', name: 'Evolución' },
  { id: 'caption', name: 'Frase' },
  { id: 'damage', name: 'Daño' },
  { id: 'pause', name: 'Pausa' },
  { id: 'settings', name: 'Ajustes' },
  { id: 'death', name: 'Derrota' },
  { id: 'ending', name: 'Final' },
  { id: 'play', name: 'En juego' },
];
const FIRST = ['reach', 'digest', 'tentacles'],
  SECOND = ['speed', 'recycle', 'shield'];
const INITIAL: Record<string, number> = {
  reach: 1,
  digest: 2,
  tentacles: 0,
  speed: 1,
  recycle: 0,
  shield: 0,
};
function Artwork({ id }: { id: string }) {
  const art = UPGRADES.find((u) => u.id === id)?.artIndex ?? 0;
  return (
    <span
      className="ui-art"
      aria-hidden="true"
      style={{
        backgroundPosition: `${(art % 5) * 25}% ${Math.floor(art / 5) * 50}%`,
      }}
    />
  );
}
export default function InterfaceStudio() {
  const [look, setLook] = useState<Look>('abyss'),
    [scene, setScene] = useState<Scene>('adaptation');
  const [compare, setCompare] = useState(false),
    [biome, setBiome] = useState('sea');
  const [round, setRound] = useState(0),
    [rerolled, setRerolled] = useState(false),
    [counts, setCounts] = useState(INITIAL);
  const [selected, setSelected] = useState('reach'),
    [sound, setSound] = useState(true),
    [motion, setMotion] = useState(true);
  const [confirm, setConfirm] = useState(false),
    [dash, setDash] = useState(false);
  useEffect(() => {
    if (!dash) return;
    const timer = setTimeout(() => setDash(false), 7000);
    return () => clearTimeout(timer);
  }, [dash]);
  function show(next: Scene) {
    setScene(next);
    setConfirm(false);
    setRound((n) => n + 1);
  }
  function restart() {
    setCounts({ ...INITIAL });
    setRerolled(false);
    setDash(false);
    show('adaptation');
  }
  function choose(id: string) {
    setSelected(id);
    setCounts((old) => ({
      ...old,
      [id]: Math.min(
        (old[id] ?? 0) + 1,
        UPGRADES.find((u) => u.id === id)!.max,
      ),
    }));
    show('acquired');
  }
  const offer = rerolled ? SECOND : FIRST;
  const chosen = UPGRADES.find((u) => u.id === selected)!;
  const current = LOOKS.find((l) => l.id === look)!;
  const visible = compare ? LOOKS : LOOKS.filter((l) => l.id === look);
  const mass = scene === 'damage' ? 22.5 : 30,
    xp = scene === 'damage' ? 46.5 : 62;
  const biomeName =
    biome === 'sea' ? 'Mar' : biome === 'shore' ? 'Orilla' : 'Planetas';
  return (
    <main className={'ui-studio ' + (!motion ? 'ui-still' : '')}>
      <header className="ui-studio-header">
        <Link href="/" className="ui-back">
          <ArrowLeft size={18} />
          <span>Volver a VORO</span>
        </Link>
        <span className="ui-lab-label">ESTUDIO DE INTERFAZ</span>
        <Link href="/animaciones" className="ui-gallery-link">
          Animaciones <ArrowRight size={16} />
        </Link>
      </header>
      <section className="ui-studio-intro">
        <div>
          <p className="ui-kicker">TARJETAS, AVISOS Y MENÚS</p>
          <h1>Tres diseños para VORO.</h1>
        </div>
        <p>
          Prueba las tarjetas y los avisos con el arte del juego. Esta vista no
          modifica tu partida.
        </p>
      </section>
      <nav className="ui-look-picker" aria-label="Diseño de interfaz">
        {LOOKS.map((l) => (
          <button
            key={l.id}
            aria-pressed={look === l.id && !compare}
            onClick={() => {
              setLook(l.id);
              setCompare(false);
              setRound((n) => n + 1);
            }}
          >
            <span>{l.number}</span>
            <b>{l.name}</b>
            <small>
              {l.id === 'abyss'
                ? 'Sutil y envolvente'
                : l.id === 'core'
                  ? 'Visual y expresivo'
                  : 'Claro y compacto'}
            </small>
          </button>
        ))}
      </nav>
      <div className="ui-lab-toolbar">
        <nav className="ui-events" aria-label="Aviso que quieres probar">
          {SCENES.map((s) => (
            <button
              key={s.id}
              aria-pressed={scene === s.id}
              onClick={() => show(s.id)}
            >
              {s.name}
            </button>
          ))}
        </nav>
        <div className="ui-lab-options">
          <label>
            Fondo{' '}
            <select value={biome} onChange={(e) => setBiome(e.target.value)}>
              <option value="sea">Mar</option>
              <option value="shore">Orilla</option>
              <option value="space">Espacio</option>
            </select>
          </label>
          <label className="ui-check">
            <input
              type="checkbox"
              checked={compare}
              onChange={(e) => setCompare(e.target.checked)}
            />
            Comparar los tres
          </label>
          <button onClick={() => setRound((n) => n + 1)} className="ui-replay">
            <RotateCcw size={15} />
            Repetir entrada
          </button>
        </div>
      </div>
      <section
        className={'ui-previews ' + (compare ? 'ui-compare' : '')}
        aria-label="Propuestas interactivas"
      >
        {visible.map((style) => (
          <article className={'ui-example theme-' + style.id} key={style.id}>
            <div className="ui-example-title">
              <span>
                {style.number} / {style.name}
              </span>
              <small>
                {scene === 'acquired'
                  ? 'Mejora adquirida'
                  : SCENES.find((s) => s.id === scene)?.name}
              </small>
            </div>
            <div className={'ui-phone scene-' + scene}>
              <div
                className="ui-world"
                key={'world-' + round}
                style={{ backgroundImage: `url('/ui-previews/${biome}.webp')` }}
              />
              <div className="ui-world-shade" />
              <header className="ui-game-top">
                <span className="ui-logo">
                  VORO<small>ABISAL</small>
                </span>
                <div>
                  <button
                    aria-label="Abrir ajustes de muestra"
                    onClick={() => show('settings')}
                  >
                    <Settings size={18} />
                  </button>
                  <button
                    aria-label={
                      sound ? 'Silenciar muestra' : 'Activar sonido de muestra'
                    }
                    onClick={() => setSound(!sound)}
                  >
                    {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                  <button
                    aria-label="Pausar muestra"
                    onClick={() => show('pause')}
                  >
                    <Pause size={18} />
                  </button>
                </div>
              </header>
              <div className="ui-hud">
                <div className="ui-size">
                  <b>
                    {biome === 'space'
                      ? '4.600 km'
                      : biome === 'shore'
                        ? '8 cm'
                        : '1,8 m'}
                  </b>
                  <span>{biomeName}</span>
                </div>
                <div className="ui-meters">
                  <label>
                    <span>Biomasa</span>
                    <b>{mass.toFixed(1)} / 180</b>
                  </label>
                  <div className="ui-meter">
                    <i style={{ width: (mass / 180) * 100 + '%' }} />
                  </div>
                  <label>
                    <span>Próxima adaptación</span>
                    <b>{Math.round(xp)} %</b>
                  </label>
                  <div className="ui-meter ui-xp">
                    <i style={{ width: xp + '%' }} />
                  </div>
                </div>
              </div>
              {['play', 'damage', 'caption'].includes(scene) && (
                <div className="ui-game-bottom">
                  <span>
                    {biome === 'space' ? '07' : biome === 'shore' ? '03' : '04'}{' '}
                    / 10 <b>{biomeName}</b>
                  </span>
                  <button
                    className="ui-dash"
                    disabled={dash}
                    onClick={() => setDash(true)}
                  >
                    <ChevronsRight size={26} />
                    <span>{dash ? 'Recargando…' : 'Impulso'}</span>
                  </button>
                </div>
              )}
              <div key={scene + '-' + round} className="ui-scene">
                {scene === 'adaptation' && (
                  <div className="ui-overlay">
                    <section
                      className="ui-panel ui-adapt"
                      aria-label="Elegir una adaptación"
                    >
                      <p className="ui-eyebrow">
                        <Sparkles size={14} /> ADAPTACIÓN 08
                      </p>
                      <h2>
                        La vida encuentra
                        <br />
                        <em>otra forma.</em>
                      </h2>
                      <p className="ui-panel-copy">
                        Elige lo que crecerá contigo.
                      </p>
                      <div className="ui-cards">
                        {offer.map((id) => {
                          const u = UPGRADES.find((u) => u.id === id)!,
                            count = counts[id] ?? 0;
                          return (
                            <button
                              key={id}
                              className="ui-card"
                              disabled={count >= u.max}
                              onClick={() => choose(id)}
                            >
                              <Artwork id={id} />
                              <span className="ui-card-body">
                                <span className="ui-card-meta">
                                  {u.group}
                                  <small>
                                    {count} / {u.max}
                                  </small>
                                </span>
                                <strong>{u.name}</strong>
                                <span className="ui-effect">{u.detail}</span>
                              </span>
                              <ChevronRight
                                className="ui-card-arrow"
                                size={17}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <button
                        className="ui-reroll"
                        disabled={rerolled}
                        onClick={() => {
                          setRerolled(true);
                          setRound((n) => n + 1);
                        }}
                      >
                        <Shuffle size={16} />
                        {rerolled
                          ? 'Cambio de opciones usado'
                          : 'Otras opciones'}
                        <span>{rerolled ? '0 / 1' : '1 gratis'}</span>
                      </button>
                      <p className="ui-footnote">
                        La partida espera a que elijas.
                      </p>
                    </section>
                  </div>
                )}
                {scene === 'acquired' && (
                  <div className="ui-overlay">
                    <section className="ui-panel ui-success">
                      <Artwork id={selected} />
                      <p className="ui-eyebrow">
                        <Check size={15} /> ADAPTACIÓN INTEGRADA
                      </p>
                      <h2>{chosen.name}</h2>
                      <p className="ui-panel-copy">{chosen.detail}</p>
                      <p className="ui-count">
                        {counts[selected]} de {chosen.max} adquiridas
                      </p>
                      <button
                        className="ui-primary"
                        onClick={() => show('play')}
                      >
                        Seguir creciendo <ArrowRight size={18} />
                      </button>
                      <button
                        className="ui-text"
                        onClick={() => {
                          setRerolled(false);
                          show('adaptation');
                        }}
                      >
                        Probar otra adaptación
                      </button>
                    </section>
                  </div>
                )}
                {scene === 'evolution' && (
                  <div className="ui-overlay ui-evolution">
                    <section className="ui-panel">
                      <p className="ui-eyebrow">UNA NUEVA ESCALA</p>
                      <div className="ui-route">
                        <span>03 · ORILLA</span>
                        <ArrowRight size={22} />
                        <b>04 · MAR</b>
                      </div>
                      <h2>
                        La marea
                        <br />
                        <em>te abre el camino.</em>
                      </h2>
                      <p className="ui-panel-copy">
                        Lo que parecía inmenso
                        <br />
                        ahora cabe dentro de ti.
                      </p>
                      <div className="ui-evolution-line">
                        <i />
                      </div>
                      <button
                        className="ui-primary"
                        onClick={() => {
                          setBiome('sea');
                          show('play');
                        }}
                      >
                        Entrar en el mar <ArrowRight size={18} />
                      </button>
                    </section>
                  </div>
                )}
                {scene === 'caption' && (
                  <output className="ui-narrative">
                    <span>ALGO HA CAMBIADO</span>
                    <p>
                      Ya no persigues la vida.
                      <br />
                      <em>La vida huye de ti.</em>
                    </p>
                    <button className="ui-text" onClick={() => show('play')}>
                      Continuar <ArrowRight size={16} />
                    </button>
                  </output>
                )}
                {scene === 'damage' && (
                  <output className="ui-damage">
                    <span>MEMBRANA HERIDA</span>
                    <strong>−25 % de biomasa</strong>
                    <p>También pierdes progreso de adaptación.</p>
                    <small>Come tus fragmentos para recuperar biomasa.</small>
                    <button className="ui-text" onClick={() => show('play')}>
                      Continuar la muestra <ArrowRight size={15} />
                    </button>
                  </output>
                )}
                {scene === 'pause' && (
                  <div className="ui-overlay">
                    <section className="ui-panel ui-pause">
                      <p className="ui-eyebrow">EN SUSPENSIÓN</p>
                      <h2>Respira.</h2>
                      <p className="ui-panel-copy">El mundo puede esperar.</p>
                      <div className="ui-summary">
                        <span>
                          <b>8</b>adaptaciones
                        </span>
                        <span>
                          <b>147</b>absorciones
                        </span>
                      </div>
                      <button
                        className="ui-primary"
                        onClick={() => show('play')}
                      >
                        Continuar <Play size={18} />
                      </button>
                      <button
                        className="ui-secondary"
                        onClick={() => show('settings')}
                      >
                        Configuración <Settings size={17} />
                      </button>
                    </section>
                  </div>
                )}
                {scene === 'settings' && (
                  <div className="ui-overlay">
                    <section className="ui-panel ui-settings">
                      <div className="ui-panel-top">
                        <p className="ui-eyebrow">TU MUNDO</p>
                        <button
                          aria-label="Cerrar ajustes de muestra"
                          className="ui-close"
                          onClick={() => show('play')}
                        >
                          <X size={19} />
                        </button>
                      </div>
                      <h2>A tu ritmo.</h2>
                      <p className="ui-panel-copy">
                        Ajusta esta vista de prueba.
                      </p>
                      <button
                        className="ui-setting"
                        aria-pressed={sound}
                        onClick={() => setSound(!sound)}
                      >
                        <span>
                          Sonido<small>Estado de muestra</small>
                        </span>
                        <i className={sound ? 'on' : ''} />
                      </button>
                      <button
                        className="ui-setting"
                        aria-pressed={motion}
                        onClick={() => setMotion(!motion)}
                      >
                        <span>
                          Animaciones<small>Entradas y transiciones</small>
                        </span>
                        <i className={motion ? 'on' : ''} />
                      </button>
                      <button
                        className="ui-setting"
                        onClick={() => show('adaptation')}
                      >
                        <span>
                          Tus adaptaciones<small>Ver tarjetas de muestra</small>
                        </span>
                        <ChevronRight size={18} />
                      </button>
                      <button
                        className="ui-setting"
                        onClick={() => setConfirm(!confirm)}
                        aria-expanded={confirm}
                      >
                        <span>
                          Volver a nacer
                          <small>Reinicia solo esta muestra</small>
                        </span>
                        <RotateCcw size={17} />
                      </button>
                      {confirm && (
                        <div className="ui-confirm">
                          <p>¿Reiniciar las elecciones de esta muestra?</p>
                          <button className="ui-primary" onClick={restart}>
                            Reiniciar muestra
                          </button>
                          <button
                            className="ui-text"
                            onClick={() => setConfirm(false)}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                      <button
                        className="ui-primary"
                        onClick={() => show('play')}
                      >
                        Volver <ArrowRight size={18} />
                      </button>
                    </section>
                  </div>
                )}
                {scene === 'death' && (
                  <div className="ui-overlay">
                    <section className="ui-panel ui-death">
                      <p className="ui-eyebrow">BIOMASA AGOTADA</p>
                      <h2>
                        La vida
                        <br />
                        <em>insiste.</em>
                      </h2>
                      <p className="ui-panel-copy">
                        Vuelves a ser pequeño.
                        <br />
                        Conservas tus adaptaciones.
                      </p>
                      <div className="ui-summary">
                        <span>
                          <b>147</b>absorciones
                        </span>
                        <span>
                          <b>8</b>adaptaciones
                        </span>
                      </div>
                      <button
                        className="ui-primary"
                        onClick={() => show('play')}
                      >
                        Volver a intentarlo <RotateCcw size={18} />
                      </button>
                    </section>
                  </div>
                )}
                {scene === 'ending' && (
                  <div className="ui-overlay ui-ending">
                    <section className="ui-panel">
                      <p className="ui-eyebrow">UNIVERSO ABSORBIDO</p>
                      <h2>
                        Todo estaba
                        <br />
                        <em>dentro de ti.</em>
                      </h2>
                      <p className="ui-panel-copy">
                        De una única célula
                        <br />
                        al último punto de luz.
                      </p>
                      <p className="ui-ending-word">FIN</p>
                      <button
                        className="ui-primary"
                        onClick={() => show('settings')}
                      >
                        Ver tu recorrido <Sparkles size={18} />
                      </button>
                    </section>
                  </div>
                )}
              </div>
            </div>
            <p className="ui-design-note">{style.description}</p>
          </article>
        ))}
        {!compare && (
          <aside className="ui-preview-notes">
            <p className="ui-kicker">
              {current.number} / {current.name.toUpperCase()}
            </p>
            <h2>
              {current.id === 'abyss'
                ? 'Deja respirar al mundo.'
                : current.id === 'core'
                  ? 'Cada elección tiene presencia.'
                  : 'Todo, en su sitio.'}
            </h2>
            <p>{current.description}</p>
            <ul>
              <li>
                {current.id === 'abyss'
                  ? 'Tarjetas horizontales fáciles de comparar.'
                  : current.id === 'core'
                    ? 'Arte más grande en cada adaptación.'
                    : 'Decisiones agrupadas en un panel inferior.'}
              </li>
              <li>
                {current.id === 'abyss'
                  ? 'Frases libres sobre el paisaje.'
                  : current.id === 'core'
                    ? 'Títulos amplios y acentos cálidos.'
                    : 'Datos alineados y textos directos.'}
              </li>
              <li>El mismo contenido y los mismos efectos.</li>
            </ul>
            <button
              className="ui-notes-compare"
              onClick={() => setCompare(true)}
            >
              Ver los tres juntos <ArrowRight size={17} />
            </button>
            <button className="ui-replay" onClick={restart}>
              <RotateCcw size={15} />
              Reiniciar muestra
            </button>
          </aside>
        )}
      </section>
      <footer className="ui-lab-footer">
        <span>Prototipos de interfaz · VORO</span>
        <Link href="/">
          Volver a mi partida <ArrowRight size={16} />
        </Link>
      </footer>
    </main>
  );
}
