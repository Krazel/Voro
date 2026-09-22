# Análisis del informe físico 0.6.1 (1)

Informe recibido el 22/09/2026; no se publica el archivo original. Prueba automática completada: 20/20 escenarios, 100s medidos, 5920 fotogramas, 59.2 FPS agregados. 16 intervalos >33.34ms (0.27%); esta cifra no cuenta todas las pequeñas irregularidades por encima de 16.67ms.

18 escenarios: 59.6–60 FPS. Microscopio ambos tamaños: 60 FPS, P95/P99 17ms, sin intervalos >33.34ms. Ciudad ambos tamaños: 60 FPS. Galaxias entrada: 54.4 FPS, P95 30ms, P99 51ms, pico56ms, 4 cuadros lentos. Galaxias grande: 51 FPS, P95 32ms, P99 48ms, pico52ms, 9 cuadros lentos. Galaxias concentra13/16 intervalos lentos; hay uno en Orilla entrada, Estrellas entrada y Universo entrada.

## Galaxias: candidato concreto a corregir

En `inhabitant-animation.mjs`, `animationCropRevision` excluye seis galaxias de los sprites exportados. `cosmic-scales.mjs` activa esa revisión para corregir recortes antiguos. Como consecuencia, se regeneran poses durante la partida. Al terminar Galaxias:4260 pasos acumulados,80 expulsiones de caché,153 misses; caché cerca del límite24MiB. Los9 intervalos lentos correlacionados de la fase grande ocurren después de generación de poses; los5 peores tienen60 pasos de preparación en el fotograma anterior. Media después de generar poses:30.73ms, frente19.62ms global en esa fase. La resolución adaptativa baja de1 a0.85.

Siguiente corrección: reexportar esas seis animaciones con los recortes aprobados completos, versionar los recortes en su manifiesto y volver a usar los sprites preparados. Verificar fidelidad de sus brazos/siluetas y desaparición de la generación de poses. La correlación es fuerte, pero este informe no mide GPU y no prueba causalidad por sí solo. Confirmar después en el dispositivo.

## Sonido de comer: fallo confirmado, causa exacta pendiente

108 solicitudes de reproducción,0 reproducidas,0 muestras decodificadas,66 intentos de carga y66 errores. Contexto de audio `running`, sonido activado,0 errores de resume/start. No es un simple volumen bajo ni demuestra falta de rendimiento.

`SfxPlayer.unlock` agrupa errores de fetch/HTTP/lectura/decodificación en `loadErrors`, por lo que el informe no identifica la subfase. Los WAV locales son PCM16 mono44100 válidos, incluidos en el verificador del paquete. Hay una hipótesis de código concreta: `WebViewAssetHandler.swift` de Capacitor8.5.1 entrega medios WAV como URLResponse (sin estado HTTP), mientras SfxPlayer exige response.ok. Comprobar el estado observado para medios locales iOS y aceptar únicamente la respuesta local válida, manteniendo el rechazo de errores HTTP y cuerpos inválidos. Separar diagnósticos de lectura/decodificación para verificar el resultado.

## Límites

Cinco segundos por tamaño, sin mejoras, adaptación, transiciones ni final. No valida sesiones largas ni los tirones ocasionales fuera de esta muestra. El informe identifica iOS18.7; no es la misma combinación iPhoneX/iOS16.7.16 mencionada anteriormente, y no revela el modelo físico. No se atribuyen estos FPS al iPhoneX ni al iPad. No se han cambiado código de juego, assets ni TestFlight durante este análisis.
