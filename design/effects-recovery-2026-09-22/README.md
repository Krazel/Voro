# Recuperación de efectos — Windows prueba 2

El usuario describe que comer deja de sonar hasta desactivar y activar sonido, y que no oye daño. Música solicitada sin cambios.

## Causas y cambios

- La música sincronizaba su bus cada frame; el bus de efectos dependía de llamadas puntuales. Algunas salidas de configuración/pruebas cambian `settingsOpen`/`paused` sin restaurar el bus. Ahora ambos estados se sincronizan, pero solo se programa una rampa cuando cambia el destino: no se generan eventos AudioParam por frame.
- Los gestos, la recuperación del foco, los cambios de estado del AudioContext y una comprobación como máximo una vez por segundo recuperan efectos. Reanudaciones deduplicadas y limitadas; nunca se encolan mordiscos antiguos. Los recursos fallidos vuelven a intentarse respetando el límite previo de 5 segundos. Un contexto cerrado se reconstruye.
- Configuración sincroniza también el audio al cerrar. Silencio, pausa, adaptaciones y segundo plano siguen bloqueando los efectos.
- Comer: intervalo aleatorio de -7 a +8 semitonos (antes -5 a +6). Mantiene volumen y muestras completas; cambia la duración por resampling. Música sin variación de pitch.
- Daño: el seno de 85 a 28 Hz se sustituye por un impacto corto triangular de 320 a 105 Hz, audible en rango medio. Daño y escudo usan el nuevo efecto; respeta invulnerabilidad/silencio y tiene contador propio en el diagnóstico SFX.

## Validación

209 tests y TypeScript correctos. Regresiones específicas cubren bus silenciado al salir de configuración, pausa/adaptaciones/foco, mute, reanudación sin pulsar el conmutador y daño real a través de `receiveHit`.

`browser-audio.json`: medición con Web Audio real, sobre el motor de juego en Edge: señal al comer, al volver de menú, tras suspender el contexto y recibir daño; silencio sin señal ni nuevas voces. Mide señal digital, no escucha humana ni un iPhone físico.

`../windows-preview-2-2026-09-22/check.json`: ejecutable empaquetado real, 206 archivos, sin errores JS/HTTP ni peticiones externas; sonido, menús, guardado al reiniciar y GPU verificados. ZIP/huellas en `manifest.json` junto a la entrega.

No se ha modificado `app/music.mjs`, ni los MP3, ni subido otra build de TestFlight. La entrega es Windows 0.6.2, prueba 2; la prueba 1 se conserva para volver atrás.
