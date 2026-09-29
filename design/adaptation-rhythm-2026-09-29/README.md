# Ritmo de adaptaciones restaurado

El usuario aclaró que quiere el ritmo anterior a la reducción del 20 %, no simplemente el anterior al último ajuste de duración.

Referencia histórica: 2993110, antes de 4ac8e0a. Se restaura el multiplicador de alimento 0.85 (actualmente era 0.748 tras reducirlo a 0.68 y subirlo un 10 %). También se recuperan sus factores de experiencia por entorno: raíz cuadrada de micro .13, pond .16, land .16, water .136, city .104, orbit .32, planets .2, stars .23, galaxies .3 y universe .3.

Estos factores quedan separados de las recompensas de biomasa: el último ajuste de duración modificaba indirectamente la experiencia al reutilizar sus coeficientes. Se conserva la calibración actual de biomasa, los objetivos de evolución, las mejoras, umbrales y progreso ya guardado. Los tiempos simulados antes de esta restauración son históricos; no se ha vuelto a medir una campaña completa con este ritmo.

Validación: 19 pruebas (recompensas históricas en los diez entornos, independencia respecto a biomasa, digestión normal y de la Tierra, bonificación de adaptación, daños y persistencia), TypeScript y build móvil con assets verificados.

Guardado como candidata. TestFlight sigue en 0.11.2 (1); este cambio aún no está subido.
