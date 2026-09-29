# Informe físico de audio — 0.11 (1)

Archivo facilitado por el usuario: Voro-audio.txt; SHA256 en summary.json. iPhone, iOS 18.7 según el user-agent; no identifica el modelo, ni equivale al anterior iPhone X/iOS16.

- Completadas 12/12 escenas. 5.846 cuadros en 98 segundos activos: 59,6 FPS; 12 cuadros por encima de 33,34 ms (0,21%). P95 de 17 ms en todas las escenas; peor intervalo activo 47 ms.
- 91 efectos programados con resultado correcto, cero fallos/omisiones. Cinco muestras de comida decodificadas, sin errores de lectura/decodificación/reproducción.
- Cero sobrecargas en ventanas de señal; máximo pico muestreado 0,48338. No acredita ausencia absoluta de clipping entre ventanas o en la salida física.
- Un intervalo de muestreo de 315 ms durante loading de órbita; el reloj de audio avanzó 317 ms. Es una demora de la toma de muestras, no prueba de corte de audio; se excluye del resumen de FPS activo.
- Al final de ciudad: evento de contexto interrupted seguido de running con la misma marca de reloj de audio 69,624 s (el reloj no mide la duración de una interrupción). La pista se pausa a 69,736 y vuelve a playing a 72,696. Hay un salto de unos 3,2 s entre muestras, con reinicio de la medición por inactividad. Compatible con pérdida temporal de foco/interrupción, pero no se registra su causa. No atribuir a notificaciones, llamada o acción del usuario sin confirmación.
- Cero eventos musicales stalled/error. Waiting observados al iniciar cada nueva pista; no son por sí mismos fallos. Todas las pistas tienen avance de reproducción.
- Cero marcas manuales de fallo. Pendiente confirmar qué oyó el usuario.
- iOS no expone playback/underruns en este informe (null). No podemos declarar solucionado un petardeo que no esté correlacionado con la escucha.
- La prueba usa fragmentos cortos al entrar en los entornos: no valida bucles completos, partidas largas ni densidad al final de cada entorno.

No se modifica código, volumen ni se sube otra build a raíz de esta lectura. TestFlight 0.11 (1) sigue vigente.
