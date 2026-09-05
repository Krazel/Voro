# Cristal — interfaz aplicada

2026-09-06. El usuario eligió «la A», aplicada como A1 Cristal, y pidió un poco de animación. Referencia conservada: design/ui-images/membrana-variants/A1-cristal.png.

Aplicada a la selección real de adaptaciones, reroll, pausa, evolución, avisos y configuración. Se conservan valores, límites, progreso, cámara y simulación. Botón Configuración → Probar interfaz Cristal con mejoras, evolución y pausa; comparte las tarjetas reales, ofrece selección/aviso y reroll de muestra sin llamar al motor ni alterar la partida.

Marco transparente creado con ChatGPT Images y conservado sin modificación en public/ui/cristal/membrane-frame.png; prompt en design/ui-images/membrana-variants/frame-prompt.md. El borde se usa como imagen dividida en nueve zonas, con texto HTML y arte de mejoras existente. Animación suave del borde y reflejo, entrada escalonada de tarjetas, contracción al pulsar y halo de evolución. Se respeta prefers-reduced-motion.

Verificación de la web local: TypeScript y lint sin errores; selección de muestra, aviso, reroll gratuito y estado agotado, tres pestañas y cierre de prueba comprobados mediante navegador. Comparación visual de mejoras/evolución/pausa con A1. Tamaño móvil 390×844: sin desbordamiento horizontal; contenido largo desplazable (350 px de ancho interno, 907 px de contenido). Al cerrar prueba permanecen los mismos 182 alimentos y siete adaptaciones de la partida local. Vista de escritorio también revisada. La animación se implementa con CSS; esta prueba web no acredita rendimiento en un iPhone.

Esta entrega actualiza la web. La IPA 0.3 build 1 ya entregada corresponde al commit c4c2da5 y conserva la interfaz anterior.
