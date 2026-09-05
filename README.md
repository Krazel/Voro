# VORO · Abisal — del origen al universo

Campaña completa jugable en navegador, con nueve escalas y un final. Mantiene el organismo azul translúcido con núcleo ámbar del inicio aprobado. Esta entrega no genera una IPA ni un paquete Steam.

## Recorrido y controles

Microscopio → agua → tierra → ciudad → órbita → planetas → estrellas → galaxias → universo. Cada etapa ofrece un mundo generado sin paredes, con habitantes de varios tamaños y comportamientos. La última exige absorber el universo tras alcanzar la biomasa necesaria; la secuencia final termina la partida.

- Móvil: arrastra desde cualquier punto y pulsa Impulso, sin joystick visible.
- PC: ratón, WASD/flechas y espacio.
- Mando: stick izquierdo, A para impulso, Start para pausa. Los menús usan teclado, ratón o táctil.
- Inicio de etapa: 2 de biomasa y radio 24; en el agua, 0,8 de biomasa y radio 15,2. Solo pueden comerse las especies menores; cada zona y el área inicial incluyen alimento adecuado. Se aplica también al reintentar. Las partidas en curso conservan su biomasa. El agua genera 14 habitantes por zona frente a los 22 anteriores, manteniendo comida accesible al principio.
- Daño: resta biomasa real y reduce el área corporal en la misma proporción. Después hay un intervalo de protección para escapar.
- Mejoras: una barra independiente permite elegir entre tres adaptaciones aleatorias mientras el tiempo se detiene. Hay 15 tipos y 43 niveles totales, con límites de acumulación. Evolucionar de escala conserva todas las mejoras. La primera adaptación requiere 18 de experiencia y las siguientes usan la curva 18 + 18 × nivel + 3 × nivel², un 25 % menos que antes. Cada elección permite un cambio gratuito de opciones; si quedan suficientes tipos, las tres opciones son nuevas. Si quedan menos, se priorizan las alternativas disponibles. El cambio usado se conserva al recargar.
- Efectos reforzados: alcance +15 %, digestión +25 %, rendimiento +12 %, velocidad +15 %, agilidad +30 % y reducción de daño del 12 % por nivel. Los límites evitan inmunidad o velocidad sin control. El impulso inicial multiplica la velocidad por 1,45 durante 0,28 s con recarga de 9 s. Solo elegir Impulso elástico aumenta su potencia (1,8 / 2,15 / 2,5), duración (0,38 / 0,48 / 0,58 s) y reduce la recarga (7 / 5 / 3 s). Crecer, avanzar de etapa o elegir otras adaptaciones no aumenta esos valores. Se guarda su recarga.
- Tentáculos cazadores: 1 / 2 / 3 pseudópodos de la propia membrana buscan presas comestibles distintas, se extienden, cierran el agarre y las acercan. Son parte del mismo contorno, relleno translúcido y citoplasma del jugador; ya no hay brazos dibujados por separado. Solo tiran después de tocar; la absorción sigue exigiendo el alcance corporal. Sueltan presas al perder tamaño o recibir daño y se limpian al cambiar de etapa o reiniciar.
- Evolución: al alcanzar el objetivo de biomasa se anima el crecimiento y el alejamiento de cámara durante 7,2 segundos. La escena anterior se transforma y se desvanece sobre la siguiente. Las magnitudes se normalizan al entrar en la nueva escala; el tamaño mostrado representa la nueva escala del organismo.
- Ciudad: civiles y vehículos huyen, unidades con escudo persiguen y soldados, blindados, tanques y helicópteros disparan. Las líneas de aviso anticipan los disparos. Al superar su umbral de tamaño, los proyectiles aportan solo 0,025 de biomasa y ninguna experiencia.
- Espacio: naves, estrellas activas, cuásares y singularidades añaden disparos, contacto peligroso y atracción gravitatoria que se puede contrarrestar nadando.
- Reinicio completo: solo en Configuración, con confirmación dentro del juego. Reintentar tras morir conserva escala y adaptaciones.

## Arte y movimiento

Cada mejora tiene una ilustración original generada con ChatGPT imagegen integrado. Las 15 imágenes se cargan desde `public/upgrades/biological-adaptations.png`, atlas de 5 × 3 de 1619 × 972 píxeles. Prompt exacto en `art/upgrades/prompt.txt`. Se conserva el archivo generado sin retoques.

88 ilustraciones distintas repartidas en seis atlas transparentes, utilizadas por 98 entradas del catálogo (algunas se reutilizan a distinta escala). Incluyen 12 formas microscópicas, 16 criaturas acuáticas, 12 animales terrestres, 12 elementos urbanos y 36 cuerpos cósmicos. Ocho fondos nuevos acompañan al fondo microscópico original. Los prompts y rectángulos de recorte quedan en art/inhabitants.

La galería `/animaciones`, también accesible en Configuración, permite revisar las 98 entradas del catálogo en nueve escalas. Incluye selección individual, anterior/siguiente, pausa, cámara lenta, reposo/movimiento/reacción y comparación a escala de juego. Diez entradas reutilizan arte de otras escalas. La carga fallida ofrece reintento; se respeta movimiento reducido al cargar.

`animation-catalog.mjs` especifica el movimiento y las articulaciones de cada ilustración. `inhabitant-animation.mjs` dibuja la misma animación en galería, juego y digestión: columna de 24 segmentos para peces; articulaciones y pesos locales para patas, brazos y alas; contracción de campanas y mantos; rotor, ventiladores, torretas y orugas; rotación, corrientes y pulsos cósmicos. Es animación 2D de ilustraciones mediante mallas y piezas articuladas, no secuencias de dibujos nuevos por fotograma. Se corrigieron recortes que mezclaban habitantes del agua y algunos límites de los atlas cósmicos.

Las vistas grandes calculan la malla continua; los habitantes pequeños reutilizan 32 poses por ciclo en una caché de memoria limitada a 24 MiB y compartida por especie. Solo se generan poses encontradas y se expulsan las menos recientes. La membrana del jugador conserva sus 100 nodos elásticos, núcleo con inercia, orgánulos y flagelos; sus pseudópodos deforman el mismo contorno. El rendimiento en dispositivos físicos sigue pendiente de medición.

El final tiene una secuencia de 12 segundos: la red cósmica converge en el núcleo y la luz se apaga. El juego muestra el recorrido y estadísticas, y guarda que se ha completado.

## Mundo y partidas

Zonas de 600 unidades generadas mediante semilla estable. Se mantienen 25 zonas cercanas y se amplía el margen según la altura de pantalla y el zoom. Las zonas lejanas se descargan; no se simula permanentemente a cada habitante fuera del área activa. La distribución permanece estable al regresar. El mapa no tiene un borde jugable, aunque utiliza coordenadas numéricas finitas.

La comida vuelve después de 150 segundos de juego, fuera de la proximidad inmediata. El registro conserva hasta 2048 entradas. El último universo mantiene una referencia independiente para que no desaparezca al alejarse, y reaparece si un golpe interrumpe su absorción.

El guardado local conserva escala, posición, biomasa, digestión pendiente, mejoras, recarga del escudo, estadísticas y final. Guarda cada cinco segundos y al pausar, ocultar o cerrar. La nueva clave es `voro-journey-v1`; migra automáticamente `voro-micro-v1` cuando aún no existe una campaña nueva. El guardado microscópico anterior no se borra. Las partidas con la cadencia anterior mantienen sus mejoras y la fracción de progreso hacia su próxima adaptación; esta conversión se realiza una sola vez. No hay sincronización entre dispositivos.

## Desarrollo y validación

- `npm ci`
- `npm run dev`: vista local de Sites.
- `npm run build`: compilación web.
- `node --test tests/*.test.mjs`: simulación, mundo, guardado y motor con Canvas simulado.
- `npx tsc --noEmit`: tipos.

Las pruebas cubren absorción, daño, escudo y reciclaje; pausas y mejoras; generación determinista y límites de memoria; recortes y deformación de ilustraciones; proyectiles comestibles; migración, carga por escala y evolución guardada; persistencia del objetivo final. Un controlador automático recorre las nueve escalas sin teletransportes ni crecimiento forzado y termina digiriendo el universo. Esa simulación no sustituye pruebas visuales, de rendimiento en dispositivos físicos ni de balance con jugadores. El ritmo varía según elecciones, rutas y encuentros.

Los módulos de la campaña antigua y de la prueba microscópica se conservan como referencia y para migración. Los proyectos Capacitor y el workflow iOS se conservan sin ejecutar. El empaquetado para tiendas, integración Steam, logros, sincronización y validación en dispositivos siguen pendientes; no se presentan como completados por esta entrega web.
