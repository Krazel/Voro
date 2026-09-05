# Fondos de VORO — 05/09/2026

Implementación solicitada: ampliar a todos los entornos el fondo que se recorre al moverse, aumentar variedad y corregir peces diminutos respecto a las plantas. Microscopio conservado. Dirección visual delegada por el usuario; pendiente de su valoración jugando.

Nueve atlas de ChatGPT, 36 zonas pintadas. Cada entorno combina sus cuatro zonas con recortes, reflejos y mezclas suaves. Charca, mar y ciudad siguen las coordenadas del mundo; el espacio usa desplazamiento más lento para dar profundidad. La orilla conserva arena a la izquierda y agua a la derecha en las mismas coordenadas que limitan a los animales. Cada visita conserva el paisaje por semilla y coordenadas, sin aumentar la población de comida. Se mantienen zoom y controles.

Los originales, prompts y SHA-256 están en esta carpeta y manifest.json; el juego carga copias WebP optimizadas. Preparación de texturas limitada a tres atlas en memoria y carga de cada fondo al visitar su entorno.

Escala: alga marina 90→28 unidades de radio; coral 45→24; anchoa 6→8, sardina 10→12, pez payaso 5→7, cirujano 12→14, caballito 6→8. Fragmento de hoja de charca 50→26; hoja de orilla 90→40. Las recompensas de plantas reducidas acompañan su tamaño. Los rangos individuales y la comparación de la galería usan estos mismos datos.

Verificación: 75 pruebas existentes superadas, tres pruebas nuevas de fondos y proporciones superadas; sandbox repetido tras ajustes finales. scripts/check-ground-raster.mjs verifica 18 combinaciones de entorno/zoom con imagen blanca para detectar uniones oscuras y comprueba que una textura real avanza exactamente con la cámara. TypeScript y lint de archivos modificados correctos. Lint global contiene avisos/errores heredados en componentes shadcn y otros tests ajenos al cambio.

Evidencia renderizada con el motor Canvas real fuera del navegador: gameplay-all.png (9 entornos) y gameplay-sea-travel.png (4 zonas del mar). No acredita prueba nativa de iPhone ni rendimiento medido en dispositivo. Publicación web privada tras compilación y verificación.
