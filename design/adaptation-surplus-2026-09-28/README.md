# Adaptaciones sobrantes al terminar

Petición: abrir el juego y, mientras el usuario lo prueba, comprobar que queden adaptaciones disponibles al finalizar. No equilibrar tomando como referencia maximizar Adaptación acelerada. Sin ralentización dinámica.

Juego abierto en el navegador integrado: http://127.0.0.1:5211/?ui=final&lab=cosmos . Fuente comprobada2993110. No se modifica el juego activo durante estas pruebas: solo scripts y evidencia.

## Resultado

| Piloto | Actual: elecciones/sobrantes | Alternativa fija: elecciones/sobrantes |
|---|---|---|
| Semilla41, daño normal |73 /1 |63 /11 |
| Semilla73, invulnerable para aislar cadencia |69 /5 |60 /14 |

Los cuatro terminan. El piloto con daño normal termina sin muertes en ambas variantes. La alternativa multiplica la ganancia de XP por0,65/0,85 (−23,53%) mediante una instrumentación solo del piloto; las recompensas no se ajustan al jugador, al tiempo o al número de mejoras. Costes, límites, biomasa y efectos de mejoras permanecen iguales. El hook de stats se renueva en cada actualización; no acumula el factor repetidamente.

En ambas variantes se deja Adaptación acelerada al final de las preferencias. La versión actual acaba obligando a elegirla: últimas7 elecciones de la semilla41 y últimas3 de la73. Al acabar solo quedan adquisiciones de esa mejora. La alternativa no la compra en estas pruebas y conserva, además de sus8 adquisiciones,3 o6 de Membrana repulsora. Son pilotos con preferencias rígidas, no evidencia de distribución de elecciones humanas.

## Recomendación concreta, todavía NO aplicada al juego

Cambiar el coeficiente fijo de progreso por comida de0,85 a0,65 (en digestión normal y al terminar de digerir durante la absorción de la Tierra). Mantener la bonificación +5%/elección de Adaptación acelerada, todos los límites actuales y las barras guardadas. No añadir otra adaptación solo para llenar el catálogo. Validar después jugando las preferencias y la sensación de frecuencia.

Así se obtiene un margen de11–14 elecciones en estas pruebas, frente a1–5. No se garantiza ese margen para todos los estilos: daño, tiempo de permanencia, comida sobrante, recorrido y mejoras elegidas cambian el resultado. Maximizar adaptación no ha sido el criterio de calibración.

## Evidencia reproducible

- scripts/audit-adaptation-budget.mjs y budget.json: presupuesto analítico sin daño ni alimentación adicional, varios tamaños de comida; no es una partida. Base actual68–69 frente a59–60 con coeficiente0,65. Filas con bonificaciones permanentes son sensibilidad matemática, no historiales posibles de adquisición desde el inicio.
- scripts/audit-adaptation-balance.mjs: piloto del motor real a30Hz, decisiones inmediatas, VORO_YIELD_LAST=1. Alternativa VORO_AUDIT_XP_SCALE=0.7647058823529412. Variante invulnerable VORO_PACING_ONLY=1.
- JSON detallados ../adaptation-balance-2026-09-28/pilot-surplus-*.json; resumen pilots-summary.json.
- No demuestra rendimiento físico, duración humana media ni balance perfecto. TestFlight y ejecutable entregados siguen en0.8.1. Juego local conserva2993110.

## Resolución posterior del usuario

Aprobado reducir un20%, en lugar del23,53% ensayado. Aplicado al juego mediante ADAPTATION_FOOD_GAIN=0,68 (=0,85×0,8), en las dos rutas de digestión. La propuesta0,65 queda como evidencia comparativa, no como configuración vigente. No se han vuelto a ejecutar los pilotos de esta auditoría con0,68; no atribuirle sus11–14 elecciones sobrantes.
