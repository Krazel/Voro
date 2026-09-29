# TestFlight 0.10.1 (1) — pausa y apariencia definitivas

Encargo del usuario: incluir ajustes de daño/adaptación, mejorar visualmente Volver a la pausa, quitar Configuración del panel de pausa, fijar Azul + verde y retirar selector de apariencia, subir a TestFlight.

- Pausa: Continuar y Tus adaptaciones. Configuración sigue disponible desde el icono del juego.
- Volver a la pausa: membrana verde azulada, borde fino luminoso, relieve y flecha. Mismo retorno y foco, sin reanudar la simulación.
- Configuración/Créditos: fondo marino azul con controles y marcos verdes originales. Preferencias visuales antiguas ignoradas; selector y lógica de persistencia retirados. Las cuatro filas restantes se redistribuyen en su marco.
- Incluye 118552b: XP por comida 0.748 (+10% respecto 0.68), daño x0.60 (golpe de referencia 25% → 15%), progreso de adaptación pierde la misma proporción real de biomasa.
- Validación: TypeScript, builds móvil/PC, 48 casos de colección, 6 de pausa/bordes y 6 de menú simplificado correctos, Chromium y WebKit. Comprobada visualmente la captura móvil de configuración y colección. No equivale a una ejecución física en iOS.
- La build incorpora verificación que impide empaquetar el selector de apariencia retirado.
- Capturas y menus-report.json junto a este documento; colección en collection/; marcos en ../pause-frame-parity-2026-09-28/after-simplified-pause/.
- Distribución completada: https://github.com/Krazel/Voro/actions/runs/36565067619, fuente 8816b74b0d4db3056d436d15356e68bcfc399755. Las 272 pruebas del juego y la verificación de recursos iOS pasaron.
- API confirma VALID / IN_BETA_TESTING para build a036c644-058a-43a3-be37-9f1d94b6130f, grupo VORO Interno. Ver app-store-connect.json.
- Biblioteca PR-009 actualizada y releída, revisión 269, 0.10.1(1), con demás tracking y marketing conservados.
- Pendiente de prueba física del usuario en iPhone/iPad. App Store no publicada y ejecutable Windows sin cambios.

- IPA descargada y verificada: artifact/testflight-0.10.1-build-1/Voro-TestFlight-50/App.ipa. SHA-256 2c96ee4409291815a939495d662fc5150836235a4401ea3f9e61a13c4bfec898. CRC, versión, origen, iPhone/iPad y siete recursos originales comprobados; selector retirado ausente y nuevo botón presente. Ver ipa-verification.json.
