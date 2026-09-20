# VORO 0.5 (3) — candidata TestFlight interna

## Snapshot

- Base congelada: `3dba747e8d2eae9766301b8ca708c7840a4d312a`.
- Icono elegido: variante 4 «Membrana».
- Fuente: `.studio/marketing/voro/icono-actual-2026-09-20/04-membrana.png`.
- SHA-256 fuente: `714f8582f177b0817407837a62fca8c13211f74c8b1bbd411e28203c43669201`.
- Asset iOS derivado: `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`.
- SHA-256 asset iOS: `0c5c6d6c6139145f78dace415961362718c59e94fd800ee2b6561b2173058fa7`.
- Transformación: reducción Lanczos de 1254×1254 RGB a 1024×1024 RGB, sin transparencia.

## Numeración y alcance

- Consulta oficial de App Store Connect: [workflow 35506265462](https://github.com/Krazel/Voro/actions/runs/35506265462).
- Builds existentes para 0.5: 1 y 2; siguiente disponible: 3.
- Grupo de destino: `VORO Interno` (`05db8744-bcf3-4c2d-a465-2635012bfeeb`).
- No incluye TestFlight externo, App Review ni publicación en App Store.

## Validación local previa

- 183 pruebas superadas.
- `npx tsc --noEmit` superado.
- `npm run build:mobile` superado, incluida la verificación de recursos.
- Catálogo iOS apunta al icono universal de 1024×1024.

La comprobación final del icono dentro del IPA, su firma, carga, procesamiento y asignación interna se registra con el resultado del workflow de entrega.
