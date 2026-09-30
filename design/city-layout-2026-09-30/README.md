# Ciudad: parcelas y perspectiva · 2026-09-30

Corrección local sobre 0.13.5(1). No se ha subido otra build ni cambiado la cámara o el fondo de Charca en este encargo.

## Diagnóstico

Los centros 185/415 no coincidían con las parcelas que dejan las calles internas: sus centros reales son 171/429. La altura de los sprites de torres podía sobrepasar el terreno aunque su radio horizontal cupiera. Los objetos se colocaban todos en las mismas líneas de acera sin reservar su dibujo completo. La hierba del cuarto solar invadía el acceso central. La palmera y el arbusto conservaban el ángulo aleatorio de creación; el contenedor estaba pintado en diagonal, con otra perspectiva.

Charca: el atlas original es 1536×1024, dividido en cuatro regiones de 768×512. Tres de sus materiales ya son suaves en el original. Se amplían al inicio (zoom automático 2,361) y se mezclan por sus bordes; la pantalla de alta densidad requiere todavía más píxeles. En 0.13.5 el patrón ocupa unos 756 píxeles lógicos de altura, antes unos 1133; no se generó detalle nuevo. El escalado anterior no equivale a más resolución real. Mantener la escala y mejorar la fuente es un trabajo distinto; no se simula aquí con enfoque ni interpolación.

## Implementación

- Geometría compartida `CITY_PLOTS` para pintura, centros y espacio reservado. Margen mínimo de 8 unidades dentro de cada parcela, incluso con el mayor tamaño generado.
- Ajuste **visual** de los edificios a su parcela conservando radio de juego, biomasa, requisitos de absorción y valor. El ajuste se aplica también al sprite digerido. No se cambia la cámara.
- Además de la separación circular anterior, se comprueba el rectángulo completo de los objetos frente a parcelas y otros objetos. Las posiciones consumidas siguen reservadas, incluidos los objetos iniciales de llegada, para no recolocar vecinos al volver.
- El cuarto solar industrial pasa a patio de carga con dos plazas centradas; el cuarto solar ajardinado conserva el parque, ahora bien delimitado. Contenedores y plantas se seleccionan en el distrito adecuado. El límite total de población y la abundancia de peatones siguen comprobados por las pruebas; cambia la distribución de especies por distrito.
- Palmera y arbusto sin giro aleatorio. Contenedor nuevo con vista elevada frontal, alineado horizontalmente con los edificios. Luces y demás sprites existentes conservados.
- Césped interior al bordillo del parque; no se pinta encima de las calles de acceso.

## Arte

Herramienta integrada ChatGPT Images, transparencia real preservada. Asset: `public/inhabitants/city-container-aligned-v1.png`, 1774×887 RGBA, 1599974 bytes, SHA256 `6bccd9b5e2c44e8894e78387f135526c8b9535cb36039bce8699e2dc1ab8c74b`. Recorte por metadatos `[225,168,1340,590]`; sin editar ni reescalar el archivo generado. Original conservado en la carpeta de imágenes de Codex. Se utiliza como sprite rígido, sin nueva malla ni animación costosa por fotograma.

Prompt enviado, con `city-buildings-v2.webp` y `objects-matter-v1.png` como referencias:

> Use case: precise-object-edit. Production game sprite: ONE weathered blue-gray steel shipping container on a genuinely transparent background, isolated with generous transparent margin, no ground, no frame, no text. Reference image 1 establishes our game's exact camera and realistic detailed painted art: orthographic elevated FRONT view, front facade faces the bottom of the image, roof visible, all horizontal edges truly horizontal and all vertical edges vertical. Reference image 2's bottom-right metal container is the subject to correct. Redraw ONLY that container as one standalone sprite with the camera of the buildings in reference 1: long corrugated front side horizontal across screen, short height, roof seen from above; NO diagonal isometric orientation, NO side leaning, no perspective vanishing point. Neutral muted steel blue, worn seams, tiny rust details. Light from upper left; subtle contact shadow confined beneath the sprite, no extended cast shadow, no background scenery. Container fills about 80% width, centered both axes, landscape rectangular silhouette. This image will be placed on horizontal pavement parcels next to those buildings, so matching orientation is essential.

## Verificación

`review.html` compara capturas reales del Canvas, misma cámara y semilla, sin HUD. `scripts/check-city-layout.mjs` reproduce centro, jardín, palmera y carga y registra errores del navegador. Las capturas no acreditan FPS ni validación en iPhone físico. Pruebas de parcelas sobre 384 bloques, objetos sobre 400 bloques (incluidas coordenadas negativas), orientación, comida persistente, población y textos EN/ES.

Resultado final: **328/328 pruebas correctas**, TypeScript correcto y build móvil con verificación de assets correcta. Cuatro escenas de navegador sin errores. Se corrigieron los cuatro fallos detectados en la primera pasada: dimensiones del asset nuevo en dos fixtures de animación, traducción de su descripción y conservación de la separación circular además del nuevo control rectangular. La partida simulada de la suite completa alcanza todos los entornos; no sustituye una nueva campaña de balance ni una medición física de rendimiento.
