# Inglés y español — 20 septiembre 2026

Encargo: juego completo EN/ES con idioma del dispositivo por defecto.

Implementado en presentación: inicio, controles, pausa, muerte, adaptaciones,
categorías, avisos, diez entornos y transiciones, final, recorrido, créditos,
configuración, accesibilidad y herramientas visuales de desarrollo.
Incluye nombres de todas las especies y descripciones del atlas de animaciones.
Los nombres propios y títulos musicales conservan su grafía.

La primera lengua del dispositivo selecciona español para es/es-*, e inglés
para las demás. Configuración ofrece Automático, Español y English. La elección
se conserva en voro-language-v1, independiente del guardado de progreso. Los
cambios de idioma actualizan HTML lang, texto React, texto canvas y formato de
tamaño. Si el almacenamiento no está disponible, la selección funciona en la
sesión y el selector informa de que no se pudo guardar.

Los IDs de especies, grupos de mejoras, ranuras, partidas, música y reglas no
se traducen. Los colores de Comer/Moverse/Defenderse/Cazar/Rara conservan sus
claves originales. Se preserva el acceso Desarrollo y su preferencia de efe039d.
Info.plist declara en y es; región de desarrollo en. No se subió ninguna build.

## Verificación

- 179/179 pruebas Node correctas, incluidos idioma, progresión, audio y UI mode.
- Catálogo completo comprobado para mejoras, etapas, frases, especies y
  descripciones de animación; claves de gameplay intactas.
- TypeScript correcto y build móvil local en artifact/voro-bilingual-local.
- browser.mjs: Chromium real con en-US, es-ES, es-MX y fr-FR; todos eligen la
  lengua esperada sin errores. Cambio manual, recarga, vuelta a Automático,
  recorrido, créditos, adaptación, muerte y final comprobados.
- La adaptación conserva masa, etapa, mejoras y oferta durante el cambio de
  idioma. La selección sigue operativa y los colores por categoría se conservan.
- Configuración EN/ES a 360, 430 y 768 px sin desbordamiento horizontal.
- Capturas reales en este directorio. No equivalen a QA física de iPhone/iPad.

Pendiente de entrega distribuida: probar en dispositivos iOS y subir una build
por la tarea de distribución cuando corresponda. La versión TestFlight previa
no incluye estos cambios.
