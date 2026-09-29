# Ritmo de adaptación y daño más suave

Petición: subir un 10% el ritmo actual tras su reducción previa del 20%, y reducir las pérdidas de biomasa y adaptación por daño.

- Ganancia fija de adaptación por alimento: 0.68 → 0.748 (+10% relativo al ritmo actual; queda un 12% por debajo del antiguo 0.85). Se aplica también a las digestiones pendientes durante la absorción terrestre.
- Daño entrante: factor global 0.60, tanto en porcentaje como en mínimo. Ejemplo: golpe del 25% → 15%; mínimo 0.6 → 0.36.
- La pérdida de progreso sin gastar sigue la proporción real de biomasa perdida, por lo que también baja un 40% respecto al daño anterior a este encargo en golpes no letales. No se multiplica una segunda vez. Un golpe letal sigue vaciando el progreso no gastado; conserva las adaptaciones adquiridas.
- No se cambia biomasa ganada por comida, umbrales, límites de mejoras, guardados, inmunidad, escudos ni reglas de fragmentos. Los fragmentos se calculan a partir de la nueva pérdida real.
- Validación: 31 pruebas relevantes correctas, incluidos ambos tipos de daño y la ganancia por comida en los diez entornos. Una expectativa antigua de 6.8 XP se actualizó a 7.48 y las ocho pruebas de ese bloque se repitieron correctamente. TypeScript y compilaciones móvil/PC correctos.
- Aplicado al código y vista local; TestFlight continúa en 0.10 (1), sin estos ajustes nuevos. No se subió otra build en este encargo.

## Aclaración del usuario

El 15% se refiere a la pérdida de biomasa del golpe del ejemplo, no al ritmo de adaptaciones. Se mantiene +10% de XP y se ajusta el multiplicador de daño a 0.60: 25% → 15%. Los ataques menos fuertes mantienen su proporción, y el mínimo también baja. Nueve pruebas relevantes repetidas correctamente tras esta corrección (diez entornos, XP, guardados, inmunidad, escudo y fragmentos).
