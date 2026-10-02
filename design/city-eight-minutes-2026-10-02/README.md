# Ciudad: objetivo de ocho minutos

Solo se recalibra Ciudad: objetivo 10 → 8 minutos y multiplicador fijo de biomasa .140 → 0.19. Se conservan la huida urbana aprobada, daño, requisitos de tamaño/evolución y ritmo de adaptaciones. No hay temporizadores ni freno adaptativo. Partidas existentes compatibles.

## Resultado

- 15 campañas principales: Ciudad media **8:15**, mediana 7:18, rango 6:02–12:23.
- Referencia de la auditoría 0.14: 11:07 con 90 campañas; mismas 15 semillas/perfiles: 11:40.
- Tres contrastes a 60 Hz: media 8:38, separados de la muestra principal.
- 18/18 campañas completas. Cada ejecución conserva parámetros, decisiones y tiempos; las tres partidas piloto previas están separadas y no se suman a la muestra final.

Simulaciones del motor real desde el inicio, con las adaptaciones heredadas y la nueva huida urbana. Son pilotos automáticos, no una media medida de jugadores. Incluye transiciones y 5–10 segundos supuestos por elección; no incluye cargas ni descansos. No mide FPS. La referencia 0.14 precede a la nueva huida: la comparación histórica incluye ambos cambios.

## Reproducir

`node scripts/run-duration-batch.mjs design/city-eight-minutes-2026-10-02/final`

`node scripts/report-city-eight-minutes.mjs`

El límite del simulador es tres horas o diez muertes. Los resultados se capturaron sobre 7283bf9a54e569adf7aae7db659954b23e6d50d8, con el ajuste local de campaña que figura íntegro en cada JSON, antes del commit de entrega. La validación del informe compara todos los parámetros de otros entornos y las recompensas de adaptación con la referencia.

## Verificación y distribución

17 pruebas dirigidas correctas: pacing, compatibilidad de guardados, independencia de adaptaciones, huida urbana y señuelo. Build móvil correcta con verificación de assets. Ajuste local guardado en Git; TestFlight sigue en 0.14 (1), sin nueva subida en este encargo.
