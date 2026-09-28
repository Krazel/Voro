# Candidata WEB local — 28/09/2026

Base distribuida: TestFlight 0.8(1). Esta candidata no se ha subido a Apple, Sites ni itch.io.

Demo PC: http://127.0.0.1:5211/?ui=final&lab=cosmos
Demo con viewport móvil: http://127.0.0.1:5210/?ui=final&lab=cosmos

El panel «solo local» permite entrar en los cuatro entornos, crecer, elegir una adaptación, consumir la Tierra y oír comer/daño. «Volver a partida» recupera la partida anterior. No escribe el progreso de las escenas temporales en el guardado normal. Se requiere localhost y la query explícita; no aparece en la web pública ni en iOS. Los cuatro temas del menú siguen disponibles.

## Cambios

- Tierra: radio mundial 900 → 1200, gravedad exterior con el mismo margen libre de 580 unidades. Historial 1014554: radio visual inicial 620. Entrada real desde Ciudad: 627,07 de radio visual, protagonista 26,88; la escala del personaje aprobada se conserva. Pintura y gravedad comparten coordenadas. No se añaden plazas de encuentros.
- Absorción: el planeta mantiene posición y radio mundial, VORO crece hasta cubrir su borde más lejano y la cámara se abre cuando el cuerpo necesita espacio. La Tierra solo se oculta al quedar engullida al final. Sin recompensas duplicadas ni cambio de biomasa guardada por la escala cinematográfica. Objetos orbitales siguen la absorción existente. La captura reutiliza regiones cargadas y omite regiones totalmente fuera del alcance.
- Planetas/Estrellas: excluidas las pinturas de espirales de esos fondos. Corregido el borde inferior de las seis estrellas para impedir que entren brazos de galaxias de la siguiente fila del atlas. Ciclos exportados al construir, nunca regenerados durante el juego; retirados dos archivos generados obsoletos.
- Galaxias: agujero negro reconocible con el arte de disco de acreción existente, gravedad/tamaño normales y peso raro dentro de las plazas actuales de peligro. Giro rígido lento: ningún ciclo/textura adicional decodificada. El botón de revisión reemplaza un residente para verlo; la población normal lo coloca ocasionalmente.
- Asteroides: deriva mayor y más visible, limitada por velocidad, sobre las posiciones reales usadas para colisiones. No se simulan movimientos solo decorativos.
- Movimiento: compensa la cámara automática real y suavizada durante el crecimiento, manteniendo la velocidad percibida. El zoom manual no cambia las reglas de movimiento. La respuesta y el tamaño pequeño aprobados se conservan.
- Adaptaciones: música al 30 % del volumen normal, bajada de 450 ms y recuperación de 650 ms. Conserva stream/posición; no pausa/reinicia. Mute, pérdida de foco y pausa siguen teniendo prioridad. Los efectos permanecen silenciados mientras se elige.
- Efectos: comer +50 %; daño más fuerte y con cuerpo antes de decaer; escudo algo más claro. Música sin subir. Evidencia y muestras en `../effects-levels-2026-09-28/`.

## Evidencia y límites

246 tests correctos (`tests.txt`), TypeScript y builds móvil/PC correctos. Tras la optimización de captura, ocho pruebas específicas de Órbita volvieron a pasar.

`browser.json`: ocho escenas reales, pequeñas/grandes, movimiento con teclado, 59–60 FPS en Edge de este PC, CPU media 1,1–2,2 ms. Música activa/atenuada/restaurada sin retroceder el tiempo, vuelta a partida verificada y cero errores de página. Caché de terreno <=3, hojas <=64 MiB residentes. Galaxias mantiene 63,34 MiB posibles de hojas; Estrellas baja de 70,77 a 70,36 MiB posibles (residencia sigue limitada a 64).

`earth.json`: transición real Ciudad → Órbita y cinematográfica completa, con y sin capturas. Sin capturas: 60 FPS, CPU 2,8 ms, pico de intervalo 21 ms, cero frames lentos. Las capturas perturban la cadencia; no interpretar esos picos como medición de GPU. Escenas de revisión y especificación temporal están en los scripts `check-cosmic-candidate.mjs` y `check-cosmic-earth.mjs`.

Audio medido con OfflineAudioContext y samples/música reales: pico máximo 0,5903 de 1 en mezclas con máxima cadencia y extremos de tono; sin clipping observado. Pendiente escucha física en iPhone/iPad. Ninguna cifra de navegador acredita FPS ni volumen físico en TestFlight.
