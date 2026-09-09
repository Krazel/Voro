# VORO 0.4.15 (1) — Peatones y superviviente

El usuario aprobó la ciudad de 0.4.14 y pidió muchas más personas. También pidió que todo el universo entre en el protagonista y, después del silencio y el vacío, permanezca él iluminándose tenuemente.

## Ciudad
Diez plazas de civiles por región de 600×600, además de las 14 plazas previas de edificios, objetos, tráfico y defensa. Máximo 24 encuentros por región (salvo el pequeño anillo inicial de ayuda). Se mantienen sus tamaños, las animaciones existentes y los corredores de las aceras. La generación sigue siendo determinista y reserva el espacio de los objetos consumidos. Medición de 1.200 regiones: 23,76 encuentros por zona, 10,08 civiles de media; civiles 42,44 % y humanos totales 44,57 %. No son una multitud de soldados añadidos.

## Final
La captura del universo se contrae y gira suavemente hasta un punto dentro del organismo, en vez de desaparecer cuando aún era grande. La cámara deja visible la membrana durante el crecimiento para que se lea la absorción. Después desaparece la luz, hay un breve negro total, y VORO reaparece solo con su núcleo y membrana tenues. Fondo negro real, sin estrellas, partículas ni restos externos. El sonido queda suspendido. Tocar permite abrir el resumen y Volver al silencio regresa a la escena.

El protagonista respira con el renderer existente, limitado a 20 FPS después del final; no se ejecutan la simulación del mundo ni actualizaciones periódicas del HUD. Movimiento reducido conserva una imagen quieta. La rama de partida completada también muestra al superviviente al cargar partidas antiguas terminadas; no necesita la captura transitoria del universo. No se modificó el arte del protagonista.

## Evidencia
- 138 pruebas correctas en local; TypeScript/lint, build web y paquete móvil correctos.
- Pruebas de cuota peatonal, aceras, solares persistentes, límites de población, contracción completa, superviviente sin fondo, límite de 20 FPS y movimiento reducido.
- PNG aquí generados directamente con el motor de VORO y Skia: inicio, 4 s, 8 s, 12 s, secuencia y ciudad. No son capturas de un iPhone ni de la interfaz completa. Revisión de píxeles del final: 29.145 píxeles iluminados y cero píxeles iluminados fuera del área del protagonista (radio 150 alrededor del centro).
- El control de navegador no estaba disponible en esta sesión (sin navegadores habilitados; iab no disponible). Se verificó el renderer real y el paquete local, sin afirmar una prueba interactiva o física.
- El estado final de Apple y la comparación binaria de la IPA se guardan en artifact/testflight-0.4.15-build-1/ tras la entrega. Web Sites permanece en v36 por la confirmación específica de destino pendiente de la revisión automática anterior.
