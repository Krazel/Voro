# Carga de fondos al probar entornos — 0.4.11 (1)

El usuario observó la charca en la partida normal, pero no en una prueba de
entorno. Se ha encontrado una preparación prematura: paintBackground aceptaba
Image.complete y naturalWidth aunque StageAssets aún esperaba decode(). Un
salto de prueba puede dibujar mientras termina otro recurso y guardar ese
estado intermedio en la caché. La nueva prueba de regresión falla antes del
cambio y pasa después. Esto confirma el defecto de orden, no reproduce por sí
solo un fondo vacío en el iPhone del usuario.

Ahora solo se prepara el fondo cuando su entrada está decodificada y corresponde
a la misma imagen vigente. La notificación existente al completar la carga
solicita otro dibujo. No se cambia el arte ni el terreno de ningún bioma.
Los atlas descartados liberan inmediatamente sus superficies Canvas; cambiar
repetidamente de entorno no depende de cuándo se ejecute el recolector de memoria.
Los informes identifican partida normal o modo de prueba.

Validación: 124 pruebas completas, incluyendo saltos repetidos hacia la charca,
liberación de superficies, diez entornos/tamaños y conservación de la campaña.
TypeScript y lint de archivos modificados correctos; builds web/móvil y sync iOS.
La disponibilidad en TestFlight y la verificación de la IPA se registran en la
biblioteca y las evidencias privadas de entrega. Prueba física final pendiente.
