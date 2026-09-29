# TestFlight 0.10 (1) — colección de adaptaciones

Solicitud del usuario: integrar la colección aprobada y distribuirla por TestFlight.

- Código: bb5bf8d9ddc2141e007bc0aff7ca5c4d224c2918.
- CI: https://github.com/Krazel/Voro/actions/runs/36500811685
- Entrada: Pausa → Tus adaptaciones. Solo adquiridas, agrupadas por tipo y contador; detalle acumulado, castellano/inglés.
- Arte original de las adaptaciones, centrado óptico individual; fondo y cápsulas orgánicas D3 aprobados.
- Sin cambios de equilibrio ni nueva animación por fotograma durante el juego.
- Validación local: 270 pruebas correctas. Verificación visual y funcional previa: 48 escenarios Chromium/WebKit, compilaciones móvil/PC y TypeScript correctos; seis escenarios de paridad de marcos de pausa.
- Evidencia visual: ../owned-adaptations-ui-2026-09-29/implementation/.
- Distribución completada: API de Apple confirma VALID e IN_BETA_TESTING en el grupo existente VORO Interno. Build ID: f1d5275e-af1a-4b88-b784-1532b5ab3065. Ver app-store-connect.json.
- IPA descargada: artifact/testflight-0.10-build-1/Voro-TestFlight-49/App.ipa. SHA-256 a70b64ce4984e1599086369d773ebdb4bf65866d9175269ec6e5bacaf552cf86; coincide con CI. CRC de todos sus archivos correcto.
- Info.plist confirma 0.10 (1), iPhone/iPad y fuente bb5bf8d. Los cuatro assets de colección/atlas son idénticos byte a byte a los aprobados; código de colección incluido y arte descartado ausente. Ver ipa-verification.json.
- Biblioteca PR-009 actualizada y releída: revisión 265, TestFlight interno 0.10 (1), demás tracking y contexto de marketing conservados.
- Sigue pendiente la prueba física del usuario en iPhone/iPad. No hay publicación en App Store ni nuevo ejecutable Windows.
