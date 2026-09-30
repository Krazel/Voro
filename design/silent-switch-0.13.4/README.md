# Efectos con el iPhone en silencio · 0.13.4 (1)

El usuario exige que música y efectos suenen con el modo silencio del iPhone. Con 0.13.3, AVAudioPlayer usa playback pero los efectos Web Audio permanecen con la política ambiental predeterminada de WKWebView.

Antes de crear o recuperar el AudioContext de efectos en iOS, se solicita `navigator.audioSession.type = 'playback'`. Se compara el valor antes de escribir para que las comprobaciones periódicas no reconfiguren una sesión ya correcta. Los efectos conservan sus muestras, síntesis, niveles, limitadores, silenciamiento del juego y ciclo de pausa. No se incorpora un audio silencioso en bucle ni se cambia el reproductor musical. El diario incluye el tipo/estado de la sesión web para comprobar el dispositivo.

Fuente primaria: [WebKit 237322, comentario del equipo de audio](https://bugs.webkit.org/show_bug.cgi?id=237322#c6): desde iOS 17, playback permite Web Audio con el interruptor de silencio activado. El diagnóstico aportado por el usuario identifica iOS 18.7. Si un sistema antiguo no expone la API o la rechaza, no se rompe la inicialización; no se afirma validación del interruptor físico en esos sistemas.

17 pruebas dirigidas de audio y TypeScript correctos. QA nativa ampliada: inicia el juego real, observa la sesión playback antes de construir AudioContext, comprueba cinco WAV decodificados, contexto en marcha, avance temporal y música nativa simultánea. El simulador no verifica acústicamente el interruptor físico.

Por indicación del usuario en el chat principal VORO, este chat entrega la versión conjunta. Se conserva el balance autorizado de los primeros cinco entornos, adaptaciones rápidas restauradas, prioridad de absorción y contador de golpes. La candidata 0.13.4(1) estaba preparada pero no entregada; la subida separada 36726857492 se canceló. Referencia de balance: `design/duration-shorter-2026-09-30/`. Quiet Stacks no se modifica ni se sube desde este encargo.

Entrega pendiente de CI y API. No se publica App Store ni se modifica marketing.
