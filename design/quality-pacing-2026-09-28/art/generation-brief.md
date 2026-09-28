# Referencias y criterios de generación

Se utilizó ChatGPT Images integrado. Los PNG originales devueltos por el servicio
se conservan aquí; no se generaron por CLI ni se ampliaron para inventar resolución.
Este documento resume los briefs de generación, no una transcripción literal
de las llamadas. `../art-inputs.json` conserva el origen de cada resultado.

Las seis galaxias se derivaron del atlas anterior del juego como referencia de
composición, silueta y color: espiral azul, espiral ámbar, elíptica, espiral barrada,
formación nubosa y lenticular inclinada. Cada llamada solicitó UN objeto separado,
detalle estelar fino, núcleo legible y periferia suave, alfa transparente, sin
texto, interfaz, recuadros ni fondo espacial. Se solicitaron píxeles suficientes
para el uso a gran escala; el resultado nativo fue 1254×1254 por objeto. Se
descartó una primera composición de seis objetos juntos por dar pocos píxeles
a cada celda. No se consume esa propuesta en el juego.

El agujero negro conservó la referencia existente: horizonte circular oscuro,
anillo fotónico blanco fino, disco de acreción naranja inclinado y filamentos
azules periféricos. El brief pidió detalle de filamentos a escala grande y alfa,
sin cuerpo oscuro rectangular ni estrellas de fondo, sin etiquetas ni UI. El
resultado es 1254×1254. La geometría física de los tres encuentros no cambia.

El fondo de Planetas solicitó cuatro variaciones de cielo profundo en un atlas
2×2: estrellas aisladas pequeñas y nubes de polvo difusas e irregulares, oscuras,
sin espirales, galaxias, bandas de Vía Láctea, cuerpos planetarios, texto ni UI.
El resultado es 1536×1024; los cuatro paneles son aptos para esta etapa.

Las cuatro estructuras del Universo no se volvieron a generar: Muralla, Corona,
Confluencia y Marea reutilizan los PNG aprobados de 1254×1254 del 23/09. Las copias
reducidas a 512×512 ya no son las fuentes de esos objetos en el juego.

Conversión de distribución: WebP calidad 96, alfa 100; se conservan maestros PNG.
La mejora se implementa junto a flujo continuo de dos pasadas, sin hornear estos
objetos gigantes en celdas pequeñas ni reducir sus rangos de tamaño.
