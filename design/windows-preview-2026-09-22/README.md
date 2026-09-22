# Windows 0.6.2 — prueba 1

Ejecutable portable preparado a petición del usuario para probar la futura versión de pago de itch.io. No publicado en itch.io ni Steam. TestFlight 0.6.2 (1) permanece sin cambios.

Entrega: `Juegos/Voro/Entregas/Windows/0.6.2-prueba1/` (enlace a `Voro-camera/artifact/windows/0.6.2-preview.1`). ZIP con carpeta VORO y ejecutable, recursos y licencias de Electron. Sin firma digital.

Verificación del ejecutable real, no solo de una página en navegador:

- Arranque con recursos empaquetados, sin servidor; origen local estable `voro://game`.
- UI aprobada: configuración y partida fotografiadas en `settings.png` y `gameplay.png`.
- Inicio, flechas, impulso, pausa y pantalla completa F11.
- 206 archivos de juego leídos: sin peticiones externas ni errores JS/HTTP.
- Audio WAV decodificado y reproducido con AudioContext en estado running. Esto comprueba la ruta de reproducción, no la escucha humana ni todos los dispositivos de audio.
- Partida e idioma conservados al cerrar y volver a abrir, usando un perfil de prueba separado.
- Canvas y composición por GPU habilitados en NVIDIA RTX 3080 Ti. La primera lectura prematura dio software; se releyó después de inicializar gráficos, sin forzar flags ni desactivar protecciones.
- 204 tests existentes, 3 tests nuevos de acceso a archivos/enlaces y TypeScript correctos.
- ZIP comprobado por CRC y SHA-256 en `manifest.json`.

Pendiente: valoración del usuario, prueba con mando físico, otros equipos/minimos de hardware, firma y preparación final de tienda. No se ha cambiado la cámara, el tamaño del protagonista ni los assets del juego.
