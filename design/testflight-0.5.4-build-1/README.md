# VORO 0.5.4 (1) — audibilidad y recuperación de efectos

El usuario indica que no aprecia el sonido al comer en el móvil, aunque en ordenador sí. El informe 0.5.3 confirma lentitud, pero no contenía estado de audio y no permite demostrar que la ausencia del efecto sea consecuencia de los FPS.

El usuario confirma que la música de fondo sí se escucha. Ambas rutas comparten AudioContext; esto hace menos probable un bloqueo general del contexto y refuerza revisar la ganancia/carga específica del efecto. No demuestra cuál de esas dos causas ocurrió.

- Código del binario: `c5b236e37c3a0a16017a5fafa79291b41b36f256`.
- CI: https://github.com/Krazel/Voro/actions/runs/35720245987
- Destino: VORO Interno, sin publicación App Store.

## Hallazgos y corrección

Los tres WAV son PCM mono 16 bits a 44100 Hz, duración 0.45–0.56 s, picos cercanos a -1 dBFS y RMS cercano a -26.5 dBFS. Antes, ganancia 0.65 multiplicada por master 0.055 dejaba el efecto cerca de -55 dBFS RMS. La ganancia de la voz pasa a 2, aproximadamente +9.8 dB: mantiene música, demás efectos, variaciones de tono/duración y límite de tres inicios por segundo. No se han sustituido los sonidos aprobados ni alterado el audio nativo/switch de silencio.

La carga anterior descartaba todos los buffers si fallaba uno y conservaba una promesa fallida para siempre. Ahora conserva las variantes que sí decodifican y reintenta solo las pendientes en un gesto posterior, con 5 s de espera mínima. No redecodifica archivos sanos ni reinicia audio activo en cada toque. El contexto interrumpido no acumula sonidos atrasados.

El informe exportado incluye contexto de audio, ganancia, variantes cargadas, errores y contadores de solicitudes/inicios/bloqueos. «Iniciado» no demuestra que haya sonido en el altavoz físico. Los WAV se comparan contra origen dentro del archive firmado.

## Informe de rendimiento recibido

30 s, 923 fotogramas, media aproximada 31 FPS, P95 64 ms, 351 cuadros lentos. CPU del motor 1.5 ms (simulación 0.35, render 1.12). Solo dos intervalos coinciden con carga activa; 8 reconstrucciones de fondo. 490 entidades, 25 chunks, raster ya reducido a 0.85 (1.44 Mpx). Caché procedural con 246 expulsiones. Los tiempos no miden GPU ni todo WebKit: investigar composición/presentación y presión de caché, sin afirmar causa probada. El informe original se conserva solo en artifact/ ignorado, no en Git público.

## Validación y límites

Tipos, 194 pruebas y build móvil correctos. Pruebas cubren fallo parcial de carga, reintento selectivo, contexto interrumpido, ausencia de sonidos atrasados y tono/duración. El iPhone sigue necesitando prueba física de audibilidad; no se presenta esta entrega como arreglo del rendimiento.

CI completado correctamente. Apple confirma VALID e IN_BETA_TESTING, build 4cbe8d65-91bd-4206-8222-f6112d779deb en VORO Interno. SHA256 de IPA descargada coincide con el artefacto. Biblioteca PR-009 actualizada y releída, revisión 120. El usuario vuelve a confirmar lentitud desde el arranque también en iPad: se abre auditoría del motor compartido; esta build corrige audio, no presenta una mejora FPS.

