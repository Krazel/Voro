# VORO: escala cósmica, HUD, final y transiciones

Entrega local del 19-09-2026 sobre fd897aa, rama camera-framing-2026-09-19. Decisión del usuario: ampliar el disco de acreción existente de Estrellas. Se conserva el dibujo y no se añade una clase nueva de galaxias a ese entorno.

Los planetas, estrellas y galaxias tienen rangos individuales más amplios. El disco estelar pasa de radio base 141 a 280, con radios 252–406. La generación reserva primero su espacio; sin ese ajuste los discos grandes desaparecían por no caber entre las estrellas. El peso minoritario y la distancia segura inicial limitan su presencia. La prueba determinista encuentra 119 discos en 600 zonas y conserva la progresión completa. Tamaño visual, colisión y absorción siguen compartiendo el radio real.

Las seis galaxias del atlas cosmos extienden su recorte hasta los brazos superiores, por encima de la fila nominal. Sus hojas de animación antiguas incluían el recorte incompleto: estas seis especies usan la caché acotada de poses del mismo renderer con el recorte corregido. No se cambian imágenes aprobadas. [Comparación de tamaños](cosmic-variety.png).

La biomasa usa dos columnas que pueden encogerse y texto que puede saltar de línea, manteniendo el valor completo. [Vista de 320 px](hud-320.png), [escritorio](hud-1440.png). Pruebas de límites en 320, 390, 430, 844 y 1440 px. Para estas capturas se vacía únicamente la comida del escenario de prueba, evitando que una adaptación tape el HUD. El juego, layout y guardado son reales.

El final conserva los primeros 9,6 segundos de absorción, deja una pausa negra y revela al protagonista durante seis segundos. La secuencia dura 17 segundos. Un botón opaco era la causa del negro permanente al acabar: ahora es transparente y permite abrir las estadísticas sin ocultar el canvas. Se comprueban final, estadísticas/retorno, recarga de partida completada y movimiento reducido. [Protagonista al terminar](final-survivor.png), [vídeo de interfaz y final](ui-finale.webm).

Las transiciones conservan los 7,2 segundos y el encuadre uniforme; los fondos se funden con pesos complementarios, se reduce el desplazamiento de escala y los habitantes entrantes aparecen gradualmente después del cambio de entorno. [Vídeo del motor](cosmos-transitions.webm): Microscopio → Charca, Océano → Ciudad, Estrellas → Galaxias. Se mantienen absorción orbital, zoom manual, selector animado, escudo único y StoreKit.

Validación: 164 tests correctos (campaña completa incluida), TypeScript, lint dirigido y build móvil con verificación de assets correctos. Vite mantiene su aviso de chunk superior a 500 kB. Los dos scripts Playwright y sus resultados JSON quedan junto a las capturas. Cero errores de página. Son pruebas Chromium, no una validación nativa iOS/StoreKit ni una medición de rendimiento en dispositivo.

Candidata: `artifact/cosmic-finale-preview-2026-09-19`, servida en http://127.0.0.1:5193/. El checkout original Voro permanece intacto. Sin push, subida de build ni publicación. Pendientes de la tarea principal: revisión iOS/StoreKit, EN/ES e IPA; capturas/whatsNew de ASC cuando editable y descripción itch.io Draft antes de publicar.

Biblioteca PR-009: revisión 62 guardada sobre 61 y releída. Se conservan y comparan tracking, versión/build, distribución, versión pública, releases, source y detail. Código 10a63b6; recibo library-verification.json. Smoke de la candidata compilada: Despertar abre el canvas sin errores de página.
