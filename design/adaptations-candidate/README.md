# Candidata de adaptaciones — 2026-09-28

Respecto a la versión entregada 0.8.1:
- Eliminada Absorción amplia (antes Pseudópodos largos, ID `reach`). Las partidas antiguas siguen cargando y devuelven esas elecciones para escoger otras, hasta el límite disponible; no se duplican al guardar y cargar.
- Corriente aspirante explica que atrae comida comestible hacia el protagonista. Cada adquisición añade 14 unidades al alcance; no cambia los tentáculos, la biomasa ni permite comer enemigos demasiado grandes.
- Se conserva Membrana repulsora de la candidata anterior, en lugar del daño de espinas.
- Quedan 13 adaptaciones y 69 adquisiciones posibles. No se han cambiado los demás valores.

Propuesta pendiente, NO implementada: Digestión protegida. Cada adquisición conservaría un alimento en digestión al recibir daño, hasta tres. Mantendría su progreso, priorizando los alimentos más cercanos a terminar. El golpe seguiría quitando biomasa. Aporta protección a una captura conseguida sin duplicar escudo o reciclaje.

Validación: 28 pruebas de adaptación, límites, idiomas, repulsión y migración correctas; TypeScript, compilaciones móvil y PC correctas. Verificación en navegador local: 13 tarjetas, filtros y repulsión funcionales, sin errores de página. No es una prueba de rendimiento físico ni se ha vuelto a medir la campaña completa con las 69 elecciones. No se ha empaquetado ni subido a TestFlight esta candidata.
