# Entrega: VORO 0.7 (1)

La build firmada está disponible en **TestFlight interno** para iPhone y iPad. Apple confirmó `processingState: VALID` e `internalBuildState: IN_BETA_TESTING` para el grupo `VORO Interno`. No se ha enviado a revisión ni publicado en App Store.

- Fuente: commit `4f8f422e09c3f6dcf8c2923bd3b3e79e408ea391`.
- CI: https://github.com/Krazel/Voro/actions/runs/35995788010 (correcta).
- App Store Connect: app `6809193565`, build `1dab7b1b-2fe9-4964-87b3-d7cbaa75df06`, bundle `com.dmkr.voro`.
- Artefacto firmado: `artifacts/testflight-0.7-build-1/App.ipa`, SHA-256 `6afd5acbc871aadbee4858a08fa1539bc7276baff03af33690e9e574b3c9fc3e` (verificado localmente contra el manifiesto de CI).

Incluye las tres apariencias de Configuración con preferencia persistente y traducciones ES/EN, así como un aumento de nivel de los efectos. El daño suena con más presencia en frecuencias que reproducen mejor los altavoces de teléfono; la música conserva su mezcla. Pasaron 239 pruebas automáticas, compilación móvil, comprobación TypeScript y la revisión de 12 capturas de navegador. Las capturas no sustituyen una escucha ni una revisión visual en el dispositivo físico.

El primer intento de CI `35995406580` se canceló durante checkout antes de subir la build para incorporar el ajuste de sonido. Solo `35995788010` fue enviado a Apple como 0.7 (1).
