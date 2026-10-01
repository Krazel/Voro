# Corrección de marcha lateral — 1 de octubre de 2026

El usuario señaló que soldado, soldado pesado, peatona con bolso, trabajador,
persona con bastón y oficinista repetían la misma pierna; el repartidor saltaba de
posición. Civil, unidad con escudo y corredora quedan aprobados y sin cambios.

## Resultado candidato

- Los seis ciclos problemáticos usan ocho fotogramas de una marcha articulada,
  calculada y pintada fuera del juego. Rodillas y tobillos alternan apoyo y avance.
  No se ejecuta ningún rig, filtro ni deformación en el teléfono.
- Se generaron piezas de torso, muslo y pantorrilla con ChatGPT Images integrado.
  Fuentes originales y prompts en `rig-sources/` y `rig-sources.json`; calibración
  de articulaciones en `rigs.json`. El bastón se registra hasta el suelo.
- El repartidor conserva su arte y sus cuatro poses; el centrado toma solo la
  coronilla y excluye la mochila. Se normalizan altura y línea de suelo.
- Los píxeles de las vistas frontal y trasera de los diez personajes coinciden
  exactamente con v3. Los tres ciclos aprobados conservan archivos y metadatos.
- La comparación del navegador usa v3 a la izquierda y la candidata a la derecha,
  con pausa, ocho posiciones de inspección y reproducción a media velocidad.

Los nuevos fotogramas permanecen discretos y los brazos de las seis figuras
articuladas conservan su pose de sujeción. La aprobación estética queda para el
usuario. Los primeros intentos de cuatro poses pintadas no resolvían la alternancia:
están documentados como rechazados y no se cargan en el juego.

## Reproducir

1. `node scripts/export-city-walk-corrections.mjs` registra el repartidor.
2. `node scripts/bake-city-walk-rigs.mjs` hornea los seis ciclos.
3. `node scripts/check-city-walks.mjs` comprueba cada fotograma renderizado,
   compara los píxeles frontal/trasero y genera contacto y vídeo.

Los scripts usan `VORO_CANVAS_RUNTIME` apuntando al runtime de @napi-rs/canvas.
Fuentes de las primeras poses rechazadas en `painted-sources/`, `sources.json`
y `rejected-painted/`, sin referencias desde el juego.

## Validación

- 336 pruebas pasadas; las ocho de ciudad incluyen alternancia real de apoyo,
  dirección inversa, conservación de los aprobados y visitas a todos los fotogramas.
- Diez ciclos exportados con todos sus fotogramas distintos; comparación exacta
  de píxeles frontal/trasero correcta en los diez.
- Builds móvil y PC correctos, verificación de assets móviles incluida.
- Galería comprobada en el navegador integrado; capturas `browser-*.jpg`.
- Los veinte atlases específicos de perspectiva de Ciudad ocupan 34,125 MiB
  decodificados y compactados, 3,375 MiB más que v3. Una llamada de imagen por
  personaje. Esto no es una medición de FPS ni de memoria total en iPhone.
- Sin nueva subida a TestFlight en este encargo; sigue vigente 0.13.5(1).

Galería: `../city-walk-2026-10-01/index.html`.
