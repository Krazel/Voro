# Reequilibrado aprobado del tiempo por entorno

Solicitud: acercar la duración de los entornos sin acelerar el movimiento ni prolongar la cinemática final. Objetivos medios: Microscopio 12, Charca 10, Orilla 10, Mar 10, Ciudad 12, Órbita 7, Planetas 8, Estrellas 8, Galaxias 7, Universo 5 minutos (89 en total).

Se ajustan las recompensas fijas de biomasa por alimento en `app/campaign-pacing.mjs`. Los umbrales de evolución y de comestibilidad, tamaños, movimiento, cinemáticas y biomasa guardada se conservan. La experiencia mantiene su fórmula fija existente por bioma; no hay adaptación dinámica del ritmo según la velocidad del jugador.

La calibración preliminar está en `pilot/`, fuente 746de97: tres campañas emparejadas con la semilla 41. Órbita resultó demasiado larga (media 15,5 minutos, un caso 25,7); se corrigió antes de ampliar la muestra. También se refinaron Microscopio, Orilla, Ciudad, Estrellas y Universo. Esta tanda preliminar no se mezcla con la validación final.

La validación está en `final/`: mismos tres perfiles y cinco semillas que el informe anterior, más un contraste a 60 Hz para cada perfil. `final/comparison.json` conserva resultados y parámetros exactos; `final/README.md` e `index.html` muestran la comparación.

Los resultados no constituyen una media humana medida. Los pilotos conocen los alimentos cargados y sus requisitos; se suponen 5–10 segundos de lectura por adaptación. No se incluyen pausas personales, tiempos de carga ni rendimiento gráfico. Los tiempos objetivo no son límites ni temporizadores dentro del juego.
