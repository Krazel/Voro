# Inicio de música al continuar · 0.13.3 (1)

El usuario informa de que 0.13.2 parece haber eliminado el petardeo, pero al cerrar por completo y continuar una partida se oye primero una canción incorrecta que después desaparece.

Causa encontrada: el desbloqueo global de audio en pointerdown/keydown inicializa la música cuando started todavía es false. El click posterior del botón establece started y selecciona el entorno guardado. Con AVAudioPlayer, la canción del menú empieza inmediatamente y permanece durante los cuatro segundos de transición.

El botón de comenzar/continuar se identifica explícitamente. Su evento inicial deja la inicialización a la acción start, que ya selecciona el entorno antes de iniciar audio. Se conservan AVAudioPlayer, su sesión, canciones, transiciones normales, efectos y música de los demás gestos del menú. Quiet Stacks no se modifica.

Regresión: toque y teclado sobre Continuar no emiten comandos musicales hasta la acción start; la primera canción es la del entorno guardado. Los demás gestos del menú mantienen su música. 17 pruebas de audio y tipos correctos. Confirmación acústica física de esta corrección pendiente.

Build móvil correcta y prueba del botón real en Edge, viewport 390×844: partida acuática guardada, recarga completa, pointerdown sin audio y click con primera canción water; teclado Enter con el mismo resultado, sin errores de página. Recibo `button-verification.json`, reproductor web (no prueba acústica de iPhone). El panel de laboratorio se oculta solo en la prueba para no tapar el botón. Fuente de la candidata: 03aeb3f. CI: https://github.com/Krazel/Voro/actions/runs/36723986942.

## Entrega

0.13.3(1) disponible en TestFlight interno, verificada por API el 30-09-2026. Apple VALID/IN_BETA_TESTING; build `12bc73f3-4df7-4bc6-bd36-d9d2ddf01607`, grupo interno `05db8744-bcf3-4c2d-a465-2635012bfeeb`. Recibo `apple-verification.json`. Biblioteca PR-009 actualizada y releída, revisión 320. Sin envío a revisión externa ni publicación App Store.

QA nativa de la misma fuente 03aeb3fc9e8d262c458c1d5b33be96ca123b5916: iPhone 17 Pro simulado, iOS 26.5; reproducción, cambio de canción, silencio, reanudación y segundo plano correctos. Recibo `native-music-simulator.json`. AVAudioPlayer y su adaptador no cambian respecto a la fuente entregada en 0.13.2.

CI final success. IPA de 349498974 bytes, SHA256 `b9568fcf3133e77c95682bdfc7157e295dc0e497044787af58496d05b62e18e3`. `verify-delivery.py` confirma fuente igual a la QA, versión/build, AVAudioPlayer en el binario, marca del botón corregido en JavaScript, doce canciones idénticas y ausencia de la prueba de simulador. Recibo `native-music-delivery-verification.json`.
