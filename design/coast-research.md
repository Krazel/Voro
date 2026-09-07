# Costa continua: investigación y propuesta

2026-09-08. El usuario confirma que la actualización anterior resolvió la diferencia visual. Ahora informa juntas visibles y repetición de la playa, y pide investigar cómo se suele resolver. Esta nota no implementa cambios en el juego.

## Diagnóstico del código y del asset

world-ground.mjs divide shore-variants.webp en cuatro paneles; en la orilla las ocho variantes son duplicados de esos cuatro paneles (sin recorte alternativo). Cada panel ya contiene arena, espuma y agua. Alterna reflejos horizontales cada COAST_TILE=1200; mezcla verticalmente pero no horizontalmente. Los paneles tienen distinta textura y luminosidad: reflejarlos no garantiza juntas compatibles entre paneles distintos. Ajustar bordes a píxeles enteros evita una rendija, no estas diferencias visuales.

population.mjs usa una función triangular periódica shoreFraction(x), independiente de y, para aparición y restricciones de animales. También repite la geografía por franjas. El cambio de fondo debe compartir una definición espacial con hábitats, restricciones y objetos.

## Técnicas consultadas

- [Tiled: terrenos](https://docs.mapeditor.org/en/stable/manual/terrain/): piezas con bordes/esquinas compatibles; transiciones automáticas y variantes ponderadas. Adecuado si se produce un tileset completo, aunque exige preparar correctamente cada conexión.
- [Red Blob Games: generación de terreno](https://www.redblobgames.com/maps/terrain-from-noise/): funciones continuas para distribución de tierra, playa y agua; generación por coordenadas para mapas extensos.

## Propuesta para VORO

Separar geografía y arte. Una costa continua definida por coordenadas del mundo, con curvas amplias y entrantes, determina arena seca, húmeda y agua. Usar texturas de materiales sin una playa entera dibujada, combinadas mediante máscaras de esa costa. Conservar arte realista generado con imágenes, preparando y verificando sus bordes; pedir una textura repetible a un generador no garantiza por sí solo que lo sea.

Espuma en una capa aparte siguiendo la misma curva, con animación ligera. Rocas, conchas y vegetación distribuidas con semilla estable y densidades limitadas, separando decoración de objetos comestibles. Variación amplia de color y detalle para disimular repetición de materiales sin repetir la forma de la playa.

Generar solo regiones próximas, mantener bordes compartidos mediante coordenadas globales y guardar superficies en una caché acotada. Reutilizar el fondo preparado entre fotogramas como el renderer actual; medir reconstrucciones y P95 en móvil antes de prometer el mismo rendimiento. Sin procesamiento de ruido por píxel cada fotograma.

La misma función de costa debe gobernar dibujo y hábitats. Probar continuidad en coordenadas negativas, cruces de región, zoom, regreso a lugares visitados y transición de bioma; revisar visualmente a varias escalas. Primero una muestra de orilla en movimiento para validar el aspecto, antes de trasladar el patrón a otros entornos. No basta añadir más paneles ni difuminar todas las juntas.
