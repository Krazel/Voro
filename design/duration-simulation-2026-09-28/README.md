# Simulación de duración · VORO 0.9 (2)

Se ejecuta el motor real sin esperar al reloj y sin dibujar ni reproducir audio. No se modifica la biomasa, XP, daño, recargas, apariciones ni invulnerabilidad. La partida real del usuario no se abre ni se guarda. Cada ejecución empieza de cero y usa una semilla reproducible.

## Alcance

Son pilotos sintéticos, no personas. Inspeccionan todos los objetos cargados y saben qué pueden comer. Los perfiles también eligen mejoras distintas, así que sus diferencias no aíslan un único efecto. El explorador dedica el 15 % de la navegación a desviarse. Se añaden explícitamente 5 segundos por elección a preciso/directo, 10 al explorador y 5 por reintento. No se incluyen descansos, cargas ni menús opcionales. No hay calibración suficiente para convertir esto en una duración media humana.

El reloj simulado incluye nacimiento, transiciones, absorción terrestre, intentos fallidos y final completo. No se aceleran las físicas aumentando dt: se avanza a pasos de 1/30 s (o 1/60 s en contrastes). No mide los FPS del móvil. Límite: tres horas simuladas o diez muertes; una partida interrumpida nunca se cuenta como completada.

## Resumen por perfil (30 Hz)

| Piloto | Completadas / intentadas | Intervalo de las completadas | Mediana de las completadas |
|---|---:|---:|---:|
| Reacción inmediata / XP primero | 2 / 3 | 93.6–102.8 min | 98.2 min |
| Directo / movimiento primero | 1 / 3 | 97.4–97.4 min | 97.4 min |
| Explorador / defensa primero | 2 / 3 | 156.3–175.0 min | 165.6 min |

La mediana es descriptiva de esta muestra pequeña y solo de sus partidas completas; no es una predicción de la mediana de jugadores. Los fallos pueden reflejar limitaciones del piloto (no planifica rutas complejas ni recupera fragmentos deliberadamente), además de dificultad del juego. No prueban por sí solos que un humano quede bloqueado.

## Resultados

| Piloto | Semilla | Hz | Resultado | Minutos con elecciones | Muertes | Cálculo (s) | Aceleración |
|---|---:|---:|---|---:|---:|---:|---:|
| Directo / movimiento primero | 109 | 30 | Completada | 97.4 | 0 | 117.0 | 47.2× |
| Directo / movimiento primero | 41 | 30 | Interrumpida en orbit | 84.7 | 10 | 92.8 | 51.6× |
| Directo / movimiento primero | 73 | 30 | Interrumpida en orbit | 89.6 | 10 | 126.4 | 40.3× |
| Explorador / defensa primero | 109 | 30 | Completada | 156.3 | 0 | 153.3 | 56.9× |
| Explorador / defensa primero | 41 | 30 | Completada | 175.0 | 0 | 215.7 | 45.7× |
| Explorador / defensa primero | 73 | 30 | Interrumpida en city | 186.3 | 0 | 235.4 | 45.9× |
| Reacción inmediata / XP primero | 109 | 30 | Interrumpida en land | 26.1 | 10 | 35.4 | 39.9× |
| Reacción inmediata / XP primero | 41 | 30 | Completada | 102.8 | 0 | 122.0 | 47.5× |
| Reacción inmediata / XP primero | 41 | 60 | Completada | 94.3 | 1 | 156.4 | 33.8× |
| Reacción inmediata / XP primero | 73 | 30 | Completada | 93.6 | 0 | 115.1 | 45.6× |

Los minutos de filas interrumpidas son tiempo transcurrido, **no duración hasta el final**. No se descartan esas filas al interpretar los resultados. La aceleración depende del ordenador y de otras simulaciones simultáneas. JSON individuales conservan elecciones, tiempos por etapa, versión y commit del juego.

## Contraste del paso temporal

La semilla 41 del piloto preciso dio 102.8 minutos a 30 Hz y 94.3 a 60 Hz (1 muerte frente a 0). No son trayectorias idénticas: cambian las oportunidades de reacción y las interacciones. Este contraste no demuestra independencia del paso temporal ni certifica una duración humana; respalda presentar un intervalo provisional y no un minuto exacto.

## Repetir

```powershell
node scripts/simulate-duration.mjs precise 41 30
node scripts/simulate-duration.mjs direct 41 30
node scripts/simulate-duration.mjs explorer 41 30
node scripts/summarize-duration.mjs
```

No requiere nuevas builds ni modifica TestFlight. Usar otras semillas para ampliar la muestra; no tratar tres semillas como una distribución de jugadores.
