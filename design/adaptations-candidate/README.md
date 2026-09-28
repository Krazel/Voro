# Candidata de adaptaciones — 2026-09-28

Tras 0.8.1 se retiró Absorción amplia con devolución de elecciones guardadas y se sustituyeron las espinas por Membrana repulsora.

Encargo actual: añadir Señuelo orgánico y ajustar únicamente el reparto de elecciones, la bonificación de Adaptación acelerada, la escala de Corriente aspirante y la mejora de Impulso elástico.

- Señuelo orgánico: rara, una adquisición; cada impulso aceptado deja una copia durante 2 segundos. Usa la recarga del impulso, sin temporizador adicional. Desvía a perseguidores móviles ya cercanos y sus nuevos disparos; no atrae enemigos nuevos, ni hace invulnerable. Snapshot del protagonista limitado a 512×512 una vez por impulso, animación de respiración y desvanecimiento mediante composición. No se recalcula otro protagonista por fotograma.
- Adaptación acelerada: +5% por elección, máximo ocho (+40%).
- Corriente aspirante: +15% del radio corporal por elección, con mínimo14 unidades por elección para conservar su efecto al inicio; seis elecciones. Solo comida comestible.
- Impulso elástico: +0,10 potencia, +0,025s duración, −0,5s recarga por elección. Base sin cambios: ×2,5 /0,42s /7s. Máximo ×2,9 /0,52s /5s.
- Cadencia: ganancias por entorno en campaign-pacing.mjs; moderación gradual cuando el número de elecciones supera su referencia de etapa, sin bloqueo ni límite duro de entorno. Conserva XP y elecciones guardadas; cada nueva barra sigue empezando en cero. Los objetivos de biomasa y los demás efectos y límites no cambian.
- 14 tipos, 70 adquisiciones. Digestión protegida descartada; no implementada.

Verificación y límites en ../organic-decoy-2026-09-28/README.md. Candidata local; TestFlight y ejecutable entregados siguen en0.8.1.
