# Prueba musical A/B integrada · 0.13 (1)

Autorizada por el usuario el 30-09-2026 para investigar el petardeo persistente. En Configuración se amplía el diagnóstico existente con preparación, escucha A/B, parada, resultado y error en español e inglés.

## Comparación

- A usa HTMLAudioElement y MediaElementAudioSourceNode; B usa AudioBufferSourceNode.
- Ambas comparten AudioContext, fragmento MP3, posición inicial, GainNode, salida, ganancia 0,42 y duración nominal de 12 segundos. Los bordes tienen fades de 30 ms. No cambiar el volumen físico entre escuchas.
- Fragmento de 14 segundos de Solace (Scott Buckley), copiado sin recodificar del MP3 ya incluido y acreditado. Se decodifica una vez para B: aproximadamente 5 MiB a 48 kHz estéreo. La posición final del medio queda registrada; no se promete sincronización exacta entre decodificadores.
- Partida, efectos y música normal permanecen pausados en Configuración. La pantalla y carga visual son iguales entre A y B; no reproducen la carga de una partida activa.
- Cada escucha exige pulsar un botón. Salir de la app, cerrar Configuración, mute, interrupción, compartir o destruir el motor detienen la prueba. Volver no la reinicia.
- Hasta doce escuchas y respuestas se guardan en el diagnóstico y su sesión anterior. No hay micrófono, grabación del altavoz ni envío automático.

## Interpretación

Escuchar A y B, marcar lo oído y repetir si difieren. Repetir A ayuda a distinguir el efecto de reiniciar la reproducción del efecto de cambiar de ruta. Las respuestas del usuario son necesarias: play resuelto y pruebas automatizadas no certifican sonido audible. Si ambas suenan bien, el resultado es inconcluyente; no acredita solución al petardeo. El reproductor normal del juego permanece igual.

## Verificación

- Suite local inicial: 322 pruebas correctas; doce regresiones finales de integración y ciclo de vida correctas. TypeScript y compilación móvil correctos.
- Pruebas de rutas, mismo asset/contexto/nivel, repetición sin decodificar de nuevo, parada automática, interrupción, respuestas tardías, errores, timeout, limpieza e historial/exportación.
- Integración: música/efectos del juego silenciados durante la comparación; mute, cierre e inactividad detienen la escucha.
- Edge y WebKit, teléfono ES y tableta EN: controles y exportación correctos. Edge ejecuta A/B; las valoraciones de estos informes son simuladas. WebKit de Playwright en Windows carece de AudioContext y solo valida interfaz degradada y exportación.
- Capturas de referencia final `edge-iphone.png` y `edge-ipad.png`, hashes en `visual-reference.json`. Se oculta únicamente el panel de laboratorio local, ausente en iOS. Son capturas de navegador, no de iPhone físico.
- El verificador de build compara el fragmento empaquetado con el original por bytes.

## Entrega

Pendiente de CI, firma, subida y relectura por API de Apple. TestFlight interno, sin envío a revisión ni publicación en tienda.

Referencias: [AudioBufferSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode), [App Store Connect Builds](https://developer.apple.com/documentation/appstoreconnectapi/builds).
