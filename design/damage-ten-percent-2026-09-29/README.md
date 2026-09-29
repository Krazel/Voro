# Daño de contacto al 10 %

Solicitud: bajar al 10 % la biomasa perdida al recibir un golpe. Cambio de código posterior a TestFlight 0.11.1 (1); no se ha publicado una nueva build por este ajuste.

- Colisión real con enemigo peligroso: 10 % de biomasa actual, sin mínimo que supere ese porcentaje en cuerpos pequeños.
- Proyectiles conservan su potencia menor, limitada a un máximo de 10 % incluyendo mínimo. Munición que ya puedes comer conserva su comportamiento.
- La pérdida de progreso no gastado de adaptación sigue la fracción real de biomasa perdida. El escudo, las adaptaciones adquiridas, dos segundos de invulnerabilidad y reciclaje siguen funcionando.
- El helper receiveHit conserva su escala interna para llamadas explícitas y herramientas; los dos caminos de daño del mundo aplican el límite aprobado y están probados con colisiones/proyectiles reales (no solo llamadas al helper).
- Ocho pruebas focalizadas correctas; tipos, build móvil y assets correctos. Suite de motor en curso.

Verificación terminada: 22 pruebas adicionales de motor, adaptación, entornos y efectos correctas, incluida simulación de crecimiento sin asistencia (115 s). Total 30 pruebas pertinentes.
