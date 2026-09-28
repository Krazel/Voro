# Candidata de adaptaciones — 2026-09-28

Tras 0.8.1 se retiró Absorción amplia con devolución de elecciones guardadas y se sustituyeron las espinas por Membrana repulsora.

Encargo actual: añadir Señuelo orgánico y ajustar únicamente el reparto de elecciones, la bonificación de Adaptación acelerada, la escala de Corriente aspirante y la mejora de Impulso elástico.

- Señuelo orgánico: rara, una adquisición; cada impulso aceptado deja una copia durante 2 segundos. Usa la recarga del impulso, sin temporizador adicional. Desvía a perseguidores móviles ya cercanos y sus nuevos disparos; no atrae enemigos nuevos, ni hace invulnerable. Snapshot del protagonista limitado a 512×512 una vez por impulso, animación de respiración y desvanecimiento mediante composición. No se recalcula otro protagonista por fotograma.
- Adaptación acelerada: +5% por elección, máximo ocho (+40%).
- Corriente aspirante: +15% del radio corporal por elección, con mínimo14 unidades por elección para conservar su efecto al inicio; seis elecciones. Solo comida comestible.
- Impulso elástico: +0,10 potencia, +0,025s duración, −0,5s recarga por elección. Base sin cambios: ×2,5 /0,42s /7s. Ocho adquisiciones; máximo ×3,3 /0,62s /3s.
- Cadencia corregida por petición del usuario: eliminada la moderación por elecciones/etapa y los multiplicadores adicionales introducidos con ella. Se recupera la recompensa fija anterior por entorno (raíz del coeficiente de biomasa, mínimo0,25); no depende de cuántas elecciones llevas ni de cómo juegas. Costes de adaptación y XP guardada intactos; nueva barra a cero como antes.
- 14 tipos, 74 adquisiciones. Digestión protegida descartada; no implementada.

Verificación y límites en ../organic-decoy-2026-09-28/README.md. Candidata local; TestFlight y ejecutable entregados siguen en0.8.1.

Corrección posterior a889a091: 32 tests de efectos, ofertas, guardados e idiomas correctos. Los pilotos documentados en organic-decoy-2026-09-28 corresponden a la candidata anterior con moderación dinámica; no acreditan el reparto final de esta versión. No se afirma un equilibrio completo ni se añaden mejoras no elegidas por el usuario.

Aprobación final del ajuste de ritmo: reducción FIJA del20% del progreso por comida respecto a0,85, es decir coeficiente0,68. Afecta digestión normal y comidas pendientes al absorber la Tierra. No reduce XP ya ganada, no cambia biomasa, costes ni efectos de mejoras. La bonificación de Adaptación acelerada sigue siendo+5% por adquisición. Sustituye la propuesta de−23,53% de la auditoría; los resultados de aquella propuesta no son una medición de esta versión.
