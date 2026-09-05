# Propuestas de interfaz — 05/09/2026

Petición: comparar diseños de los avisos y pantallas que aparecen durante VORO. Ruta /interfaz, enlazada desde Configuración y /animaciones. No se aplica todavía ninguno a la partida.

## Diseños

- Abisal: panel oscuro translúcido, serif, tarjetas horizontales con ilustración pequeña; narrativa libre sobre el fondo.
- Núcleo: panel sólido oscuro, acento ámbar, títulos sans-serif de mayor peso e ilustraciones más grandes; narrativa en tarjeta cálida.
- Observatorio: panel inferior claro de información compacta; límites, efectos y categorías alineados, botones oscuros.

Estados completos: adaptación, mejora adquirida, evolución, frase narrativa, daño, pausa, ajustes, derrota, final y vista en juego. El comparador mantiene el mismo estado, contenido y fondo en los tres modelos. Modos individual y comparación simultánea; en móvil la comparación se desplaza horizontalmente. Paneles internos desplazables si crece el texto.

Interacciones de muestra: escoger una mejora con efectos/límites tomados del catálogo real; un reroll; volver a las tarjetas; continuar; configuración con reducción de animaciones, estado simulado de sonido, confirmación para reiniciar solo la muestra; impulso con espera de siete segundos; repetir la entrada. No instancia el motor ni accede a localStorage: la campaña no se lee ni se modifica. El estado de muestra desaparece al abandonar la ruta.

Fondos: tres renders del motor de VORO en mar, orilla y planetas, exportados a public/ui-previews/ mediante Canvas; tarjetas con el atlas biológico existente de ChatGPT. La simulación queda estática para comparar la UI; las entradas de avisos sí están animadas. Idioma español. Las referencias vivas son los propios prototipos: pendientes de elección del usuario, no marcadas como arte aprobado.

Verificación: TypeScript, lint de los archivos modificados, carga HTTP de /interfaz y compilación de producción. No se ha realizado una prueba interactiva de navegador ni una captura nativa de iOS; la entrega es una propuesta web para probar.
