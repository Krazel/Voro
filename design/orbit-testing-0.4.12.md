# Microscopio, Tierra y controles de prueba — 0.4.12 (1)

El microscopio usa el fondo aprobado en regiones continuas ligadas a la cámara,
con caché y desplazamiento de profundidad 0,65. Se retira el desplazamiento
sinusoidal de solo unos pocos píxeles que parecía una imagen estática.

Órbita queda alrededor de la Tierra: anillo libre, atracción progresiva desde
1200 unidades y límite de 1550 incluso con impulso mejorado. La superficie y
su dibujo comparten coordenadas. No se generan habitantes bajo la superficie.
Con la meta de biomasa alcanzada, acercarse a la Tierra inicia una absorción
cinemática de 3,2 s (1 s con movimiento reducido). Solo al terminar se inicia la
transición a Planetas. earthConsumed sobrevive al guardado y evita repetir la
Tierra en Planetas. Las escalas se resuelven en la transición cinematográfica.

Configuración > Probar entornos y tamaños permite pasar al siguiente entorno
(opción activada por defecto en la interfaz; el API conserva el modo fijo por
defecto). Durante una prueba: +25 % de la meta de biomasa, llenar barra y una
adaptación inmediata para elegir. Los controles y transiciones no modifican la
campaña guardada; al salir se restaura la misma partida. Las adaptaciones por
comer también funcionan en pruebas, con sus límites y elecciones normales.

Validación: 129 tests; TypeScript y lint correctos. Incluye avance al absorber,
persistencia, no reaparición, gravedad 30/60/120 FPS con impulso extremo, pruebas
fijas, transiciones y controles independientes, caché del microscopio. QA local
por UI: microscopio visible, botón de adaptación abre selección, llenar barra en
Órbita provoca absorción y transición visible a Planetas. No es una prueba física
de la IPA. Entrega y artefactos verificados en la biblioteca/evidencias privadas.
