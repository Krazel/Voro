# Fondo azul + menú verde — candidata 0.8 (1)

Referencia aprobada el 25/09/2026: `approved/06-fondo-azul-menu-verde.png`, SHA-256 `c8dd6ef2014948d4128fe5cac4e308a3fe19b235e39b5dbd59e0eaa292b7610e`. La imagen se copió íntegra del taller de diseño como evidencia; no se utiliza como pantalla estática.

La opción «Azul + verde» / «Blue + green» es la cuarta apariencia. Usa **solo la capa de fondo azul** que ya existía para Azul orgánico, y conserva el marco, botones, interruptores, texto y controles verdes de Actual. Las otras tres apariencias, el tema Actual predeterminado y la clave de preferencia `voro-menu-theme-v1` permanecen. La elección se aplica al momento y persiste entre aperturas, sin modificar la partida.

`scripts/check-menu-inverse.mjs` produjo 16 capturas de navegador: cuatro temas en iPhone ES/EN y iPad ES vertical/EN horizontal. `qa.json` verifica selección y restauración tras recarga para las 16 combinaciones, conservación de movimiento/zurdo/sonido/idioma y navegación a Recorrido y Créditos. Compara además la URL/filtro del fondo con Azul orgánico y el filtro del marco con Actual. Se inspeccionaron las capturas nuevas junto a la referencia; el nombre inicial, demasiado largo en iPhone, se acortó antes de cerrar la candidata. Estas vistas emulan tamaño y agente de usuario; no son capturas de una build física.

App Store Connect confirmó por API que 0.7 (1) estaba `VALID` e `IN_BETA_TESTING` en `VORO Interno` antes de numerar esta nueva función. La nueva candidata es 0.8 (1), sujeta a preflight de API, firma y comprobación final de TestFlight. No se envía a revisión pública.
