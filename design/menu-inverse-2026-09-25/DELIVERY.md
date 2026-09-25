# Entrega: VORO 0.8 (1)

El cuarto tema «Azul + verde» está disponible en **TestFlight interno** para iPhone y iPad. App Store Connect verificó `processingState: VALID` e `internalBuildState: IN_BETA_TESTING` en el grupo `VORO Interno`. No se ha enviado a revisión ni publicado en App Store.

- Fuente: commit `c319c18af6bcdc43d80f287ee7ee0a13d0904368`.
- CI firmada y subida: https://github.com/Krazel/Voro/actions/runs/36161465881 (correcta).
- Apple app `6809193565`, build `e0c222fb-8e58-4b7f-91eb-57c8f3f8de92`, bundle `com.dmkr.voro`; grupo interno `05db8744-bcf3-4c2d-a465-2635012bfeeb`.
- Artefacto firmado: `artifacts/testflight-0.8-build-1/App.ipa`, 201935570 bytes, SHA-256 `04b738cdaa8ca30d9a114198583edf7f8fe7c96b9075e656e159172aa41f0611`, comprobado localmente contra el manifiesto de CI.

Se conservaron los tres temas anteriores y la preferencia guardada. La cuarta opción aplica el fondo azul de Azul orgánico y deja verdes los marcos y controles de Actual; funciona en ES/EN. Pasaron 239 pruebas automáticas, TypeScript, build móvil y de PC. `qa.json` conserva 16 verificaciones visuales/de interacción en navegador: cuatro temas × iPhone/iPad × ES/EN, con restauración de cada tema, controles y navegación. Las capturas son emulaciones de navegador, no fotos físicas de la IPA; sigue pendiente la revisión visual en dispositivo real.

La consulta oficial previa confirmó 0.7 (1) en pruebas internas y 0.8 (1) libre. La publicación comercial y la revisión de App Store permanecen fuera de esta entrega.
