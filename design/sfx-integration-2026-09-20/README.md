# Integración de efectos seleccionados — 2026-09-20

Se integraron las tres variantes aprobadas de `slime_000.ogg` en el inicio de cada absorción:

- `public/sfx/ingest-1.wav`: `a08a6d5d105656e6fb9a67f84ea0c1fdf01da913477b7194b3919a4738889e9a`
- `public/sfx/ingest-2.wav`: `fc112a6dd84673c412af36a4e44b016335c4cee1b41ea3626eea8a262b37da92`
- `public/sfx/ingest-3.wav`: `5626fddc344c178e81c7e8deae7bf0625fa6fc996493548351a8c2af712337e3`

La reproducción evita repetir consecutivamente una variante y admite como máximo tres inicios por segundo. Al terminar la digestión no se reproduce ningún efecto, conforme a la selección aprobada.

## Verificación

- Suite completa: 181 pruebas superadas.
- TypeScript: `npx tsc --noEmit` superado.
- Compilación móvil: `npm run build:mobile` superada, incluida la verificación de recursos.
- Chromium: los tres WAV se descargaron y decodificaron correctamente a 44,1 kHz, mono.
- Integridad: los SHA-256 coinciden con `.studio/audio-selection/voro/sfx/manifest.json`.

La escucha perceptiva final queda para una prueba en dispositivo o navegador con salida de audio. Esta integración no crea ni sube una nueva build a TestFlight.
