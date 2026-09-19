# Integración musical local — 19 septiembre 2026

Base canónica 4801d402cc1717e39b7105dc9a4834016e46114f, posterior a TestFlight0.5(2). Único escritor audio/runtime:01a0b934-3ec1-79f1-8029-de6177fd0228. Sin nueva build iOS, CI, push ni publicación.

Las doce composiciones aprobadas de Scott Buckley se integran completas según las asignaciones de app/music.mjs: diez entornos, Life In Silico para menú y The Distant Sun para final/célula superviviente. No se usaron los cuatro MP3 de Voro_Music ni se integraron SFX pendientes. Los dos osciladores continuos anteriores se retiran; los efectos breves existentes permanecen.

## Archivos y derechos

public/music contiene versiones runtime, no copias de originales modificadas en Studio. tracks.json registra SHA256 original y runtime, URL de cada fuente, bytes, mediciones y procesamiento. approved-selection.json conserva aprobación/asignación. license-evidence conserva las páginas de evidencia del autor. CREDITS.md y créditos desplegables en Configuración incluyen doce títulos, autor, fuente individual, CC BY4.0 y modificaciones.

Procesamiento reproducible en prepare.py: dos pasadas loudnorm objetivo−23LUFS/−2dBTP/LRA11; MP3 estéreo44.1kHz160kbps, fades de borde150/200ms. Sin recortar secciones: Meanwhile usa la composición completa aprobada. Resultados íntegramente decodificados:−23.44 a−23.68LUFS; picos verdaderos máximo−5.58dBTP. The Distant Sun pasa de−31.84 a−23.53LUFS. El nivel adicional del mezclador de música es0.42. La medición no equivale a escucha perceptiva.

## Runtime

Dos HTMLMediaElements reutilizables conectados a GainNodes evitan mantener los doce archivos como PCM en memoria. Fundido lineal4s para cambio de destino y repetición anticipada4.5s antes del fin; si cambia de entorno varias veces conserva la última petición con solo dos decks. Fades de borde eliminan saltos de amplitud de corte; no se certifica continuidad musical perceptiva de estas composiciones completas.

Sin autoplay hasta gesto de usuario; se intenta desbloquear ambos elementos y AudioContext desde pointerdown/keydown. Rechazos tratados sin bucles de promesas ni errores no capturados, nuevo gesto permite reintento. Pausa/ajustes/adaptación/mute congelan posición tras rampa80ms; segundo plano/pérdida de foco detienen medios inmediatamente. Destrucción cancela temporizador/libera recursos. El final deja de suspender AudioContext para que The Distant Sun continúe tras la cinemática. Estado musical no modifica progreso.

## Verificación

173/173 tests completos; tests/music.test.mjs cubre asignaciones, gesto, dos decks, cambio, loop, pausa/reanudar, cambios rápidos, rechazo autoplay y destrucción. TypeScript y build Vite local separados correctos. browser.json: Chromium real entrega señal PCM medible, micro→pond con dos medios activos durante fundido, repetición anticipada, pausa de ambos y reanudación desde posición; cero errores JS. Sin escucha auditiva afirmada.

Pendiente escucha humana de dos vueltas y transiciones, iPhone físico/WKWebView, ruta altavoz/Bluetooth/interrupciones; prueba técnica Chromium no acredita validación nativa. Referencias técnicas consultadas: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices y https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay.

TestFlight interno0.5(2), App Store, web e itch.io permanecen sin cambios. UI Desarrollo/Final se implementará a continuación en commit separado; selección de membranas A/B/C/D sigue pendiente.
