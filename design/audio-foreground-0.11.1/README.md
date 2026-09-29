# 0.11.1 (1) — recuperar audio tras segundo plano

El usuario confirma silencio total (música y efectos) al salir un rato de la app y volver a Continuar. El informe anterior midió bien la reproducción activa; no validó este ciclo de vida. Daño y balance intactos.

Correcciones:
- Visibilidad/foco/pageshow restauran el estado de foco y vuelven a intentar el contexto previamente creado, sin despausar la partida.
- Continuar/acciones de juego y gesto explícito reintentan la reanudación incluso si la petición enviada en segundo plano quedó pendiente.
- Una promesa antigua no puede borrar la referencia de un intento nuevo. Reintentos sin gesto siguen limitados.
- La música activa recupera un elemento que el sistema haya pausado, conservando posición; no reinicia pistas sanas ni reintenta autoplay rechazado sin gesto.
- El mute y la pausa conservan prioridad. No cambian ganancias, pitch, mezcla, latencia ni daño.

Verificación inicial: 33 pruebas focalizadas correctas; TypeScript correcto. Compilación móvil aislada y assets verificados. Pendiente suite completa y CI.

Referencias consultadas:
https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state
https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/

Límite: escenarios de interrupción reproducidos con estados/peticiones controlados, no con un iPhone físico. Tras TestFlight, probar bloquear/desbloquear y salir varios minutos, volver y Continuar, con sonido activado y con mute. No afirmar que se ha reproducido la causa exacta del dispositivo.

Suite completa: 289 pruebas correctas en 141 s. Tipos y paquete móvil correctos. CI pendiente.

## TestFlight confirmado

CI https://github.com/Krazel/Voro/actions/runs/36596943164 correcta; fuente 808c05637026ce99d2f04a204158a03e608c2693. 286 tests de juego en macOS (más 3 de Windows en local). Apple build 749b51fd-f2bf-49b8-88b8-1d226ee04a52: VALID/IN_BETA_TESTING, grupo VORO Interno asignado y releído por API. 0.11.1 (1) disponible para instalar.

Biblioteca PR-009 revisión279 guardada/releída, versión0.11.1, marketing y tracking conservados. Pendiente comprobación física del usuario; no se afirma arreglado en su dispositivo antes de probar.
