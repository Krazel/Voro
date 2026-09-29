# Duración por entorno · simulación del balance con daño al 10 %

Fuente de juego: 130f845003f65897cedf997229fb5d9d9450760c. Etiqueta base 0.11.1; incluye el ajuste posterior de daño del 10 %, todavía no distribuido en TestFlight. 15 campañas a 30 Hz y 3 contrastes a 60 Hz.

## Qué se ha medido

Motor real de movimiento, apariciones, comida, daño, adaptaciones, órbita y final. Campañas desde cero con adaptaciones heredadas entre etapas. Sin invulnerabilidad, comida artificial ni saltos de entorno. Renderizado y audio omitidos: esto mide duración, no rendimiento del dispositivo. Cinco semillas (41,73,127,409,930), tres pilotos sintéticos. No son jugadores reales ni sus resultados una duración humana exacta.

Preciso: reacción inmediata y prioridad a adaptación. Directo: decide cada 0,1 s y prioriza movimiento. Explorador: decide cada 0,25 s, se desvía durante el 15 % de la navegación y prioriza defensa. Todos conocen los objetos cargados y sus requisitos, lo que les da ventaja sobre un jugador que descubre el juego. Los perfiles cambian varias cosas a la vez y no aíslan causalmente una adaptación.

Se añaden 5 s por elección a preciso/directo y 10 s al explorador, más 5 s por reintento. Son supuestos explícitos; no tiempo medido de lectura. Las cifras incluyen nacimientos, transiciones, intentos fallidos y animación final. Excluyen cargas, descansos y menús opcionales. La frontera entre etapas es el cambio real de entorno del motor, a mitad de la transición.

Límite de ejecución: 180 min de reloj simulado (las elecciones se añaden después) o 10 muertes. Una etapa que no termina no se cuenta como duración completada. Sí se incluyen las etapas completadas de campañas que se atascan más tarde. Las medias son condicionales a completar; el sesgo se muestra con el número de completadas/alcanzadas y los abandonos.

## Duraciones con tiempo de elección supuesto

| Entorno | Completadas / alcanzadas | Media | Mediana | Rango observado | Preciso | Directo | Explorador |
|---|---:|---:|---:|---:|---:|---:|---:|
| Microscopio | 15/15 | 14.6 min | 13.0 min | 11.5–21.1 min | 12.3 | 12.7 | 18.9 |
| Charca | 15/15 | 10.7 min | 10.4 min | 8.8–13.9 min | 10.1 | 9.5 | 12.6 |
| Orilla | 15/15 | 12.0 min | 11.1 min | 9.9–14.5 min | 11.1 | 10.6 | 14.2 |
| Mar | 15/15 | 10.6 min | 10.2 min | 8.9–12.9 min | 9.9 | 9.7 | 12.3 |
| Ciudad | 15/15 | 14.8 min | 13.4 min | 10.9–24.4 min | 13.4 | 12.2 | 18.8 |
| Órbita | 15/15 | 5.6 min | 4.9 min | 3.2–15.6 min | 4.6 | 7.0 | 5.2 |
| Planetas | 15/15 | 6.8 min | 6.0 min | 5.6–8.9 min | 5.9 | 5.8 | 8.6 |
| Estrellas | 15/15 | 7.2 min | 7.3 min | 4.4–11.6 min | 7.1 | 5.7 | 8.8 |
| Galaxias | 15/15 | 3.7 min | 3.5 min | 3.1–4.7 min | 3.4 | 3.3 | 4.5 |
| Universo | 15/15 | 2.4 min | 2.3 min | 2.0–3.0 min | 2.1 | 2.4 | 2.9 |

Las tres últimas columnas son medias en minutos por perfil, solo de etapas terminadas. El rango es el mínimo y máximo de esta muestra, no un intervalo de confianza.

## Campaña completa

| Perfil | Completadas / intentadas | Media (min) | Mediana | Rango |
|---|---:|---:|---:|---:|
| Preciso · adaptación primero | 5/5 | 79.8 | 79.9 | 77.6–82.5 |
| Directo · movimiento primero | 5/5 | 78.9 | 78.4 | 75.3–84.2 |
| Explorador · defensa primero | 5/5 | 106.8 | 107.9 | 100.3–110.0 |

Media conjunta de campañas completadas: 88.5 min; 15/15 completas. No sumar las medias por etapa si las muestras difieren.

## Ejecuciones que no terminaron

Todas las campañas principales terminaron.

## Contraste a 60 Hz (misma semilla 41, no mezclado con la muestra principal)

- Directo · movimiento primero: 30 Hz 78.4 min (completa); 60 Hz 80.0 min (completa).
- Explorador · defensa primero: 30 Hz 106.1 min (completa); 60 Hz 108.3 min (completa).
- Preciso · adaptación primero: 30 Hz 82.5 min (completa); 60 Hz 85.6 min (completa).

Cambiar el paso puede cambiar encuentros y decisiones; no implica recorridos idénticos. Estos contrastes muestran sensibilidad, no certifican convergencia ni representan FPS físicos.

## Reproducir

`node scripts/run-duration-batch.mjs design/duration-simulation-2026-09-29`

`node scripts/report-duration-batch.mjs design/duration-simulation-2026-09-29`

Cada JSON conserva fuente, semilla, perfil, elecciones y tiempos por etapa; batch.json conserva el estado de los 18 procesos. No se toca el guardado del usuario ni se sube una nueva build.
