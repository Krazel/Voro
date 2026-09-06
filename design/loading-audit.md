# Auditoría de carga y tirones — candidata 0.4.2 (1)

El usuario describe pocos FPS al iniciar, recuperación y nuevos tirones al moverse.
Confirma que usa VORO 0.4.1 en iPhone X con iOS 16.7.16. Esta es la referencia
de dispositivo para validar la candidata; no atribuir el fallo solo a su edad.
Se mantiene React/Canvas2D + Capacitor, iOS y futuro Steam. No se migra el motor.

## Hallazgos y correcciones

- La IPA usa `webDir: mobile-dist`, sin `server.url`, con imágenes relativas
  incluidas en el bundle. La simulación, el mundo procedural y el guardado son
  locales. La web descarga los archivos al acceder; no pide mapas de zonas a un
  servidor. No se atribuye la lentitud a estar en local ni se prueba que Capacitor
  sea el límite.
- El constructor iniciaba 15 imágenes de todas las etapas, incluidas tres
  alternativas antiguas de fondo. Ahora solicita las imágenes de la etapa actual
  y ambos fondos durante una transición, con dos cargas/decodificaciones en vuelo.
  Se espera `decode()` antes de declarar lista la etapa y se usan `imageAtlas`
  (incluye correctamente nadador y nadadora). Los cambios rápidos descartan
  resultados antiguos sin corromper el estado ni lanzar todas las imágenes.
- Inicio microscópico: 29.206 MB -> 4.829 MB de archivos; estimación RGBA de las
  imágenes solicitadas 88.354 MB -> 18.874 MB. Son bytes de imagen, no una medida
  del consumo total de proceso, GPU ni RSS. La IPA conserva todos los archivos
  para poder jugar sin red; reducir solicitudes no reduce su tamaño instalado.
- La versión 0.4.1 limitaba a dos poses por fotograma pero completaba cada pose
  sin interrupción. Ahora el mismo pintor cede cada ocho triángulos con un
  presupuesto temporal de 2 ms y máximo dos poses terminadas por fotograma.
  Es un límite blando: una llamada individual al navegador o preparar una malla
  todavía puede superarlo. No se afirma que el fotograma completo dure 2 ms.
- Se conserva el límite de 24 MiB, cola de 64 y 24 poses por ciclo. Los lienzos
  expulsados se liberan explícitamente. Las poses incompletas nunca se muestran:
  se reutiliza una pose terminada o el bitmap mientras se prepara la nueva.
  En dispositivos lentos las animaciones pueden tardar más en calentarse; este
  cambio prioriza que el movimiento y la interacción no esperen a toda la malla.
- Cada ocho segundos se regeneraban también los chunks intactos, desechando las
  entidades recién creadas. Ahora solo se regeneran chunks con huecos consumidos;
  se conserva la reposición después de 150 segundos y la población determinista.
- Configuración > Mostrar rendimiento habilita un indicador local de cadencia
  FPS, CPU media, pico de intervalo, cargas, poses pendientes y caché. Ventana
  fija de 120 fotogramas; pausa y segundo plano excluidos. No envía telemetría.

## Verificación y límites

- `loading-raster-audit.json`: 456 comparaciones de píxeles (152 habitantes,
  tres intensidades, fase 1.91) entre el pintor publicado y el nuevo: idénticas.
  Se mantienen las pruebas de rigs y cierre de ciclos existentes.
- Tests cubren carga limitada, decode pendiente/fallido, cambios de etapa,
  resultados obsoletos, ambos nadadores, reposición y cesión dentro de una pose
  con reloj simulado lento, además de campaña completa, cámara y controles.
  También verifican que las comidas reaparecen tras salir y volver a un chunk
  en los diez entornos. Total: 90 pruebas pasan, TypeScript y lint de cambios.
- `loading-frame-benchmark.json`: antes/después CPU Skia, semilla 834, móvil
  lógico 390x844, DPR 1.5, seis escenarios de 360 frames con movimiento. P95
  microscópico inicial 14.98 -> 12.35 ms; orilla grande 28.53 -> 12.83 ms;
  mar inicial 29.48 -> 16.07 ms. Mar grande conserva picos 34.69 ms.
  Son ejecuciones independientes con ruido de máquina, no FPS de iPhone ni
  mediciones de descarga, compositor, WebKit o React.
- Auditoría adicional de veinte escenarios (inicio/grande, diez entornos) en
  `loading-all-stages.json`. La actualización lógica queda muy por debajo del
  coste de renderizado en estas pruebas. El protagonista y los fondos conservan
  coste gráfico; no se rebajan su diseño, tamaño ni zoom sin evidencia específica.
- Se mantiene el guardado local cada cinco segundos; no se cambian sus garantías
  por una hipótesis. Persisten límites de fragmentos, partículas y proyectiles.

Pendiente validación física: modelo de iPhone y prueba de arranque, desplazamiento,
crecimiento y transición con la candidata exacta. No declarar resuelto el problema
en el dispositivo antes de esa comprobación.

Distribución candidata: TestFlight interno únicamente. Ficha App Store creada,
sin publicación pública. Anuncios por confirmar. Añadir evidencia de entrega y
actualizar la ficha PR-009 existente tras verificar Apple y Sites.
