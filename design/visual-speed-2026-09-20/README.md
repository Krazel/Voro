# Velocidad visual uniforme entre entornos

Entrega local del 20-09-2026 sobre `73989e2`.

La misma velocidad del motor se veía distinta porque el zoom automático de entrada variaba: Microscopio empezaba a `1,12×`, Agua/Tierra/Playa a `2,36×` y Órbita a `0,625×`. El modo nuevo compensa únicamente ese zoom automático para igualar el desplazamiento aparente de referencia a 140 unidades de pantalla por segundo. Las mejoras de velocidad, el impulso y el zoom manual conservan su funcionamiento.

Configuración incluye `Velocidad visual entre entornos` con dos estados:

- `Uniforme`, predeterminado: aplica la compensación.
- `Clásica`: restaura exactamente el multiplicador anterior.

La elección se recuerda en `localStorage`. Se verificó en Chromium el ciclo Uniforme → Clásica → recarga → Clásica → Uniforme, sin errores de página. [Captura del ajuste](settings-uniform.png).

Validación: 174/174 pruebas, TypeScript y build móvil correctos. La prueba nueva comprueba la igualdad matemática en radios de entrada representativos, incluidos Agua y Órbita.

No se ha subido una nueva build ni se ha publicado el juego.

Biblioteca: ficha `PR-009`, revisión 89, guardada por API y releída. Se conservaron versión, build y estados de distribución. Recibo: `library-verification.json`.
