# Órbita, adaptación y detalle — 28 septiembre 2026

Correcciones de la candidata local; no se ha enviado una build nueva a TestFlight.

- Cada adaptación elegida descarta el exceso de XP de la comida anterior. Los reembolsos de mejoras retiradas de partidas antiguas se conservan como elecciones pendientes explícitas; al terminarlos la barra también queda vacía.
- La órbita ya repoblaba las comidas a los 150 s. Ahora, si quedan menos de tres comidas accesibles, la comprobación periódica de 8 s recupera ranuras consumidas de alimento sin umbral de masa, entre 300 y 850 unidades del jugador, dentro del límite gravitatorio. No añade población permanente ni regenera la Tierra.
- La Tierra se desplaza y contrae hasta la posición animada exacta del núcleo. Se mantiene visible a través del protagonista hasta su llegada; antes el núcleo opaco la ocultaba anticipadamente.
- Púlsar azul independiente con alfa y chorros completos. Se eliminan las dos animaciones exportadas que incluían el recorte antiguo; el pulso continuo usa una transformación barata.
- El laboratorio tenía invulnerabilidad y evolución bloqueada sin mostrarlas. Ahora expone ambos interruptores, con daño y evolución activados por defecto. Las tres variantes de agujero negro ya causaban daño con las reglas normales y así se ha comprobado. Al superar el objetivo, los biomas avanzan; Órbita exige además acercarse a la Tierra.

## Tierra

La textura anterior era de 1254 px para un globo de varios miles de píxeles en PC. La candidata emplea una fotografía de 8000 px, distribuida a 4096 px y recortada circularmente al pintar, también en su variante comestible. No es un reescalado artificial del dibujo anterior. Ocupa 4,51 MB en disco y unos 64 MiB decodificada; se carga únicamente en las etapas que la utilizan. La memoria y fluidez en iPhone físico siguen pendientes de probar antes de una entrega iOS.

Fuente: [NASA NPP Blue Marble 2012](https://svs.gsfc.nasa.gov/30002/). Crédito incorporado en Licencias: NASA/NOAA/GSFC/Suomi NPP/VIIRS/Norman Kuring. Archivo original y hashes en `art/manifest.json`.

## Verificación

`tests/orbit-recovery.test.mjs` cubre exceso de XP, guardado, órbita agotada y recuperada tras recarga en cuatro semillas y cuatro puntos del límite, daño de las tres variantes de agujero negro y avance de todos los biomas. Las pruebas cinematográficas comprueban el centro y la contracción de la Tierra.

`scripts/check-orbit-recovery.mjs` comprueba la candidata PC y la vista móvil en Edge, incluyendo imágenes y estados. Ambas dieron 60 FPS en la muestra orbital; no equivale a una prueba en iOS físico. Resultados y capturas en `browser/`.

## Púlsar generado

Generado con ChatGPT Images; original conservado en `art/pulsar-master.png`. Encargo: recrear como sprite independiente el púlsar azul del atlas cósmico, conservando núcleo luminoso, dos chorros diagonales completos y filamentos magnéticos; margen transparente alrededor de todas las puntas, sin fondo, rectángulo ni recortes. Exportación WebP a su resolución nativa de 1254 px mediante `scripts/prepare-orbit-detail.mjs`.

## Auditoría visual

La comparación inicial de 85 assets grandes está en `audit/`. Es una selección preliminar; el usuario pidió después revisar **todos** los assets, incluidos los pequeños, antes de decidir cuáles rehacer. Ningún otro asset se ha sustituido por esta comparación.
