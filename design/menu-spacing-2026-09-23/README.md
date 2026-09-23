# Márgenes de texto y fondo marino horizontal

El usuario aclaró que el problema de ordenador era el fondo del mar con medusas, no los marcos. Se restauraron sus proporciones y posiciones anteriores. Se mantienen los márgenes adicionales de texto dentro de los paneles en las tres pantallas.

Se conserva intacto public/ui/membrane/background.webp para móvil y retrato. En ordenador e iPad horizontal se utiliza background-landscape.webp, generado con ChatGPT Images integrado a partir del master vertical aprobado. Master nuevo: background-landscape-master.png. WebP de producción: public/ui/membrane/background-landscape.webp.

Prompt: adaptar el fondo submarino aprobado a 16:9 extendiendo lateralmente el océano, conservando medusa grande arriba derecha, criatura pequeña izquierda, agua oscura central, rayos suaves y rocas sólidas inferiores sin agujeros; sin recortar criaturas, sin UI ni nuevos elementos. Se mantiene el interior oscuro de los marcos y su transparencia exterior.

Verificación: cinco tamaños ES/EN con navegación, controles y licencias; capturas en esta carpeta. Build móvil y verificación de los assets empaquetados correctas; tres tests de idioma pasaron. También se completó la traducción faltante de Ver licencias. Los marcos mantienen su animación existente.

Cambio para revisión local en5206; TestFlight sigue en0.6.6(1). No se afirma validación de esta revisión en dispositivo físico.
