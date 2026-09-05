# VORO · Abisal

Juego 2D de evolución microscópica. Arrastra con ratón para dirigir la célula; en pantallas táctiles aparece un joystick flotante. También admite WASD/flechas y espacio para impulso. La primera evolución se alcanza a 26 unidades de biomasa (empiezas con 8). Puedes seguir nadando después y los nutrientes se reponen fuera de tu zona inmediata.

## Movimiento y alimentación

La membrana se anima con 100 nodos elásticos amortiguados: se estira al nadar, envuelve nutrientes con dos extremos que se cierran y recupera su forma. El núcleo tiene inercia independiente y los flagelos ondulan. La absorción dura 1,65 segundos: rodear, encerrar y digerir. La comida conserva su forma hasta descomponerse en partículas dentro del cuerpo y solo entonces suma biomasa.

## Daño y supervivencia

Las espinas quitan el 25 % de la biomasa actual, con un mínimo de 2 unidades. Un golpe interrumpe la digestión, deforma el lado del impacto, expulsa partículas, empuja al organismo y da 2 segundos de invulnerabilidad. El área corporal es proporcional a la biomasa; el diámetro mostrado y el radio de colisión usan la misma relación. Si bajas del umbral de evolución, la membrana y los flagelos retroceden gradualmente. Se recuperan al comer. A cero biomasa termina la vida y puedes reiniciar.

## Desarrollo

Canvas2D anima membrana, filamentos, orgánulos, digestión y partículas. El fondo ilustrado es el único recurso de imagen. El audio se sintetiza tras la primera interacción y puede silenciarse. No se guardan datos ni se usan servicios de analítica.

- npm run dev: vista local.
- npm run build: Worker y recursos.
- node --test tests/*.test.mjs: pruebas de simulación y motor. Las pruebas de motor usan un contexto Canvas simulado; no sustituyen una prueba visual en un navegador.
- npx tsc --noEmit: tipos.

Esta versión desarrolla el primer entorno de VORO; las escalas acuática, terrestre y cósmica siguen pendientes. No se ha probado en móviles físicos. WebMCP es opcional y no se ha validado en un navegador compatible.
