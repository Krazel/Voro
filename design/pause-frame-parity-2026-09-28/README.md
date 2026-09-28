# Paridad de marcos y candidata0.9(1)

Petición28/09/2026: comprobar por qué los avisos y botones de pausa difieren, igualar móvil al ordenador y subir después a TestFlight.

Hallazgo comprobado: comparten membrane-frame.png, pero el aviso final reducía su opacidad estática de0,58 a0,3 y medía44px de alto con dos bandas de28px, comprimiendo las esquinas. Eliminada esa excepción; mínimo64px y radio38px como los botones aprobados del ordenador. Se conserva el arte, la pausa Respira, el texto HTML y la respiración7s. No assets nuevos.

Evidencia local antes/después en Chrome y WebKit, entrada PC e iPhone, además iPad horizontal; `after-build` prueba los outputs compilados. Mismo asset, opacidad0,58, bandas28px y respiración en los tres controles. Ajuste de alto solo permite leer mensajes de varias líneas sin comprimir el marco. Capturas locales no equivalen a comprobación física del iPhone.

La candidata0.9(1) agrupa el nuevo señuelo raro y sus pruebas locales, adaptaciones rebalanceadas con XP fijo−20%, final sin espera y esta corrección. No cambia la ficha de App Store1.0 ni publica en tienda. Distribución previa comprobada por API:0.8.1(1),VALID/IN_BETA_TESTING, grupo internoVORO Interno.

Pendiente de esta entrega: resultado de suite completa, capturas de simuladores nativos, CI de firma/subida y confirmación API de TestFlight. No se declara entregada hasta verificar esos resultados.
