# VORO 0.11 (1) — prueba automática de audio

Autorizado: prueba de sonido y subida a TestFlight interno. El usuario confirmó que «Slack» era dictado de «TestFlight».

Configuración → modo de desarrollo → Probar audio automáticamente. Conserva las herramientas de desarrollo y los cambios candidatos de audio/órbita. No añade contenido nuevo ni modifica las fichas comerciales.

## Protocolo

- Doce fragmentos musicales, incluido menú y final: 8 s por pista y 10 s para el final, 0,5 s de preparación por escena; unos 104 s más cargas. No reproduce los temas completos ni verifica sus puntos de bucle.
- Escenas del motor real con movimiento e impulso automáticos, sin muerte ni ofertas de adaptación. Primera escena: música sola. Diez escenas siguientes: cinco WAV de comida, daño, escudo, aviso y evolución. Última: tono largo del final.
- La comida espontánea se silencia solo en la prueba de audio para identificar las cinco muestras programadas. Los efectos atrasados no se acumulan en ráfaga: quedan marcados como omitidos.
- Sonido activado temporalmente; campaña, cámara, pausa y ajuste de sonido restaurados al acabar/cancelar. Las escenas de prueba no sobrescriben el guardado normal.
- «He oído un fallo» marca el instante y la escena; el contador confirma el toque.
- Compartir usa el flujo de archivos ya existente: `Voro-audio.txt`, compatible con el envío manual por WhatsApp. Nada se envía automáticamente.

## Datos

Informe de cada escena: FPS/CPU y peores cuadros, contexto/latencias/underruns si la plataforma los permite, eventos waiting/stalled/error, posición y disponibilidad de ambas pistas, solicitudes/resultados de efectos y marcas del usuario.

Solo durante la prueba, un analizador conectado a la mezcla toma ventanas de 2.048 muestras como máximo cada 100 ms; guarda pico/RMS y avance del reloj, no PCM. Máximo 400 ventanas y 100 eventos por escena. Se desconecta al cambiar de escena o terminar. No usa micrófono, AudioWorklet ni telemetría.

Los posibles cortes de reloj, sobrecarga muestreada, pausas del contexto y retrasos de JS se cuentan como observaciones, no como diagnóstico causal definitivo. Un silencio musical es válido; métricas no disponibles son null, no cero. El sonido que finalmente produce el altavoz y los intervalos entre ventanas quedan fuera de observación directa.

## Verificación

- 283 pruebas de juego/Windows correctas, incluidas cobertura de doce escenas, selección de cinco bocados, cancelación durante carga, restauración de sonido apagado/guardado, marcas, límites y archivo compartible.
- TypeScript correcto, compilaciones móvil y PC correctas. Paquete móvil con assets locales verificado.
- Comprobación UI del paquete local: acceso desde Configuración, recorrido, contador de marcas, restauración al terminar y preparación de archivo. La prueba detectó correctamente escenas incompletas cuando se retiraron temporalmente recursos durante una recompilación; se repite con el paquete completo antes de entrega.
- Esta evidencia no confirma que el petardeo del iPhone esté resuelto: el objetivo es medirlo en el dispositivo afectado.

Distribución pendiente al crear este documento; se registrará el resultado real de Apple en esta misma carpeta.
