# VORO — candidata local 0.6.4 / Windows prueba 4

Trabajo del 23/09/2026. TestFlight sigue en **0.6.4 (1), fuente9381ebc**.
Esta carpeta NO acredita una nueva subida ni una prueba física iOS.
La candidata concilia Windows prueba3 con la fuente distribuida: conserva los
cinco WAV aprobados, su shuffle sin repetición y pitch −5…+6 semitonos. Después
de la integración el usuario eligió explícitamente la pausa1 **Respira**.
Los assets/componentes de la otra pausa quedan conservados, sin ser la pausa activa.

## Audio: hallazgo reproducible y límites

El usuario oye petardeo en TestFlight0.6.4; **no ha probado Windows**. Se reprodujo
con el módulo musical de esa fuente una transición interrumpida por pausa y
reanudación que deja dos canciones audibles a la vez, tanto en Charca como
Estrellas. La candidata apaga el reproductor saliente, invalida promesas antiguas
sin cortar una reproducción nueva, mantiene continuidad de ganancia y no vuelve
a arrancar el decodificador inactivo con cada gesto.

`music-acoustic.json` y los WAV before/after son capturas digitales reales de
Web Audio en Edge, no micrófono. Verifican las transiciones, pausa/reanudar,
bucles de Charca/Estrellas/final y gestos repetidos en el vacío: una sola pista
audible al estabilizarse y cero muestras recortadas. `music-files.json` inspecciona
los12 MP3 completos: sin errores de decodificación ni muestras saturadas; no se
reemplazaron pistas ni se bajó su volumen para ocultar el problema.

Esto **no demuestra que sea la única causa del petardeo del iPhone**. Falta
reprobar en dispositivo físico. El informe del juego ahora añade estado de cada
reproductor, errores/waiting/stalled, transiciones y latencia publicada por el
AudioContext; esos contadores ayudan a correlacionar incidencias, no miden GPU
ni certifican por sí solos un fallo audible. Se mantiene recuperación de SFX y
sonido de daño de la candidata anterior.

## Cámara y poblaciones

Se conserva el encuadre de entrada y el zoom manual. El radio visible aumenta
de26.88 hacia105 unidades de pantalla al crecer; ya no queda retenido por un
suelo de zoom que hacía que el cuerpo ocupara casi toda la vista.

- Charca: de13 a24 plazas por región,11 plazas adicionales exclusivamente de
  fauna pacífica. En400 zonas, fauna media5.53→16.15; no se añaden cazadores.
- Ciudad: misma densidad, biomasa objetivo210→300 y rendimiento.33→.22.
  El mismo recolector automático, sin mejoras, tarda81–88s antes y159–179s después
  en tres semillas. Es una comparación controlada, no duración humana prevista.
  Las armas ligeras dejan de dañar pronto; blindados/tanques/helicópteros
  mantienen amenaza más tiempo, con límites por debajo del final de Ciudad.
- Órbita: media13.33→8.97 objetos por zona; Planetas10.27→5.42;
  Estrellas8.46→5.60. Muestreo400 zonas. Sin modificar las demás poblaciones.
- Universo: tres siluetas nuevas, mismo presupuesto10 plazas. Sus umbrales
  permiten comerlas antes de completar la etapa; aparecen en generación real.

`performance-baseline.json`/`performance-after.json` usan misma masa/semilla,
seis segundos activos tras calentamiento por caso. En PC, CPU p95 de Charca
1.7–1.8ms antes frente1.9–4ms después con más habitantes y campo visible.
Por eso NO se presenta como una mejora global de FPS. La simulación omite
movimiento remoto fuera de cámara/alcance para limitar el coste. Cadencia alrededor
de60Hz con0–1 intervalos>33.34ms en esos casos. No extrapolar a iPhone/iPad.
`performance-before.json` es una captura exploratoria previa no controlada;
NO usar para comparación. Las capturas baseline/after finales corresponden
al control correcto, importando la misma instancia de módulos del juego.

## Tierra, final y UI

Tierra se dibuja en las mismas coordenadas que su gravedad. `earth-visible-gravity.json`
contrasta alfa del bitmap real, tres zooms, cuatro direcciones y distancias
0…1250: ninguna corrección dentro de1100; atracción gradual fuera de1200.
Contornos azul/ámbar en capturas son SOLO overlays de prueba, no juego.

Final24s: oscuridad desde bordes hasta9.6s, breve pausa negra, luego núcleo→cuerpo
de10.5 a23s, movimiento libre posterior. El revelado afecta a todo el dibujo con
una máscara negra local sobre el vacío negro, sin buffers/filtros por fotograma.
`final-reveal.webm` muestra el render real; respeta movimiento reducido.
**No se abre automáticamente Recorrido.** Actualización posterior a Windows prueba5:
A Espiral fue elegida e integrada en fuente local; ver `../journey-spiral-2026-09-23/`.
No está incluida en aquel ejecutable ni en TestFlight0.6.4(1).

Pausa1 Respira verificada en375×667,390×844,1194×834 y1280×800, incluida entrada
a Configuración. Avisos de escudo/combo/protección abajo, en el lado contrario
al impulso también en modo zurdo; `final-candidate-browser.json` recoge geometría.
Escudo Película viva aprobado integrado, un golpe/40s sin cambiar mecánica.
Hit visual se limpia en carga, nueva vida, etapa y salida de pruebas.
Propuesta y QA de referencia: `../.studio/design/voro/shield-proposals-20260923`
desde la raíz del repositorio. Módulo conserva autoría/QA coordinada, con JSDoc
añadido para TypeScript. No modifica forma/animación del protagonista.

## Arte y verificación

`universe-art.json` conserva **prompts completos** y rutas de las tres imágenes,
creadas con herramienta integrada ChatGPT Images. Originales PNG RGBA en esta
carpeta; exportación técnica512×512 WebP en `public/inhabitants/*-v1.webp`:
cosmic-wall, lensed-crown, cosmic-confluence. Alfa real inspeccionado; no nuevos
atlases animados. Total de los tres archivos≈316KB,3MiB RGBA decodificados.

223/223 pruebas (`tests.txt`), TypeScript (`types.txt`, vacío=sin errores),
salida móvil y assets verificados (`mobile-verified.txt`). El build conserva el
aviso de bundle JavaScript>500KB; no es un error ni una medición de rendimiento.
QA del ejecutable y manifiesto ZIP en `design/windows-preview-4-2026-09-23`
y `artifact/windows/0.6.4-preview.4`, respectivamente.

Scripts reproducibles: audit-music-files.py, check-music-acoustic.mjs,
check-city-balance.mjs, check-pond-performance.mjs, check-earth-visible-gravity.mjs,
check-final-candidate.mjs y record-final-reveal.mjs. QA usa perfiles aislados;
no sustituye la partida guardada del usuario.
