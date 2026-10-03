# Revisión final VORO 1.0 (1)

Candidata local, sin publicar ni subir a TestFlight. Fuente de simulación: 89889c39582592669b4dfb4daec7c0f121267036. Los últimos cambios del botón de volver y del empaquetado no afectan al balance.

90 campañas principales (30 semillas y tres pilotos) y nueve contrastes separados a 60 Hz: 99/99 completadas. 117.3 horas simuladas. La sesión se interrumpió; el registro conserva las reanudaciones y las campañas terminadas no se repitieron.

| Entorno | Completadas | Media | Mediana | Mínimo–máximo |
|---|---:|---:|---:|---:|
| Microscopio | 90/90 | 8:28 | 8:17 | 6:16–12:41 |
| Charca | 90/90 | 8:37 | 8:24 | 6:33–11:33 |
| Orilla | 90/90 | 8:30 | 8:08 | 6:51–11:12 |
| Mar | 90/90 | 9:07 | 8:43 | 6:42–11:37 |
| Ciudad | 90/90 | 8:05 | 7:28 | 6:02–12:40 |
| Órbita | 90/90 | 7:33 | 5:56 | 3:12–43:44 |
| Planetas | 90/90 | 8:33 | 7:42 | 6:49–11:33 |
| Estrellas | 90/90 | 7:45 | 7:19 | 4:37–14:13 |
| Galaxias | 90/90 | 7:13 | 6:27 | 5:35–9:57 |
| Universo | 90/90 | 5:11 | 5:03 | 3:54–6:49 |

Campaña principal: media 79:00, mediana 73:40. Son pilotos sintéticos usando el motor real: conocen la comida disponible y no están calibrados con jugadores humanos. Incluye transiciones y tiempos de lectura supuestos de 5–10 s; excluye cargas y descansos. No mide FPS de dispositivo ni audio físico. Las partidas no terminadas, si las hubiera, no se cuentan como tiempos de finalización.

## Excepción en Órbita

5/90 campañas principales superaron 15 minutos en Órbita. El máximo fue 43:44. Una repetición separada de la semilla 1907 con el mismo piloto y retorno explícito a Tierra reprodujo la duración: la biomasa objetivo se alcanza tras 43:17, con 167 golpes y 80.7 de biomasa acumulada perdida; la siguiente etapa empieza 6.8 segundos después. Esa prueba descarta que el retraso de ese caso ocurra únicamente buscando la Tierra después de alcanzar la meta. No demuestra que un jugador humano siga la misma ruta ni aísla una causa única de todos los retrasos. La comida renovable y la recuperación tras encoger pasan sus regresiones; no se observó bloqueo permanente en estas campañas. Esta variabilidad se conserva visible, sin cambiar el balance aprobado durante la auditoría. Repetición adicional: earth-return/precise-1907-30.json; no se suma a las medias principales.

## Interfaz y guardados

12 escenarios comprobados en Chromium/Edge y WebKit: iPhone nuevo y con guardado, pantalla de 375×667, iPad vertical/horizontal y PC. Controles de jugador, pausa, adaptaciones vacías y con los 14 tipos, configuración, recorrido sin etapas futuras, créditos/licencias, idiomas del dispositivo y vuelta al juego. Sin errores JavaScript ni archivos fallidos. Capturas en ui/.

## Adaptaciones durante toda la campaña

Los pilotos direct y explorer (60 campañas) terminan con adaptaciones disponibles: rangos 1–4 y 2–4 elecciones restantes, respectivamente. El piloto precise prioriza desde el inicio Adaptación acelerada, que acelera la adquisición, y alcanza el límite en sus 30 campañas; en algunas lo agota en Galaxias. Es la excepción expresamente aceptada para quien invierte en adquirir adaptaciones más deprisa, no un motivo para frenar adaptativamente la experiencia. Se mantienen ritmo fijo, requisitos y límites aprobados.

## Cambios de versión final

Eliminados el selector de desarrollo, las galerías, el laboratorio cósmico, las pruebas de rendimiento/audio, los incrementos de biomasa/XP y los menús antiguos. Parámetros ui=development, lab=cosmos y rutas hash antiguas no abren herramientas. No se publica una referencia al motor en window; no se registra el puente de comandos ni el diario periódico de audio. Los métodos internos de QA del motor quedan en el repositorio para reproducir tests, sin acceso de jugador. Flecha convencional y botón rectangular redondeado para volver a la pausa. Inspector Electron desactivado.

## Validación y límites

346/346 pruebas globales correctas; 31 comprobaciones dirigidas adicionales y 15 comprobaciones del runtime y audio nativo (con solapamiento). TypeScript sin errores y compilaciones móvil/PC verificadas. Compatibilidad de guardados, progreso de adaptaciones, daño, recuperación de comida en Órbita, transición tras absorber Tierra, final/segundo plano y audio/mute/reanudación cubiertos por regresiones. Assets móviles comparados con las fuentes aprobadas.

La ausencia de petardeo y el rendimiento en iPhone/iPad necesitan confirmar el binario nuevo en dispositivo físico. La versión instalada 0.14 y su APK anterior no son esta candidata 1.0. La compilación Windows no constituye QA nativa de iOS. No se han cambiado metadatos, precios ni distribución de tiendas.

Windows: paquete local 1.0-preview.2; sus 363 archivos coinciden exactamente con pc-dist y el inspector de jugador está desactivado (windows-integrity.json). No se completó el smoke del ejecutable mediante inspector externo: Runtime.evaluate agotó el tiempo; la comprobación web no sustituye esa ejecución nativa. Android: no hay APK 1.0 nuevo, la compilación Java quedó bloqueada por AccessDeniedException al leer JARs de Gradle, también con caché y salida dentro del workspace. El APK anterior sigue siendo 0.14. iOS: fuente candidata 1.0 (1), sin nueva IPA ni subida TestFlight en esta revisión. Estados separados en package-review.json.

Biblioteca PR-009: actualización pendiente en library-pending.json. El acceso de escritura a la API está bloqueado por la restricción de red del entorno; no se presenta como sincronizada. Antes de conciliar se debe releer su revisión vigente y conservar los demás campos.
