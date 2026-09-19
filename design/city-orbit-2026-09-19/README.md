# VORO — Ciudad y absorción orbital · candidata local 19-09-2026

Continuación de ae0e339/f18149d, rama camera-framing-2026-09-19 y worktree Voro-camera. Conserva integración 0.4.18, zoom uniforme/manual, selector animado, escudo único y StoreKit. Checkout Voro original intacto. Encargo ampliado por el cerebro para incluir Órbita; propiedad confirmada con la tarea principal.

## Ciudad

Causa: soldados, unidad con escudo, blindado, tanque y helicóptero conservaban umbrales manuales de biomasa (9/20/18/38/75/58), aunque sus radios habían disminuido. Ahora usan la regla común: el radio del organismo debe ser al menos 1,17 veces el del objetivo, incluida la variación individual. No se hace comestible un tanque grande por llevar armas.

Civil y soldado pasan de radio 6,17 a 10; unidad con escudo y soldado pesado de 6,6 a 10,7 (aproximadamente +62 %). Dibujo, colisión y umbral comparten ese radio. La lata conserva su función de alimento mínimo de recuperación.

Los tiradores conservan armas, cadencia, proyectiles y daño. Un defensor comestible recibe el intento de absorción antes del daño de contacto: si hay capacidad se absorbe, si está llena sigue siendo peligroso. Fuera del alcance corporal sigue disparando. Esto evita reintroducir el bloqueo mediante un golpe anterior al contacto de absorción.

El atlas existente ya incluye city-5, automóvil azul sin armas. Se le reserva una plaza de alimento por zona, sin elevar el máximo de 24 habitantes y sin apariciones aleatorias adicionales. Prueba de 40 zonas: presencia minoritaria menor del 6 %. Se conservan calles, aceras, edificios y determinismo de los huecos consumidos.

## Órbita

La Tierra ya se dibujaba antes de los habitantes. El problema era espacial: generación y movimiento eliminaban o expulsaban objetos del disco. Se retiran esas exclusiones, manteniendo el límite exterior de la arena y el orden Tierra → objetos/proyectiles → organismo.

Al alcanzar la meta y acercarse a la Tierra, se congelan los objetos restantes de la arena orbital accesible, los residentes, fragmentos y proyectiles. Una captura por ID evita duplicados y respeta el registro de objetos consumidos. Todos convergen y se encogen al organismo durante la misma secuencia de 3,2 s (1 s con movimiento reducido) que absorbe la Tierra. Después se limpian restos y proyectiles y comienza la transición habitual.

La captura se guarda antes de animar. Al cargar durante la secuencia se repite desde su inicio con los mismos objetos; el menú espera a Continuar. Tras completarla se guardan earthConsumed/pendingEvolution y se elimina la captura. Cargar justo antes del cambio de escala no regenera restos. Se conserva la Tierra consumida al llegar a Planetas.

El barrido de cierre no concede biomasa ni XP adicionales: la meta de evolución ya está ganada. Se terminan una sola vez las digestiones iniciadas antes del barrido. Esto mantiene la progresión y evita multiplicar recompensas al guardar/cargar.

## Evidencia

- [Vídeo de ciudad y órbita](city-orbit-evidence.webm): motor real en Chromium, perfil aislado, vista 390 × 844. En las tres pruebas de absorción de ciudad se inmoviliza el objetivo para repetir el acercamiento; movimiento del organismo, absorción y digestión los ejecuta el motor. No representa una prueba de persecución o balance físico.
- [Ciudad con su población real](city.png); [objetos sobre la Tierra](orbit-over-earth.png); [absorción orbital](orbit-absorption-55.png).
- [Resultados de navegador](browser-checks.json): soldado, blindado y coche absorbidos y digeridos; captura de 398 objetos orbitales; cero restos antes de la transición y cero errores de página.
- [160 pruebas correctas](tests.log): umbrales por tamaño, humanos ampliados, capacidad, disparos/daño, población y guardado; superposición orbital, captura/recarga/finalización, ausencia de duplicados/residuos; regresiones de zoom, selector, escudo, StoreKit y progresión.
- TypeScript y lint dirigido correctos. [Build Vite](build.log) correcto; aviso habitual de bundle >500 kB.

La única expectativa antigua ajustada exige que en ciudad sigan existiendo objetivos grandes bloqueados, en vez de exigir mayoría de especies bloqueadas: los humanos armados pequeños ya son alimento válido. Se mantiene la comprobación de tamaño para toda absorción.

Candidata ejecutable: artifact/city-orbit-preview-2026-09-19. Vista local: http://127.0.0.1:5192/. No se cambia versión pública, no hay push, IPA, TestFlight, publicación ni envío a revisión. La compilación y validación nativa iOS/StoreKit siguen pendientes. Siguiente paso: revisar esta candidata integrada y probar en dispositivo antes de una distribución autorizada por separado.
