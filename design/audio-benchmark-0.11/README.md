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
- Comprobación UI del paquete local: acceso desde Configuración, recorrido, contador de marcas, restauración al terminar y preparación de archivo. La prueba detectó correctamente escenas incompletas cuando se retiraron temporalmente recursos durante una recompilación.
- Repetición sobre paquete completo 0.11: 12/12 escenas, 5.800 fotogramas, cero escenarios incompletos y sin errores de consola. Resumen copiado por la UI: música de menú 55 FPS; resto 58,6–60 FPS, P95 20,9–21 ms en el navegador de escritorio. No extrapolar estas cifras al iPhone.
- Corrección final `2cc4468`: si falta una muestra solicitada, se registra como no disponible; no se sustituye por otra. 22 pruebas focalizadas correctas; una prueba nueva respecto a las 283 anteriores.
- Esta evidencia no confirma que el petardeo del iPhone esté resuelto: el objetivo es medirlo en el dispositivo afectado.

CI vigente: `36589490398`, fuente `2cc4468ad6b7c9b6118e847c63d774f27082296a`. La primera ejecución `36589263906` se canceló antes de compilar/subir para incluir la corrección de muestras ausentes. Se registrará aquí el resultado real de Apple.

## Entrega TestFlight verificada

CI https://github.com/Krazel/Voro/actions/runs/36589490398 correcta. Apple: build `2a04d7e1-e9ee-4eb0-834e-45113a268fc4`, `VALID` y `IN_BETA_TESTING`, grupo VORO Interno. API releída por el flujo tras asignación. Versión 0.11 (1), fuente 2cc4468ad6b7c9b6118e847c63d774f27082296a.

IPA descargada y comprobada: CRC, versión, familias iPhone/iPad, código de prueba/archivo, 17 hashes de audio idénticos al fuente (12 músicas + 5 bocados). SHA256 cb75466a65dddbd95181ae809b968086ecf227d4a3890ec6b6b77e8b016eab1b. Metadatos adjuntos; IPA ignorada en artifact/testflight-0.11-build-1/.

Biblioteca PR-009 actualizada y releída, revisión 275: TestFlight interno 0.11 (1), pendiente informe físico; demás tracking y marketing conservados. No publicación de App Store ni cambio de la web pública.
