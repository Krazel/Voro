# Colección de adaptaciones — D3 implementada

Referencia aprobada por el usuario el 29-09-2026: `../D3-organica.png`. Se abre desde **Pausa → Tus adaptaciones**. Pantalla funcional React, no una captura sobre botones invisibles.

- Solo se muestran las adaptaciones adquiridas. Repeticiones agrupadas con ×N. No hay casillas bloqueadas ni tipos por descubrir.
- Los 14 tipos actuales caben en la vista de referencia de 390 × 844, incluso con márgenes de seguridad simulados de 47/34 px. En alturas pequeñas la colección permite desplazamiento; el detalle y el retorno permanecen accesibles.
- Selección ámbar, detalle del efecto acumulado, indicador de máximo, totales de tipos y adquisiciones. Valores derivados de `upgradeStats` y los límites reales, sin cambiar equilibrio ni partida.
- Castellano/inglés según la preferencia vigente. Cinco columnas en escritorio/iPad horizontal, tres en vertical. Escape, flecha y botón inferior devuelven a la pausa; no reanudan la simulación.
- Arte derivado con ChatGPT Imágenes integrado en `public/ui/owned-adaptations/`: `organisms.png` conserva alfa real y `background.png` es el fondo oscuro orgánico. Prompts en `prompts.json`; huellas en `hashes.json`. Los rectángulos SVG recortan el atlas sin deformarlo ni mostrar fragmentos vecinos.
- Las dos imágenes se solicitan al abrir esta pantalla, no durante la partida. No hay bucles de animación, canvas adicional ni filtros por fotograma en la colección.

## Verificación

- `npm run build:mobile`: correcto, incluyendo verificación de presencia y huellas exactas de los nuevos assets.
- `npm run build:pc`: correcto.
- `npx tsc --noEmit`: correcto.
- `node --test tests/owned-adaptations.test.mjs`: 2 pruebas correctas de agrupación, límites, estado inmutable y efectos acumulados bilingües.
- `scripts/check-owned-adaptations.mjs` contra los **bundles compilados**: 48 escenarios correctos (Chromium/WebKit × seis formatos × partida vacía, pocas mejoras, 14 tipos/32 compras, 14 tipos/74 compras). Ver `report-build.json`.
- Navegación, selección, ausencia de recortes en nombres, tamaño y posición del diálogo, foco de retorno, Escape, simulación pausada y ausencia de peticiones del atlas durante la partida comprobados.
- `scripts/check-pause-frame-parity.mjs`: seis escenarios correctos, conserva el único borde pintado de los botones de pausa y los avisos. Se actualizó el recuento para incluir el nuevo acceso.
- Se detectó y corrigió una diferencia entre desarrollo y el CSS optimizado para Safari: la colección anula también las clases de traslación del diálogo, evitando que el bundle aparezca desplazado media pantalla.

Capturas finales: `*-build.png`. `review.html` compara referencia y capturas reales. Las capturas usan una partida aislada de prueba, no modifican la del usuario.

Esto acredita los bundles web móvil/PC y WebKit de escritorio, **no una ejecución física en iPhone/iPad**. TestFlight sigue en **0.9 (2)**; no se ha subido una nueva build ni empaquetado otro ejecutable Windows por este encargo.
