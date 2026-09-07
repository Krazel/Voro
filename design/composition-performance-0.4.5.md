# Composición e instrumentación — 0.4.5 (1)

Encargo 2026-09-07: analizar Voro-rendimiento.txt y optimizar el juego sin
alterar el protagonista (exclusión anterior conservada).

## Informe recibido

0.4.4 (2), iPhone/iOS 16.7.16, 560 × 1218 y DPR 1,5. Orilla, 30 segundos,
1313 cuadros: 43,7 FPS, P50 23 ms, P95 30 ms, P99 34 ms, pico 59 ms y
16 intervalos >33,34 ms. CPU instrumentada 2,6 ms; render 1,94 ms, protagonista
0,77 ms y simulación 0,55 ms. Secciones anidadas, no sumables.

Diez hojas residentes, 27.005.960 bytes, sin errores/expulsiones ni poses
procedurales. Los cinco peores cuadros no muestran cargas pendientes; cuatro
eventos de imágenes duran hasta 111 ms transcurridos, no CPU. El contador 32
de fondos era acumulado de la sesión, no exclusivamente de los 30 segundos.
No se demuestra saturación GPU ni causalidad de Capacitor. La variación frente
a 0.4.3 tampoco es un A/B controlado: escenarios y recorridos diferentes.

## Cambios aplicados

- Overscan del fondo pasa de 128 a 192 unidades; dibujo al lienzo principal
  recortado al rectángulo visible. Misma pintura, cámara y lógica de parallax.
  Repetición sintética de 300 posiciones: reconstrucciones 25 → 17 (−32 %).
  Error medio máximo entre seis imágenes: 0,693 niveles por canal de 255.
  Compromiso explícito: cada superficie pasa de 3.827.200 a 4.935.168 bytes
  en el escenario alto probado; siguen reteniéndose como máximo dos superficies.
- Barras animadas con transform en lugar de width; se evita animar el layout.
- Los menús cerrados no se construyen en cada publicación del HUD. Se conserva
  la apertura de configuración, adaptación y vista previa cuando corresponde.
- Se detienen animaciones de avisos invisibles y el barrido de gradiente del
  aviso durante la partida. El borde conserva su respiración cuando es visible.
- Las notificaciones de resize de dimensiones iguales no reinician el buffer.
- Estadísticas visibles a 2 Hz; resumen completado reutilizado, sin ordenar
  la captura completa ocho veces por segundo. La captura sigue midiendo cada cuadro.
- drawCell idéntico por comparación de fuente; sin reducción de DPR, resolución
  del protagonista, fotogramas de animación, población ni velocidad de simulación.

La [guía Canvas de MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
documenta reutilización de dibujos y reducción del trabajo repetido. Estas pruebas
locales no acreditan FPS de WebKit ni de GPU en el iPhone.

## Informe v3 compacto

Conserva copia y archivo compartible. Añade número de reconstrucciones durante
la captura, intervalos >20 ms y correlaciones no excluyentes con trabajo del
cuadro anterior: fondo, publicación del HUD, carga pendiente y otros.
Incluye retraso desde timestamp rAF hasta entrada al callback; no es tiempo GPU.
La entrega a React mide espera y commit conjuntamente, no CPU aislada de React.
Eventos de resize quedan registrados; se conservan cinco peores cuadros y sus
anteriores. No se añade telemetría automática ni se presentan causas como hechos.

## Validación

107 pruebas correctas, incluidas correlaciones con cuadro anterior, exportación,
resize sin reinicios y reutilización de resumen terminado. TypeScript, lint y
build web correctos. 18 casos raster sin huecos y desplazamiento de terreno real
correctos. HTTP local 200. Fuente y comparaciones guardadas en artifact fuera de Git.
Pendiente nueva captura física para medir la mejora real y revisar interfaz táctil.

## Distribución

Registrar aquí fuente compilada, web, CI, Apple y revisión D1 al verificar entrega.
