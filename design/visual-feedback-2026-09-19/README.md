# Correcciones visuales y de escala — 19 septiembre 2026

Candidato local en Voro-camera, rama camera-framing-2026-09-19. Responsable: tarea 01a0b934-3ec1-79f1-8029-de6177fd0228. Base 5d912c3. No subida iOS, publicación web ni cambios de distribución.

## Resultado

- Adaptación: se eliminó el organismo SVG alternativo. El canvas del selector ejecuta el mismo drawCell y usa la misma vida, membrana, núcleo, digestión y mutaciones que el juego. El cuerpo del escenario se oculta mientras está conectado este canvas. Tres opciones independientes emergen desde el centro; membranas con cinco pequeñas prolongaciones y movimiento lento; movimiento reducido respetado.
- HUD: adaptación integrada bajo biomasa dentro de su misma cuadrícula.
- Definición: detalle del cuerpo normalizado por radio de entrada, manteniendo tamaño/zoom acordados. Lienzo móvil limitado a dos millones de píxeles, DPR hasta 2.5 y mínimo adaptativo .85. Fondos con caché ajustada al raster hasta 2×; poses demasiado pequeñas usan el atlas original y caché de mayor resolución. No imagen nueva del protagonista.
- Ciudad: eliminado desplazamiento global por hitFlash. Edificios requieren superar la dimensión larga visible, además del margen de absorción. Personas y vehículos mantienen sus reglas de escala. Presas comestibles no dañan por contacto aunque la digestión esté llena. Umbral de cada proyectil depende del tamaño efectivo del tirador y potencia; la colisión compara masa actual, incluyendo crecimiento durante el vuelo.
- Seis civiles nuevos con siluetas, ropa y accesorios distintos. Conviven con el civil original en los mismos slots; no aumentan población ni radio. Atlas public/inhabitants/city-civilians.png, 1536×1024 RGBA, generado con ImageGen desde el atlas existente y solicitud de seis civiles desarmados (abrigo rojo/bolso, obrero/casco, corredora, mayor/bastón, traje/maletín, repartidor/mochila). Segunda extracción con transparencia conservada sin edición raster posterior. Poses exportadas por el rig humano, 12 hojas WebP locales nuevas.
- Órbita: misma imagen de Tierra; recupera exactamente la composición original (radio 620 y parallax .08), independiente del zoom del juego. Objetos por delante y barrido/absorción íntegros. Se omite movimiento remoto fuera de vista acolchada y de alcance de interacción; no se elimina población. El problema señalado es desde la entrada, no durante el barrido final.
- Tras la reaparición final, movimiento independiente del mundo con teclado, táctil, mando e inclinación; animación al moverse, reposo 20 fps y movimiento reducido. Límites mantienen visible al superviviente. Pausa y configuración funcionan; partida sigue completada. El botón Recorrido ocupa solo una esquina para no interceptar el control del canvas. StoreKit y ReviewMilestone conservados.

## Evidencias y límites

- tests.txt: 169/169 pruebas completas. Tras el último ajuste de limpieza al cargar final completado: 11/11 pruebas de cámara/final/regresiones. TypeScript sin errores.
- Compilación Vite separada en artifact/voro-visual-feedback-2026-09-19 dentro del repositorio. mobile-dist/TestFlight intactos. Aviso existente de chunk JS >500 kB.
- adaptation.png, hud.png y adaptation-selection.webm: UI real, tres opciones seleccionables, canvas del protagonista y sin errores JS. Los elementos flotantes requieren clic por coordenadas en la automatización porque nunca están inmóviles.
- before/after-stage-{0,1,3,4,5}.png y JSON: mismo encuadre, aumenta buffer de 645×1398 a 961×2082 para CSS430×932/DPR3.
- survivor-movement.webm y survivor-before/after.png: seis segundos de reaparición seguidos de movimiento. survivor.json acredita desplazamiento, cero entidades, completado y masa230 intacta. Es una prueba desechable del motor real, no avance de partida del usuario.
- orbit-natural-entry.png y orbit-render-profile.json: Chromium, CSS390×844/DPR3, radio42.93, zoom.626, 314 entidades. 360 renders: CPU media1.455ms, P953ms en este escritorio. No mide FPS físico ni acredita corregidos los tirones del iPhone. Pendiente QA de dispositivo, incluyendo coste de mayor raster, entradas de entorno y StoreKit.

La entrega mantiene TestFlight interno0.5(1), webv38, itch.io Draft y App Store1.0 PREPARE_FOR_SUBMISSION. No beta externa, revisión ni publicación.
