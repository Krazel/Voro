# Rendimiento y TestFlight — 6 septiembre 2026

El usuario reporta lentitud tanto en la IPA 0.3 instalada como en la web fuera
del navegador de Codex. Autorizó crear la ficha y subir a TestFlight. No autorizó
publicar el juego en la tienda. La IPA anterior precede a la interfaz Cristal.

## Corrección compartida web/iOS

- La escena pausada se dibuja una vez y se invalida con resize, carga de assets,
  cambios de estado o reanudación. La interfaz CSS conserva su animación.
- En pantallas táctiles el framebuffer pasa de DPR máximo 2 a 1.5: 43.75 % menos
  píxeles al partir de DPR 2. La cámara, coordenadas táctiles y tamaños no cambian.
- Los animales grandes también reutilizan poses. Fallback a canvas HTML cuando
  no existe OffscreenCanvas. 24 poses por ciclo; el estudio detallado conserva
  su animación continua. Caché LRU limitada a 24 MiB y resoluciones 64/128/192/256.
- Fondo con margen de 128 píxeles: desplazar/escalar el mosaico ya dibujado mientras
  cubra la vista; recomponer cuando se agota el margen o cambian bioma/semilla.
  Se conserva el alineamiento físico arena/agua y la transición entre etapas.

## Evidencia

`render-benchmark.json`: Skia Canvas en Windows, carga sintética de 2880 dibujos
de peces y 600 frames de fondo. No son FPS de iPhone ni prueba física de la IPA.
Animales: 3121 → 934 ms (70 % menos); sin OffscreenCanvas: 4920 → 893 ms.
Fondo: 3693 → 543 ms (85 % menos), 2 recomposiciones para 600 frames de paseo.
La primera propuesta de caché de 256 px para medianos producía expulsiones
continuas y era más lenta; se descartó tras medir, antes de publicar.

78 pruebas existentes y 4 nuevas de caché/pausa/cámara pasan. TypeScript y lint
de archivos modificados pasan. Lint global conserva incidencias preexistentes
en componentes UI del starter, hooks y un import no usado de campaign.test.
Builds web y móvil correctas. La confirmación de fluidez en iPhone queda pendiente.

## Apple

- Ficha creada: **VORO: Abisal**, Apple ID **6809193565**.
- Bundle ID registrado: **com.dmkr.voro**, equipo **B2X6D3A9J9**.
- Español (España), iOS, SKU `voro-ios`.
- «VORO» estaba ocupado; se usó el nombre completo ya establecido del producto.
- https://appstoreconnect.apple.com/apps/6809193565/distribution
- TestFlight comprobado sin compilaciones, ni pruebas internas ni externas activas.
- Candidata nativa **0.4 build 1**; la ficha pública 1.0 sigue en preparación.
- Workflow manual `.github/workflows/testflight.yml`: exige credenciales del
  entorno `app-store-production`, valida perfil/equipo/bundle/caducidad, firma,
  exporta, sube y elimina material temporal. Solo main; no se ejecuta en PRs.
- Firma y credencial de subida aún no configuradas en VORO. A petición del usuario
  se consultó al cerebro de Studio el mecanismo protegido que debe reutilizarse.

Ficha central PR-009 actualizada y verificada en revisión 11 con el alta de Apple.
No confundir alta con publicación, workflow preparado con build enviada, ni
benchmark local con validación en dispositivo.
