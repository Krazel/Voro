# VORO 0.14(1): auditoría ampliada de duración

Fuente: 1fdd2c4bab24515fb5f85683088cb5efec7e1f01. 90 campañas principales (30 semillas × tres perfiles) y nueve contrastes prefijados a 60 Hz, más un diagnóstico del caso extremo Preciso/2153. Este último se eligió después de ver las 90 partidas y no se mezcla con su media. 120,7 horas de juego simuladas. No se ha cambiado el balance.

Los tiempos incluyen transiciones y un tiempo supuesto para elegir: 5 s para Preciso/Directo y 10 s para Explorador, más 5 s por reintento. No incluyen cargas, descansos ni menús opcionales. Motor real sin gráficos/audio: mide duración, no FPS. Los pilotos conocen los objetos cargados y no están calibrados con jugadores humanos. Ver PROTOCOL.md para el método.

## Duraciones por entorno

| Entorno | Completadas/alcanzadas | Media min:s | Mediana | P10–P90 (min) | Mín–máx (min) | Impactos medios | Elecciones medias |
|---|---:|---:|---:|---:|---:|---:|---:|
| Microscopio | 90/90 | 8:28 | 8:17 | 6,8–10,1 | 6,3–12,7 | 3,9 | 10,0 |
| Charca | 90/90 | 8:37 | 8:24 | 7,4–10,0 | 6,6–11,5 | 0,0 | 7,4 |
| Orilla | 90/90 | 8:30 | 8:08 | 7,4–10,2 | 6,8–11,2 | 0,0 | 7,4 |
| Mar | 90/90 | 9:07 | 8:43 | 8,0–10,8 | 6,7–11,6 | 0,1 | 6,7 |
| Ciudad | 90/90 | 11:07 | 10:19 | 8,8–14,8 | 7,7–17,5 | 30,0 | 16,2 |
| Órbita | 90/90 | 7:07 | 5:21 | 4,0–10,6 | 3,0–44,4 | 19,1 | 3,5 |
| Planetas | 90/90 | 8:14 | 7:15 | 6,8–10,7 | 6,4–11,3 | 0,0 | 5,5 |
| Estrellas | 90/90 | 7:27 | 7:13 | 4,8–10,6 | 4,3–13,2 | 12,1 | 5,1 |
| Galaxias | 90/90 | 6:59 | 6:21 | 5,9–8,8 | 5,3–9,5 | 0,1 | 6,2 |
| Universo | 90/90 | 5:06 | 5:00 | 4,1–6,3 | 3,8–6,6 | 0,0 | 5,7 |

El intervalo P10–P90 resume el 80 % central observado, no un intervalo de confianza. La media excluye etapas no completadas; sí incluye etapas terminadas de campañas que se atascan después. Los tres perfiles tienen el mismo peso por diseño, no porque representen porcentajes conocidos de jugadores.

## Campañas completas

| Perfil | Completadas/intentadas | Media min | Mediana min | P10–P90 min | Mín–máx min |
|---|---:|---:|---:|---:|---:|
| Conjunto | 90/90 | 80,7 | 73,0 | 68,7–97,1 | 66,2–106,9 |
| Preciso | 30/30 | 73,8 | 71,4 | 68,3–81,1 | 66,4–106,9 |
| Directo | 30/30 | 73,3 | 72,0 | 67,9–79,9 | 66,2–94,5 |
| Explorador | 30/30 | 95,1 | 94,2 | 90,6–100,3 | 89,4–103,2 |

## Frente a la muestra anterior

Mismas 15 combinaciones de perfil y semilla. Esta comparación reduce el cambio de muestra; no demuestra la causa de diferencias posteriores, porque encuentros y elecciones pueden divergir.

| Entorno | Anterior (min) | Actual mismas semillas (min) | Actual 90 (min) |
|---|---:|---:|---:|
| Microscopio | 8,0 | 8,0 | 8,5 |
| Charca | 8,5 | 8,5 | 8,6 |
| Orilla | 8,5 | 8,5 | 8,5 |
| Mar | 9,1 | 9,1 | 9,1 |
| Ciudad | 10,3 | 11,7 | 11,1 |
| Órbita | 6,5 | 5,2 | 7,1 |
| Planetas | 8,2 | 8,2 | 8,2 |
| Estrellas | 7,4 | 7,0 | 7,4 |
| Galaxias | 7,1 | 6,9 | 7,0 |
| Universo | 5,1 | 5,1 | 5,1 |

## Contrastes a 60 Hz

No se mezclan con las 90 campañas principales. Es el paso del motor, no rendimiento gráfico.

| Perfil / semilla | 30 Hz (min) | 60 Hz (min) | Completada 30/60 |
|---|---:|---:|---|
| Directo / 1013 | 79,1 | 71,0 | true/true |
| Directo / 2203 | 72,7 | 78,4 | true/true |
| Directo / 41 | 72,6 | 72,2 | true/true |
| Explorador / 1013 | 95,5 | 90,6 | true/true |
| Explorador / 2203 | 96,4 | 93,0 | true/true |
| Explorador / 41 | 98,8 | 96,4 | true/true |
| Preciso / 1013 | 72,2 | 77,2 | true/true |
| Preciso / 2203 | 101,2 | 72,2 | true/true |
| Preciso / 41 | 72,6 | 75,4 | true/true |
| Preciso / 2153 | 106,9 | 68,0 | true/true |

## Partidas incompletas

Todas las campañas principales terminaron.

## Adaptaciones aún disponibles al acabar

- Preciso: 0,0–0,0 elecciones; media 0,0.
- Directo: 0,0–2,0 elecciones; media 0,7.
- Explorador: 0,0–2,0 elecciones; media 0,3.

Los resultados completos y los casos extremos por etapa están en summary.json; cada partida conserva semillas, elecciones y eventos agregados. Esta auditoría no modifica TestFlight ni el guardado del usuario.

## Interpretación

- Las 100 campañas terminaron. Media de las 90 principales: 80,7 min; mediana 73,0 min. Son pilotos sintéticos con tiempos de elección supuestos, no una estimación exacta de la población humana.
- Ciudad: 11,1 min de media frente al objetivo orientativo de 10. Con las mismas 15 semillas/perfiles pasa de 10,3 a 11,7 min.
- Órbita es la principal señal a revisar: media 7,1 min y mediana 5,4; 6/90 partidas superan 14 min. El caso Preciso/2153 tarda 44,4 min a 30 Hz, recibe 263 golpes, y baja a 6,3 min al repetir a 60 Hz.
- Ese contraste demuestra sensibilidad del recorrido simulado; no prueba que un jugador humano o un móvil a 30 FPS sufran esa misma duración. Puede intervenir la navegación del piloto, los encuentros y el paso del motor. Conviene revisar Órbita antes de reajustar globalmente las recompensas.
- No se ha cambiado el juego ni subido una nueva build.
