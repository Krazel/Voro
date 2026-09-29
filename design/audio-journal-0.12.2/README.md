# Recuperación tras interrupción temprana · 0.12.2 (1)

La prueba física de 0.12.1 confirma que la música se detiene inmediatamente al salir, pero persiste el petardeo. El registro demuestra un defecto de recuperación; no demuestra por sí solo el origen acústico del petardeo.

## Hallazgo y cambio

En tres salidas, WebKit informa `interrupted` antes de que llegue a JavaScript el permiso nativo cerrado. SfxPlayer solicita `resume()` en ese intervalo de 8–14 ms y la promesa termina con el contexto en `running` mientras el permiso ya está cerrado. Las pruebas de 0.12.1 cubrían primero el cierre del permiso; faltaba este orden real.

El motor ahora detecta la interrupción tanto desde `statechange` como desde cualquier intento de recuperación. Cierra el permiso inmediatamente y consulta de nuevo el estado nativo. El observador mantiene el cierre hasta recibir esa consulta; un aviso activo anterior no basta. Una secuencia nativa más reciente prevalece sobre una respuesta antigua. La consulta puede confirmar la misma secuencia si la interrupción ocurrió sin abandonar la aplicación.

No se reinicia el reproductor ni se modifica el volumen, los archivos de sonido o AVAudioSession. Se conserva la pausa de la partida y el sonido desactivado. El diagnóstico registra `native-interruption-check` y su respuesta para comprobar físicamente el nuevo orden. Un fallo de la consulta mantiene el bloqueo y permite reintentar al volver a la app; la ausencia inicial del plugin conserva el comportamiento web anterior.

La distinción entre una interrupción externa y una suspensión controlada por la aplicación está documentada en [BaseAudioContext.state](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state).

## Verificación

- Regresión del orden físico, repetida tres veces: interrupción, intentos de efecto/gesto/foco, suspensión y aviso nativo tardío; ningún resume antes de confirmar la vuelta.
- Recuperación sin cambio de secuencia, avisos activos durante la consulta, respuestas antiguas, mute, teardown y fallo de consulta con reintento.
- Las pruebas usan los listeners y el motor reales con AudioContext y puente nativo simulados. No validan el sonido del iPhone.
- TypeScript y compilación móvil correctos. Suite local inicial: 315 pruebas; once regresiones dirigidas tras el ajuste final. CI sobre la fuente distribuida: **316/316**, sin fallos.
- Edge y WebKit, teléfono y tableta: controles, pausa, permiso nativo simulado y exportación correctos (`browser-check.json`). WebKit en Windows no dispone de AudioContext; estas pruebas no acreditan reproducción física.

## Entrega

- Fuente: `f6de5108b109c6c428445d5964f755eb1ae4d7a1`.
- [CI 36635455963](https://github.com/Krazel/Voro/actions/runs/36635455963): correcta, con compilación, firma, recursos, versión y subida verificadas. La ejecución anterior 36635049661 se canceló antes de subir; su paso de subida quedó omitido.
- Apple, comprobado por API el 29-09-2026 a las 21:57 UTC: build `029caab4-8102-4ff1-ba7c-91d11504b38c`, **0.12.2 (1), VALID / IN_BETA_TESTING**.
- Grupo existente `VORO Interno`, `05db8744-bcf3-4c2d-a465-2635012bfeeb`. Sin envío a revisión ni publicación en la tienda.
- Biblioteca D1: ficha `PR-009`, revisión **302**, guardada y releída conservando marketing, distribución y seguimiento.
- Paquete y manifiestos: `artifact/testflight-0.12.2-build-1/`. Comprobación reproducible: `verify-delivery.py`; resultado compacto: `verification.json`.

## Prueba física

Instalar 0.12.2 (1), jugar un minuto y salir/volver tres veces. Continuar la partida después de cada regreso. Si aparece el petardeo, compartir el diagnóstico enseguida; no hace falta prolongar la sesión. Comparar también una sesión sin salir de la aplicación. La desaparición del petardeo sigue pendiente de esta comprobación.

El diagnóstico original se conserva localmente fuera de Git. El registro público resume solo el orden técnico pertinente.
