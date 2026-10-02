# Huida urbana y visibilidad del señuelo — 2 de octubre de 2026

Candidato local sobre TestFlight 0.14 (1). No se ha subido una build nueva.

- Señuelo orgánico: opacidad máxima 26 % → 46 % en todos los entornos. Conserva la imagen difuminada precalculada, duración y desaparición de los últimos 0,65 s. No añade filtros ni pasadas de dibujo.
- Peatones: hasta 1,9× su velocidad de paseo al huir de un protagonista cercano. Vehículos terrestres: hasta 1,65×. Aceleración suave (respuesta de 0,35 s) y desaceleración más lenta (1 s); no se ajustan a la velocidad del jugador.
- Distancia de reacción desde el borde del organismo, conservando la histéresis de la IA. Soldados y vehículos armados mantienen su combate; aceleran al huir cuando son comestibles o están asustados. Otros animales y entornos mantienen sus velocidades.
- El movimiento urbano se normaliza sobre la calle/acera. La cadencia de las piernas integra la distancia realmente recorrida: sin saltos de fase al acelerar y sin caminar si están inmovilizados.

## Verificación

- `node --test tests/*.test.mjs`: 346/346 correctas. Cinco nuevas pruebas de huida, independencia de FPS, combate, calles, inmovilización y continuidad de animación.
- `npx tsc --noEmit`: correcto.
- `npm run build:mobile`: correcto, incluida verificación de assets empaquetados.
- Escena real de Ciudad abierta en navegador local. No equivale a una prueba física en iOS.
- Campaña de contraste: `node scripts/simulate-duration.mjs direct 41 30 design/city-escape-2026-10-02`. Completada, 0 muertes, 76,51 min simulados. Ciudad: 591,97 s frente a 571,07 s con la misma semilla/perfil de la auditoría anterior (+20,9 s). Una comprobación de regresión, no una nueva estimación estadística de duración. Resultado en `direct-41-30.json`; captura del árbol de fuente anterior a commit, con cambios locales presentes.

La auditoría de 100 campañas anterior corresponde a 0.14 (1), anterior a esta aceleración urbana.
