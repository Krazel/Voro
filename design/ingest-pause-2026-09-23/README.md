# Sonidos de absorción y pausa — candidata 0.6.4(1)

Petición del 23/09: distintos sonidos parecidos al comer, combinados con pitch aleatorio; usar el diseño nuevo al pausar. Esta petición sustituye la selección anterior de la pausa «Respira.» del 22/09 para esta candidata.

La banca anterior contenía tres velocidades del mismo `slime_000`. Ahora hay cinco gestos: el original y cuatro pasajes diferentes de `slime_001`, ambos de Kenney Sci-Fi Sounds (CC0). Se conservan fuentes y licencia en `sources/`. Los cortes tienen entrada/salida suavizada y RMS equivalente; no llevan pitch preaplicado. `scripts/prepare-ingest-bank.py` reproduce la derivación y `audio-manifest.json` conserva cortes, niveles, SHA-256 y correlación tras igualar duraciones.

SfxPlayer recorre los cinco gestos en orden aleatorio, sin repetir al cambiar de ronda; cada reproducción sortea su tono entre −5 y +6 semitonos. Se conserva el límite de tres inicios por segundo. Los errores de carga permiten seguir con las muestras disponibles.

La pausa de jugador reutiliza `design/pause-fidelity-2026-09-21/reference.png` y su placa texturizada, con las tres membranas animadas y el organismo real. Configuración mantiene su arte vigente y su adaptación horizontal. El componente anterior solo queda en el modo de desarrollo explícito. Se mantiene el soporte de movimiento reducido y fallback estático de WebGL, traducciones ES/EN y controles DOM accesibles.

Verificación local: 207 tests, TypeScript y compilación móvil correctos. El verificador del paquete exige los cinco WAV y la placa de pausa. Web Audio decodificó las cinco muestras y programó diez reproducciones en dos rondas completas; `audio-browser.json`. Navegación pausa → configuración → pausa → partida y pausa → menú comprobada. Capturas en 390×844, 375×667, 834×1194 y 1194×834; `ui-browser.json`. Inspección visual de iPhone ES e iPad horizontal EN. Son pruebas de navegador, no escucha ni prueba física de iOS.

El workflow `review-checkpoint` amplía la prueba nativa existente con decodificación de los cinco WAV, cinco reproducciones y navegación del menú nuevo en iPhone/iPad. Su botón de diagnóstico y salto de entorno son exclusivamente fixtures de CI, ausentes de la distribución.

Trabajo aislado en Voro-store-prep sobre 0.6.3. Los cambios Windows prueba3 de Voro-camera permanecen locales y no se incluyen. App Store 1.0 conserva su candidata seleccionada; no hay envío a App Review.
