# Colección de adaptaciones — D3 implementada

Referencia aprobada por el usuario el 29-09-2026: `../D3-organica.png`. Se abre desde **Pausa → Tus adaptaciones**. Pantalla funcional React, no una captura sobre botones invisibles.

- Solo se muestran las adaptaciones adquiridas. Repeticiones agrupadas con ×N. No hay casillas bloqueadas ni tipos por descubrir.
- Los 14 tipos actuales caben en la vista de referencia de 390 × 844, incluso con márgenes de seguridad simulados de 47/34 px. En alturas pequeñas la colección permite desplazamiento; el detalle y el retorno permanecen accesibles.
- Selección ámbar, detalle del efecto acumulado, indicador de máximo, totales de tipos y adquisiciones. Valores derivados de `upgradeStats` y los límites reales, sin cambiar equilibrio ni partida.
- Castellano/inglés según la preferencia vigente. Cinco columnas en escritorio/iPad horizontal, tres en vertical. Escape, flecha y botón inferior devuelven a la pausa; no reanudan la simulación.
- Corrección expresa del usuario: las ilustraciones son exactamente las originales de `public/upgrades/biological-adaptations.png`, con el mismo `artIndex` que en la elección de adaptaciones. La nueva colección no inventa otro vocabulario de iconos. El atlas nuevo rechazado se conserva solo como evidencia en `rejected-organisms.png`, fuera de `public/`.
- Fondo vertical completo `background-portrait.png`, fondo horizontal `background.png` y cinco siluetas neutras más una seleccionada pintadas en `capsules.png`. Fondos y marcos derivados de D3 con ChatGPT Imágenes; prompts en `prompts.json`. El marco usa su contorno SVG exacto como recorte para que el fondo de la hoja no aparezca alrededor. Las ilustraciones originales usan un desvanecimiento radial equivalente al de las opciones del juego.
- Los fondos y marcos de la colección se solicitan al abrir esta pantalla, no durante la partida. El atlas original se comparte con las elecciones. No hay bucles de animación, canvas adicional ni filtros por fotograma en la colección.

## Verificación

- `npm run build:mobile`: correcto, incluyendo verificación de presencia y huellas exactas de los nuevos assets.
- `npm run build:pc`: correcto.
- `npx tsc --noEmit`: correcto.
- `node --test tests/owned-adaptations.test.mjs`: 2 pruebas correctas de agrupación, límites, estado inmutable y efectos acumulados bilingües.
- `scripts/check-owned-adaptations.mjs` contra los **bundles compilados**: 48 escenarios correctos (Chromium/WebKit × seis formatos × partida vacía, pocas mejoras, 14 tipos/32 compras, 14 tipos/74 compras). Ver `report-build.json`.
- Navegación, selección, ausencia de recortes en nombres, tamaño y posición del diálogo, foco de retorno, Escape, simulación pausada y ausencia de peticiones del atlas durante la partida comprobados.
- `scripts/check-pause-frame-parity.mjs`: seis escenarios correctos, conserva el único borde pintado de los botones de pausa y los avisos. Se actualizó el recuento para incluir el nuevo acceso.
- Se detectó y corrigió una diferencia entre desarrollo y el CSS optimizado para Safari: la colección anula también las clases de traslación del diálogo, evitando que el bundle aparezca desplazado media pantalla.

Se verificó también la correspondencia de los 14 iconos con el atlas original y la variedad de siluetas.

Capturas finales actualizadas tras las correcciones de ilustraciones, fondo y marcos: `*-build.png`. `review.html` compara referencia y capturas reales. Las capturas usan una partida aislada de prueba, no modifican la del usuario.

Esto acredita los bundles web móvil/PC y WebKit de escritorio, **no una ejecución física en iPhone/iPad**. TestFlight sigue en **0.9 (2)**; no se ha subido una nueva build ni empaquetado otro ejecutable Windows por este encargo.

## Centrado óptico — 29-09-2026

Revisadas las 14 ilustraciones dentro de sus celdas originales. Se midió el centro del contenido visible, ponderado por luminancia sobre el fondo y el desvanecimiento radial existente. `ART_OFFSETS` corrige cada celda mediante traslación SVG del dibujo junto a su máscara. Los desplazamientos máximos de la fuente son 39,1 px horizontal y 37,9 px vertical (aproximadamente 8 px en el icono móvil). No cambia el tamaño, el atlas, los marcos, los contadores ni el balance. Comprobadas visualmente las capturas actualizadas de móvil/PC y los 48 escenarios existentes sobre las dos compilaciones.

## Entrega iOS

Tras la aprobación final, la colección se distribuyó en **TestFlight 0.10 (1)** interno. Apple confirmó VALID / IN_BETA_TESTING; IPA y assets verificados. Evidencia: `../../testflight-0.10-build-1/README.md`. La referencia anterior a 0.9 (2) describe el estado previo a esta entrega.
