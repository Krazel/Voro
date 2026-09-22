# VORO 0.5.3 (1) — acceso a diagnóstico móvil y fondo completo

El usuario aclara que la lentitud ocurre en el teléfono desde el inicio, no en iPad horizontal ni tras abrir menús. No se ha identificado todavía la causa en su dispositivo.

- Commit del binario: `afe49521fe5e4787722df17b787c57f03478cb17`.
- CI: https://github.com/Krazel/Voro/actions/runs/35714843597
- Destino: mismo grupo TestFlight VORO Interno. Continuación de la entrega autorizada; sin App Review ni publicación App Store.

## Cambios

- Botón visible «Modo de desarrollo» fuera del contenedor de la ilustración, mínimo 44 px y márgenes seguros. Reabre el menú existente de entornos/tamaños, biomasa/adaptaciones, FPS, medición y compartir informe.
- Fondo y composición de Configuración ocupan toda la altura y anchura del teléfono. PC/iPad horizontal extiende el fondo general detrás del panel. Se reutiliza el arte existente.
- Informe añade tamaño lógico, cantidad de chunks y entidades activos para contrastar la carga real de simulación.
- La optimización experimental de regiones rectangulares se retiró tras la aclaración del usuario. Esta entrega no cambia el motor de juego ni afirma resolver la lentitud.

## Validación

- Tipos correctos, 191 pruebas y build móvil correctos.
- Navegación Configuración → Desarrollo → medición → UI final verificada sobre `mobile-dist`, servido en 5207, a 390×844. Capturas junto a este archivo.
- Captura funcional de 30 s: 1797 fotogramas y resumen no vacío en navegador Windows. Esta prueba confirma el funcionamiento del informe, NO el rendimiento en iPhone.
- El menú animado solo se monta con Configuración abierta; no hay evidencia de que su bucle continúe durante la partida.

## Pendiente en teléfono

Actualizar a 0.5.3 (1). Configuración → Modo de desarrollo → Medir una partida de 30 s. Jugar hasta «Medición terminada», volver y elegir «Compartir informe como archivo». Analizar el archivo antes de atribuir la lentitud a CPU, dibujo o carga de recursos. QA físico iPad/sonido/micro/UI/EN-ES/Órbita/StoreKit sigue pendiente.

## Entrega verificada

- CI correcto; 191 tests, firma y comprobaciones del archive aprobadas.
- API oficial: build `6e06c556-6af4-4a04-90b6-79ded9227972`, `VALID` e `IN_BETA_TESTING`, grupo VORO Interno confirmado después de asignarlo.
- IPA 196682547 bytes, SHA-256 local coincide con CI; manifiesto y respuesta API guardados.
- Biblioteca PR-009 actualizada y releída, revisión 117, versión 0.5.3 build 1; tracking y trabajo de marketing conservados.
- El diagnóstico físico sigue pendiente. No se presenta la prueba de navegador como mejora de FPS del iPhone.
