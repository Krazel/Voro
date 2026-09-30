# Recuperación de streaming al activar audio · 0.13.1 (1)

El usuario confirma el 30-09-2026 que, cuando petardea, entrar y salir de Configuración sin reproducir A/B elimina el ruido. Solicita una solución. Se mantiene la autorización existente para corregir audio y entregar TestFlight interno.

## Evidencia recibida y límites

Diagnóstico (4), sesión actual 0.13 (1): 27 muestras, 94 eventos y ninguna escucha A/B. Archivo privado `artifact/audio-recovery-0.13.1/diagnostic-4.json`, 637160 bytes, SHA-256 `e5ae4c87b88e3df02417de679c56f650f78c217adb56d8580ab49d053dcb8853`. La sesión anterior no se mezcla.

Hubo dos salidas/regresos a la aplicación antes de Configuración. Al arranque la música se solicita con el contexto aún suspended; al segundo regreso aparece un playing a 35,147 s con contexto interrupted, antes de la autorización nativa a 35,236 s. Esto no demuestra salida audible ni identifica el mecanismo interno del petardeo, pero confirma actividad del medio durante la reactivación. Los permisos de recuperación del contexto de 0.12.2 se mantienen.

Configuración se abre a 40,081 s y pausa micro a 40,112 s, posición 21,025 s. A 42,567 s vuelve playing en posición 21,024 s, mismo contexto running. El usuario dice que desapareció el petardeo. Se reproduce unos diez segundos más, abre Configuración y exporta a 57,267 s. La preparación automática A/B ocurre al abrir Configuración, aunque no hay reproducciones: por tanto la simple pausa es una hipótesis de recuperación respaldada por su experiencia, no una causa aislada con certeza. La recuperación también concuerda con su observación anterior de mejora al apagar/encender sonido.

## Corrección

En el motor móvil, MusicPlayer incorpora una compuerta de salida independiente del volumen musical. Permite el desbloqueo de medios durante el gesto, pero mantiene la música silenciada al arrancar y tras inactividad/interrupción. Cuando el contexto está running y la canción elegida muestra avance real durante al menos 150 ms de reloj de audio y 80 ms de tiempo del medio, pausa ambos decks. Tras al menos 120 ms de reloj de audio reanuda únicamente la canción elegida, sin seek ni cambio de fuente. Abre la salida con fade de 80 ms solo al resolverse play correctamente.

Así reproduce de forma automática y breve la pausa/reanudación que recupera el sonido en Configuración, después de reactivar el contexto, antes de hacer audible la canción. La duración mínima elegida requiere escucha física; no se afirma que la secuencia garantice resolver un defecto interno de WebKit.

- Elimina el crossfade todavía silenciado de menú a partida al iniciar directamente; no expone la canción de menú durante esa recuperación. Las transiciones posteriores conservan su crossfade.
- No reinicia el AudioContext, no decodifica canciones largas, no añade muestras A/B al arranque ni cambia la ganancia final. La simulación no se pausa artificialmente.
- Mute, Configuración, inactividad y destrucción cancelan recuperaciones pendientes. Cambiar de escena invalida el resultado anterior; promesas tardías no abren la salida.
- No hay reinicios periódicos durante la partida. El ducking de adaptaciones y la pausa normal, después de estabilizar, siguen funcionando sin una nueva recuperación.
- Un play de recuperación rechazado o pendiente ocho segundos de reloj activo mantiene salida cerrada y exige nuevo gesto, sin bucle de reintentos. El reloj suspendido no consume esperas.
- Eventos `stream-recovery-pause/resume/ready`, fase y ganancia de salida quedan en el diagnóstico. No hay grabación acústica ni envío automático.
- La opción se activa para el motor móvil; la distribución PC no recibe esta recuperación.

## Verificación

- 330 pruebas locales correctas; TypeScript y build móvil correctos. Nuevas regresiones: arranque suspended, continuación directa, conservación de posición, foreground, mute/destrucción, promesas tardías, errores/timeout y cambio de escena.
- Tras añadir los campos del diagnóstico, sus ocho pruebas y las siete nuevas pasan de nuevo. CI verifica el estado final completo antes de compilar.
- `scripts/check-music-recovery.mjs`, con Edge en Windows, ejecuta la partida y decodificadores reales. Verifica recuperación inicial y tras suspensión/permisos nativos simulados, una sola secuencia por activación, posición conservada, canción micro, mute y ausencia de errores de página. Evidencia `browser-check.json`.
- En esa comprobación, la pausa inicial transcurre de 1976,4 a 2116,3 ms y reanuda en la misma posición 0,272 s. La segunda conserva 0,734 s. No es una prueba de sonido de iPhone ni una medición del petardeo.
- Sin cambios visuales. Se conserva A/B para investigación, pero no es necesario entrar a Configuración para activar la corrección.

## Entrega

**Disponible en TestFlight interno: 0.13.1 (1), VALID / IN_BETA_TESTING.**

- Fuente `a33c1ab93b3ae0d681fcdb64bacd8758d7f3e917`, [CI 36703693569](https://github.com/Krazel/Voro/actions/runs/36703693569) finalizada correctamente. 330/330 pruebas en macOS, compilación, firma, subida y acceso interno verificados.
- Apple build `f6f12c68-6d8f-4d42-80f6-be83600be43f`, grupo VORO Interno `05db8744-bcf3-4c2d-a465-2635012bfeeb`. API confirma estado y pertenencia. Subida 30-09-2026; consulta final 10:50 UTC / 12:50 Europe/Madrid.
- IPA `349761923` bytes, SHA-256 `3da03326097e1ff972930e274c6ca63b8ef12390f5ff7e823bc8bf140afdda6d`. `verify-delivery.py` comprueba versión/build, commit, familias iPhone/iPad, código nativo de suspensión, recuperación móvil y campos de diagnóstico dentro del paquete; resultado `verification.json`.
- Biblioteca PR-009: revisión 311 durante implementación y **312** al entregar, guardada y releída; marketing, versión pública y tracking conservados. No hay publicación App Store ni TestFlight externo.
- Falta confirmación física del usuario en su iPhone: jugar normalmente, arranque y regreso a la app, sin abrir Configuración para recuperar el audio. La build incorpora la corrección, pero la desaparición del petardeo no se declara comprobada por pruebas de navegador.

Se reutiliza el flujo oficial de [subida de builds de Apple](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/), consultado el 30-09-2026, y el preflight API comprueba que versión/build no existan antes de subir.
