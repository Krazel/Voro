# C · Membrana ligera — candidata iOS 0.6.6 (1)

Autorización transmitida por el taller 01a0cf42-5f64-7cd3-b277-7130b60a4fb5:
«Vale, perfecto, pues implémentalo y súbe la ultima version a testflight».
Referencia definitiva: `approved.png`, copia de
`.studio/design/voro/menu-nuevo-20260923/iphone/iphone-c-ligera-fondo-liso.png`.
SHA256: 4b5fe87f7f64487245b9f7f0987da99bf671eb1843a79d9c072e1ef258da1a52.

Se sustituye solamente la pantalla principal de Configuración. Pausa Respira,
Recorrido D3 final, recorrido parcial y créditos mantienen su diseño existente.
ES/EN: textos, selectores, switches y botones son DOM interactivo localizado.
Se conservan movimiento táctil/inclinación, sonido, modo zurdo, idioma,
Recorrido, Créditos, Instagram, privacidad y reinicio con confirmación.
Los controles de desarrollo siguen accesibles al pie, sin tapar botones.
No hay controles de zoom en este menú.

Los marcos tienen movimiento CSS suave de siete segundos con respeto de
movimiento reducido; no se crea un contexto WebGL para Configuración.
La roca del fondo es maciza, sin los agujeros rechazados por el usuario.
Paisaje: panel a la izquierda, enlaces y acciones a la derecha. Móvil pequeño
puede desplazarse verticalmente, con todos los objetivos táctiles de 44 px.
VisualViewport actualiza el alto al girar iPad; foco inicial en el encabezado.

Arte: edición mediante herramienta integrada ChatGPT Images de la referencia.
Masters originales conservados como settings-art-master.png/background-master.png;
WebP calidad88 en public/ui/membrane, sin textos ni controles pintados.
Prompt 1: eliminar todos los textos, iconos, selectores, switches, separadores
y botones inferiores; conservar exactamente los tres marcos orgánicos, su
composición, fondo submarino, medusa y rocas lisas. Sin rediseño ni agujeros nuevos.
Prompt 2: extraer únicamente el fondo, retirando toda la UI y los tres marcos;
mantener iluminación, medusa, composición y rocas macizas sin perforaciones.

QA web reproducible en scripts/check-membrane-settings.mjs: capturas y controles
ES/EN, 390×844, 375×667, 1194×834 iPad, 834×1194 iPad, 1280×800 PC. Cambio de idioma,
sonido/zurdo, navegación, cancelación de reinicio, regreso y enlaces comprobados.
Capturas web no equivalen a dispositivo. QA nativa y TestFlight completados:
consultar DELIVERY.md y native/. Pendiente prueba en dispositivo físico.

Incluye también c0f5583: Tierra ampliada, satélites variados, aviso orbital
temporal y final continuo de31s. La versión comercial se incrementa por cambios
de código/arte:0.6.6(1), en vez de reconstruir0.6.5. La API oficial consultada
en CI35900036559 confirmó que la entrega anterior es0.6.5(3) interna.
