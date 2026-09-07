# Comportamiento, fondos y control táctil — 0.4.6 (1)

Encargos 2026-09-07: animales trabados al cambiar entre persecución y huida;
fondos distintos a los mostrados en todos los biomas de TestFlight; impedir
selección accidental de pantalla; aumentar depredadores en el mar.

## Cambios

- Reacción con memoria: entrada 240/340 y salida 320/420 unidades para micro/resto.
  Miedo persiste 0,8 s y requiere bajar del 90 % del umbral de masa para recuperar
  agresividad. No cambia el tamaño necesario para comer ni las colisiones.
- Enemigos a distancia respetan huida cuando son comestibles o reciben miedo.
  Retroceden por debajo de 230 hasta 265; avanzan por encima de 300 hasta 275.
  En el intervalo mantienen posición sin alternar en cada cuadro.
- Cerca del borde del territorio emprenden retorno al interior con margen,
  en lugar de seguir intentando cruzar una coordenada limitada. Paso acotado
  a la distancia pendiente; orientación según desplazamiento efectivo.
- Bloqueadas selección, arrastre HTML y menú contextual en la superficie del
  juego. Campos de texto de Configuración siguen seleccionables y copiables.
- Mar: mismo límite de 12 plazas por región, ahora [5,5,2], una plaza de cazador
  y otra de peligro pasivo. Simulación de 1200 regiones: cazadores 1,39 % → 6,97 %;
  promedio total 11,60 → 11,57 elementos. Pulpos 3,04 %, morenas 2,14 %, tiburón
  de arrecife 1,74 %, martillo 0,05 %. Colocación y refugio inicial conservados.

## Fondos: evidencia y alcance

Se comprobó la IPA firmada 0.4.5: los diez fondos estaban incluidos y su SHA256
coincide con las imágenes mostradas. No se reprodujo la discrepancia visual
del iPhone del usuario; no atribuirla como hecho a archivos ausentes o caché.

Catálogo explícito de los diez fondos aprobados, con revisión de contenido en
las URLs para invalidar copias antiguas. StageAssets usa exclusivamente ese
catálogo. El motor ya no intenta sustituir un fondo no disponible por un atlas
antiguo de otro entorno. Se conserva el mosaico continuo, caché y cámara.
Test valida los diez archivos y revisiones; render selecciona la imagen de cada
bioma. Los fondos no se han regenerado ni reemplazado por diseños nuevos.
Pendiente confirmación visual en TestFlight de la build nueva.

## Verificación y entrega

Pruebas de bordes de rango, miedo, distancia de tiro, retorno al territorio,
densidad marina, catálogo completo y selección del fondo. TypeScript, lint y
build web correctos. HTTP local y recurso WebP con revisión responden 200.
Registrar resultados finales de CI/Apple y biblioteca al completar entrega.
Sin cambios de velocidad/zoom del protagonista ni su arte; el ajuste sugerido
en una pregunta anterior no fue autorizado y no forma parte de esta entrega.
