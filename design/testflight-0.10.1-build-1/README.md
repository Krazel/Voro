# TestFlight 0.10.1 (1) — pausa y apariencia definitivas

Encargo del usuario: incluir ajustes de daño/adaptación, mejorar visualmente Volver a la pausa, quitar Configuración del panel de pausa, fijar Azul + verde y retirar selector de apariencia, subir a TestFlight.

- Pausa: Continuar y Tus adaptaciones. Configuración sigue disponible desde el icono del juego.
- Volver a la pausa: membrana verde azulada, borde fino luminoso, relieve y flecha. Mismo retorno y foco, sin reanudar la simulación.
- Configuración/Créditos: fondo marino azul con controles y marcos verdes originales. Preferencias visuales antiguas ignoradas; selector y lógica de persistencia retirados. Las cuatro filas restantes se redistribuyen en su marco.
- Incluye 118552b: XP por comida 0.748 (+10% respecto 0.68), daño x0.60 (golpe de referencia 25% → 15%), progreso de adaptación pierde la misma proporción real de biomasa.
- Validación: TypeScript, builds móvil/PC, 48 casos de colección, 6 de pausa/bordes y 6 de menú simplificado correctos, Chromium y WebKit. Comprobada visualmente la captura móvil de configuración y colección. No equivale a una ejecución física en iOS.
- La build incorpora verificación que impide empaquetar el selector de apariencia retirado.
- Capturas y menus-report.json junto a este documento; colección en collection/; marcos en ../pause-frame-parity-2026-09-28/after-simplified-pause/.
- Distribución y comprobación por API pendientes de finalizar el workflow.
