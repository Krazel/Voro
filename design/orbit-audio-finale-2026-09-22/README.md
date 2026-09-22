# Audio, órbita y final — Windows prueba 3

## Cambios pedidos

- Órbita: retiradas de la población las tres imágenes de lunas/planetas que seguían apareciendo con nombres de fragmentos. La Tierra permanece como objetivo. Se conservan sus identificadores y animaciones para partidas históricas, sin volver a generarlos.
- Satélites: radio base 24 y factores 0,7–2,4 (antes radio 8 con variación estrecha); estaciones 65 y factores 0,8–1,8. La masa necesaria depende del tamaño de cada ejemplar.
- Tierra: la imagen usaba una posición fija en pantalla y un desplazamiento de cámara del 8 %, mientras la gravedad usaba coordenadas del mundo. Ahora pintura, interacción y gravedad comparten centro (700,1750) y radio 620, proyectados con el zoom. Movimiento libre dentro del planeta y hasta radio 1200; retorno gradual fuera, contención exterior 1550. Acercarse al planeta no se bloquea.
- Final: captura completa sin contracción ni succión; sombra radial suave avanza desde los bordes hacia el centro. Conserva oscuridad completa y posterior aparición tenue del protagonista. Después, movimiento sin límites con seguimiento de cámara; no se reanuda la simulación ni se conceden recompensas.
- Audio: pausa durante un fundido podía dejar otra pista audible; promesas de reproducción antiguas podían pausar una reproducción nueva sobre el mismo reproductor. Corregidos ambos casos. Las rampas conservan el valor interpolado con `cancelAndHoldAtTime` cuando está disponible. Cada mordisco tiene entrada de 6 ms y salida de 20 ms para evitar discontinuidades incluso al cambiar pitch. Conserva canciones, volumen y variación aprobados.

## Evidencia

- `tests.txt`: 216 pruebas correctas, incluyendo gravedad en 32 direcciones, ausencia de planetas en 49 sectores, tamaños, viaje final sostenido en cuatro direcciones y carreras de reproducción. TypeScript correcto.
- `browser-audio.json`: efectos medidos en Web Audio real tras menú/interrupción/daño; mute sin señal ni voces nuevas. No equivale a escuchar el dispositivo del usuario ni demuestra la desaparición de todo posible petardeo físico.
- `visual-check.json` y PNG: capturas del motor real en viewport 430×860 desde norte, sur y este de la Tierra; final en 0/4/8/11/17 s; recorrido final de 11988 unidades sin barreras.
- `../windows-preview-3-2026-09-22/check.json`: comprobación del ejecutable empaquetado. ZIP y manifiesto en `artifact/windows/0.6.2-preview.3`.

Entrega local Windows 0.6.2 prueba 3. El código compartido incorpora las correcciones; no se ha subido una build nueva a TestFlight ni publicado en itch.io/Steam.
