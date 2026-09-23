# Sonidos de absorción y pausa — TestFlight 0.6.4(1)

Petición del 23/09: distintos sonidos parecidos al comer, combinados con pitch aleatorio; usar el diseño nuevo al pausar. Esta petición sustituye la selección anterior de la pausa «Respira.» del 22/09 para esta candidata.

El banco anterior contenía tres velocidades del mismo `slime_000`. Ahora hay cinco gestos: el original y cuatro pasajes diferentes de `slime_001`, ambos de Kenney Sci-Fi Sounds (CC0). Se conservan fuentes y licencia en `sources/`. Los cortes tienen entrada/salida suavizada y RMS equivalente; no llevan pitch preaplicado. `scripts/prepare-ingest-bank.py` reproduce la derivación y `audio-manifest.json` conserva cortes, niveles, SHA-256 y correlación tras igualar duraciones.

SfxPlayer recorre los cinco gestos en orden aleatorio, sin repetir al cambiar de ronda; cada reproducción sortea su tono entre −5 y +6 semitonos. Se conserva el límite de tres inicios por segundo. Los errores de carga permiten seguir con las muestras disponibles.

La pausa de jugador reutiliza `design/pause-fidelity-2026-09-21/reference.png` y su placa texturizada, con las tres membranas animadas y el organismo real. Configuración mantiene su arte vigente y su adaptación horizontal. El componente anterior solo queda en el modo de desarrollo explícito. Se mantiene el soporte de movimiento reducido y fallback estático de WebGL, traducciones ES/EN y controles DOM accesibles.

Verificación local: 207 tests, TypeScript y compilación móvil correctos. El verificador del paquete exige los cinco WAV y la placa de pausa. Web Audio decodificó las cinco muestras y programó diez reproducciones en dos rondas completas; `audio-browser.json`. Navegación pausa → configuración → pausa → partida y pausa → menú comprobada. Capturas en 390×844, 375×667, 834×1194 y 1194×834; `ui-browser.json`. Inspección visual de iPhone ES e iPad horizontal EN. Son pruebas de navegador, no escucha ni prueba física de iOS.

El workflow específico `pause-sfx-checkpoint` comprueba decodificación de los cinco WAV, cinco reproducciones y navegación del menú nuevo en iPhone/iPad. Su botón de diagnóstico y entrada directa en pausa son exclusivamente fixtures de CI, ausentes de la distribución. La prueba existente `review-checkpoint` se conserva independiente, con su alcance anterior.

Distribución completada: [35793229429](https://github.com/Krazel/Voro/actions/runs/35793229429), fuente 9381ebc, Apple VALID / IN_BETA_TESTING y pertenencia al grupo interno releída. Build 08104061-7bde-4ee4-81dc-7549d92306d6. IPA SHA-256: 71bb5492172447540fbc99d66782ad3ae9bd5acf0c6bf6bcbd330091219f2c2c. Se inspeccionó el IPA: cinco WAV y placa idénticos a sus fuentes; ningún marcador ni control del fixture.

En [35793203602](https://github.com/Krazel/Voro/actions/runs/35793203602), el caso extendido de iPhone pasó completo (valoración, cinco sonidos, pausa, configuración, continuar, menú y repetición beta). En iPad la automatización intentó retocar un aviso nativo que ya se había cerrado; no se declara esa ejecución aprobada. En [35794255554](https://github.com/Krazel/Voro/actions/runs/35794255554), el caso específico de iPad pasó sonidos y navegación completos. El código de app es idéntico al IPA (solo cambian scripts de QA). Capturas y logs bajo `.studio/marketing/voro/ingest-pause-20260923/`; inspección visual nativa de pausa y configuración en ambos dispositivos. No es una prueba física.

Limitación de automatización: las matrices completas no quedaron verdes en una misma ejecución. El caso específico adicional de iPhone no obtuvo el resultado del botón de diagnóstico inferior; el mismo audio y navegación sí habían pasado en su caso extendido anterior. Se movió ese control de fixture fuera de la zona del indicador de inicio, con área de 44 px y estado inmediato al tocar; este ajuste del harness no tiene nueva validación nativa. No modifica ni aparece en la app distribuida. Se conservan todos los fallos, sin convertirlos en pases ni repetir pruebas de producto que ya tienen evidencia satisfactoria por dispositivo.

`ingest-preview.wav` permite escuchar los cinco gestos sin transposición y una ronda con pitch aleatorio. Es una muestra de los recursos, no una grabación de altavoces físicos.

Selección aprobada expresamente por el usuario el 23/09/2026: «me gusta lo de los sonidos de la ingesta, implementalo». Estos cinco gestos y su pitch aleatorio ya están integrados en la build interna 0.6.4(1) indicada arriba; se mantiene esta selección sin generar otra build por la confirmación.

Trabajo aislado en Voro-store-prep sobre 0.6.3. Los cambios Windows prueba3 de Voro-camera permanecen locales y no se incluyen. App Store 1.0 conserva su candidata seleccionada; no hay envío a App Review.
