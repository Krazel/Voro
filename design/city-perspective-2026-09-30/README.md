# Ciudad: perspectiva coherente · 2026-09-30

Encargo: el usuario aprobó corregir todos los problemas de la auditoría de los 29 elementos («perf, pues haz todo»). Referencia conservada: arquitectura elevada frontal, calles alineadas, contenedor nuevo. No se modifica el protagonista ni el balance.

## Implementación

- Veinte PNG nuevos con transparencia real, creados con la herramienta integrada ChatGPT Images. Cuatro objetos: banco, farola, señal y palmera. Diez personas: civil, tres unidades militares y seis variantes civiles. Seis vehículos: motocicleta, coche, furgoneta, blindado, tanque y helicóptero.
- Personas: cuatro vistas de cámara fija. Corrección del 01/10: cuatro poses pintadas para cada lateral, conservando las dos de frente/espalda. El ciclo anterior fue rechazado por piernas estáticas. Comparación y fuentes en `../city-walk-2026-10-01/`. Los cuerpos no se rotan en pantalla para cambiar de rumbo.
- Vehículos: vistas frontal, posterior y laterales. La vista izquierda del helicóptero se refleja horizontalmente de su toma lateral; conserva la vertical, a diferencia de la antigua rotación plana. Su rotor se anima en un plano elíptico sobre el mástil, independiente de cabina y patines.
- La palmera conserva movimiento de copa anclado al tronco, exportado fuera del dispositivo. Banco, farola y señal permanecen rígidos.
- Se conservan los 29 IDs, radios de juego, recompensas, requisitos de biomasa, velocidades y ataques. Las personas mantienen la altura visual común de 20 unidades con su variación previa. Los objetos redibujados caben dentro de su anterior envolvente; no vuelven a invadir edificios.
- Galería animada `index.html`: mismo renderer que el juego, cuatro direcciones. Se conservan edificios, arbusto, lata y contenedor que ya eran compatibles. La auditoría anterior muestra capturas históricas, evitando mezclar comentarios antiguos con imágenes nuevas.

## Arte y trazabilidad

`prompts.json` conserva el conjunto exacto de prompts, las referencias y rutas de generación, incluidas las iteraciones. `assets.json` contiene dimensiones, SHA-256 y tamaño de cada PNG. Originales copiados sin modificar los píxeles ni el canal alfa a `public/inhabitants/city-perspective/`.

`scripts/city-perspective-metadata.py` inspecciona el alfa y genera solamente coordenadas y anclajes en `app/city-perspective-art.json`. No edita imágenes. Los recortes siguen las separaciones reales de cada hoja, no una cuadrícula supuesta. Se corrigió una pose policial orientada al lado erróneo mediante ImageGen; se descartaron dos composiciones del helicóptero con rotores demasiado próximos.

## Rendimiento

Las veinte fuentes ocuparían aproximadamente 120 MiB decodificadas. Durante la carga de Ciudad se crean superficies de hasta 768 píxeles de lado largo, se descartan los decodificados originales y se conservan factores de escala para leer exactamente los mismos recortes. Dos cargas simultáneas; no se redimensiona ni genera una malla de personas/vehículos en cada fotograma. Las superficies se liberan al abandonar el entorno.

La prueba actualizada del 01/10 registra **48,75 MiB de atlases de Ciudad** (antes 52,50 MiB), incluyendo los elementos conservados. No es la memoria total de la app: no incluye el fondo, el protagonista, buffers ni hojas de animación. Las hojas de la palmera siguen bajo el presupuesto de la caché existente. Se retiraron 26 hojas obsoletas, recuperables desde Git y enumeradas en `retired-sheets.json`.

## Comprobaciones

- **334/334 pruebas correctas** tras la revisión del 01/10. Casos nuevos: parámetros de juego intactos, elección de vistas sin girar cuerpos, ausencia de hojas antiguas, recortes válidos en originales/superficies reducidas, liberación de memoria al cambiar de entorno y cambio real de silueta en el paso lateral.
- TypeScript y builds móvil/PC correctos. Verificación de assets incluidos en el build móvil. Aviso preexistente de tamaño de bundle, sin error de compilación.
- Galería: 29 elementos; tres escenas reales de Ciudad (centro, parque, zona de carga), sin errores del navegador. Evidencia `browser-verification.json`, capturas y `scripts/check-city-perspective.mjs`.
- Esta prueba no acredita FPS en un iPhone físico ni sustituye la validación nativa. La entrega es candidata local/Git; **sin nueva subida a TestFlight**. La distribución interna sigue en 0.13.5(1).

Se verificó la integración y se registró el resultado en PR-009 de la biblioteca, conservando marketing y estados de distribución.
