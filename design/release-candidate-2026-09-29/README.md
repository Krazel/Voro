# Preparación de candidata definitiva

Base de juego: `b321a2f`, con audio candidato `c72f96b` y piezas intermedias de órbita. El usuario pide conservar por ahora el modo de desarrollo. No se añaden mecánicas ni contenido nuevo por esta auditoría.

## Estado comprobado

- TestFlight entregado: 0.10.1 (1), interno; todavía no incorpora los dos commits candidatos.
- Windows entregado: 0.8.1 preview 1. `desktop/release.json` aún apunta a 0.9, mientras el juego marca 0.10.1: el empaquetador rechaza esta discrepancia. Alinear la versión al crear el binario candidato final.
- 275 pruebas pasaron tras el ajuste de audio. El cambio de órbita añadió una prueba y pasó las 11 de ecología/recuperación. TypeScript y build móvil verificados sobre el contenido actual.
- Auditoría de cierre: 16 pruebas de idiomas, conservación de progreso con cambios de balance, recorrido, ciclo de final, inclinación y política del ejecutable correctas.
- Español/inglés y elección por idioma del dispositivo ya tienen cobertura. No se añade un idioma nuevo.

## Pendientes para declarar definitiva

1. Audio: confirmar en el iPhone afectado que la candidata elimina el petardeo. Las pruebas offline no reproducen cortes de reproducción reales. No marcar resuelto todavía.
2. Prueba física de la misma candidata en iPhone/iPad: inicio, cambios de entorno, zonas densas, pausa/regreso, background/regreso y audio después de esos eventos. Usar el informe automático para comparar p95/p99 y cortes, no solo FPS medios.
3. Campaña normal de principio a final: progresión sin ayudas, recuperación tras daño, absorción de Tierra, tránsito de entornos y cierre del universo. Las simulaciones no sustituyen la valoración real de ritmo/duración.
4. Persistencia en binario: cerrar/reabrir, actualizar conservando una partida existente y funcionar sin conexión, sin restablecer datos del usuario.
5. Paridad de entrega: generar IPA y ZIP Windows desde el mismo commit y registrar versión, hash y pruebas. No vender un ejecutable antiguo por error.
6. Tienda: releer la ficha por API, elegir el binario final, contrastar capturas/tráiler/textos aprobados con lo que contiene y conservar las licencias/créditos existentes. No reescribir textos aprobados por esta auditoría ni enviar a revisión/publicación.
7. Herramientas de desarrollo: se conservan tal como pide el usuario; su exposición comercial se decidirá al cerrar la candidata.

No se consideran requisitos de esta versión nuevos biomas, logros, nube, más adaptaciones ni integración Steam. Steam sigue siendo un objetivo de distribución aparte, no debe retrasar por sí solo el cierre del juego.

Consulta ASC de solo lectura completada en CI `36587067936`, con todas las opciones de modificación desactivadas. Ver `store-summary.json`: ficha 1.0 en PREPARE_FOR_SUBMISSION, aún con binario seleccionado del 22 de septiembre (`118537c4-7428-4664-a1da-1b96cb35e240`), anterior a los cambios actuales. EN dispone de dos grupos de capturas y dos de previews; ES no tiene grupos propios. Hay que comprobar la presentación final de cada idioma, sin deducir que la ausencia de grupos propios bloquea el envío. No se ha enviado a revisión ni publicado nada.
