# Efectos con el iPhone en silencio · 0.13.4 (1)

El usuario exige que música y efectos suenen con el modo silencio del iPhone. Con 0.13.3, AVAudioPlayer usa playback pero los efectos Web Audio permanecen con la política ambiental predeterminada de WKWebView.

Antes de crear o recuperar el AudioContext de efectos en iOS, se solicita `navigator.audioSession.type = 'playback'`. Se compara el valor antes de escribir para que las comprobaciones periódicas no reconfiguren una sesión ya correcta. Los efectos conservan sus muestras, síntesis, niveles, limitadores, silenciamiento del juego y ciclo de pausa. No se incorpora un audio silencioso en bucle ni se cambia el reproductor musical. El diario incluye el tipo/estado de la sesión web para comprobar el dispositivo.

Fuente primaria: [WebKit 237322, comentario del equipo de audio](https://bugs.webkit.org/show_bug.cgi?id=237322#c6): desde iOS 17, playback permite Web Audio con el interruptor de silencio activado. La sesión nativa del diagnóstico del usuario identifica iOS 26.6 (el user-agent web anuncia 18.7). Si un sistema antiguo no expone la API o la rechaza, no se rompe la inicialización; no se afirma validación del interruptor físico en esos sistemas.

17 pruebas dirigidas de audio y TypeScript correctos. QA nativa ampliada: inicia el juego real, observa la sesión playback antes de construir AudioContext, comprueba cinco WAV decodificados, contexto en marcha, avance temporal y música nativa simultánea. El simulador no verifica acústicamente el interruptor físico.

Por indicación del usuario en el chat principal VORO, este chat entrega la versión conjunta. Se conserva el balance autorizado de los primeros cinco entornos, adaptaciones rápidas restauradas, prioridad de absorción y contador de golpes. La candidata 0.13.4(1) estaba preparada pero no entregada; la subida separada 36726857492 se canceló. Referencia de balance: `design/duration-shorter-2026-09-30/`. Quiet Stacks no se modifica ni se sube desde este encargo.

QA nativa correcta en iPhone 17 Pro simulado, iOS 26.5, fuente `2ac0dbdadaf9b9fc3a328c0e4159f62dfe4d1b33`: `creationType=playback`, `type=playback`, cinco WAV decodificados, AudioContext running con avance temporal y AVAudioPlayer reproduciendo simultáneamente. También pasan silencio del juego, reanudación y segundo plano. Recibo `native-music-simulator.json`. Ejecución: https://github.com/Krazel/Voro/actions/runs/36728512558.

## Entrega verificada

0.13.4(1) disponible en TestFlight interno. CI36728512558 success; API Apple VALID/IN_BETA_TESTING, build `bf393aea-1a2a-40eb-8947-6466b2598b07`, grupo interno `05db8744-bcf3-4c2d-a465-2635012bfeeb`. Recibo `apple-verification.json`. Biblioteca PR-009 actualizada y releída, revisión 323, conservando tracking y marketing.

No se publica App Store ni se envía a revisión externa. La comprobación acústica con el modo silencio físico sigue pendiente. Siguiente prueba: música, ingesta y golpes con modo silencio activado, además del regreso desde segundo plano.

IPA verificado de 349499034 bytes, SHA256 `48051b39ebc439c79c17511312f65c2ea908c6770ca61c2082db611c18d03fae`. El verificador confirma fuente igual a la QA nativa, inclusión del commit de balance, versión/build, reproductor nativo, configuración de efectos, doce canciones y cinco WAV idénticos y ausencia del script de simulador. Recibo `native-music-delivery-verification.json`.
