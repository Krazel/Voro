# Paridad de marcos y candidata0.9(1)

Petición28/09/2026: comprobar por qué los avisos y botones de pausa difieren, igualar móvil al ordenador y subir después a TestFlight.

Hallazgo comprobado: comparten membrane-frame.png, pero el aviso final reducía su opacidad estática de0,58 a0,3 y medía44px de alto con dos bandas de28px, comprimiendo las esquinas. Eliminada esa excepción; mínimo64px y radio38px como los botones aprobados del ordenador. Se conserva el arte, la pausa Respira, el texto HTML y la respiración7s. No assets nuevos.

Evidencia local antes/después en Chrome y WebKit, entrada PC e iPhone, además iPad horizontal; `after-build` prueba los outputs compilados. Mismo asset, opacidad0,58, bandas28px y respiración en los tres controles. Ajuste de alto solo permite leer mensajes de varias líneas sin comprimir el marco. Capturas locales no equivalen a comprobación física del iPhone.

La candidata0.9(1) agrupa el nuevo señuelo raro y sus pruebas locales, adaptaciones rebalanceadas con XP fijo−20%, final sin espera y esta corrección. No cambia la ficha de App Store1.0 ni publica en tienda. Distribución previa comprobada por API:0.8.1(1),VALID/IN_BETA_TESTING, grupo internoVORO Interno.

La suite completa pasó268 tests. Tipos y builds correctos.

## Hallazgo nativo y corrección de pintura

Run36475064908 pasó la interacción nativa en iPhone17ProMax e iPadPro13M5, pero las capturas mostraron que WKWebView no pintaba la textura del pseudo-elemento border-image: quedaba únicamente el borde CSS liso. Las primeras capturas se adelantaron al primer pintado y quedaron vacías; se usan las capturas posteriores, que muestran el defecto. Evidencia native-before/. La mera igualdad de estilos web no bastaba.

MembraneRim reutiliza la imagen aprobada mediante las mismas9 secciones (corte200px, borde28px), en un canvas explícito sobre el fondo del control. Se pinta al cargar/redimensionar; la animación7s solo transforma la capa. DPR limitado a2. Sin generar arte nuevo ni trabajo en el bucle de juego. Se evita el antiguo pseudo-elemento en los3controles. El segundo checkpoint nativo comprueba además que los3canvas contienen píxeles y espera antes de capturar.

Paridad de esta solución en after-canvas/ y after-canvas-build/. Pendientes: inspección de capturas nativas del segundo run36476681828, firma/subida y confirmación API de TestFlight. No se declara entregada hasta verificar esos resultados.
