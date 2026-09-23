# Final: absorción visible y aparición retrasada

23-09-2026, petición directa del usuario tras probar la candidata local.
Mantener la aparición del superviviente que le gusta, pero retrasarla, y hacer
visible que el protagonista engulle el universo antes de apagarse la última estrella.

## Secuencia de31 segundos

- 0–10.8s: la escena capturada sin protagonista converge bajo la membrana viva.
  Máscara elíptica con borde suave evita que se perciba un rectángulo reduciéndose.
  Hasta48 luces siguen trayectorias deterministas hacia el centro (16 con movimiento reducido).
- 8–13s: una última estrella entra hacia el centro, pierde luz y se apaga;
  el cuerpo también desaparece. La música funde de10 a13s.
- 13–18s: cinco segundos de negro total, silencio, sin partículas ni cuerpo.
- 18–30.5s: misma función drawVoidSurvivor y misma duración de12.5s de aparición
  aprobada, desde el núcleo hacia fuera. Solo cambia su momento de inicio.
- Después: superviviente, movimiento ilimitado y acceso manual a Recorrido.

Una única captura al comenzar; no nuevas imágenes, texturas o canvas por frame.
Las trayectorias están acotadas; no se acumulan entidades ni recursos.
No cambia la animación de membrana o la función de aparición del protagonista.
Las fuentes son compartidas por PC/iOS. No se ha subido una build nueva.

## Verificación

TypeScript correcto y17 tests de final, música e idioma. Cubren convergencia,
última estrella, cinco segundos negros, activación/guardado del final, silencio,
movimiento ilimitado y cadencia del superviviente; tests previos de crossfade
continúan pasando. Texto adicional traducido a inglés.

`check.mjs`: Chromium móvil390×844 y PC1280×800, escenas reales. Diez capturas
por formato, sin errores JS; píxeles RGB=0 a13s y17.9s, cuerpo visible a26s.
`finale.webm`: captura del canvas a30fps de32s. Es evidencia de comportamiento,
no una medición de FPS ni validación de sonido/rendimiento de iPhone físico.
La prueba usa un perfil aislado, sin modificar el guardado del usuario.

Recorrido A Espiral sigue en fuente como candidata visual rechazada; su nueva
dirección se está explorando en la tarea visual correspondiente. No se distribuye
como aprobada. Pausa Respira y enlace de privacidad se conservan.
