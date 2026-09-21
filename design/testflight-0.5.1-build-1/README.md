# VORO 0.5.1 (1) — TestFlight interno

Subida autorizada expresamente por el usuario el 21 de septiembre de 2026.

- Candidata de código: `8477e76fe41f468680b3aeeb62b3ba8ab73f3a36`.
- Commit del binario: `76f124d0f3d62ea276a442d52a8e4f078d76e45e`.
- Versión de correcciones 0.5.1; primera build de esa versión: 1.
- Consulta API de numeración: [35630000574](https://github.com/Krazel/Voro/actions/runs/35630000574), ninguna build existente en esa versión (`build-number.json`).
- Compilación, firma y subida: [35630156408](https://github.com/Krazel/Voro/actions/runs/35630156408).
- Destino: VORO Interno, grupo `05db8744-bcf3-4c2d-a465-2635012bfeeb`.
- Bundle: `com.dmkr.voro`; app Apple: `6809193565`.

Incluye correcciones de audio, animación de habitantes grandes del microscopio, pausa basada en la referencia aprobada, menor frecuencia de adaptaciones (+25% XP requerida), un alimento pequeño adicional en Charca, zoom gradual y selección accidental. Conserva EN/ES y el icono Membrana. Evidencia detallada: [regresiones](../regressions-2026-09-21/README.md).

Las 187 pruebas pasan en local; el workflow vuelve a ejecutar la suite, reconstruye los recursos iOS y verifica la firma. La entrega no acredita rendimiento físico: la ralentización fuerte de audio y la animación deben comprobarse en el iPhone con esta build. No incluye la demo horizontal de PC ni distribución externa, App Review o publicación en App Store.

## Entrega verificada

- CI correcto; 187 pruebas correctas también en el servidor.
- Apple build ID: `fa742dd5-6a83-43f1-b924-4359c81801f7`.
- Estado releído por API: `VALID` e `IN_BETA_TESTING`, grupo `VORO Interno` asignado.
- Fecha de carga Apple: `2026-09-21T10:14:39-07:00`.
- Manifiesto firmado, respuesta API y SHA-256 conservados junto a este documento.
- Biblioteca D1: PR-009, revisión 105 guardada y releída, versión 0.5.1 build 1. Se conservan tracking y encargo PC independiente.
