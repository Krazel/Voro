# Órbita y desaparición continua — 23 septiembre 2026

Petición: satélites de tamaños más variados, Tierra mayor, aviso orbital solo
al comienzo y desaparición continua del protagonista hasta una luz diminuta.

- Tierra: radio 620 → 900 (+45,2 %). La zona libre y el límite exterior se
  desplazan con su nuevo borde, conservando 580/930 unidades de separación.
- Satélites: radios individuales 16,5–96, antes 16,8–57,6. No cambia la densidad.
  La Tierra sigue siendo, con diferencia, el mayor elemento orbital.
- Aviso: visible durante cinco segundos; se desvanece hasta el segundo ocho
  del entorno. El tiempo se conserva al guardar y cargar. Durante la absorción
  sigue apareciendo su mensaje específico.
- Final: absorción hasta 8 s; desvanecimiento inmediato de membrana 8–11,6 s
  mientras el núcleo original se contrae 8–13 s. No se superpone otra estrella.
  Oscuridad completa 13–18 s; aparición aprobada 18–30,5 s. Duración total 31 s.
  Música se desvanece durante la extinción, cinco segundos. Sin nuevas texturas
  ni superficies intermedias por fotograma. El dibujo ordinario conserva su aspecto.

Verificado: 227 tests, TypeScript y build móvil con comprobación de assets.
Pruebas web en 390×844, PC 1280×800 y navegador con identidad iPad 1194×834;
sin errores JavaScript. `tablet-qa.json` sustituye la pasada inicial a tamaño
tablet sin identidad iPad de `web-qa.json`. Capturas inspeccionadas y secuencia
grabada en `continuous-fade.webm`; son pruebas de navegador, no de dispositivo iOS.

Disponible en la demo local :5206; esto todavía NO cambia TestFlight.
TestFlight entregado sigue siendo 0.6.5 (3), fuente 17c1d5e.
Reproducción: `scripts/check-orbit-soft-ending.mjs`, usando el runtime Playwright
configurado con VORO_PLAYWRIGHT_RUNTIME y servidores locales :5208 / :5206.
