# Pausa nativa y recuperación del audio · 0.12.1 (1)

Implementación autorizada el 29-09-2026, a partir del diagnóstico físico de 0.12 y el relato de música que continúa al salir y petardeo al regresar. Responsable: chat de audio `01a0ee97-7b09-79b0-96d7-1d8a7b1aa465`. La entrega anterior sigue siendo 0.12 (1) hasta verificar TestFlight.

## Cambio

- El aviso nativo de pérdida de actividad pausa los medios y bloquea su reproducción en WKWebView, sin esperar a `document.hidden`. El bloqueo se levanta al recuperar actividad; el motor recibe permiso para reanudar una vez que WebKit confirma esa operación.
- El motor pausa la partida, cierra el paso a efectos/música y evita intentos de resume mientras el permiso nativo está cerrado. Foco web y visibilidad no pueden abrirlo por su cuenta. Sigue respetando sonido desactivado, Configuración, pausa y reanudación especial del final.
- Las generaciones nativas descartan respuestas tardías de operaciones anteriores. El receptor web ordena por secuencia y nunca ejecuta acciones a partir del historial antiguo de diagnóstico.
- SfxPlayer queda como único responsable del resume del AudioContext compartido del motor. MusicPlayer independiente conserva su comportamiento predeterminado. Foco/visibilidad repetidos no duplican la recuperación del mismo regreso.
- El diagnóstico conserva el permiso nativo y el estado de bloqueo/liberación. Se filtran los cambios de foco de controles para conservar más historial útil. El archivo sigue siendo local y compartido voluntariamente.
- La ausencia del plugin o un error inicial de consulta conserva el comportamiento web como alternativa; no deja permanentemente mudo el juego por un diagnóstico no disponible.

La API [setAllMediaPlaybackSuspended](https://developer.apple.com/documentation/webkit/wkwebview/setallmediaplaybacksuspended(_:completionhandler:)) de Apple impide reanudar medios hasta liberar el bloqueo. Disponible desde iOS 15, que coincide con el mínimo del proyecto. También se pausa explícitamente para que liberar el bloqueo no reproduzca una partida pausada. No se cambia la categoría ni se activa/desactiva AVAudioSession.

## Verificación

- **310/310** pruebas locales correctas; TypeScript y build móvil con recursos verificados.
- Cinco regresiones nuevas: orden nativo-inactivo → interrupted → oculto → foco temprano → permiso nativo; orden inverso de visibilidad/actividad con sonido activado o desactivado; nueva salida con resume pendiente; respuestas e historial antiguos; limpieza/fallo del plugin.
- Pruebas del motor usan AudioContext y elementos de medios simulados, ejecutando los listeners reales. No son mediciones acústicas ni una simulación del código Swift.
- Navegador: Edge y WebKit, teléfono ES y tableta EN; bloqueo inmediato del motor antes de ocultarse, foco sin permiso, pausa conservada, exportación y sesión anterior. `browser-check.json`. WebKit de Playwright en Windows no dispone de AudioContext; su cobertura es de interfaz y control, no reproducción física.
- Compilación Swift, firma y distribución pendientes de CI. La desaparición del petardeo y la latencia audible de parada requieren comprobar esta build en el iPhone afectado.

## Comprobación del usuario

Instalar 0.12.1 (1), jugar, salir de la app y volver varias veces. La música debe pararse al salir, y la partida debe continuar pausada al regresar hasta pulsar Continuar. Comprobar también con sonido desactivado. Si reaparece el petardeo o el silencio, compartir pronto el diagnóstico desde Configuración; el nuevo registro permitirá comparar el permiso nativo con la reproducción.
