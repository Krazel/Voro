# Selector de adaptaciones · candidata local · 19-09-2026

Encargo del cerebro, tarea 01a0b934-3ec1-79f1-8029-de6177fd0228. Propiedad de
selector y escudo acordada con VORO 01a06eb1-17bb-74c1-b4a4-f88225d8e26d.

## Resultado

Tres burbujas en composición triangular: turquesa arriba, ámbar y violeta abajo,
organismo y conexiones luminosas en el centro. Entrada escalonada, flotación,
filamentos giratorios y pulsación suave mientras el mundo está detenido.
Los nombres, ilustraciones, efectos y límites proceden del catálogo del juego,
no de los porcentajes ilustrativos de la referencia. El organismo central es
un ornamento de la selección; no cambia el render del protagonista en partida.

Pulsar una burbuja o activarla con teclado aplica esa adaptación y reanuda el
juego. Sin Omitir, Renovar, cierre por Escape ni cierre al tocar fuera. El motor
ya no expone reroll; los adaptadores antiguos no pueden renovar la oferta.
El flag histórico se sigue leyendo para conservar ofertas antiguas ya renovadas.
Con movimiento reducido las animaciones decorativas se detienen.

La selección presenta siempre tres puestos. Si al final de la progresión solo
quedan uno o dos tipos disponibles, los puestos repiten esas opciones válidas:
no se inventan mejoras, no se sortean otras y nunca se superan los límites.
Al completar todas las mejoras no aparece otra oferta.

## Escudo único

Escudo tiene límite uno. La adquisición queda en las mutaciones persistentes;
consumir la carga o recargar el guardado no lo vuelve a ofrecer. También se
rechaza una segunda adquisición desde una oferta obsoleta.
Guardados anteriores con varios escudos se migran a uno: conservan las demás
mejoras y la experiencia, recuperan las elecciones sobrantes y mantienen la
carga con menor tiempo de recarga. La migración es versionada e idempotente.

## Evidencia revisable

- [Vídeo real del selector y las tres selecciones](adaptation-selection.webm).
- [Captura vertical de 430 × 932](mobile-430.png).
- Capturas adicionales a 320 × 568, 390 × 844, 768 × 1024 y 932 × 430.
- [13 comprobaciones de navegador](browser-checks.json), sin errores de página.
- [Referencia original y huella SHA-256](reference.json).

Grabación sobre la compilación web local, Chromium 153, con un guardado de
prueba en un perfil aislado. No se tocaron partidas del usuario. Las pantallas
bajas permiten desplazarse para acceder a las tres opciones. El vídeo muestra
entrada, reposo animado, elección con puntero y elección con teclado.

Validación final: 124 pruebas Node correctas, TypeScript sin errores, lint
dirigido correcto y compilación de producción Vite correcta. Se conserva el
aviso de bundle superior a 500 kB. Incluye las dos pruebas de la política de
valoración aportadas por VORO. Script de QA conservado junto a esta evidencia.

Candidata en `artifact/adaptation-preview-2026-09-19/`, separada de `mobile-dist`.
Sin nueva versión pública, IPA, subida a TestFlight ni revisión/publicación en
tiendas. Estas pruebas web no acreditan el comportamiento de una build iOS.

`ReviewMilestone` se conectó en page.tsx a petición del propietario; StoreKit y
su verificación nativa corresponden a la tarea VORO, con documentación propia
en `../review-milestone-2026-09-19.md`.
