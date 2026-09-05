# VORO · Abisal

Primera campaña completa de un juego 2D: empieza como organismo unicelular, absorbe comida, crece y acaba devorando Gaia. Se comparte el mismo motor entre la web y la aplicación iOS, con recursos incluidos y sin servidor de juego.

## Campaña y controles

Seis entornos: gota de agua, estanque, bosque húmedo, ciudad costera, órbita y sistema planetario. Cada entorno ofrece alimento de tres tamaños y aspecto propio; los cazadores persiguen a organismos pequeños y huyen de quienes pueden absorberlos. La última etapa exige digerir Gaia, además de alcanzar suficiente biomasa.

Al superar una etapa eliges velocidad, resistencia o digestión. Las mutaciones se acumulan. El daño resta biomasa real, encoge al organismo y le da dos segundos para escapar. El área corporal es proporcional a la biomasa; la cámara se aleja suavemente al crecer. Las transiciones entre escalas representan generaciones de evolución.

- Táctil: arrastra para mover el joystick flotante y pulsa Impulso.
- PC: arrastra el ratón, o usa WASD/flechas y espacio.
- Mando: stick izquierdo para moverte, A para impulso, Start para pausa. La navegación por menús aún usa ratón/táctil/teclado.
- Configuración: sonido, recorrido, mutaciones y Volver a nacer. El reinicio completo exige confirmación dentro del juego.
- Al morir: reintenta la etapa conservando etapas y mutaciones anteriores.

El guardado local conserva etapa, posición, biomasa, tiempo, absorciones, mutaciones y final. Se guarda cada cinco segundos, al pausar y al ocultar la página. Al cargar se regenera el alimento del entorno y se conceden dos segundos de protección. No hay sincronización entre dispositivos ni analítica. Si el almacenamiento no está disponible, Configuración lo indica.

## Animación y recursos

Canvas2D dibuja la membrana con 100 nodos elásticos, núcleo con inercia, orgánulos, flagelos y digestión por fases. Los alimentos conservan su forma durante la absorción y aportan biomasa al terminar. Los atlas pintados incluyen seis fondos, seleccionados mediante rectángulos de origen; la nebulosa aparece al completar la campaña. Los prompts se conservan en art/. El sonido se sintetiza después de una interacción.

## Compilación

- `npm ci`
- `npm run dev`: vista local de Sites.
- `npm run build`: Worker y recursos de la web.
- `npm run build:mobile`: aplicación estática independiente en mobile-dist.
- `npm run ios:sync`: compila y copia los recursos al proyecto Capacitor de iOS.
- `node --test tests/*.test.mjs`: simulación, recorrido completo del motor, daño, alimentación, guardado y reintento.
- `npx tsc --noEmit`: tipos.

El workflow privado de GitHub Actions Build iPhone IPA compila en macOS y entrega una IPA **sin firmar**. La instalación necesita firma; no es una publicación en TestFlight ni App Store. La IPA v0.1.0 contiene el inicio aprobado; v0.2.0 incorpora la campaña. iOS mínimo 15. El lanzamiento de iPhone usa orientación vertical; iPad también permite horizontal.

## Estado y siguientes publicaciones

Hay una campaña corta con principio y final, no una versión comercial validada. Las pruebas del motor usan un contexto Canvas simulado y un controlador automático, sin teletransportar al jugador; no sustituyen pruebas visuales ni pruebas de rendimiento en dispositivos físicos. No se ha probado en un iPhone real. El empaquetado y la integración de Steam (logros, guardado en la nube y navegación completa con mando) y Android siguen pendientes. El motor, las entradas y el build estático se mantienen separados de Sites para permitir esos empaquetados sin rehacer el juego.
