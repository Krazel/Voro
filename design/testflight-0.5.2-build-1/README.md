# VORO 0.5.2 (1) — iPad y pausa aprobada

Subida a TestFlight autorizada expresamente por el usuario el 22/09/2026.

- Commit del binario: `34e4c37254a079642dc77950f44568afbf802841`.
- CI: https://github.com/Krazel/Voro/actions/runs/35672260226
- Bundle `com.dmkr.voro`, app Apple `6809193565`.
- Destino existente: VORO Interno (`05db8744-bcf3-4c2d-a465-2635012bfeeb`).

Restaura pausa A «Respira» también en iPhone. Integra el campo de juego ancho en iPad horizontal y adapta Configuración, Recorrido y Créditos usando el arte aprobado. iPhone e iPad vertical mantienen su composición. No incluye publicación App Store ni pruebas externas.

## Validación

- Tipos correctos y 191 pruebas locales correctas.
- Build móvil, sincronización Capacitor y comparación de assets copiados correctas.
- CI repite las pruebas; verifica la firma, versión/build, familia iPhone+iPad, cuatro orientaciones iPad y assets dentro del archive firmado antes de subir.
- Rotación simulada por prueba de motor conserva progreso, posición y cámara. UI comprobada en navegador a 1280×720, 1194×834, 800×600 y 390×844; no son pruebas físicas iPad.
- Evidencia visual: `../landscape-settings-2026-09-22/` y `../pause-a-2026-09-22/`.

## Prueba en dispositivo pendiente

Actualizar VORO desde TestFlight a 0.5.2 (1), manteniendo la instalación y su partida. En iPad, desactivar el bloqueo de orientación y abrir a pantalla completa. Verificar ambas orientaciones horizontales, vertical y cambio de orientación con Configuración/Recorrido/Créditos abiertos; comprobar controles táctiles, pausa, reanudación, audio y rendimiento. iPhone conserva el modo vertical y debe mostrar pausa A.

## Entrega verificada

- CI completado correctamente, incluidas las 191 pruebas y comprobaciones del archive firmado.
- Apple build `e66209ce-f417-42bc-b716-a51564e86b62`, estado releído por API `VALID` e `IN_BETA_TESTING`, grupo VORO Interno asignado.
- IPA de 196682352 bytes; SHA-256 local coincide con el calculado en CI. Manifiesto y respuesta API conservados junto a este documento.
- Biblioteca PR-009 actualizada y releída, revisión 112: 0.5.2 (1). Tracking y encargo independiente del tráiler PC preservados.
- Las pruebas físicas indicadas arriba siguen pendientes; no se ha publicado en App Store.
