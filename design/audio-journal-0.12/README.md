# Diagnóstico automático de audio · 0.12 (1)

Autorizado por el usuario el 29-09-2026: implementar el registro y distribuir TestFlight.
Responsable: chat de audio `01a0ee97-7b09-79b0-96d7-1d8a7b1aa465`.
Base: `6878460`, incluyendo Golpes recibidos, prioridad por tamaño del alimento y ritmo de adaptaciones restaurado.

## Uso

El registro comienza al abrir el juego. En Configuración, bajar hasta «Compartir diagnóstico de audio». Indicar opcionalmente si sonaba bien, había petardeo o estaba en silencio, guardar el archivo y adjuntarlo al chat. No hace falta marcar el momento del fallo. Compartir pronto después del episodio conserva más contexto.

Son datos técnicos locales; no se usa el micrófono, no se graba el sonido ni se envía nada automáticamente. El fichero es `Voro-diagnostico-audio.txt`, JSON legible. El registro funciona también cuando no se oye ningún problema. Esta entrega permite investigar el fallo; no afirma corregir su causa.

## Cobertura y límites

- Instantánea inicial, últimas 180 muestras a intervalos de 2 s y 100 eventos, con reloj de pared y monotónico. Guardado cada 30 s y al salir, ocultar o compartir; una terminación forzada puede perder los últimos segundos.
- Sesión anterior y actual con un límite total de 600.000 caracteres; si se alcanza se descarta primero la anterior y después muestras antiguas. Guardado aislado de la partida. Los fallos de almacenamiento no bloquean el juego.
- Contexto Web Audio, intentos y resultados de resume/play, carga/pausas de las pistas, relojes y ganancias, contadores de efectos y condiciones de silencio del juego.
- Plugin nativo de solo observación: interrupciones, cambios de ruta, servicios de audio perdidos/restablecidos y actividad de la app; sesión AVAudioSession, tipo de salida, formato, latencia y volumen. Sin activar/configurar la sesión ni conservar nombres de dispositivos.
- No mide la señal acústica. Un contexto running o play resuelto no demuestra sonido audible. Métricas de salida ausentes significan no disponibles.
- Sin trabajo adicional por fotograma, analizadores ni PCM. El muestreo/persistencia introduce trabajo periódico; su coste real y la audibilidad se deben comprobar en iOS físico.

## Verificación previa al envío

- 305 pruebas automáticas correctas, incluidos 8 casos nuevos de persistencia, interrupción, límites, exportación y callbacks de diagnóstico inocuos.
- TypeScript y build móvil correctos; comprobación de integridad de recursos incluida.
- `scripts/check-audio-journal.mjs`: interfaz, descarga, contenido y sesión anterior al recargar en Edge y WebKit, teléfono ES y tableta EN. Resultados en `browser-check.json`; capturas adjuntas.
- El WebKit de Playwright en Windows no implementa AudioContext: valida UI/exportación y registro del error, **no reproducción de iOS**. Edge sí creó el contexto. Se fuerza la ruta de descarga web solo en la prueba; el adaptador nativo Filesystem/Share tiene prueba separada.
- CI macOS debe compilar el plugin Swift, verificar firma, versión, recursos de la app archivada y procesado/asignación del grupo interno mediante API Apple. El resultado se añadirá tras completar la entrega.

Antecedentes acústicos: `../audio-independent-audit-2026-09-29/README.md` (auditoría local, sin causa demostrada).
