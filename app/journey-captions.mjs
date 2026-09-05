// Each stage has its own voice. Selection uses the saved adaptation count so
// rerolling choices or reopening a saved offer keeps the same line.
/** @type {Record<string, string[]>} */
export const ADAPTATION_CAPTIONS = {
  micro: [
    'La vida encuentra\notra forma.',
    'Todo empieza\ncon hambre.',
    'Tu cuerpo aprende\na ser más.',
  ],
  pond: [
    'Bajo el agua,\nalgo despierta.',
    'Lo diminuto\ntambién tiene hambre.',
  ],
  land: [
    'La orilla entera\npuede ser parte de ti.',
    'Raíces, conchas, alas.\nTodo te transforma.',
  ],
  water: ['El mar guarda\nnuevas formas.', 'Tu sombra crece\nbajo las olas.'],
  city: [
    'Las calles ya no saben\ncómo detenerte.',
    'Lo que construyeron\ntambién te alimenta.',
  ],
  orbit: [
    'El cielo era\nsolo otra orilla.',
    'El mundo que te vio nacer\nqueda bajo tu sombra.',
  ],
  planets: [
    'Cada mundo\nte cambia por dentro.',
    'Los océanos caben\nen un solo latido.',
  ],
  stars: [
    'La luz también\npuede tener sabor.',
    'Llevas nuevos soles\nbajo la membrana.',
  ],
  galaxies: [
    'Un cielo entero\nes apenas un bocado.',
    'Las espirales de luz\nse enredan en ti.',
  ],
  universe: [
    'El universo empieza\na caber en ti.',
    'Aún recuerdas\naquella primera gota.',
  ],
};
export function adaptationCaption(stageId, level) {
  const lines = ADAPTATION_CAPTIONS[stageId] || ADAPTATION_CAPTIONS.micro;
  const index = Number.isFinite(level) ? Math.max(0, Math.floor(level)) : 0;
  return lines[index % lines.length];
}
