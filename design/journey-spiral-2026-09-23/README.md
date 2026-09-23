# Recorrido final A · Espiral y privacidad — candidata local

**Estado posterior:** el usuario rechazó visualmente A Espiral. Se conserva como
candidata histórica; no distribuir como aprobada. Nueva exploración visual en
la tarea01a0ce4b-784d-7460-9c93-f300aed8936b. Privacidad y pausa Respira siguen válidas.

23-09-2026. Encargo coordinado con la tarea UI 01a0b934-3ec1-79f1-8029-de6177fd0228.
Referencia elegida: `approved.png`, copia intacta de la imagen A Espiral refinada
en `.studio/design/voro/journey-finale-20260923/carta-variantes/` de Studio.
El cambio solicitado en el botón conserva el marco fino azul grisáceo de Respira.

## Implementación

- Sustituye la pantalla intermedia del final por la carta aprobada. Apertura
  **solo manual** desde Recorrido, abajo a la derecha, tras terminar el final.
- Diez etapas en su posición ilustrada. Nombres, estadísticas y botones DOM
  traducidos EN/ES. Datos de `state.eaten`, `state.elapsed` y `state.level`;
  los valores 2345/78/47 de las capturas son fixtures de prueba aislados.
- Renacer exige confirmación; cancelar y volver al silencio conservan la vida.
  No cambia el final de 24 segundos, su animación ni el movimiento ilimitado.
- Portrait sigue la referencia. Móviles cortos permiten desplazar la carta;
  abrirla enfoca su contenedor para no saltar al botón. Horizontal adapta la
  ilustración a la izquierda y texto/estadísticas/acciones a la derecha.
- La ilustración solo carga al abrir el diálogo, sin atlases ni trabajo durante
  el juego. Una animación CSS lenta para el marco; respeta reduced-motion.
- Configuración incorpora Política de privacidad / Privacy policy, sin solapar
  Modo de desarrollo. Destino público comprobado HTTP200 el 23-09-2026:
  https://krazel.github.io/voro-abisal/privacy/ (contenido EN/ES).
- Enlace `_blank` con noopener/noreferrer. Capacitor iOS instalado delega este
  caso a UIApplication.shared.open en WebViewDelegationHandler.swift:334.
  Windows permite exclusivamente ese host+ruta HTTPS mediante policy.cjs;
  otros paths, credenciales, HTTP, queries y hosts parecidos no se admiten.

## Arte

`public/ui/journey/spiral-plate.png`: imagen de producción sin texto preparada
mediante ChatGPT Images integrado a partir de la referencia aprobada. Original:
`C:/Users/dmkra/.codex/generated_images/01a06eb1-17bb-74c1-b4a4-f88225d8e26d/exec-c1048c92-263f-4e10-bc48-d8900d7f5f19.png`.
Prompt completo en `image-prompt.txt`. El marco es el asset existente
`public/ui/cristal/membrane-frame.png`, sin generar un nuevo botón.

## Verificación

- TypeScript sin errores; 13 pruebas de política externa, orden/guardado,
  idiomas y final pasan. Prueba adicional de cuatro estructuras cósmicas pasa.
- `node design/journey-spiral-2026-09-23/check.mjs` contra Vite móvil5208 y PC5206:
  390×844 ES,375×667 EN,1194×834 iPad ES,1280×800 PC EN.
- Enlace visible,44px de alto, sin solapamiento; popup carga página pública.
  Diez etiquetas, datos reales, ninguna apertura automática, cancelar preserva,
  volver al silencio preserva, confirmar reinicia en microscopio. Sin errores JS.
- Capturas `journey-*`, `settings-*` y `checks.json` permiten revisar resultado.
- Prueba de pausa del **EXE real Windows prueba5** independiente en
  `../pause-reference-2026-09-23/`: Respira coincide con CSS/PNG históricos.

**No se ha compilado ni subido una versión nueva.** Este cambio está en fuente
y demo local. No está incluido en Windows prueba5 ni TestFlight0.6.4(1).
No equivale a QA en iPhone/iPad físico. La próxima build verificará que el nuevo
plate está incluido y coincide byte a byte mediante verify-mobile-assets.mjs.
