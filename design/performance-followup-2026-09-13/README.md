# Revisión local de rendimiento y zoom — 13/09/2026

Petición: tirones desde el primer entorno, menos alejamiento al entrar en un
bioma y zoom manual para comparar encuadres.

La base entregada 0.4.18 (1) ya incorpora el encuadre inicial 1,12, compensación
suave del crecimiento, botones visibles, rueda y pellizco entre 75 y 175 %.
Se mantienen esos controles y el restablecimiento al tocar el porcentaje.
Las pruebas de transición confirman que conserva el factor manual y toma el
encuadre del organismo recién nacido, sin heredar el zoom del gigante anterior.
localhost:5175 estaba apagado; se reactivó con una compilación local separada.

Cambios adicionales:

- El terreno descarta las piezas completamente fuera de su superficie antes de
  enviarlas a dibujar, conservando el margen de desplazamiento y de filtrado.
- Cuando no hay fragmentos recuperables, la comida reutiliza la lista del mundo
  en lugar de copiar sus cientos de referencias en cada fotograma. Al haber
  fragmentos se sigue combinando ambas listas para permitir recogerlos.
- El protagonista, las animaciones, poblaciones y mecánicas no se modifican.

Verificación: 148 pruebas, TypeScript y compilaciones web y móvil separada
correctos. verify-ground.mjs compara con el commit entregado e7eb5c2 usando las
texturas reales: 81 vistas (9 fondos, 3 zooms y 3 posiciones, con coordenadas
negativas) idénticas píxel a píxel. Las llamadas de dibujo para preparar sus
texturas/superficies pasan de 3984 a 2830, un 29 % menos. La orilla tiene su
renderer independiente y no se cambia. ground-equivalence.json conserva datos.

baseline.json y candidate.json recogen cuatro escenarios del motor real con
Skia, 360 cuadros cada uno. Las cuatro imágenes finales coinciden. Los tiempos
medios varían: calidad 100 %, quieto 10,53 → 11,66 ms y movimiento 12,87 → 13,33;
calidad 70 %, quieto 11,26 → 8,53 y movimiento 12,14 → 10,25. No demuestran una
mejora uniforme del tiempo total: son ejecuciones únicas en una máquina con
otras tareas, no FPS de WebKit, ni GPU ni dispositivos físicos. Se acredita la
reducción de trabajo y la equivalencia visual, no la desaparición de tirones.

Vista local: artifact/local-performance-preview, servida con Vite preview en
http://localhost:5175/. Conserva la versión base 0.4.18 en la interfaz; se trata
de una candidata local identificada por este documento y su commit, no de una
nueva entrega de TestFlight. mobile-dist 0.4.18 y la distribución no se cambian.
Pendiente comparar informes físicos de 30 s, quieto y moviéndose.
