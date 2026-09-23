# Candidata local 0.6.8 (1)

Encargos recibidos del cerebro después de cerrar la fuente de TestFlight 0.6.7 (1): algo más de materia pequeña en Órbita y desaparición final de fuera hacia dentro, conservando la aparición aprobada.

Órbita conserva sus nueve plazas previas y añade una sola plaza de restos pequeños por región de 600 × 600. Son restos metálicos, chatarra o paneles, con radio 10.2–13.8; comestibles al entrar según las reglas de biomasa vigentes. No aumentan planetas, estaciones, satélites grandes ni peligros. Se añade al final del generador para conservar IDs, posiciones, tamaños y memoria de absorción de todos los objetos anteriores.

Comparación determinista de 100 regiones, semilla453: 902→1002 entidades; las 902 originales idénticas. Cien nuevas de tres tipos, radio observado10.328–13.750 y requisito máximo0.886, inferior a biomasa inicial2. Generación local de las cien regiones:13.77→15.64ms (una muestra orientativa, no FPS de iPhone). Una plaza más por región limita el coste y se reutilizan assets existentes. Capturas before/after/orbit.png muestran la diferencia moderada.

Final: el mismo perfil radial de aparición se usa al revés para ocultar todo lo ya dibujado. Se aplica después de membrana, flagelos, halos y núcleo, evitando que los trazos con alpha propio dejen contornos. El núcleo original se contrae hasta un punto mientras el cierre termina de apagarlo. Duración de31s y aparición posterior conservadas. No hay texturas nuevas ni buffers creados por fotograma.

Evidencia visual: after/sequence.webm (secuencia completa,30fps nominales), fotogramas finales y visual-verification.json. Seis fotogramas de aparición entre18 y30.5s conservan exactamente los SHA256 originales. Durante desaparición:35546→33568→14938→874→22→0 píxeles visibles; a12s queda un punto de5×5px, sin borde residual, luego negro. El vídeo y estas capturas son del navegador local; no acreditan rendimiento físico iOS. after/population.json y before/population.json permiten comparar cada objeto.

Verificaciones finales: 231/231 tests en ejecución serial, TypeScript sin errores, build móvil y assets correctos. Se actualizó el límite de ecología para contar la plaza adicional, y se añadió una regresión de conservación de objetos/IDs y otra de máscara aplicada después de todos los trazos. Hubo un cierre nativo transitorio de V8 y una lectura/hash inconsistente durante ejecuciones paralelas locales; el SHA del archivo era correcto en PowerShell, el test aislado pasó y la ejecución completa serial pasó sin cambiar ese asset.

No incluida en TestFlight0.6.7; candidata0.6.8(1) local, sin subida nueva. Demo en http://127.0.0.1:5206/?ui=final. La nueva secuencia puede comprobarse en el modo de pruebas de Universo; vídeo y fotogramas adjuntos a esta evidencia.
