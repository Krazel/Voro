# Final del universo — 0.4.13 (2)

El antiguo desenlace requería absorber un objeto final fuera de la pantalla y
mantenía el HUD/panel sobre un fondo oscuro. Ahora alcanzar la meta de biomasa
en Universo activa el final automáticamente; una adaptación simultánea no lo
interrumpe. El modo fijo de pruebas conserva su opción de no finalizar.

La secuencia de 12 segundos captura una vez el mundo sin el protagonista. El
protagonista crece, la imagen del mundo se contrae y trayectorias de luz convergen
en su núcleo. Después se apaga la última luz. Desde el 80 % de la secuencia solo
se dibuja negro #000; no quedan imágenes, halos, HUD ni leyendas. Al terminar,
la pantalla negra permanece hasta que se toca para ver el recorrido y el cierre.
El botón «Volver al silencio» oculta el resumen. Un final guardado vuelve al negro
sin repetir automáticamente la secuencia ni iniciar una partida nueva.

Rendimiento: una captura, hasta 88 trayectorias (24 con movimiento reducido),
sin filtros blur ni nuevas superficies por frame. Superficie liberada al acabar,
salir de pruebas o destruir el motor. Render en reposo detenido y audio suspendido
al finalizar. El arte del protagonista sigue siendo el existente; solo cambia la
escala al dibujarlo en esta secuencia. Con movimiento reducido se suaviza el
crecimiento y se elimina el giro de trayectorias.

Verificación: pruebas de final por biomasa, guardado, aislamiento de campaña,
respeto al modo fijo, crecimiento, negro puro, liberación de captura y reposo.
Comprobación de UI local: inicio de absorción, negro completo, resumen solo al
tocar. No equivale a validación de la IPA en iPhone. Entrega y evidencia exacta
se registran en la biblioteca y artifact/testflight-0.4.13-build-2/.

La revisión intermedia detectó el rectángulo de la captura al contraerse. La
segunda build aplica una máscara elíptica suave una sola vez a la captura.
La build 1 llegó a Apple antes de poder cancelarla; no se habilitó en el grupo.
