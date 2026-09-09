# VORO 0.4.16 (1) — Cámara y presupuesto de dibujo

Petición: regresión percibida desde el microscopio, menos alejamiento al entrar en un entorno y zoom ajustable para probar encuadres. Sin informe nuevo ni confirmación de dispositivo en esta sesión; no se identifica una causa física demostrada.

## Cambios
- Máximo 60 actualizaciones/dibujos por segundo en pantallas de 120 Hz. Prueba de 10 s: 600 cuadros aceptados frente a 1.200 refrescos; en 60/30 Hz conserva la cadencia. No ráfaga al volver de suspensión. El informe mide el intervalo entre cuadros aceptados.
- Presupuesto de píxeles: 1 millón en entrada táctil, 1,5 millones en escritorio. El DPR máximo anterior de 1,5/2 por sí solo no limitaba pantallas grandes. La resolución no cambia coordenadas, tamaño ni velocidad.
- Si durante 2,4 s más del 25 % de los cuadros superan 22 ms (mínimo 40 cuadros), baja la resolución en pasos del 10 %, hasta 70 % del factor inicial. Ignora pausas, menús, transiciones, nacimiento, final y esperas de assets base. No vuelve a subir durante la sesión ni oscila. El cambio de buffer se realiza antes de pintar para evitar cuadros vacíos. Puede suavizar algo la imagen; no modifica el renderer del protagonista ni las animaciones.
- Inicio de bioma con zoom base 1,12 y compensación de crecimiento más suave, mínimo 0,78. En el punto medio del fundido adopta la escala inicial nueva; ya no hereda el alejamiento del organismo gigante anterior.
- Configuración: zoom 75–175 %, restablecer y botones opcionales mientras juegas. El factor modifica la cámara automática y se conserva entre entornos durante la sesión; no modifica biomasa, población, ni el tamaño físico de las presas. El final cinematográfico conserva su encuadre propio.
- Los archivos de rendimiento conservan factor manual, zoom real, resolución, calidad adaptativa, refrescos omitidos y eventos de reducción. Cada peor cuadro incluye calidad y píxeles; son correlaciones, no tiempos de GPU ni una causa demostrada.

## Validación
143 pruebas correctas, TypeScript, lint, builds web/móvil. Pruebas nuevas de cadencia 30/60/120 Hz, presupuesto de raster, calidad adaptativa, pausas, zoom y cruce real al siguiente bioma. Conservadas las pruebas del final, ecología y fondos.

zoom-comparison.png está dibujado con el motor real y Skia, microscopio y charca a 75/100/175 %. No es captura de navegador ni dispositivo y no muestra la UI. El control de navegador devolvió cero navegadores habilitados; no se afirma una prueba interactiva o física. No se ha cambiado el dibujo del protagonista.

Evidencia de entrega: artifact/testflight-0.4.16-build-1/. TestFlight interno solo tras verificar la IPA y releer la API de Apple. Web Sites v36 permanece bloqueada por la confirmación específica de destino exigida en una revisión automática anterior.
