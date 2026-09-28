# Los 48 casos claros — mejora de nitidez

Solicitud: «los casos claros haz la mejora». Solo se modifican los 48 IDs clasificados como claros en la auditoría de los 168 assets. Los casos leves y conservables mantienen sus dibujos. La cámara, los tamaños físicos, las recompensas y las reglas no cambian.

## Resultado

- 24 habitantes/plantas conservan sus originales y sus rigs. Se añaden hojas de animación con cuerpos de 192–224 px y detalle cercano de hasta 320 px, frente a 128 px en la mayoría de los originales. Los ciclos conservan todos sus fotogramas y su duración; los pinchos y la ameba mantienen también su versión de 256 px. No se genera una malla por fotograma en el móvil.
- 24 objetos/cuerpos cósmicos reciben 22 imágenes independientes de ChatGPT Images; el núcleo activo y la colisión se comparten entre dos etapas. Máster PNG con alfa conservado y WebP de distribución de 1254 px de ancho. Coste comprimido total de este arte: 10,66 MiB.
- La forma de dibujo se ajusta sin estirar al aspecto del recorte anterior. Los cuerpos cósmicos mantienen movimiento continuo mediante transformaciones y una capa interior de flujo; no necesitan enormes hojas de poses.
- La calidad se adapta al tamaño de pantalla y al presupuesto. Se mantienen 64 MiB de hojas en móvil y 128 MiB en PC. Las variantes detalladas reservan espacio para las animaciones básicas de otros habitantes, reutilizan una textura cercana para individuos pequeños y vuelven a una versión menor cuando no cabe más detalle.
- Las nuevas hojas se empaquetan dentro de 4096 px por lado, incluso cuando el número de fotogramas es primo. Se retiran del paquete las exportaciones obsoletas.

## Comparación

Abrir `review.html`: 48 pares antes/después, filtros por entorno. La auditoría original queda intacta en `../asset-audit-2026-09-28/`. `after/` contiene una nueva revisión de los 168 para detectar efectos fuera del alcance. Las muestras inferiores son ventanas de inspección a tamaño CSS real, no recortes accidentales del dibujo. Cada tarjeta carga una especie; en una escena poblada la calidad puede bajar para respetar el límite de memoria.

Los animales siguen limitados por la resolución de su dibujo original al ampliar mucho. Esta entrega recupera el detalle que la exportación de 128 px estaba perdiendo; no promete nitidez ilimitada al hacer zoom.

## Verificación

- 255 tests correctos (`tests-final.txt`). Las dos primeras incidencias de prueba eran perfiles ahora rígidos que seguían deformándose en el inspector de mallas; se corrigió esa incoherencia y se repitió la suite. Se repitieron además las 12 comprobaciones de carga/memoria tras el último ajuste de selección de energía.
- TypeScript y builds móvil/PC correctos. Aviso existente de bundle JavaScript superior a 500 kB.
- Galería: 48 fichas, 96 imágenes cargadas, filtro Charca con cinco resultados, sin errores (`review-verification.json`).
- Revisión visual de todos los casos modificados en los tamaños mínimo/medio/máximo. Las 22 fuentes tienen alfa, sin esquinas opacas ni bordes con alfa superior a 24/255 (`alpha-check.json`). La gigante roja se corrigió una segunda vez para conservar el halo entero.
- Recorrido local de las diez entradas reales, movimiento y carga de habitantes: 59–60 FPS observados, sin errores de imagen ni de página; máximo de hojas residentes 57,4 MiB sobre límite de 64. Los guardados de campaña se mantuvieron intactos (`scenes/results.json`). Son resultados de Edge en PC con viewport táctil móvil, no FPS de un iPhone físico ni medición GPU.

## Entrega

Candidata local: http://127.0.0.1:5211/?ui=final&lab=cosmos. No se ha subido una nueva build a TestFlight ni publicado la web. TestFlight interno continúa en 0.8(1); la prueba física de esta mejora sigue pendiente.

## Fuentes y reproducción

`art-plan.json` conserva los recortes y perfiles anteriores; `references/` las imágenes de referencia; `generation.json` la procedencia de cada generación; `art-manifest.json` las huellas de los másteres y tamaños/pesos. `install-clear-art.mjs` encaja y comprime los PNG conservando proporciones y alfa. `export-animation-sheets.mjs` exporta los mismos rigs en las nuevas resoluciones. Los scripts de auditoría y pruebas producen las evidencias del navegador.

Dirección de las generaciones: una llamada por asset, usar el recorte original como referencia, misma silueta/orientación/paleta y estilo realista ilustrado; recuperar textura fina nítida a resolución nativa, objeto completo, sin texto ni escena de fondo, alfa verdadero y márgenes vacíos. En estrellas y formaciones cósmicas se pidió que coronas, chorros y filamentos se desvanecieran a transparencia antes del borde. Para 129 se hizo una segunda edición alejando el encuadre y preservando toda la corona.
