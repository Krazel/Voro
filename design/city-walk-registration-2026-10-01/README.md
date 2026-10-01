# Registro final de personajes — 1 de octubre de 2026

Solicitud: comprobar que los personajes permanecen exactamente en su lugar
entre fotogramas e implementar el resultado en el juego.

Se midieron las 144 poses/vistas de diez humanos. Antes, la posición inferior de
sus siluetas variaba entre poses y direcciones: de 6 a 14 píxeles de rango según
personaje en el atlas. El renderer añadía además oscilación vertical continua.

Ahora cada fotograma tiene una transformación de registro calculada previamente:
coronilla/casco en el eje central, altura visual 208 unidades y suelo a +104
unidades respecto al origen del personaje. Se aplica escala uniforme por pose,
sin estirar miembros ni cambiar los archivos de arte. El cálculo excluye brazos,
bolsos y escudos del punto central. Se elimina el rebote adicional del renderer
para personajes registrados. El movimiento de brazos/piernas sigue en las poses.

Los PNG/WebP permanecen intactos, incluidas frente/espalda y las animaciones ya
aprobadas; solo cambia su colocación y normalización de escala en pantalla. No
cambian tamaños de colisión, velocidad, daño, recompensa ni memoria de texturas.
El dibujo sigue usando una sola llamada de imagen por persona.

## Reproducción y verificación

1. Después de regenerar arte con cualquier exportador histórico, ejecutar
   `node scripts/register-city-walks.mjs` con VORO_CANVAS_RUNTIME configurado.
2. Ejecutar `node scripts/check-city-walks.mjs`. Renderiza las cuatro direcciones,
   todas las poses y verifica la posición de los píxeles opacos.
3. `node --test tests/city-perspective.test.mjs` verifica invariantes del juego,
   registros geométricos y ausencia de desplazamiento vertical añadido.

`before-art.json` conserva el manifiesto anterior; `audit.json` contiene las
medidas originales y las transformaciones. En la salida de 130px de alto, el
error máximo rasterizado es 1px de centrado, 1px de suelo y 2px en coronilla por
muestreo de bordes. El registro geométrico coincide exactamente. No se promete
precisión de píxel entre distintas GPU/escalas de pantalla.

Galería revisada en navegador, con guías de centrado y suelo; `browser.jpg`.
Ya se utiliza el mismo renderer y manifiesto en el juego. Sin nueva build iOS.

Validación final: 338/338 pruebas correctas; builds móvil y PC correctos, incluida verificación de assets móviles.
