# VORO 0.14 (1) — TestFlight interno

Petición del 1 de octubre de 2026: subir únicamente a TestFlight para una última prueba. Conservar el modo de desarrollo; esperar indicación expresa antes de retirarlo y preparar la entrega comercial. No se genera EXE ni se envía a revisión de App Store.

Versión menor nueva por la revisión del sistema visual de Ciudad: perspectiva de objetos, distribución del mobiliario y personajes con caminar direccional. Incluye los laterales aprobados, las vistas frontales/traseras y las correcciones finales de pantorrillas de los dos soldados. No cambia el sistema de audio validado en la versión anterior.

Origen: rama camera-framing-2026-09-19, cambios aprobados hasta bd9f064. App com.dmkr.voro, equipo B2X6D3A9J9, iPhone/iPad. Versiones del código, Xcode y flujo TestFlight alineadas en 0.14 (1).

Procedimiento: workflow existente testflight.yml con entorno protegido app-store-production. API oficial verifica combinación libre antes del archive y comprueba procesamiento/asignación al grupo interno después de subir. No se alteran testers, metadatos de tienda ni publicación.

Estado inicial: preparación. La entrega solo se confirma con recibo de API VALID y acceso interno, manifiesto del binario y huella SHA256.

Validación local: 341/341 pruebas correctas; build:mobile correcto y verificación binaria de los assets empaquetados. Las pruebas generales de densidad distinguen los 24 habitantes/objetos anteriores y los seis objetos de acera aprobados; no se modifica la población para hacer pasar la suite. Se conserva el texto/acceso Modo de desarrollo en el JS móvil y ambos atlas verticales v2.

CI: https://github.com/Krazel/Voro/actions/runs/36878287849 — commit 06c38223fb667f5174f80e8445634e7047655cc6. QA en simulador iPhone 17 Pro correcta: música menú y microscopio, silencio/recuperación, cinco efectos decodificados con sesión playback y contexto running; pausa en segundo plano y recuperación al volver. Es una comprobación de simulador, no una medición del rendimiento/sonido de un dispositivo físico.

Entrega completada: workflow 36878287849 SUCCESS. API de Apple releída tras asignación: build 97678a72-e2d9-4c68-b953-b642d6d72843, VALID / IN_BETA_TESTING en VORO Interno. IPA descargada y SHA256 verificado: 09fc38891627e2bd3431fd77c583f39d106efee9a9b420e75d8709d0bbbc64b4. Dentro de la IPA, los atlas city-1-vertical-v2 y city-3-vertical-v2 coinciden byte a byte con los aprobados; acceso a Modo de desarrollo presente. Manifiesto confirma versión 0.14, build 1, familias iPhone/iPad y cuatro orientaciones iPad. No envío a revisión ni publicación.
