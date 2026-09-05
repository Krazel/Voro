# VORO · Abisal — la vida en una gota

Primera etapa jugable del nuevo diseño, solo navegador. Organismo unicelular en un mundo microscópico sin paredes. Conserva la membrana azul translúcida y el núcleo ámbar del inicio aprobado. El agua, la tierra y la progresión cósmica quedan fuera de esta entrega.

## Jugar

- Móvil: arrastra desde cualquier punto para dirigir al organismo y pulsa Impulso. No aparece un joystick dibujado.
- PC: arrastra el ratón o usa WASD/flechas y espacio.
- Mando: stick izquierdo, A para impulso y Start para pausa. Los menús usan teclado, ratón o táctil.
- Come criaturas más pequeñas. Los cazadores y organismos espinosos más grandes dañan tu membrana.
- El daño reduce la biomasa y el área corporal en la misma proporción. La recuperación vuelve a aumentar ambas; tras el golpe hay dos segundos de protección.
- La adaptación tiene su propia barra: al llenarse, el tiempo se detiene y eliges entre tres mejoras aleatorias sin cambiar de entorno.
- Hay 15 mejoras, con un máximo de tres niveles por mejora salvo Hambre encadenada, de un nivel. Los efectos suman y tienen límites para evitar multiplicaciones descontroladas.
- Al alcanzar 150 de biomasa se celebra la madurez celular con membrana y cámara animadas. Puedes seguir explorando; el crecimiento de esta prueba tiene un tope de 240.
- Volver a nacer está solo en Configuración y requiere confirmación dentro del juego. Reintentar tras morir conserva las adaptaciones.

## Arte y animación

12 clases de alimento/habitantes ilustrados en un atlas PNG con transparencia: nutrientes, bacilos, cocos, diatomeas, paramecios, amebas pequeñas, flagelados, bacterias espirales, ciliados cazadores, protistas espinosos, amebas gigantes y cadenas celulares. Los rectángulos de cada ilustración evitan mezclar especies contiguas.

Los cuerpos blandos pulsan o se ondulan; las formas rígidas conservan su silueta. Los cazadores persiguen o huyen según tu tamaño. La digestión conserva la misma ilustración: envoltura de la membrana, arrastre al interior y disolución. El jugador mantiene 100 nodos elásticos, núcleo con inercia, orgánulos y flagelos. El escudo, espinas, estela y tentáculos tienen señales visuales propias. El sonido se sintetiza tras una interacción.

## Mundo y guardado

Zonas de 600 unidades generadas con una semilla estable. Se cargan 25 zonas alrededor del jugador y se amplía el margen según el zoom y la altura de pantalla. Las zonas lejanas se descargan. La semilla conserva la distribución de lugares; no se simula permanentemente a cada habitante que queda lejos. No hay límite de mapa jugable, aunque las coordenadas usan números finitos del motor.

La comida vuelve a generarse después de 150 segundos de juego y fuera de la proximidad inmediata del jugador. El registro de comida consumida conserva hasta 2048 entradas. La posición, biomasa, digestión pendiente, adaptaciones y recarga del escudo se guardan localmente cada cinco segundos y al pausar, ocultar o cerrar. La partida microscópica usa una clave independiente de la campaña anterior. No hay sincronización entre dispositivos.

La ganancia de biomasa es más lenta que la adaptación. Reciclar tu propia biomasa no da experiencia ni recibe bonificaciones de rendimiento. La distribución, dificultad y ritmo siguen sujetos a las pruebas del jugador; no se presentan como balance comercial terminado.

## Desarrollo y validación

- `npm ci`
- `npm run dev`: vista local de Sites.
- `npm run build`: web.
- `node --test tests/*.test.mjs`: simulación, mundo, guardado y motor con Canvas simulado.
- `npx tsc --noEmit`: tipos.

Las pruebas actuales comprueban absorción y daño, escudo/reciclaje, pausas, elecciones, límites de mejoras, movimiento sin paredes, regeneración determinista, guardado, recortes y animación de sprites. Un controlador automático recorre tres semillas desde el inicio hasta la madurez sin teletransportar al jugador. No sustituye pruebas visuales ni de rendimiento en dispositivos físicos.

Los módulos y pruebas de la campaña anterior se conservan como referencia, pero no forman parte de la pantalla actual. Los proyectos Capacitor y el workflow de iPhone también se conservan; esta entrega no genera una IPA. Steam y el resto de biomas quedan pendientes.
