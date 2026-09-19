# VORO — Encuadre uniforme, candidata local 19-09-2026

Petición: conservar el tamaño visual inicial del microscopio en todos los entornos, con zoom manual y sin alterar mecánicas ni arte.

## Base e integración

El checkout original Voro/main (6dce830) pertenece al linaje Sites y carece del zoom manual de 0.4.18. No se modificó. Tras `git fetch github`, github/main seguía en 1fbff49, con 0.4.18 y b8d28aa. Se creó el worktree hermano Voro-camera, rama camera-framing-2026-09-19.

Integraciones autorizadas: 1dca23d → 90055ac (StoreKit) y 160bc5b → 9fe519a (selector animado y escudo único). Único conflicto en page.tsx: se conserva el ocultamiento del pie durante el final y se incorpora ReviewMilestone, bloqueándolo también durante nacimiento/final. El propietario VORO revisó esta resolución. Las ramas originales permanecen intactas.

## Corrección

Referencia real de 0.4.18: radio 24, zoom automático 1,12, ancho lógico 480. El diámetro corporal de referencia ocupa el 11,2 % del ancho (43,68 píxeles CSS en una vista de 390). Charca, orilla y mar nacen con radio 11,384: ahora reciben zoom 2,3612 en vez de 1,12. Órbita puede heredar radio 43,037 o más según la biomasa de entrada: se ajusta también a la misma referencia.

La cámara usa el radio real al entrar en cada nueva escala. Lo guarda en progress.cameraEntryRadius; cargar no toma el tamaño crecido como un nuevo inicio. Los guardados anteriores sin ese dato usan el radio de nacimiento de su entorno: no se inventa la biomasa histórica de entrada. Los valores inválidos usan la misma alternativa segura. Reintentar restablece la referencia de nacimiento. Las herramientas de prueba usan el inicio del entorno como referencia para que sus tamaños mayores sigan viéndose mayores.

Se conserva la curva de crecimiento relativo, suavizado, límites 75–175 %, rueda, pellizco y controles existentes. El zoom manual sigue siendo una preferencia de sesión, como antes; no se añade persistencia nueva de ese factor. Biomasa, colisiones, arte, progresión y final cinematográfico no cambian.

## Evidencia y comprobación

- [Comparación de diez entornos](comparison.png): motor real en Chromium, mismo viewport, zoom manual 100 %, semilla 834. Izquierda reproduce la fórmula anterior; derecha usa la nueva. Son escenas de QA dibujadas con el motor, sin HUD, no capturas de iOS.
- [Mediciones](measurements.json): veinte renders, diez tamaños nuevos iguales a 43,68 píxeles; cero errores de página.
- [Pruebas](tests.log): 155 correctas. Incluyen transiciones con exceso de biomasa, fin de transición, guardado/carga, crecimiento tras cargar, reintento, guardados antiguos y zoom 75/100/175 % en los diez entornos. También selector, escudo, review, rueda y pellizco.
- [Integración visual](integration/browser-checks.json): 13 comprobaciones Chromium correctas; [vídeo del selector integrado](integration/adaptation-selection.webm).
- TypeScript sin errores; lint dirigido sin errores; [build Vite de producción](build.log) correcto. Permanece el aviso de bundle superior a 500 kB.

Candidata ejecutable: artifact/camera-preview-2026-09-19 dentro de este worktree. Conserva versión 0.4.18 como base; no representa una nueva versión distribuida. Sin push, publicación Sites, IPA nueva, TestFlight ni envío a revisión. StoreKit requiere compilación y validación nativa iOS. Siguiente paso: revisar esta candidata integrada y validar en dispositivo antes de cualquier distribución autorizada por separado.

Biblioteca: PR-009 revisión 57 guardada por API y releída; next actualizado con entrega y pendientes. tracking, versiones, distribución, releases, source y detail conservados y comparados. Recibo: library-verification.json. Código de la entrega: f18149d.
