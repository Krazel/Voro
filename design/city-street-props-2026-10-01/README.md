# Más objetos de calle — 1 de octubre de 2026

El usuario da por terminadas las animaciones y solicita más señales, basura y
objetos urbanos. Se añaden seis plazas por manzana: dos señales, un banco, una
farola y dos latas. Se reutilizan los assets existentes; no se añaden texturas.

Generación independiente, posterior a los residentes y objetos de llegada, con
IDs city-street estables. Hasta 24 intentos para encajar cada objeto en aceras;
si no cabe sin solaparse, se omite. Reserva su espacio incluso consumido para
no desplazar vecinos al recargar. Regeneración normal a los 150 segundos.

Los residentes, edificios y enemigos previos conservan exactamente ID, especie,
posición y tamaño en las 12 regiones de tres semillas comparadas. La densidad
máxima aumenta de 24 a 30 plazas por manzana (más objetos iniciales en llegada).
La comprobación de streaming contempla un máximo de 757 entidades en 25 regiones;
no es una medición de FPS ni una promesa de rendimiento en dispositivo.

Report.json: en las 12 regiones, señales 15→39, bancos 13→25, farolas 16→26 y
latas 35→59; 70 objetos adicionales (media 5,83 de seis posibles por manzana).
Pruebas espaciales sobre 120 regiones adicionales y 400 de regresión de mobiliario.

17 pruebas correctas, incluyendo persistencia, huecos libres y recorrido completo
simulado. Builds móvil y PC correctos. Galería/juego no cambian las animaciones.
Ciudad abierta en navegador integrado; captura browser.jpg. Sin nueva build iOS.
