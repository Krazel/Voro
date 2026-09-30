# Música nativa iOS · 0.13.2 (1)

El usuario informa de más petardeo con 0.13.1 y del mismo problema original en Quiet Stacks, en el mismo iPhone/salida. Tilt Arena funciona bien. Autoriza usar su reproductor de música en ambos juegos y retirar intervenciones fallidas de VORO.

Se usa AVAudioPlayer con AVAudioSession playback/default/mixWithOthers, como ClassicSound de Tilt Arena. Las doce canciones, nivel .42, duck .3, transiciones de cuatro segundos y pausas de juego se conservan. No hay HTMLAudioElement ni nodos de música Web Audio en iOS. Los efectos siguen en su backend existente. Web conserva el reproductor previo a 0.13.1.

Retirados la recuperación automática, la compuerta adicional y la comparación A/B (incluido clip), conservando diagnóstico técnico y parada nativa inmediata al perder actividad. No se modifica gameplay ni arte. La hipótesis WebKit no está demostrada y el resultado acústico requiere iPhone físico.

Candidata 0.13.2(1), TestFlight interno. Fuente, API y evidencia de entrega pendientes. Pruebas JS y tipos locales correctos; compilación iOS pendiente de CI.
