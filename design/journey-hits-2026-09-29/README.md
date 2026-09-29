# Golpes recibidos en Recorrido

Nuevo contador de impactos efectivos en la partida, incluidos los bloqueados por el escudo. No cuenta contactos ignorados durante invulnerabilidad, tras morir o con invulnerabilidad de pruebas. Persiste al guardar, evolucionar y reintentar; Volver a nacer lo reinicia. Las partidas antiguas empiezan a contabilizar desde esta actualización y muestran una nota, sin inventar datos históricos.

Interfaz en castellano e inglés, cuadrícula de cuatro estadísticas en móvil y pantalla ancha. Verificada visualmente en navegador a 390×844 y 1280×720. Captura: iphone.png. Esto no acredita una prueba física iOS.

Validación: ocho pruebas de golpes, daño y recuentos pasan; TypeScript y build móvil con verificación de assets correctos. Todavía no incluido en TestFlight 0.11.2(1).

A petición del usuario se creó el chat independiente 01a0ee97-7b09-79b0-96d7-1d8a7b1aa465 para investigar desde cero el petardeo del primer entorno. Audita el código sin modificarlo y guarda evidencias en design/audio-independent-audit-2026-09-29/. El sonido no se declara resuelto.
