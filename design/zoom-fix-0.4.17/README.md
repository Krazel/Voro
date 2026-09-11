# VORO 0.4.17 (1) — Acceso al zoom y lentitud severa

Dos defectos encontrados al revisar la petición repetida:

1. En 0.4.16 el bloque camera-settings se había insertado delante de la primera instancia de movementChoice (la introducción), en vez de dentro del diálogo Configuración. El usuario no podía encontrarlo donde se le indicó. Se traslada al diálogo y los botones de zoom durante la partida quedan visibles por defecto; Configuración permite ocultarlos. Mantiene el rango 75–175 %, restablecer y el encuadre inicial cercano de 0.4.16.
2. RasterBudget exigía 40 cuadros por ventana de 2,4 s. A aproximadamente 16 FPS o menos se reiniciaba sin bajar la resolución, justo cuando más falta podía hacer. Se exige un mínimo de 12 muestras; se conservan la duración, proporción de cuadros lentos, exclusiones y el suelo de calidad. Una prueba reproduce 10 FPS sostenidos y comprueba el descenso gradual hasta el límite. No modifica la simulación ni el dibujo del protagonista.

144 pruebas pasan; TypeScript/lint/build web y móvil correctos. localhost:5175 estaba apagado. Se reactivó sirviendo mobile-dist y se verificaron por HTTP el JS real 0.4.17 y las funciones de zoom/rendimiento. No equivale a medición del dispositivo ni confirma que desaparezcan todos los tirones. CUA falló al iniciar por ACL del sandbox; sin prueba visual interactiva en esta sesión.

Entrega y verificación de IPA/API en artifact/testflight-0.4.17-build-1/. Se actualiza la ficha PR-009 preservando revisión y tracking. Sites público sigue sin modificar por su autorización específica de destino pendiente de la revisión anterior.
