# Corrección del final: solo queda el núcleo

Petición23-09-2026: conservar la absorción del universo, retirar la estrella
externa que entra y terminar con una pequeña luz central que se contrae y desaparece.

La escena y sus48 partículas de absorción conservan sus trayectorias. Se elimina
el caso especial de estrella48. El cuerpo desaparece suavemente entre10 y12.1s;
la última luz está ligada a la posición real del núcleo que devuelve drawCell,
sin viaje desde fuera. Su halo y radio se contraen a cero entre11.9 y13s.

Se mantienen31s totales, música fundida10–13s, negro absoluto13–18s y la aparición
aprobada18–30.5s, sin cambios en drawVoidSurvivor. No se añadió un efecto sonoro.

TypeScript sin errores;6 pruebas del final pasan (trayectorias, anclaje de luz
al núcleo, desaparición, intervalo negro, guardado, movimiento ilimitado).
QA navegador móvil390×844 y PC1280×800: diez fotogramas por formato, cero errores
JS, negros exactos13 y17.9s, superviviente visible26s. Captura32s en finale.webm.
No es una prueba física de iOS ni una medición de FPS. Sin nueva build/subida.

Previa anterior conservada en ../finale-absorption-2026-09-23; esta revisión la
sustituye visualmente. Recorrido sigue pendiente de nueva elección independiente.
