# Música nativa iOS · 0.13.2 (1)

El usuario informa de más petardeo con 0.13.1 y del mismo problema original en Quiet Stacks, en el mismo iPhone/salida. Tilt Arena funciona bien. Autoriza usar su reproductor de música en ambos juegos y retirar intervenciones fallidas de VORO.

Se usa AVAudioPlayer con AVAudioSession playback/default/mixWithOthers, como ClassicSound de Tilt Arena. Las doce canciones, nivel .42, duck .3, transiciones de cuatro segundos y pausas de juego se conservan. No hay HTMLAudioElement ni nodos de música Web Audio en iOS. Los efectos siguen en su backend existente. Web conserva el reproductor previo a 0.13.1.

Retirados la recuperación automática, la compuerta adicional y la comparación A/B (incluido clip), conservando diagnóstico técnico y parada nativa inmediata al perder actividad. No se modifica gameplay ni arte. La hipótesis WebKit no está demostrada y el resultado acústico requiere iPhone físico.

Candidata 0.13.2(1), fuente ef73cf6a712f4b63eb9d5599bc142326d0ca461f. Pruebas JS, tipos y build móvil correctos. [CI 36717941873](https://github.com/Krazel/Voro/actions/runs/36717941873) supera compilación y prueba nativa en iPhone 17 Pro simulado, iOS 26.5: menú, Microscopio, silencio, reanudación y segundo plano. Nivel .42 y avance real de AVAudioPlayer verificados. Recibo: `native-music-simulator.json`.

La prueba de simulador se incorpora al documento cargado mediante WKUserScript y se excluye del IPA de dispositivo. Los intentos previos fallaron por tipado Swift y por inyectar la prueba en una página provisional; no son entregas.

## Entrega verificada

CI correcta y Apple VALID/IN_BETA_TESTING el 30-09-2026. Build `ddd7c08f-b5c3-4120-9eb5-f0dd5a5770f1`, grupo interno `05db8744-bcf3-4c2d-a465-2635012bfeeb`. No se envía a revisión externa ni se publica en App Store.

IPA de 349498935 bytes, SHA256 `04e02dfb0c1e513e3a1fe616d4aff7624a91bf42ad33afc8a8fa7a4d44828017`. `verify-delivery.py` comprueba el mismo commit que la QA nativa, versión/build, reproductor en el binario, las doce canciones idénticas, retirada del clip A/B y ausencia del script de simulador. Recibo: `native-music-delivery-verification.json`. Biblioteca PR-009 actualizada y releída, revisión 316, versión 0.13.2(1).

Siguiente paso: prueba acústica en el mismo iPhone y salida de sonido. La validación técnica no confirma todavía que haya desaparecido el petardeo físico. Quiet Stacks queda implementado y validado, sin subir a TestFlight por instrucción expresa del usuario.
