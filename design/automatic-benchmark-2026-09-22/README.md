# VORO 0.6 (1) — prueba automática desde iPhone/iPad

Acceso: Configuración → Modo de desarrollo → Probar todos los entornos automáticamente. La prueba utiliza el motor y los assets de la app instalada, con movimiento automático y un intento de impulso cada nueve segundos. No envía informes automáticamente.

Protocolo: los diez entornos, dos tamaños por entorno (masa de entrada y 80% del intervalo logarítmico hacia la meta), 15 segundos medidos por tamaño, dos segundos de calentamiento después de cargar. Unos seis minutos más cargas. Cada escenario conserva FPS, P95/P99, peor intervalo, CPU por sistema, audio, carga de assets, renderizado y cinco peores fotogramas con el anterior. El archivo contiene 20 resultados compactos; no los miles de registros crudos. Se conserva el método manual anterior de 30s.

La campaña se guarda antes de entrar al sandbox. Al terminar o cancelar se restauran sus objetos de progreso/vida/mundo, zoom, cámara, estado de pausa, nacimiento, reloj y presupuesto de rasterización. Los escenarios no escriben en su ranura. Si se cierra la app durante la prueba, la campaña guardada antes de empezar permanece. Los informes en curso/finales se mantienen en memoria hasta compartirlos o cerrar la app.

La prueba usa invulnerabilidad, sin mejoras, sin evolución automática ni ofertas de adaptación para evitar interrupciones. No evalúa las transiciones ni el final cinematográfico; mide el recorrido de cada entorno. Se reinicia el presupuesto adaptativo de píxeles por tamaño y se restaura el del usuario después. El movimiento es determinista; semilla y protocolo figuran en el informe.

Si un asset base falla o no llega en 30s activos, se registra el problema y se sigue con el siguiente escenario. Cancelar genera un informe parcial, incluso sin cuadros medidos. El resumen avisa si hay escenarios incompletos. Pausa/segundo plano quedan fuera de la medición; al regresar se ofrece Continuar prueba.

Pantalla encendida únicamente mientras la prueba está activa: pequeño bridge UIKit, liberado al pausar/terminar/salir, y Wake Lock web cuando esté disponible. Referencia de Apple: https://developer.apple.com/documentation/uikit/uiapplication/isidletimerdisabled . Compilación de Swift en CI; todavía pendiente validación física del bloqueo automático y medición en iPhone.

## Verificación

- 200 pruebas: plan completo, dos tamaños por entorno, retorno exacto a la campaña/cámara, ningún guardado de sandbox, pausas, cancelación durante carga, timeout/errores y exportación de informe parcial.
- Tipos y build móvil correctos. Verificación de todos los fondos/atlas/animaciones/UI/sonidos en el paquete.
- WebKit de escritorio, almacenamiento aislado y reloj rAF acelerado solo dentro del test: 20/20 escenarios con muestras, vuelta a la pantalla anterior, descarga Voro-rendimiento.txt (aprox. 230KB), sin errores JS. No son FPS físicos: el test de navegador valida flujo y formato; sus tiempos sintéticos no se publican como informe de rendimiento.
- UI en español e inglés. Captura de final revisada; botones accesibles en viewport de iPhone.

El primer CI (35724713820) pasó las pruebas JS y falló al compilar el bridge de pantalla por inferir [CAPPluginMethod?]. Corregido en fd1b4c5 declarando [CAPPluginMethod], como requiere CAPBridgedPlugin. La build candidata no llegó a Apple en ese intento.

CI de entrega: https://github.com/Krazel/Voro/actions/runs/35725066132 . Código fd1b4c59a39a55237e0da7ff89e223a25110ca28. Pendiente verificación final TestFlight y ejecución física del usuario.

22 septiembre, 12:26 UTC: archive, firma y subida con altool completados. API oficial `/v1/apps/{id}/buildUploads` confirma upload `7670f085-59e7-4396-824a-595057b08454`, versión 0.6 (1), estado PROCESSING sin errores ni advertencias. Todavía no existe recurso Build visible para 0.6; última build disponible 0.5.5 (1). Consulta protegida: https://github.com/Krazel/Voro/actions/runs/35727141724 ; respuesta en `apple-upload-processing.json`. No confundir subida correcta con disponibilidad en TestFlight. El CI de entrega continúa esperando hasta 50 minutos para verificar VALID y asignar VORO Interno. No se ha enviado a revisión ni a grupos externos.
