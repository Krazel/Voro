# Desaparición inmediata tras absorber el universo

Petición28/09/2026: conservar la animación final pero eliminar la espera visual entre terminar de comer y empezar a desaparecer.

Causa: el estado bodyLight ya decrecía desde8s, pero el render pintaba el cuerpo a intensidad completa y solo contraía la máscara exterior. Esa máscara arrancaba fuera de la silueta, produciendo una espera visible aunque el estado de prueba cambiara.

Solución: atenuación gradual de las capas visibles desde8s, protegiendo el núcleo original. Atenuación lineal sin tramo inicial de aceleración, termina11,6s; contracción radial y del núcleo conservadas. Absorción8s, oscuridad13s, reaparición18s y duración31s intactas. No estrella nueva ni cambio de movimiento, cámara, audio, alimentación o protagonista fuera de esta escena. Un gradiente adicional solo durante la desaparición, sin texturas, filtros ni canvas nuevos por frame.

Verificación:14 tests de final/ciclo de vida, incluido render a100ms de acabar de absorber, y TypeScript correctos. Builds móvil/PC correctos. scripts/check-finale-immediate-fade.mjs captura el canvas real a390×844 en9 instantes; navegador sin errores. Revisados8s,8,6s,9,2s y11,6s. Capturas web, no prueba física iOS. TF/ejecutable0.8.1 intactos; disponible en servidor local.
