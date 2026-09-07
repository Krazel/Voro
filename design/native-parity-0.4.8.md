# VORO 0.4.8 (1): interfaz móvil y diagnóstico de fondos

El usuario ve la orilla en la web pero no en TestFlight, y tampoco ve la nueva interfaz. La versión instalada exacta sigue pendiente de confirmación.

## Causa comprobada y corrección

La IPA firmada 0.4.7 (1) contiene los diez fondos, idénticos byte a byte al código fuente. Incluye también Cristal, pero mobile/main.tsx cargaba globals.css después de Home y sus estilos Cristal. Las reglas antiguas de igual especificidad sobrescribían alturas de tarjetas y tamaños de texto. Ahora se importa globals.css primero, como en la web.

build:mobile comprueba la precedencia en el CSS realmente generado y la identidad de los diez fondos y del marco generado de Cristal. El mismo control se ejecuta en CI antes de empaquetar iOS.

Configuración muestra la versión y build del contenido. El informe completo y el archivo compartible incluyen estado de carga/error, dimensiones y superficie preparada del fondo actual. Estos datos ayudan a distinguir carga de preparación; no prueban que la GPU dibujara correctamente en un dispositivo físico.

## Validación local

- 118 pruebas correctas, TypeScript y oxlint correctos.
- Compilación web, móvil y sincronización Capacitor correctas.
- Precedencia Cristal verificada sobre salida móvil; diez fondos y marco idénticos.

## Límites y pendientes

No se ha reproducido la ausencia del fondo en un iPhone físico. No atribuirla todavía a caché, memoria o versión antigua. La web ya mostró correctamente charca, orilla, mar, ciudad, órbita y planetas.

Pendiente heredado de 0.4.7: el disco protoplanetario usa una ilustración que parece una galaxia; reemplazarla por un disco sin brazos espirales. Inclinación y rendimiento requieren comprobación física.

## Entrega verificada

- Web actualizada y compilación iOS completada.
- CI [34147782581](https://github.com/Krazel/Voro/actions/runs/34147782581) correcta.
- Diez fondos, Tierra, marco Cristal y precedencia CSS comprobados en el paquete iOS generado.
- Queda pendiente confirmación física de la UI y del fondo informado. Los detalles de distribución se conservan en el registro privado del producto.
