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

## Entrega verificada

- Commit binario: `ddb894d7413344010455645e9641a75f0bf7c5d5`.
- CI: [VORO TestFlight 35506392624](https://github.com/Krazel/Voro/actions/runs/35506392624), correcto.
- App Store Connect build ID: `b233dc04-2bb5-4593-a172-4fee7c2c3d96`.
- Estado: `VALID` e `IN_BETA_TESTING`.
- Fecha de carga informada por Apple: `2026-09-20T03:59:39-07:00`.
- Grupo asignado: `VORO Interno`.
- SHA-256 del IPA: `7b750f159c9e1b55da69274e925eae029771518151c14888da880eba9117def7`.

El IPA firmado contiene `AppIcon60x60@2x.png` (120×120, SHA-256 `82382e980ba95f0b7299358bc7977604c5cd286604afb5f7d337cc6a14c48b29`) y `AppIcon76x76@2x~ipad.png` (152×152, SHA-256 `f44a5e82793db6f86b466242b79276c6353777cce398921ee511390072124ae6`). Tras revertir la optimización CgBI de Apple, ambas imágenes coinciden perceptualmente con la fuente «Membrana» reducida: diferencia absoluta media de 0,81–1,23 niveles por canal, correspondiente a la recompresión de Xcode.
