# Restauración del final — candidata 0.6.8 (1)

Causa del bloqueo en segundo plano: blur/visibilitychange pausaban la secuencia, pero durante ending>0 no se mostraba el menú normal de pausa y action('pause') tampoco la reanudaba. Además solo se persistía completed, sin el momento restante de la secuencia.

Se conserva finaleRemaining en el guardado; los eventos pagehide/blur/visibilitychange guardan el instante, y finalizar la secuencia guarda0. Volver al primer plano reanuda solo la pausa automática de una cinemática, sin alterar la pausa normal. Al abrir de nuevo se restaura la fase y se espera a Continuar partida antes de consumir tiempo. Si el cierre ocurrió antes de tragar el universo, el frame capturado no persiste: se retoma al inicio de la desaparición, tras la absorción ya conseguida. Oscuridad y aparición se restauran en su instante exacto. Guardados antiguos completados conservan el superviviente. No se abre Recorrido automáticamente ni se repiten recompensas.

Pruebas: guardado/cierre en7instantes, segundo plano, pausa normal y migración. Navegador real: cinco puntos8.5/12.9/15/18.1/26s, eventos de visibilidad simulados y cierre/reapertura de página con almacenamiento compartido. Todos reanudan, conservan47absorciones, terminan con0pendiente y no abren Recorrido. Capturas survivor-from-*.png y web-qa.json. 238tests globales, tipos y build/assets correctos.

QA nativa en simulador iOS mediante finale-lifecycle-checkpoint.yml preparada: Home/activate y terminate/relaunch reales de XCUIApplication. El fixture solo sitúa el final en negro y añade un marcador de estado; no se incluye en release/TestFlight. Resultado pendiente. No se afirma validación en dispositivo físico.

Primera QA nativa35923210466: iPad confirmó regresar y reabrir sin pausa, pero la cuenta solo bajó17→7 durante45s, agotando el timeout. Se detectó que el límite35ms de física también ralentizaba el reloj cinematográfico a pocos FPS. Ahora solo el final consume el intervalo visible real (máximo500ms por frame; vuelta de segundo plano reinicia el reloj), manteniendo35ms para integrar la membrana. Una regresión a10fps verifica31s reales y valores finitos. La aparición conserva su curva y geometría. Se repite la QA nativa con la corrección; no se da la primera ejecución por aprobada.

Las capturas web finales se regeneraron avanzando en pasos1/60s, sin saltar de golpe todos los segundos restantes: así la evidencia visual conserva la dinámica real de la membrana.
