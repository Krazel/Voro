# Valoración al completar Agua — 0.6.3(1)

Petición del usuario: solicitar la valoración justo al terminar el segundo entorno y pausar el juego; permitir comprobarlo en TestFlight.

El motor retiene la transición de Agua (índice1) a Tierra hasta terminar este punto de control. Tiempo, movimiento, daño, entrada y progresión quedan suspendidos; se silencia el audio de juego. No hay espera de ocho segundos ni activación al cargar partidas de entornos posteriores. El punto de control queda guardado como evolución pendiente y se recupera tras cerrar la app.

App Store: petición oficial StoreKit y continuación explícita desde el diálogo de entorno completado. Apple no proporciona callback de cierre ni garantiza mostrar su diálogo; la partida permanece segura hasta pulsar Continuar. Se mantiene un intento por instalación, con una clave exclusiva de producción v2, sin heredar intentos antiguos de TestFlight.

TestFlight: Apple desactiva el diálogo real. Un UIAlertController claramente identificado como prueba permite comprobar el mismo hito, pausa y continuación, sin enviar ninguna reseña ni consumir el intento de producción. Se repite al empezar de nuevo y completar Agua. Debug utiliza la misma vista de prueba; Release la activa solo para el recibo sandbox de TestFlight.

Interfaz: reutiliza los componentes Dialog y primary-button del juego, sin rediseño. Fondo congelado en Agua; estado de carga mientras responde el puente; pausa con Continuar tras la solicitud StoreKit; aviso de prueba nativo EN/ES en beta. Cerrar el aviso beta continúa hacia Tierra. Fallos del puente dejan disponible Continuar y nunca bloquean indefinidamente la partida.

Pruebas: cuatro regresiones verifican el límite exacto, congelación de tiempo/posición/biomasa, entradas bloqueadas, continuación aun tras blur, repetición al reiniciar y exclusión de escritorio/pruebas de rendimiento. Suite206/206; TypeScript y build móvil correctos. Workflow review-checkpoint usa un fixture solo de CI que llega al fin de Agua y ejecuta el puente nativo real, conservando capturas de iPhone/iPad. Ese fixture no se ejecuta en el workflow de distribución.

La candidata previa0.6.2(1) continúa seleccionada en App Store Connect hasta decidir qué build presentar; esta entrega se distribuye mediante TestFlight interno y no envía App Review.

Fuentes: https://developer.apple.com/documentation/storekit/requesting-app-store-reviews y https://developer.apple.com/documentation/storekit/appstore/requestreview(in:)-1q8qs/
