# Señuelo orgánico y cuatro ajustes autorizados

Implementación descrita en ../adaptations-candidate/README.md. No se añadieron otras propuestas ni se modificaron objetivos de biomasa, enemigos, entornos, menús o versión de distribución.

## Verificación
- 36 tests de comportamiento, alcance, disparos, elecciones, límites, migración e idiomas; 15 adicionales de compatibilidad, tentáculos y guardados: correctos.
- TypeScript y builds móvil/PC correctos. Advertencia de tamaño de bundle ya existente. No build iOS ni prueba física nueva.
- Navegador real local: copia capturada de512px, separación del protagonista, desvanecimiento y desaparición a2s, sin errores. Capturas y browser-check.json. Catálogo14 tarjetas y2 raras; oferta móvil revisada a390×844. Usa arte pintado existente, casilla12 del atlas.

## Campaña, datos y límites
Pilotos finales en ../adaptation-balance-2026-09-28/:
- pilot-verified-first-41.json: piloto normal priorizando adaptación, semilla41. Completa en5378s simulados, sin muertes,70 elecciones. Al entrar: charca11, orilla19, mar28, ciudad36, órbita49, planetas52, estrellas58, galaxias64, universo69. Última elección en universo a5301s.
- pilot-verified-pacing-41.json: invulnerable para aislar la cadencia de las pérdidas por daño. Completa en3996s; estrellas58, galaxias64, universo69 y70 al terminar. No demuestra supervivencia.
- pilot-verified-last-73.log: piloto normal, semilla73, posponiendo adaptación; aborta tras tres muertes en órbita. No es una prueba pasada.
- pilot-defensive-41.log: otra prioridad con defensa al principio también aborta tras tres muertes en órbita. No se afirma equilibrio cerrado para todas las elecciones/semillas. Necesaria prueba humana de órbita; no se atribuye causalmente a un único cambio con estos datos.

Las iteraciones intermedias (final-*, rebalance-*, pacing-only-*) tienen otros ajustes y no son evidencia de esta candidata. El reparto de la candidata evita agotar elecciones antes de las últimas etapas en los pilotos completos; no garantiza el ritmo de todas las partidas ni impide que alguien siga consiguiendo elecciones quedándose indefinidamente en un entorno.

TestFlight y ejecutable entregados siguen en0.8.1. Esta candidata está disponible en el servidor local, no publicada.
