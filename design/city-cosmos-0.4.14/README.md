# VORO 0.4.14 (1) — Ciudad y mundos

Encargo del usuario: rehacer la ciudad para que parezca una ciudad real, evitar inclinaciones arbitrarias, limitar la gravedad solo al alejarse de la Tierra y ampliar/rebalancear los planetas.

## Resultado
- Cuatro barrios deterministas de 600×600: viviendas, centro, industria y jardín. Calles principales y accesos interiores, aceras, bordillos, pasos de peatones y sumideros. Materiales generados con ChatGPT Images, sin mezclas ni giros de imágenes de calles.
- Seis edificios con perspectiva compartida: casa de tejas, apartamentos, supermercado, nave industrial, oficinas y edificio municipal. Parcelas estables y edificios comestibles; el fondo no dibuja edificios duplicados. Los solares quedan vacíos al comerlos y el registro conserva la desaparición durante el periodo de regeneración.
- Hasta 14 encuentros por región, incluidos 3–4 edificios; se preserva el área segura inicial. Vehículos por la calzada y personas por aceras, manteniendo sus movimientos dentro de su corredor. Helicópteros libres. Más coches y furgonetas que antes.
- La gravedad orbital no impone ningún radio mínimo ni cancela velocidad de aproximación. Solo devuelve al organismo desde el límite exterior; la absorción de la Tierra y la progresión siguen ligadas a la biomasa.
- Nueve tipos de planetas principales: rocoso, oceánico, volcánico, helado, gaseoso, anillado, desértico, sulfuroso y gigante de hielo. Ocho diseños nuevos. Oceánicos con peso 0,35 frente a 8 de desérticos, 6 de sulfurosos y 3 de gigantes de hielo; no se alteran los tamaños con un multiplicador común. Medición de 1.200 regiones: oceánicos 0,36 % de todos los encuentros, antes del ajuste de tráfico (que no afecta a Planetas).

## Arte y procedencia
Herramienta integrada image_gen (ChatGPT Images), no API/CLI. Fuentes PNG conservadas aquí; WebP finales en public/inhabitants y public/backgrounds. Preparación determinista: conversión a WebP, reducción del material a 1024² y del planeta anillado a 640², recortes del atlas sin modificar la pintura ni su alpha. Un intento de atlas editado con damero pintado fue descartado y no está en el juego. El anillado se generó por separado para conservar sus anillos completos. El fondo de ciudad anterior se conserva aquí como previous-city-background.webp y no se empaqueta en public.

Los seis edificios comparten la cámara casi cenital con fachada sur corta, sin perspectiva isométrica ni rotaciones aleatorias. Se preservan personajes, vehículos y el arte del protagonista. Las nuevas superficies planetarias mantienen contorno e iluminación y derivan en el mundo; no se aplica deformación de pez a la arquitectura ni a los planetas.

## Verificación
137 pruebas automáticas correctas, incluidos acercamiento a Tierra/centro/límite exterior, parcelas en coordenadas negativas, consumo/reentrada, diversidad planetaria, límites de población y caché de cuatro barrios. TypeScript y lint correctos. Build web y móvil correctas; validación de assets extendida a todos los atlas. QA visual local del paquete móvil: ciudad con edificios nuevos, alineación y calles; no equivale a una prueba física en iPhone. TestFlight por comprobar al redactar esta evidencia; el resultado de distribución se guarda en artifact/testflight-0.4.14-build-1 y la biblioteca.

Web pública sigue en v36: publicación pendiente de la confirmación específica de destino exigida por la revisión automática. No se publicó por otra vía.
