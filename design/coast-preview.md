# Prueba de costa continua

Ruta `/orilla`, accesible también desde Configuración. Muestra web independiente: no sustituye todavía el entorno de la partida ni modifica sus hábitats, guardados o progresión. No se ha subido una nueva build de TestFlight por esta prueba.

La costa se define mediante una función continua de coordenadas globales con tres escalas de variación. Materiales de arena y agua extraídos del asset aprobado se repiten con bordes reflejados; la forma de la playa no se repite por paneles. Arena húmeda y profundidad mediante gradiente deformado, espuma en tres frentes animados. Un mismo cálculo permite identificar el hábitat de la posición central.

Controles: comparar con el renderer anterior, arrastrar para explorar, recorrido automático, escala, espuma y reinicio. Ningún acceso a localStorage. La muestra informa CPU media/pico de dibujo, con limitación explícita: no mide GPU ni rendimiento del juego completo.

## Comprobaciones

- Continuidad en coordenadas positivas y negativas e identificación de hábitats, 30 001 posiciones.
- Recorrido sintético de 480 cuadros y regreso a una posición: pintura idéntica tras regenerar la caché. Superficie única acotada, reutilizada hasta salir del margen.
- TypeScript, lint y compilaciones web/móvil correctas.
- Inspección visual en navegador, comparación anterior/nueva, arrastre, reinicio, escala y espuma. Vista de 390 × 844 utilizable.
- Evidencias locales de renderer en artifact/coast-preview.png y artifact/coast-check.json; los tiempos sintéticos son CPU de escritorio, no pruebas de iPhone.

## Pendiente de validar

La muestra valida la forma y continuidad. Las texturas de materiales todavía pueden revelar simetrías/repetición al alejar la vista; no equivale a tener el arte final de toda la playa. Aún sin objetos ni animales integrados. Antes de sustituir el entorno real: validar aspecto con el usuario, medir en móvil físico y conectar aparición/restricciones de habitantes con la misma geografía. No prometer un coste de reconstrucción nulo: preparar la superficie es más caro que reutilizarla.
