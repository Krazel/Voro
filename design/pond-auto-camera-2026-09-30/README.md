# Cámara automática y nitidez de Charca

Solicitud: retirar el zoom manual y conservar el encuadre automático aprobado; mejorar el fondo borroso de Charca cuidando el rendimiento. No se modifica audio ni balance.

## Cámara

Se retiran los controles de zoom del HUD y de Configuración, tanto en UI final como de desarrollo, además de pellizco y rueda. Un segundo dedo no roba el control al dedo de movimiento. La cámara sigue usando la curva automática existente al crecer y al pasar de etapa, con factor normal 1. El ajuste manual anterior solo vivía en memoria, no en el guardado. La API interna `setZoom` se conserva para pruebas automatizadas, sin controles accesibles al jugador.

## Fondo

Se reutiliza exactamente el original aprobado `design/approved/backgrounds/pond-variants.png`, sin generar otro diseño. Nuevo recurso local `pond-variants-lossless.png`, SHA256 5a9af28139abec6e5697ba7849e095ee30018edc06b87f9c461ae58935066f21. La resolución del archivo sigue siendo 1536×1024: la mejora es eliminar compresión con pérdida y aumentar un 50 % la densidad de detalle por unidad del mundo (paso de terreno 360→240), sin cambiar el tamaño del protagonista, habitantes ni cámara.

Las ocho variantes conservan las dimensiones nativas de sus recortes en lugar de estirarse primero a 768×768. Memoria de variantes: 18.0→9.84 MiB, con el mismo buffer de pantalla. El archivo en disco aumenta de 208648 a 2745338 bytes, pero la imagen decodificada mantiene sus dimensiones. No hay filtros ni texturas adicionales por fotograma. Se conserva la mezcla de bordes, caché de desplazamiento y límites entre entornos.

## Evidencia

`comparison.json` y capturas antes/después: mismo encuadre automático, cámara, semilla y tamaños de pantalla 390×844 / 1194×834, Chromium de escritorio. En 240 pasos hay dos reconstrucciones y 238 reutilizaciones en ambos casos; las reutilizaciones mantienen una sola composición de fondo. Tiempos de envío de comandos a Canvas muy pequeños, insuficientes para prometer FPS de iPhone; no son medidas GPU ni pruebas físicas. Las reconstrucciones observadas no aumentaron en esta muestra.

`browser.json`: UI final y de desarrollo, Charca decodificada/renderizada, Ctrl-rueda no cambia la cámara, cero controles de zoom y cero errores de página. Capturas del juego y Configuración. 27 pruebas dirigidas correctas; cobertura raster de Charca en dos escalas y desplazamiento correcto; TypeScript y build móvil con assets verificados. El comprobador raster general tiene una expectativa antigua de lienzo blanco que falla en Ciudad (renderer urbano específico, sin cambios); se permite filtrar el entorno para verificar Charca separadamente.

La 0.13.4 (1) distribuida es la base; los cambios de esta carpeta corresponden a la siguiente build, no validan por sí solos TestFlight.

## Entrega verificada · 0.13.5 (1)

Fuente `0487cf45a04ab03e8cba9df70254c30d7797c604`. [CI 36761306167](https://github.com/Krazel/Voro/actions/runs/36761306167) completada correctamente: 325 pruebas, build móvil, verificación de assets, simulador iPhone, archivo firmado iPhone/iPad y subida.

`apple-verification.json` registra la lectura por API posterior a la asignación: build `2e00fdbb-2635-489c-a848-4d3f63ff6eca`, versión 0.13.5 (1), `VALID`, `IN_BETA_TESTING`, grupo VORO Interno `05db8744-bcf3-4c2d-a465-2635012bfeeb`. Disponible en TestFlight interno; no se publica en App Store.

`native-music-simulator.json` corresponde a la misma fuente: música AVAudioPlayer y cinco muestras Web Audio activas simultáneamente con sesión playback, silencio del juego, reanudación y retorno desde segundo plano correctos en iPhone 17 Pro simulado con iOS 26.5. No prueba acústica física ni FPS del dispositivo.

Biblioteca PR-009 actualizada y releída, revisión 325, preservando tracking y coordinación de marketing. La ejecución 36760910429 se canceló antes de subir por apuntar a la fuente anterior; la entrega válida es únicamente 36761306167. Pendiente la prueba física de nitidez, cámara y fluidez por el usuario.
