# VORO · Abisal

Primera escena en 2D de aproximadamente un minuto. Arrastra con ratón para dirigir la célula; en pantallas táctiles el gesto crea un joystick flotante. También admite WASD/flechas y espacio para impulso. Los nutrientes se envuelven y se digieren antes de sumar masa. A los 18 nutrientes se desarrolla una membrana mayor y nuevos flagelos. Se puede seguir nadando o reiniciar.

Canvas2D anima membrana, filamentos, orgánulos, digestión y partículas en tiempo real. El fondo ilustrado es el único recurso de imagen. El audio se sintetiza localmente tras la primera interacción y puede silenciarse. No hay analítica ni datos guardados.

`npm run dev` inicia la vista local. `npm run build` genera el Worker y los recursos. `node --test tests/*.test.mjs` ejecuta las pruebas de simulación y `npx tsc --noEmit` verifica los tipos.

El aspecto es una primera aproximación animada al concepto Abisal, no una reproducción exacta de las láminas conceptuales. La escena termina en la primera evolución; las demás escalas aún no están implementadas. No se ha realizado una prueba en dispositivos móviles físicos. Los comandos WebMCP se registran de forma opcional; no se dispuso de un contexto de navegador compatible para validar esa integración.
