# VORO 0.6.8 (1) — TestFlight interno

Autorización del usuario: 24/09/2026, subida de toda la candidata a TestFlight.

- Código exacto: `3b100c63e5e1207a3a6134cf389d79b20c77a345`, rama `main`.
- CI firmado: https://github.com/Krazel/Voro/actions/runs/35926817967 — `success`. Incluye pruebas, compilación iOS, comprobación de assets, firma, exportación, upload y lectura posterior por API.
- App Store Connect: app `6809193565`, build `7a24a645-fe3a-4e22-b588-3905cd439e62`; versión `0.6.8`, compilación `1`, estado `VALID` e `IN_BETA_TESTING`.
- Grupo interno: `VORO Interno`, `05db8744-bcf3-4c2d-a465-2635012bfeeb`, asignado y releído por API.
- IPA: `artifact/testflight-0.6.8-build-1/App.ipa`, 201934357 bytes. SHA-256 `ed6dfc7488bfc51e8b10726db27e5e7b18800a822991ba661bef007a4ebb8702`; calculado localmente e idéntico a `SHA256SUMS.txt` de CI.
- Manifest del archivo: `com.dmkr.voro`, familias iPhone/iPad y cuatro orientaciones iPad.

Incluye un resto pequeño adicional por región en Órbita, desaparición inversa del universo, restauración y reloj del final corregidos para pocos FPS, y sonidos distintos de daño y escudo con el volumen aprobado en `cc01def`. No se duplicó el incremento de Órbita. Evidencia previa de audio y ciclo de vida en `design/hit-audio-2026-09-23/` y `design/finale-lifecycle-2026-09-23/`; QA en simuladores iPhone/iPad, 239 pruebas locales y las pruebas de CI correctas. La escucha final en dispositivo físico corresponde a esta nueva build.

No se ha enviado a revisión de App Store ni publicado en la tienda. El grupo de TestFlight es interno.
