# Recorrido D3 desde Configuración — candidata 0.6.7 (1)

Petición: abrir desde Configuración el recorrido ilustrado ya aprobado, corregirlo antes de subir todo a TestFlight. Se reutiliza JourneyComplete D3 con franjas de los entornos visitados y estadísticas reales de absorciones, tiempo y adaptaciones. El botón inferior vuelve a Configuración. El recorrido final conserva las diez franjas y su vuelta al silencio. No se revelan entornos futuros durante una partida. Reinicio sigue requiriendo confirmación y se oculta en pruebas desechables.

Incluye también los cambios anteriores: Créditos coherente con Configuración, interior oscuro de marcos con exterior transparente, márgenes de texto ampliados y fondo marino horizontal para PC/iPad conservando el vertical para móvil. No se modifican las proporciones aprobadas de marcos por el ajuste de fondo.

Fuente: b8e47ae. Tipos, build móvil con verificación de assets y 227 pruebas pasaron. QA web cinco tamaños ES/EN en web-qa.json y capturas. Se corrigió una codificación de acento en el texto de regreso antes de generar la candidata. QA nativa en curso: https://github.com/Krazel/Voro/actions/runs/35909700380

Además se comprobaron partidas sintéticas aisladas en la compilación móvil: cinco entornos descubiertos muestran cinco franjas; partida terminada muestra diez; cancelar el reinicio conserva la pantalla y permite volver a ajustes. Evidencia progress-qa.json y compiled-partial/complete.png; script check-settings-journey-progress.mjs. La prueba distingue el botón de ajustes del final del encabezado normal.

Versión 0.6.7, build1: incremento por correcciones de código y arte desde 0.6.6(1). Subida interna autorizada; no incluye App Store review/publicación ni expansión de grupos.
TestFlight verificado aún 0.6.6(1), pendiente terminar QA y subida de esta candidata. PR-009 revisión196 registra ese estado.

QA nativa inicial35909700380: iPhone ES/EN pasó; iPad ES pasó, pero iPad EN falló al abrir Configuración antes de entrar en Recorrido. La grabación mostró que el toque inicial no había abierto el menú, sin error visual dentro de él. El harness ahora reintenta una sola vez ese toque cuando no aparece el encabezado; las aserciones de navegación siguen intactas. Repetición focalizada de iPad:35911814037, commit08bd495. Este commit solo cambia la prueba y su workflow, sin diferencias de código de app respecto de b8e47ae.

Resultado: repetición iPad35911814037 correcta en ES/EN, incluidos regreso y giro; capturas en native/ipad-v2. Junto con iPhone35909700380 verifica el recorrido reutilizado en WKWebView. Después el usuario pidió cifras pequeñas a la derecha por entorno: añadido absorptionsByStage, acumulación al evolucionar/reintentar y restauración de guardado. Solo se muestran entornos descubiertos; datos históricos imposibles de recuperar aparecen como raya, sin inventar ceros. Reiniciar borra estos contadores junto con la partida. Total global sigue intacto.

Verificación adicional de contadores: 229 tests, TypeScript, build móvil/verificación de assets y prueba del bundle compilado con partidas parcial y completa, números y navegación correctos. Las capturas compiled-partial/complete incluyen los contadores nuevos; las capturas nativas anteriores a esta adición validan el menú, no los nuevos contadores en dispositivo. Queda prueba física en TestFlight. Subida pendiente de ejecución/validación Apple.
