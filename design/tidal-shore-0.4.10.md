# Orilla de marea — 0.4.10 (1)

La 0.4.9 mantenía la costa continua como visor separado. La partida seguía usando
el atlas de costa reflejado por franjas. No era un problema de caché en ese caso.

El usuario precisó que quiere arena, charcos y entrantes de mar distribuidos sin
fin, parecido al planteamiento inicial, sin cortes. Ahora la partida y /orilla
usan el mismo renderizador. La geografía es un campo continuo en dos dimensiones;
los materiales proceden de la imagen pintada existente. Se conserva el resto de
fondos aprobados y el microscopio. No se ha generado arte nuevo.

Los habitantes se colocan según el mismo campo de arena/agua, comprobando también
su perímetro. Al moverse vuelven a la última posición válida si cruzan al agua.
Hay arena segura y un charco próximo al punto de llegada. Se conserva la densidad
de encuentros; se actualiza la prueba de regeneración para buscar una región
habitada, porque un punto que antes era tierra ahora puede ser agua.

Se retira la comparación «Anterior». Los tres archivos de fondos obsoletos y el
renderizador antiguo quedan archivados fuera de public. El paquete móvil se
rechaza si incluye esos archivos o carece del código tidal-shore-v1. Cada informe
identifica el renderizador del entorno. Los diez fondos se comparan byte a byte
con el paquete móvil. Las versiones ya instaladas requieren actualizar la app.

El terreno conserva su superficie al crecer y desplazarse dentro del margen de
caché. Las transiciones retienen como máximo dos fondos; la espuma usa una máscara
preparada. 122 pruebas superadas, TypeScript, lint de los módulos cambiados, build
web y build/sincronización iOS correctos. Revisión visual local del visor y de la
partida con habitantes. Esto no equivale a una prueba física en iPhone.

La comprobación de píxeles contrasta 2312 puntos de agua/arena con los hábitats,
incluidas coordenadas lejanas y negativas. Las máscaras se dibujan en coordenadas
de pantalla para evitar diferencias de recorte de Canvas al alejarse del origen.
Se verifican también 480 fotogramas con desplazamiento y crecimiento, y 16 casos
de cobertura de los otros atlas. La primera compilación se sustituye por esta
corrección antes de distribuirla.

La geometría no repite una fotografía de la costa, pero los materiales pintados
siguen siendo texturas reutilizadas. Su valoración artística final corresponde
a la prueba del usuario. Estado de distribución y evidencia de IPA: biblioteca
del producto y evidencias privadas de entrega.
