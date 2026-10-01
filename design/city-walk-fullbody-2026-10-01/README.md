# Tres marchas con poses completas — 1 de octubre de 2026

El usuario pidió aplicar el mismo método que el civil y la corredora aprobados.
Peatona con bolso, trabajador y oficinista vuelven a cuatro poses completas
pintadas con ChatGPT Images integrado. Cada pose contiene todo el cuerpo; ya
no se monta torso, brazos y piernas por separado. Se usa el civil como referencia
visual de movimiento y se conserva la cadencia de 0,95 segundos.

Fuentes finales y prompts exactos: los tres PNG de esta carpeta y `prompts.json`.
El trabajador necesitó un nuevo pase cambiando la ropa del civil aprobado para
que el brazo de la tercera pose cambiara realmente de posición. Dos intentos
previos demasiado estáticos se descartaron.

`scripts/export-city-fullbody-walks.mjs` empaqueta las poses v7 en 1024x512 PNG,
conserva los píxeles frontal/trasero de v3 y actualiza el manifiesto. Ejecutarlo
tras los exportadores históricos si se reconstruyen todos los assets. La antigua
versión por piezas queda conservada en Git y como comparación `before-art.json`.

Los siete humanos aprobados conservan archivos y metadatos exactamente. Tamaños,
velocidades, recompensas y ataques no cambian. Una imagen por persona y tres
atlases menores que la revisión anterior (no constituye una medición de FPS).

Verificado: nueve pruebas de ciudad, diez ciclos renderizados sin fotogramas
duplicados, frente/espalda idénticos, builds móvil y PC correctos. Comparación
revisada y abierta en el navegador integrado. Captura `browser.jpg`.
Son cuatro poses discretas como el civil; valoración estética pendiente del
usuario. No se ha enviado una nueva build a TestFlight.
