# Ciudad: marcha frontal y trasera

Correcciones del 1 de octubre de 2026 según revisión del usuario.

| Personaje | Hacia abajo / frente | Hacia arriba / espalda |
|---|---|---|
| Civil | Conservado | Nuevo |
| Soldado | Nuevo | Conservado |
| Unidad con escudo | Nuevo | Nuevo |
| Soldado pesado | Antena fija | Nuevo |
| Peatona con bolso | Nuevo | Nuevo |
| Trabajador | Conservado | Conservado |
| Corredora | Conservado | Conservado |
| Persona con bastón | Conservado | Nuevo |
| Oficinista | Nuevo | Maletín fijo |
| Repartidor | Conservado | Conservado |

Los diez ciclos laterales y nueve vistas verticales aprobadas se conservan píxel a píxel. Se sustituyen 22 poses de once vistas. Todas mantienen dos contactos por ciclo y la cadencia original: no se añaden deformaciones, dibujos ni texturas por personaje en tiempo de ejecución. Los atlas conservan sus dimensiones. Cada pose queda registrada por coronilla y suelo, sin desplazamiento adicional del cuerpo al animar.

Arte generado/editado con la herramienta integrada ChatGPT Images. Prompts en `prompts.json`, refinamientos en `refinement-prompts.json` y `heavy-final-prompt.txt`. Referencias originales en `references/`. Fuentes finales y selección exacta de celdas en `export-audit.json`; las propuestas iniciales con zancadas repetidas no se usan. Las hojas de cuatro propuestas se reducen a los dos apoyos realmente distintos, sin espejar accesorios.

Reproducción: `scripts/export-city-vertical-walks.mjs`, con VORO_CANVAS_RUNTIME apuntando al runtime de canvas. El exportador parte de `before-art.json`, conserva las vistas aprobadas y cambia solo las celdas señaladas.

Verificado:
- 10 pruebas de ciudad correctas: geometría, orientación, registro, preservación y jugabilidad.
- `scripts/check-city-walks.mjs`: píxeles de todas las vistas aprobadas idénticos; centrado y suelo comprobados en todos los fotogramas.
- Compilaciones móvil y PC correctas; sin aumento de las dimensiones de texturas.
- Galería real comprobada en navegador, con cambio de pose y todos los personajes cargados. Captura `preview.png`.

Revisión visual: `../city-walk-2026-10-01/vertical.html`. Integrado en la candidata local; pendiente de aceptación visual del usuario. No se ha subido una nueva build a TestFlight por este cambio.

## Segunda revisión: pantorrillas de los soldados

El usuario pidió corregir únicamente el soldado de frente y el pesado de espaldas. Se sustituyen sus cuatro contactos por zancadas bajas, con pantorrillas completas y menor elevación del pie. Fuentes finales: `city-1-front-natural-v4.png` y `city-3-back-natural-v2.png`. Prompts de ChatGPT Images en `lower-leg-prompts.json` y `lower-leg-refinements.json`. Se mantiene la antena, arma y correas en el mismo lado. El resto de vistas queda idéntico a `before-lower-legs.json`, comprobado píxel a píxel por el verificador. Los nuevos atlas usan sufijo `vertical-v2` y revisión de caché 2.
