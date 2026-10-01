# VORO · corrección de la marcha lateral

El usuario rechazó las piernas estáticas en la galería de Ciudad. Las dos poses anteriores tenían casi la misma silueta lateral; alternarlas y mover el cuerpo no producía un paso.

## Resultado

- Diez hojas de poses nuevas, hechas con ChatGPT Images: civil, soldado, policía con escudo, soldado pesado, peatona, trabajador, corredora, persona con bastón, oficinista y repartidor.
- Cuatro poses laterales por personaje, con apoyo extendido y paso flexionado. El lado izquierdo refleja la misma secuencia; no se gira el cuerpo en plano. Cuatro poses dibujadas no equivalen a una animación esquelética continua.
- Se conservan los dibujos, los anclajes relativos y la cadencia de las dos poses frontal y posterior. Se empaquetan en la segunda fila de la nueva textura. No cambia el tamaño de juego, la velocidad, el daño ni el valor de ningún personaje.
- Se descartó una prueba de articulación por deformación: retorcía pantalones y zapatos. Sus archivos locales están en `rejected-rig/` y no se utilizan ni se incluyen en la entrega.
- Galería principal actualizada; `index.html` compara el antes y el después, con pausa, selección de pose y reproducción a media velocidad. `walks.mp4` muestra los diez ciclos durante cuatro segundos, capturados a 30 FPS. La cadencia de poses es independiente del vídeo.

## Fuentes y reproducción

`prompts.json` contiene los diez prompts exactos de la herramienta integrada y sus referencias. Originales intactos en `painted-sources/`. `source-art.json` conserva los recortes anteriores.

`scripts/export-city-walks.mjs` registra cabeza/altura, empaqueta las poses y conserva frente/espalda. El pase de exportación limita la cobertura alfa de halos semitransparentes generados; no cambia los originales. Exporta `public/inhabitants/city-perspective/*-walk-v3.webp` y el manifiesto de la aplicación.

Ejecutar con `VORO_CANVAS_RUNTIME` apuntando al `package.json` del runtime autorizado de `@napi-rs/canvas`. `scripts/check-city-walks.mjs` verifica que las cuatro poses produzcan imágenes diferentes y genera la comparación y el vídeo. Para el vídeo utiliza el ffmpeg existente de `work/audio-audit-libs/`.

## Verificación

- 334/334 pruebas correctas, TypeScript y builds móvil/PC correctos.
- Pruebas de todas las direcciones y ciclo completo; pose detenida estable; silueta de piernas más estrecha en el paso que en el apoyo (al menos 20 % de diferencia), sin sustituir la revisión visual.
- Revisión de las 40 poses laterales, diez ciclos, galería de 29 elementos y tres escenas del juego; ningún error de navegador.
- Una llamada de imagen por persona. Atlases residentes de Ciudad: 48,75 MiB frente a los 52,50 MiB de la candidata anterior. No se calculan mallas en el móvil. Esta cifra no es la memoria total de la aplicación ni una medición física de FPS.
- Candidata local y Git. No se ha enviado una nueva build a TestFlight; la interna vigente sigue siendo 0.13.5(1).

La valoración estética final queda para la prueba del usuario; no se da su aprobación por supuesta.

## Revisión posterior del usuario

Civil, unidad con escudo y corredora aprobados. Se señalaron seis ciclos que no
alternaban piernas y desplazamiento del repartidor. La versión vigente de la
galería y del juego incorpora la corrección documentada en
`../city-walk-corrections-2026-10-01/README.md`: seis ciclos articulados horneados
de ocho fotogramas, repartidor registrado y frente/espalda conservados. Las
cifras y descripción anteriores corresponden a v3.
