# Paridad de marcos y candidata0.9(1)

Petición28/09/2026: comprobar por qué los avisos y botones de pausa difieren, igualar móvil al ordenador y subir después a TestFlight.

Hallazgo comprobado: comparten membrane-frame.png, pero el aviso final reducía su opacidad estática de0,58 a0,3 y medía44px de alto con dos bandas de28px, comprimiendo las esquinas. Eliminada esa excepción; mínimo64px y radio38px como los botones aprobados del ordenador. Se conserva el arte, la pausa Respira, el texto HTML y la respiración7s. No assets nuevos.

Evidencia local antes/después en Chrome y WebKit, entrada PC e iPhone, además iPad horizontal; `after-build` prueba los outputs compilados. Mismo asset, opacidad0,58, bandas28px y respiración en los tres controles. Ajuste de alto solo permite leer mensajes de varias líneas sin comprimir el marco. Capturas locales no equivalen a comprobación física del iPhone.

La candidata0.9(1) agrupa el nuevo señuelo raro y sus pruebas locales, adaptaciones rebalanceadas con XP fijo−20%, final sin espera y esta corrección. No cambia la ficha de App Store1.0 ni publica en tienda. Distribución previa comprobada por API:0.8.1(1),VALID/IN_BETA_TESTING, grupo internoVORO Interno.

La suite completa pasó268 tests. Tipos y builds correctos.

## Hallazgo nativo y corrección de pintura

Run36475064908 pasó la interacción nativa en iPhone17ProMax e iPadPro13M5, pero las capturas mostraron que WKWebView no pintaba la textura del pseudo-elemento border-image: quedaba únicamente el borde CSS liso. Las primeras capturas se adelantaron al primer pintado y quedaron vacías; se usan las capturas posteriores, que muestran el defecto. Evidencia native-before/. La mera igualdad de estilos web no bastaba.

MembraneRim reutiliza la imagen aprobada mediante las mismas9 secciones (corte200px, borde28px), en un canvas explícito sobre el fondo del control. Se pinta al cargar/redimensionar; la animación7s solo transforma la capa. DPR limitado a2. Sin generar arte nuevo ni trabajo en el bucle de juego. Se evita el antiguo pseudo-elemento en los3controles. El segundo checkpoint nativo comprueba además que los3canvas contienen píxeles y espera antes de capturar.

Paridad de esta solución en after-canvas/ y after-canvas-build/. El segundo checkpoint nativo [36476681828](https://github.com/Krazel/Voro/actions/runs/36476681828) ha terminado correctamente en iPhone 17 Pro Max e iPad Pro 13 (M5). Revisadas las capturas de ambos: los tres marcos muestran la textura aprobada. Evidencia en `native-after/`, con iPad en vertical y horizontal. Son simuladores con la app Capacitor y WKWebView, no mediciones de rendimiento en dispositivos físicos.

Las capturas nativas corresponden a d457540. La corrección posterior 683983d solo aumenta la especificidad CSS para conservar los límites del marco (−4 px) frente a la regla general del canvas del juego. Comprobado en los builds de Chrome y WebKit de `after-canvas-build/`.

La build firmada parte de 238c2ab. [36478097404](https://github.com/Krazel/Voro/actions/runs/36478097404) terminó correctamente. Apple confirma **0.9 (1), VALID / IN_BETA_TESTING**, build `158414ba-f36b-4ee3-982c-69c6d0e5161b`, asignada y releída en **VORO Interno**. Manifiesto y respuesta API en `testflight/`. App Store sigue sin publicar; no se ha modificado su versión 1.0 ni solicitado revisión.

Biblioteca PR-009 actualizada y releída, revisión 253: 0.9 (1) como TestFlight interno entregado. Windows sigue en 0.8.1. Pendiente probar rendimiento y sensaciones en los dispositivos físicos del usuario.

Verificación del IPA descargado: 345184403 bytes, SHA-256 `e08accb91715d1abc5ffda97d62dfa0780736c2187488b4d8f7ad38b97bf01a1`, coincide con CI; CRC ZIP completo correcto, Info.plist 0.9 (1), familias iPhone/iPad, imagen aprobada idéntica y código de los marcos presentes. Fixture de pruebas ausente. La primera descarga local sufrió corrupción en una hoja de animación; se repitió y se sustituyó por la copia que pasó checksum y CRC. No fue necesario reconstruir ni volver a subir a Apple. Resultado en `testflight/local-verification.json`.

## Corrección del doble contorno · 0.9 (2)

El usuario señaló correctamente que las capturas de 0.9 (1) conservaban el trazo CSS liso debajo de la textura. Ahora `has-membrane-rim` deja ese borde transparente sin alterar las dimensiones; solo se ve el marco pintado. Se conserva el foco de teclado y la animación de 7 segundos.

`after-single-rim-build/` verifica los builds de PC y móvil en Chrome y WebKit, iPhone e iPad horizontal incluidos. Los tres controles tienen borde CSS transparente, pseudo-elemento antiguo oculto y canvas visible. Capturas revisadas. El verificador de assets también exige esta corrección dentro de la app firmada. Candidata 0.9 (2), pendiente de confirmar entrega en TestFlight.
