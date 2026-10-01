# Protocolo de duración — VORO 0.14(1)

Petición: repetir la medición con muchas más campañas, sin modificar el balance.

Muestra fijada antes de ejecutar: 30 semillas × 3 perfiles a 30 Hz = 90 campañas principales. Se incluyen las cinco semillas anteriores para comparar y 25 nuevas; las mismas semillas se cruzan con los tres perfiles. Nueve contrastes a 60 Hz (semillas 41, 1013 y 2203, tres perfiles), separados de la muestra principal. Concurrencia seis procesos, no agentes.

Motor real sin renderizado ni audio. Cada campaña empieza desde cero y hereda sus adaptaciones entre entornos. Sin invulnerabilidad ni recompensas artificiales. Mismos pilotos que el análisis anterior: preciso, directo y explorador. Los pilotos conocen todos los objetos cargados, no solo los visibles; no equivalen a una muestra humana. Se añaden 5–10 segundos supuestos por elección y 5 por reintento. No se incluyen cargas ni descansos. Una semilla es una unidad compartida por los tres perfiles, no tres jugadores humanos independientes.

Límite: tres horas simuladas o diez muertes. Las etapas incompletas se muestran explícitamente y no entran en medias de finalización. Todas las etapas completadas se conservan aunque la campaña se atasque después. Media, mediana, percentiles 10–90, mínimo/máximo, finalización, impactos y adaptaciones por entorno. Los percentiles son descriptivos, no intervalos de confianza.

Fuente de juego: TestFlight 0.14(1), commit de entrega 06c3822; HEAD f563362 contiene solamente los recibos posteriores. Esta auditoría añade herramientas y resultados, sin cambios en app/. Se registrará el commit exacto en cada ejecución.

Ejecutar: `node scripts/run-duration-batch.mjs design/duration-audit-0.14 extended`.

Comprobación de fuente: el árbol Git app/ coincide exactamente con la build TestFlight 06c3822. Fixture móvil vertical de 390 × 844, sin almacenamiento persistente del usuario. Se guardan las huellas del simulador y fixture en game-provenance.json. No mide específicamente la duración en PC, ni latencia de controles reales.

Diagnóstico adicional elegido tras observar los resultados principales: repetir Preciso/2153 a 60 Hz (44,36 min y 263 golpes en Órbita a 30 Hz). Se guarda en diagnostics/. No se añade a las 90 campañas principales ni se presenta como muestra aleatoria: es una comprobación deliberada del caso más largo. Total final: 100 campañas, 90 principales + 9 contrastes prefijados + 1 diagnóstico.
