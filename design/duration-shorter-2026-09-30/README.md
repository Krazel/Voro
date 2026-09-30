# Campaña más corta: objetivo de 78 minutos

Objetivos aprobados: Microscopio 8, Charca 8, Orilla 8, Mar 9, Ciudad 10, Órbita 7, Planetas 8, Estrellas 8, Galaxias 7 y Universo 5 minutos. Son medias orientativas, no temporizadores ni plazos obligatorios.

Solo cambian las recompensas de biomasa de los primeros cinco entornos: .223, .224, .245, .163 y .140 respectivamente. Se conservan las últimas cinco, el tamaño inicial, los umbrales de evolución, controles y movimiento. El ritmo de adaptaciones restaurado permanece independiente (0.85 y sus factores históricos por entorno). No se cambia daño, límite de adaptaciones, audio ni reproductor nativo.

## Simulaciones

- `pilot/`: tres campañas preliminares, semilla 41, fuente 8abb886. No se mezclan con la muestra final.
- `final/`: quince campañas principales (tres pilotos × cinco semillas) a 30 Hz y tres contrastes a 60 Hz. El informe compara con la tanda anterior de 15 campañas en `design/duration-rebalance-2026-09-29/final/comparison.json`.
- Los pilotos usan el motor real y sus recompensas, daños, mundos y adaptaciones. El renderizado y audio están desactivados: no mide FPS del dispositivo.
- Los tiempos incluyen las transiciones y un supuesto de 5–10 segundos para leer cada elección. No equivalen a una media medida con jugadores humanos.
- La comparación histórica también incluye la restauración de adaptaciones y prioridad de absorción implementadas entre las dos tandas; no permite atribuir toda la diferencia exclusivamente a los cinco coeficientes de biomasa.
- Cada resultado final guarda commit, configuración, recompensas y semilla. Los límites de seguridad de simulación son tres horas o diez muertes; las partidas incompletas nunca se cuentan como tiempos de finalización.

## Verificación

Resultado final: 18/18 campañas completas (15 principales y tres contrastes). Media principal 78,666 minutos, mediana 74,353, rango 64,251–99,156. Medias por entorno: 8,0 / 8,5 / 8,5 / 9,1 / 10,3 / 6,5 / 8,2 / 7,4 / 7,1 / 5,1. Los contrastes a 60 Hz completan en 70,7, 74,7 y 100,6 minutos; no se mezclan con la media principal.

Se conserva el ritmo rápido de adaptaciones pedido: al terminar quedan 0 opciones en el perfil preciso, 0–2 en el directo y 0–1 en el explorador. No se introduce un freno automático ni se cambian límites para compensarlo. Órbita sigue siendo la fase más variable (2,5–18,8 minutos), aunque las quince campañas la superan.

La suite de 322 pruebas tuvo un fallo inicial: el test de madurez microscópica utilizaba el objetivo medio como plazo máximo por semilla. Se separa ese límite (20 minutos simulados para detectar bloqueos) y se fija la aleatoriedad para reproducirlo. Reejecutado el archivo completo: cinco pruebas correctas; madurez a los 504, 390 y 360 segundos para las tres semillas. Las otras 321 pruebas ya habían pasado. También pasan las 14 pruebas dirigidas de adaptación, daño, absorción, persistencia y estadísticas, TypeScript y compilaciones móvil/PC con verificación de assets móviles.

Las evidencias de simulación se guardan en Git. Este encargo no sube una nueva build a TestFlight.
