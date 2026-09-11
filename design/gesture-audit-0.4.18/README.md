# Zoom táctil y auditoría del microscopio — 0.4.18 (1)

Continúa la entrega 0.4.17, sin repetir sus cambios de encuadre, ciudad ni final.

- Pellizco con dos dedos, rango 75–175 %. La cámara mantiene su centro y escala actual; no salta al colocar el segundo dedo. Bloquea dirección, inclinación e impulso hasta levantar todos los dedos. Cancelación, pérdida de captura, pausa y cambios de ventana reinician el gesto.
- Rueda del ratón y botones existentes como alternativa web; ajuste y restablecimiento en Configuración. Los eventos continuos no publican React por cada movimiento: el HUD usa su cadencia habitual.
- Microscopio: se evita pintar un color opaco a pantalla completa debajo de otro fondo ya opaco en cada fotograma. Se conserva la composición de transiciones y el fondo de reserva durante la carga. No cambia el protagonista.
- Se conserva el encuadre inicial cercano 1.12, compensación de crecimiento 0.22 y suelo 0.78 de la cámara automática.

## Evidencia y límites

148 pruebas pasan. TypeScript y lint de los archivos modificados pasan. El lint global detecta errores previos en componentes UI compartidos, hooks y un import de campaign.test; no se declara limpio. Compilaciones web y móvil correctas, verificador de diez fondos y marco Cristal incluido. En el navegador real se verificaron la versión 0.4.18, el texto del gesto en Configuración, el botón de acercar (100 → 110 %) y el restablecimiento a 100 %. La partida original se restauró al salir de la prueba.

Comparación del motor real con Skia, semilla 1834, 360 cuadros por escenario, hojas cargadas previamente. Tiempos medios de CPU + raster síncrono en ms:

| Resolución | Movimiento | Antes | Después |
| --- | --- | ---: | ---: |
| 100 % | Quieto | 10.72 | 10.50 |
| 100 % | Moviéndose | 12.57 | 11.95 |
| 70 % | Quieto | 10.43 | 8.44 |
| 70 % | Moviéndose | 11.05 | 9.56 |

Los hashes de la imagen final coinciden exactamente en los cuatro escenarios. Una pareja de ejecuciones no mide variabilidad estadística, GPU, WebKit ni FPS físicos; no acredita por sí sola fluidez en iPhone. JSON completos en baseline.json y candidate.json. Reproducir desde la raíz con `node design/gesture-audit-0.4.18/benchmark.mjs artifact/benchmark.json`; requiere la dependencia local @napi-rs/canvas indicada en el script.

La medición real de 30 s en el navegador integrado sobre 0.4.17 devolvió 32 cuadros, 1.1 FPS, P95 1001.5 ms y CPU 2.2 ms, sin cargas ni errores. Cadencia compatible con limitación del navegador de pruebas, causa no confirmada. Se excluye de las conclusiones de fluidez. Los gestos táctiles se verificaron mediante eventos del canvas en pruebas automatizadas; queda pendiente validar el multitáctil y medir 30 s en iPhone/iPad físico.

Ciudad y final ya estaban entregados: se conservan sus pruebas de peatones, absorción del universo, vacío y superviviente. No se recrean assets ni se modifica su arte.

Estado exacto de IPA y Apple se conserva en artifact/testflight-0.4.18-build-1, separado de esta evidencia local. Sites público no se actualiza: sigue pendiente la autorización específica de destino de una revisión anterior.
