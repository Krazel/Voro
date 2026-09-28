# Efectos más audibles — candidata web 28/09

Comer: ganancia 2 → 3 (+50 %). Daño: 3,2 → 4,2, con 45 ms de cuerpo antes de decaer. Escudo: 1,1 → 1,5. Bus de efectos y música sin cambio de volumen. Conserva las envolventes sin clics, la variación de tono y los límites de voces.

Validación: 19 tests de efectos/recuperación, síntesis real OfflineAudioContext en Edge. Daño RMS 0,0287 → 0,0615; comer 0,00713 → 0,01069. Mezcla con música real, todos los samples, cadencia máxima y tres extremos de pitch: pico máximo 0,5903 (clipping a 1). Archivos WAV y métricas en esta carpeta. No acredita volumen físico de altavoces iPhone; pendiente probar allí. Sin TestFlight ni publicación.

Reproducir con `VORO_PLAYWRIGHT_RUNTIME` y `node scripts/check-effects-levels.mjs` sobre servidor local 5210. La comparación usa fd0381d como estado anterior.
