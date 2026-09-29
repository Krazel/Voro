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
- CI macOS compiló el plugin Swift, verificó firma, versión y recursos de la app archivada; las 305 pruebas también pasaron allí. El procesado y la asignación del grupo interno se verificaron mediante API Apple.

Antecedentes acústicos: `../audio-independent-audit-2026-09-29/README.md` (auditoría local, sin causa demostrada).

## Entrega verificada · 29-09-2026

- Fuente: `2096be58e268914607ba83fdb74dc8158c904ea2`.
- [CI 36623409965](https://github.com/Krazel/Voro/actions/runs/36623409965), resultado `success`. Artefacto `Voro-TestFlight-56`.
- Apple: app `6809193565`, build `e9af81dd-7d66-4e0b-955c-e3d4618b7513`, versión **0.12 (1)**, `VALID / IN_BETA_TESTING` comprobado a las 20:15 UTC.
- Grupo existente `VORO Interno`, ID `05db8744-bcf3-4c2d-a465-2635012bfeeb`; acceso interno, sin distribución externa ni envío a App Review.
- Biblioteca D1: misma ficha `PR-009`, revisión **293**, versión/build y siguiente paso releídos y verificados. Conservados seguimiento de App Store/anuncios, marketing y fuente histórica.
- Archivo firmado descargado en `artifact/testflight-0.12-build-1/`; `verify-delivery.py` verifica hash, versión, familias iPhone/iPad, plugin nativo y diagnóstico/controles dentro de la IPA. Resultado en `verification.json`.
- Prueba auditiva en dispositivo físico pendiente: el registro se incorpora para investigar el petardeo/silencio, sin afirmar una corrección acústica.
