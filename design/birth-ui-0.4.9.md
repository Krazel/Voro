# Inicio y avisos: 0.4.9 (1)

Se retiran la guía permanente de arrastrar/inclinar, el marcador inferior de etapa y el lema lateral. El modo de movimiento continúa siendo seleccionable al inicio y en Configuración. Impulso conserva la preferencia izquierda/derecha.

Los mensajes y la protección se agrupan en una columna centrada. El estilo de marco establecía position:relative sobre el aviso que antes dependía de coordenadas absolutas: causaba el desplazamiento. El grupo nuevo centra cada elemento sin depender del transform del marco y evita que se superpongan. Los textos de transición se centran en el área de juego.

Inicio renovado con «Antes de todo, una vida». Primer nacimiento de 2,8 segundos: la célula existente emerge y pulsa; cámara se centra suavemente sin cambiar el zoom. Sin simulación de movimiento, consumo, daño, experiencia o impulso durante la entrada. El HUD aparece al terminar. Partidas guardadas continúan sin repetirla. Reiniciar una partida completa sí la reproduce. Movimiento reducido usa 0,8 segundos, sin escalar la célula.

121 pruebas correctas. Pruebas de nacimiento verifican pausa de simulación, bloqueo de impulso, entrada de partidas guardadas y movimiento reducido. Los fixtures de simulación esperan al final del nacimiento antes de evaluar jugabilidad. TypeScript, lint y builds web/móvil comprobados. Se conserva la muestra de orilla separada; no sustituye el fondo real.

Revisión visual en navegador del nacimiento y de la continuidad de partida. Confirmación en dispositivo físico pendiente tras la entrega. Detalles de distribución se mantienen en el registro privado.
