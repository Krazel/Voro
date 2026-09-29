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

- **Disponible en TestFlight interno: 0.13 (1), VALID / IN_BETA_TESTING**, relectura API del 30-09-2026 (hora local).
- Fuente del binario `4d82e30f1614401b34ffeb25ffa84dd4ff7ccce6`; **323/323 pruebas** correctas en macOS.
- [Build 36642414137](https://github.com/Krazel/Voro/actions/runs/36642414137): pruebas, compilación, firma y subida correctas; la asignación al grupo falló por HTTP 500 de Apple después de procesar la build como válida.
- [Recuperación API 36643493875](https://github.com/Krazel/Voro/actions/runs/36643493875): correcta sobre la misma build, sin recompilar ni subir otra. Código de automatización `11842d6`; consulta pertenencia al grupo antes de repetir la escritura y comprueba errores de la tubería.
- Build Apple `3ab79ba1-4b3e-46d5-a3fa-fdb572b7aa75`, grupo existente `VORO Interno` (`05db8744-bcf3-4c2d-a465-2635012bfeeb`). Sin App Review ni publicación en tienda.
- IPA `349760979` bytes, SHA-256 `11949c73ec11b3d83a465310d04deabfd2924c453e85e0aa2e0487edbd7aac7b`. `verify-delivery.py` valida versión, fuente, firma declarada, familias, controlador y hash del fragmento dentro del IPA. Resultado: `verification.json`.
- El recibo de acceso se conserva en `artifact/testflight-0.13-api-recovery/` y junto al paquete `artifact/testflight-0.13-build-1/`; sustituye el recibo vacío de la asignación fallida.
- Biblioteca D1: misma ficha PR-009, revisión **308**, guardada y releída; marketing, publicación y tracking conservados. Escucha física y causa del petardeo siguen pendientes.

Referencias: [AudioBufferSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode), [App Store Connect Builds](https://developer.apple.com/documentation/appstoreconnectapi/builds).
