# Candidata local de regresiones — 2026-09-21

Base: 0b8042b38092dca67f84af4bba24fcc2241cb211. TestFlight 0.5(3) permanece sin cambios; no se ha subido otra build. Demo local: http://127.0.0.1:5196/.

## Cambios y evidencias

1. Audio: desbloqueo idempotente, reanudación del contexto solo cuando procede y limpieza de nodos terminados. En 30 gestos, música y música+SFX pasan de 90 llamadas adicionales a play y 60 a resume a ninguna adicional. Se conservan pistas, muestras y mezcla aprobadas. `audio-ab.mjs`, `audio-before.json`, `audio-after.json`. Los intervalos rAF del navegador no miden FPS de GPU ni rendimiento de iPhone. La ralentización fuerte comunicada en iOS no se reproduce en escritorio y requiere comprobación física.
2. Microscopio: los gigantes y cazadores grandes sin sprite sheet de resolución suficiente dibujan la fase actual del rig aprobado, evitando reutilizar poses desfasadas. En siete segundos: 198 expulsiones de caché antes y cero después; p95 de dibujo 3,5 → 3,9 ms. Hay un pequeño coste extra de dibujo directo, pendiente de validar en iPhone. `micro-before.webm`, `micro-after.webm`, `micro.json` y `micro-video.mjs`. El antes desactiva únicamente esta rama en el módulo servido.
3. Pausa: composición basada en la referencia aprobada `../menu-imagegen-2026-09-20/pause-menu.png`, protagonista real, botones orgánicos y textos ES/EN. Capturas `pause-es-ES.png` y `pause-en-US.png`; es una implementación de la referencia, no una reproducción píxel a píxel. Volver al menú y continuar conserva la partida.
4. Adaptaciones: el usuario confirmó que recibe mejoras demasiado a menudo. Umbrales de XP +25%, aproximadamente un 20% menos de mejoras por la misma XP. Migración v5 conserva fracción de progreso, mejoras y oferta pendiente. No se modifica la animación de tentáculos.
5. Charca: una plaza adicional de alimento pequeño, de 12 a 13 plazas máximas, sin aumentar peligros. Cien zonas deterministas pasan de 11,9 a 12,9 entidades medias. Otros entornos conservan sus plazas.
6. Cámara: retirada gradual algo mayor al crecer, manteniendo encuadre inicial, suavizado y zoom manual. Radios 42/60/96 pasan de 1,12/1,035/0,934 a 1,065/0,977/0,873. `balance.json`.
7. Interacción: desactivada selección/callout en diálogos del juego, preservando selección en inputs, textarea y créditos. Se conserva el foco y los controles. Comprobación de estilos y navegación en `ui-check.mjs` y `ui.json`.

## Validación

- Suite completa: 187 pruebas correctas, cero fallos (`tests.txt`).
- TypeScript correcto y compilación móvil Vite correcta en directorio de artefacto local.
- Navegación de pausa en ES/EN, retorno y continuación conservan masa, etapa y mutaciones; sin errores de página.
- Pendiente: revisión física de rendimiento/sonido y animación en iOS, y aceptación visual del usuario. No se considera resuelta la ralentización fuerte de iPhone a partir de estas pruebas web.
- La demo horizontal de PC tiene propietario y checkout independientes; no forma parte de esta candidata móvil.

Los vídeos crudos duplicados y el registro de pruebas parciales anterior no forman parte de esta entrega. La suite completa citada corresponde al estado final.
