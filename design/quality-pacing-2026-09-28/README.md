# Fluidez, detalle y duración — candidata local del 28/09/2026

Responsable: VORO, chat 01a06eb1-17bb-74c1-b4a4-f88225d8e26d. Encargo:
`../.studio/voro-fluidez-progresion-20260928.md` desde la raíz del repositorio.
Demo PC: http://127.0.0.1:5211/?ui=final&lab=cosmos
Demo táctil: http://127.0.0.1:5210/?ui=final&lab=cosmos
El panel permite inspeccionar los diez entornos en escenas temporales. No escribe
la campaña. La URL normal no muestra el panel. No hay publicación ni subida iOS.
TestFlight sigue 0.8(1), fuente c319c18; los builds de esta carpeta son locales.

## Causa y corrección

Comparación con candidata a35afaa y fuente TF c319c18: las hojas microscópicas
eran idénticas. El PC renderizaba a 60 FPS en las escenas aisladas, pero el gigante
solo tenía 64 poses para 4,2 segundos (15,24 poses/s); el espinoso 22,86 y la ameba
18,29. `pose-audit.json` conserva estos datos. El renderer anterior a 854dead
recurría al rig vivo al acercarse, lo que mejoraba el detalle a costa de CPU.
Esta candidata no vuelve a activar esas mallas en el juego por acercar la cámara.

Ahora los ciclos microscópicos deformables tienen 30 poses/s. Cazador, espinoso
y gigante disponen además de hojas opcionales de 384 px para vistas cercanas de
PC, frente a las normales de 192/256. El cuerpo del gigante pasa de unos 171 a
256 píxeles de fuente en PC. No se han cambiado su geometría, tamaño comestible,
animación aprobada, cámara ni protagonista. Se descarga solo la energía usada;
un ciclo normal listo sigue visible mientras se carga la reacción o el detalle.
La falta de presupuesto conserva un bitmap temporal en lugar de iniciar mallas
costosas. La carga sigue limitada a dos decodificaciones simultáneas.

Los agujeros negros grandes y seis galaxias usan imágenes nativas de 1254² con
alfa, sin ampliación artificial de los originales pequeños. Su circulación se
dibuja con dos pasadas y una máscara interior; el contorno no se deforma. El
agujero negro de Estrellas conserva exactamente r máximo 406: a zoom automático
1,12 ocupa unos 1137 px de ancho en la escena PC, cubiertos por la nueva fuente.
Las cuatro estructuras aprobadas del Universo recuperan sus maestros originales
de 1254², antes reducidos a 512². No son diseños nuevos. Otros astros grandes
usan todos los píxeles de su atlas existente en vez de una pose horneada pequeña.
Esto mejora detalle, pero no añade información que no exista en el maestro;
un zoom manual extremo todavía puede superar los píxeles de cualquier fuente.

Planetas usa un fondo nuevo de estrellas aisladas y polvo difuso, sin galaxias
pintadas. Los dos antiguos objetos que reutilizaban nubes galácticas se dibujan
como planetas, manteniendo IDs, recompensas, radios y rangos físicos para saves.
Los cuatro paneles del nuevo atlas se utilizan. Estrellas continúa excluyendo el
panel espiral del atlas anterior y los recortes estelares terminan antes de la
fila de galaxias. Se probaron poblaciones de Planetas en 245 regiones/5 semillas,
además de los fondos y assets realmente cargados por el navegador.

## Progresión

No se alarga ralentizando el movimiento. Cambian las recompensas futuras de
biomasa por etapa; los objetivos y tamaños iniciales siguen iguales. Las
adaptaciones usan la raíz cuadrada del coeficiente para seguir apareciendo más
a menudo que los cambios de entorno. Sus efectos y límites no cambian. Los
saves conservan biomasa, XP, elecciones, heridas, tiempos y comida en digestión.

| Etapa | Objetivo, min | Biomasa respecto a antes | Estimación media, min |
| --- | ---: | ---: | ---: |
| Microscopio | 19 | 13 % | 20,8 |
| Charca | 16 | 16 % | 16,5 |
| Orilla | 18 | 16 % | 16,7 |
| Mar | 17 | 13,6 % | 15,9 |
| Ciudad | 18 | 10,4 % | 20,8 |
| Órbita | 11 | 32 % | 9,1 |
| Planetas | 8 | 20 % | 8,6 |
| Estrellas | 7 | 23 % | 6,5 |
| Galaxias | 4 | 30 % | 4,4 |
| Universo | 2 | 30 % | 2,2 |

La referencia humana del usuario era ~30 min. El piloto anterior acabó en 992 s;
se usa provisionalmente la proporción 1800/992, no una medición de jugadores.
Tres campañas naturales, sin entregar biomasa ni teletransportar, acabaron en
4082/3675/4298 s: estimaciones humanas de 123,4/111,1/130 min, media 121,5 min.
Semillas 41/73/834; hubo una muerte en Ciudad en la primera y ninguna en las otras.
Todas llegaron al final. La media espacial se acorta desde Órbita; cada partida
individual puede variar y no cumple necesariamente un orden estricto. El piloto
elige instantáneamente, esquiva peligros y favorece mejoras de alimentación.
El test microscópico usa navegación alrededor de comida custodiada: el piloto
antiguo se quedaba empujando hacia un depredador, lo que no demuestra un bloqueo
de la campaña. Conserva enemigos/daño y alcanza madurez naturalmente en 862,
839 y 970 s (semillas 41/127/930). `pacing-summary.json` contiene el cálculo.
Los informes candidate/final-seed anteriores son iteraciones, no la curva final.
Los informes finales vigentes son `pacing-orbit32-seed*.json`.

## Comprobaciones

- 249 tests correctos; TypeScript correcto; builds locales móvil y PC correctos.
- Escenas aisladas PC: 60 FPS antes y después. Ciclos 30 poses/s tras la corrección.
- Mundos en movimiento PC/táctil emulado: 59–60 FPS, CPU media 1,4–2,5 ms.
  El microscopio PC tuvo 3 intervalos lentos en 265 frames mientras se ejecutaban
  otras pruebas locales. No se afirma ausencia total de tirones ni GPU medida.
- Animaciones microscópicas: PC 111,36 MiB bajo presupuesto 128 MiB;
  táctil 45,71 MiB bajo 64 MiB. Táctil no solicita las hojas HD. Estos presupuestos
  describen hojas, no memoria total del proceso. Los nuevos siete masters
  astronómicos añaden hasta ~42 MiB de píxeles decodificados en Galaxias. Se
  descargan solo los assets del entorno activo y transiciones, no todo el juego.
- Caché de fondos <=3; sin errores de decode ni JavaScript en las escenas.
- Regresión de Órbita/Planetas/Estrellas/Galaxias, cuerpos pequeños/grandes,
  absorción terrestre, música durante elecciones, restauración exacta de campaña
  y ausencia del laboratorio en la URL normal: correctas.
- Capturas de las cuatro estructuras a tamaño máximo y zoom manual 175 %.
- Vídeos de canvas a 1440×900: se pidió captureStream(60), pero el recorder produjo
  259/285/265 frames en ~4,97 s. No son prueba de un vídeo bloqueado a 60 FPS;
  los FPS anteriores proceden del monitor del juego. Decode ffmpeg correcto.

No se ha ejecutado una build física en iPhone/iPad ni un nuevo ejecutable Windows.
Esta evidencia corresponde a Edge local y emulación táctil, no a WebKit iOS.

## Evidencia y reproducción

`before.json`, `final.json` y PNG/vídeos correspondientes comparan idénticos
radios/zoom/pose de espécimen; la pintura de fondo puede variar por la semilla de
escena temporal. `quality-memory.json` registra mundos móviles y de PC.
`cosmic-regression/browser.json` registra audio/partida/cuerpos pequeños-grandes.
`art/manifest.json` contiene masters nuevos, dimensiones, alfa y hashes;
`art/restored-masters.json` contiene los cuatro originales aprobados recuperados.
`art/generation-brief.md` registra los criterios de generación.

Los scripts de navegador usan Playwright de la dependencia configurada mediante
VORO_PLAYWRIGHT_RUNTIME; los de exportación/importación usan VORO_CANVAS_RUNTIME
con @napi-rs/canvas y sharp. Los servidores locales deben estar en 5210/5211.
`node scripts/check-visual-quality.mjs final`,
`node scripts/check-quality-memory.mjs`,
`node scripts/check-quality-regression.mjs`,
`node scripts/audit-campaign-pacing.mjs verification 41`.
