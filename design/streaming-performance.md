# Rendimiento y medición local — candidata 0.4.3 (1)

Encargo 2026-09-07: el usuario confirma una gran mejora con 0.4.2 pero persisten
irregularidades también en iPad Pro (modelo y sistema por confirmar). Autoriza
optimizar animaciones de habitantes, cachés, fondos, guardado y medición;
**excluye expresamente el dibujo del protagonista**. Referencia anterior:
iPhone X, iOS 16.7.16. No migrar motor, tecnología ni alterar balance/cámara.

## Cambios

- 105 entradas con deformación utilizan 140 hojas WebP únicas exportadas de los
  rigs aprobados. Dos intensidades, 192 px de lienzo antes del recorte, 24–64
  poses por ciclo. Los ciclos rápidos apuntan a 30 poses/s; los lentos limitan
  poses casi idénticas. Giros, traslaciones y escalado rígido se aplican cada
  fotograma, independientemente del muestreo de la deformación. La galería
  conserva el pintor continuo original. No hay nuevos dibujos ni movimiento
  automático del protagonista.
- 70,94 MiB de archivos añadidos al paquete; no se cargan todos en memoria.
  Límite de 64 MiB de píxeles reservados para hojas (incluye descargas pendientes),
  máximo dos cargas/decodificaciones simultáneas, solo especies encontradas.
  Se prioriza la versión normal frente a su reacción. Se conserva el fallback
  procedural con caché de 24 MiB ante fallos o falta de presupuesto; su trabajo
  sigue repartido en porciones. Estas cifras son presupuestos de nuestros
  buffers, **no** una medición de la memoria total del proceso/GPU/WebKit.
- Las poses útiles compartidas sobreviven al cambio de escala; los trabajos
  pendientes que dejan de verse se descartan. No se expulsan hojas visibles
  para cargar otra hoja visible y provocar recarga circular.
- Dos superficies de fondo independientes mantienen ambos lados de la
  transición. No recomponerlos por alternar las llamadas de cada escala.
- Guardado periódico cada cinco segundos: agrupar y diferir a tiempo libre,
  con timeout de un segundo; en WebKit sin requestIdleCallback, siguiente tarea.
  Guardados de pausa, ocultación y puntos de control siguen inmediatos y cancelan
  la tarea pendiente. No se cambian formato ni reglas de la partida.

## Medidor

Configuración → **Medir una partida de 30 s**. Cierra ajustes, cuenta 30 segundos
activos y congela los resultados. **Copiar informe de rendimiento** permite
compartir JSON; si el portapapeles falla, queda un texto seleccionable. No hay
telemetría ni envío automático. También sigue disponible Mostrar rendimiento.

FPS observados, P95/P99 de intervalos, pico, cuadros >33,34 ms, CPU por sección,
cargas de imágenes y eventos de guardado, entorno, radio, zoom y resolución.
El informe incluye los 30 peores cuadros y el trabajo del cuadro anterior:
un intervalo largo puede ser consecuencia de este último. Los tiempos de
carga/decodificación son duración transcurrida, no CPU. Las secciones están
anidadas; no sumarlas. rAF mide cadencia, no tiempo de GPU ni frames realmente
presentados en pantalla. Pausas, ocultación y espera de assets base se excluyen
del muestreo de juego. Ventana máxima: 3600 cuadros y 120 eventos.

Al terminar se muestra el resumen de toda la prueba, no solo los últimos dos
segundos. El muestreo detallado solo se activa por decisión del jugador.

## Verificación

- Comparación raster: 630 muestras de los 105 habitantes deformables, ambas
  intensidades, contra el pintor aprobado; error medio máximo de color
  premultiplicado 2,218/255 y de alfa 1,7/255. El pequeño error corresponde a
  compresión y remuestreo. `animation-sheet-validation.json`.
- Se verifica por comparación de fuente que `drawCell` es idéntico a la versión
  0.4.2 entregada, commit 2205780effb5b586e844e1c0cdf5b3c36e8f9863.
- Pruebas de reserva y liberación de memoria, cancelación y fallo de decodes,
  reacción sin perder nado normal, cachés compartidas, crossfade de 20 cuadros
  con solo dos reconstrucciones, guardado agrupado y captura de 30 segundos
  que no incluye pausas. Integridad de todos los WebP empaquetados.
- Benchmark repetido del motor con Canvas Skia en Windows: diez escalas con
  desplazamiento, tamaño del 65 % de objetivo, tres repeticiones y 180 cuadros
  por caso. Carga nativa de hojas fuera de los tiempos de CPU. No mide WebKit,
  compositor, React ni GPU de Apple. `animation-sheet-benchmark.json`.

TypeScript, lint de módulos de motor/exportación y 99 pruebas automáticas pasan.
Compilaciones web y móvil correctas. En las tres repeticiones, mediana del P95 de
CPU por etapa: 8,50–11,27 ms con fallback procedural frente a 3,79–5,01 ms con
hojas; cero poses generadas en ejecución en los recorridos con hojas. Son
comparaciones sintéticas dentro de este motor revisado, no FPS físicos ni una
promesa sobre el iPad.

## Entrega verificada

- Fuente compilada: `37806a3095e8f179d5a66f36f7460d70faaa156c`.
- Web privada v29, despliegue `appgdep_6a9e8a2fe39881919509715e293aff0a`,
  succeeded el 2026-09-07T09:56:27Z, URL habitual y mismo acceso.
- [Workflow firmado y subido](https://github.com/Krazel/Voro/actions/runs/34108593473): success.
- Apple build `764e3ed4-24c2-44fd-89d2-857ad3cf728c`: VALID,
  IN_BETA_TESTING, asignación al mismo grupo VORO Interno con 1 tester,
  verificado por API el 2026-09-07T10:01:57Z. Versión 0.4.3, build 1.
- IPA 113.327.519 bytes; SHA256
  `4e52829925c0cf27956d8cdc9b93bf066afaf9e6b9e2cb4d227f36e1c7ac4ab1`.
  Coincide con manifiesto y checksum de CI. Se comprueban las 140 hojas
  dentro de la IPA y ausencia de server.url remoto: webview local.
- Biblioteca D1 PR-009 actualizada y releída, revisión 17: misma ficha,
  0.4.3 (1), TestFlight Interno, App Store Creada en App Store Connect,
  anuncios Por confirmar. Enlace de demo y repositorio registrados.

## Pendiente de prueba física

Confirmar la fluidez física con el informe de 30 s del iPad Pro y, si es posible,
del iPhone X. No declarar resuelto el rendimiento por pruebas de escritorio.
La ficha App Store está creada, no publicada; no activar pruebas externas ni
anuncios. El repositorio y las imágenes siguen el alcance ya autorizado.
