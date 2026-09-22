# VORO 0.5.5 (1) — dibujo de organismos a corta distancia

El usuario confirma rendimiento muy lento desde el inicio tanto en móvil como en iPad. El informe físico 0.5.3 tenía 31 FPS, P95 64 ms y CPU del motor 1.5 ms; no mide GPU ni composición. No se atribuye todo el problema a una causa sin repetir la prueba física.

## Regresión localizada

El modo ancho añadido en 810404e solo se activa en PC o iPad horizontal. iPhone y iPad vertical conservan el encuadre y presupuesto de píxeles anteriores. La comparación no muestra que iPhone esté usando el lienzo ancho de iPad.

AnimationSheets descartaba una animación ya decodificada cuando el radio multiplicado por el zoom y DPR superaba el tamaño exportado. En 8477e76 (0.5.1) se añadió además una excepción que desactivaba la caché para hunter y giant. Cada uno pasaba a 224 drawImage con clip por fotograma. La ruta es compartida por iPhone/iPad y puede activarse desde el microscopio. El tiempo de envío de comandos Canvas no representa todo el coste de rasterizar esos recortes.

Ahora los ciclos exportados se mantienen al crecer/acercar la cámara. Las animaciones de hunter/giant se exportan con el mismo rig, duración y número de poses a 256px en vez de 192px. Todas las animaciones del microscopio juntas caben en 61.4 MiB, dentro del límite existente de 64 MiB. Se retiran únicamente los tres archivos reemplazados, conservados en Git. La galería sigue usando el rig continuo. El protagonista, simulación, cámara y resolución general no cambian.

## Evidencia

- benchmark-mobile-closeups.mjs: 90 fotogramas por especie con Canvas Skia real, radio 130px y texturas cargadas. Antes hunter/giant: 20.160 recortes y dibujos por especie; después 90 dibujos y cero recortes. Promedio local aproximadamente 2.0–2.3 ms → 0.01–0.02 ms por organismo. No son FPS de iOS ni un factor de mejora para el juego completo.
- before.json / after.json conservan tiempos y contadores, incluida la eliminación de generación de poses para amoeba a ese tamaño.
- validate-mobile-closeups.mjs: 12 comparaciones contra los rigs originales. Error medio máximo de color 1.141/255, error de alfa 0; comparación visual revisada. La animación exportada mantiene sus ciclos; el escalado de sprites puede suavizar detalles a zoom extremo.
- tests: zoom/DPR altos mantienen ciclos, no generan triángulos ni nuevas poses; memoria del primer bioma bajo límite. Captura incluye sheetDraws, proceduralDraws y poseBakeSteps en cuadros lentos y correlaciones.
- El verificador de build compara cada hoja de animación del paquete con su fuente, además de fondos, UI, atlas y sonidos.

## Entrega verificada

TestFlight 0.5.5 (1), código 854deadb008064b9d1ca6d77c7eb0c9ae9505003. CI https://github.com/Krazel/Voro/actions/runs/35722277416 completado correctamente. API: build dfb7d9fd-cec8-4274-b7de-ad95a6933fe1, VALID e IN_BETA_TESTING, grupo VORO Interno verificado. IPA descargada y SHA256 coincide. Dispositivos iPhone/iPad; las cuatro orientaciones iPad se verifican en el archive. No se ha enviado a App Review ni publicado en App Store.

196 pruebas correctas en local y CI. Build PC actualizado con el mismo código. WebKit de escritorio en contextos aislados: arranque y partida sin errores de página con viewport de teléfono e iPad horizontal; teléfono wide=false, tablet horizontal wide=true. Las capturas se conservan. No es una prueba de hardware iOS ni de FPS; se espera a que termine el nacimiento en lugar de asumir su duración de reloj bajo emulación.

Biblioteca PR-009 guardada y releída, revisión 124; conservados seguimiento y datos de marketing. Pendiente medición física de 30s en iPhone/iPad y audibilidad del efecto comer. Esta corrección elimina una ruta costosa demostrada, no certifica fluidez física.
