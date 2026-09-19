# UI final — candidata revisable, 19 septiembre 2026

Base visual: Cristal y protagonista real existentes. No logo nuevo, no elección de membrana A/B/C/D aplicada: sigue pendiente del usuario. Implementación posterior a música5614c41/f6b0c5a. Tarea01a0b934-3ec1-79f1-8029-de6177fd0228.

Botón Pasar a UI final en inicio/configuración; Volver a UI de desarrollo siempre disponible en configuración y en inicio. Preferencia separada voro-ui-mode-v1, sin tocar guardado ni reglas. Desarrollo es el valor inicial si no existe elección. Final conserva HUD de biomasa/adaptación compacto, controles44px, pausa, sonido, impulso, ajuste de cámara opcional, movimiento/táctil/tilt, recorrido y créditos. Encuadre y recorrido colapsables; cierre visible de configuración.

Solo Desarrollo muestra diagnósticos/captura/reportes, selector/saltos de entornos, boosts, galerías e interfaz de prueba. Al pasar a Final se cierran paneles de desarrollo y se desactiva medición. Una prueba activa conserva estado y se identifica como VISTA PREVIA; Volver a mi partida sigue accesible, sin convertirla en partida guardada. Final oculta botones de zoom inicialmente; pueden activarse en ajustes, con estado independiente de Desarrollo.

Fin: ajustes/pausa/reanudar ahora accesibles también junto al superviviente. Panel de pausa funciona tras completar. No cambia cinemática, controles de movimiento, adquisición de adaptaciones, progreso ni StoreKit/ReviewMilestone. Música aprobada preservada y créditos accesibles en las dos vistas. SFX nuevos no integrados.

## Evidencia

Capturas reales desarrollo/final de inicio, HUD y ajustes; además final-pause, final-adaptation, final-death, final-survivor, final-survivor-pause y final-credits. screenshots.json registra SHA256. Pruebas navegador430×932/DPR2, también360×740 y768×1024: sin overflow horizontal. Sin errores JS, elección persistente tras recarga y masa/XP/posición/etapa idénticas al alternar. Créditos con12 enlaces. capture.mjs añade un observador solo a la respuesta del módulo durante la prueba, nunca al código del producto.

TypeScript y compilación Vite separados correctos: artifact/voro-final-ui-local. 12 regresiones audio/final/StoreKit-policy/entornos correctas tras UI; suite completa previa173/173 en carpeta musical. Safe areas implementadas con env(); falta validación visual/táctil física iPhone/iPad. La captura de navegador no es una build nativa ni aprobación del usuario. No CI/subida/publicación.

Demo local mientras siga activo el servidor: http://127.0.0.1:5194/ . Pulsar Pasar a UI final. Regresar en Configuración. TestFlight0.5(2) y distribución intactos.

## Propuesta PC, sin iniciar port

Sí es razonable una vista horizontal adaptada, no estirar el lienzo vertical. Probar primero16:9 con HUD en esquinas, tecladoWASD/flechas, ratón y mando existentes; impulsoEspacio y pausaEsc. Mantener la versión móvil vertical y controles táctiles. Evitar que el ancho extra cambie inadvertidamente dificultad: conservar tamaño aparente del protagonista y revisar campo visible, anticipación de amenazas, generación, cantidad de presas y rendimiento. Comparar una partida idéntica antes de decidir cámara/área activa; no multiplicar población automáticamente por ancho. No ejecutable/Steam/distribuciónPC ni viewporthorizontal implementados en este encargo.
