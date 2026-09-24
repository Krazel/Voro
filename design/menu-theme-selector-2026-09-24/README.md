# Tres apariencias del menú — candidata 0.7 (1)

Encargo aprobado 24/09/2026: mantener **Actual** como predeterminado y añadir **Azul orgánico** (tercera propuesta azul, `approved/03-azul-organico.png`) y **Azul con fondo actual** (`approved/05-fondo-actual-menu-azul.png`). Las imágenes son referencias, no interfaces estáticas: botones, idioma, sonido, movimiento y navegación siguen siendo controles reales.

El selector «Apariencia» de Configuración cambia inmediatamente y guarda una preferencia independiente en `voro-menu-theme-v1`. Ante una instalación previa o valor desconocido elige Actual; la elección se recupera al reabrir. Los colores azules están acotados al menú. La variante mixta usa exactamente `public/ui/membrane/background.webp` en vertical y `background-landscape.webp` en horizontal sin filtro de fondo. La variante Azul orgánico enfría solo la capa del fondo, además de los marcos y controles. Actual conserva el arte y la paleta previos salvo el espacio del nuevo control. El contenido del juego y la progresión no cambian.

Referencias copiadas del taller:

- `approved/03-azul-organico.png`: SHA-256 `d707793d8ebaf7aec6f081baea395b3a74761cbeb2ea074fdfbe7e85cb0a9e15`.
- `approved/05-fondo-actual-menu-azul.png`: SHA-256 `423986fe6b1d8f7150afb9ee286e1920994fefd839022f80166b008d5e10211`.
- Fondo vertical original: SHA-256 `1fde792a6c59222a88471beb5fa39240d2ec9c270bfe16dd66184660280ca9d9`.
- Fondo horizontal original: SHA-256 `ab8e140d8f5f2af1233366d946d91e2aa100f530d10a86789c39cdc974d49434`.

`scripts/check-menu-themes.mjs` generó 12 capturas web: tres temas × ES/EN × iPhone/iPad (iPad EN horizontal). `qa.json` registra elección inmediata, restauración tras recargar en cuatro dispositivos/idiomas, controles de movimiento/zurdo/sonido/idioma sin cambios, y navegación por Recorrido y Créditos. La imagen de fondo computed-style de Actual y Mixto coincide en las cuatro vistas; además, los primeros 50×60 píxeles de las capturas son idénticos. Las capturas `iphone-*.png` y `ipad-*.png` son vistas de navegador con tamaño/dispositivo simulado, no fotos de una build física.

La 0.7 es una nueva función visual respecto a TestFlight 0.6.8 (1), por eso estrena versión y build 1. Subida a TestFlight interno autorizada para después de implementación y pruebas. Registrar por separado el commit exacto, la CI, el identificador y estado real de la build Apple cuando se complete; no enviar a revisión de App Store.
