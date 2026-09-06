# Tirones puntuales — candidata 0.4.1 (1)

El usuario confirma que 0.4 (1) resulta jugable pero va lento ocasionalmente.
Se mantiene Capacitor. Se corrige la concentración de preparación de poses en
un solo fotograma, sin cambiar simulación, controles, zoom ni tamaños.

## Cambio

La caché anterior generaba todas las poses faltantes dentro del dibujo de los
animales. Cada una puede requerir cientos o más de mil triángulos con texturas.
La caché mejoraba el promedio, pero una aparición nueva podía bloquear un frame.

Ahora el juego encola las poses que faltan y genera como máximo dos por frame,
con un presupuesto orientativo de 2 ms: una pose iniciada se termina aunque lo
supere. No se ejecuta una cola ilimitada; admite 64 solicitudes únicas. Mientras
se prepara una pose se usa la fase más cercana ya disponible del mismo grupo;
si no hay ninguna, la última pose disponible del asset o su imagen original.
El organismo nunca desaparece durante la espera. No se alteran rigs ni dibujos.

Las 24 fases, tres intensidades y tamaños de caché se conservan. La memoria de
poses sigue limitada a 24 MiB; los índices auxiliares se limpian al expulsarlas.
No hay tareas asíncronas ni workers que sigan trabajando al pausar o cerrar.
El estudio de animación detallado conserva su cálculo continuo. Las poses
intermedias pueden aproximarse durante el calentamiento de la caché; no se
promete un límite duro de 2 ms ni 60 FPS en todo dispositivo.

## Evidencia

83 pruebas pasan, incluido ensayo de cola fría, visibilidad, límite de trabajo,
vaciado, memoria, pausa, cámara, alimentación y recorrido completo. TypeScript
y lint de archivos modificados pasan; builds web y móvil verificadas.

`frame-pacing-benchmark.json` compara 360 frames por escenario con seed 834,
misma simulación y resolución, Skia CPU en Windows. No incluye compositor del
navegador ni React y no acredita rendimiento en iPhone. En mar grande el peor
frame medido pasa de 254.5 a 27.8 ms y el percentil 95 de 37.0 a 21.8 ms.
En micro inicial el peor pasa de 107.7 a 18.0 ms. Los resultados varían con el
equipo; el usuario debe confirmar los tirones en la actualización de TestFlight.

Versión de corrección 0.4.1, build 1. Se conserva 0.4 (1) para comparación.
