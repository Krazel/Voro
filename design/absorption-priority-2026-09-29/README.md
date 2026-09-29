# Prioridad de absorción por tamaño

Los huecos disponibles se llenan primero con los objetos comestibles de mayor radio real que ya estén al alcance, después del movimiento y de la corriente aspirante. Antes se llenaban en el orden de almacenamiento del mundo, por lo que los pequeños podían ocupar todos los huecos.

La digestión que ya está en curso se conserva. No se reservan huecos para objetos lejanos, demasiado grandes para comer, consumidos o con recogida aplazada. Los fragmentos recuperables siguen la misma prioridad. No cambian capacidad, alcance, recompensas ni tiempos de digestión.

Se reutiliza un buffer y solo se ordenan candidatos cercanos y elegibles; no se ordena ni se copia todo el mundo para priorizar.

Validación: 16 pruebas de prioridad, absorción urbana y simulación; TypeScript; build móvil y verificación de assets. Todo correcto. Incluye prioridad independiente del orden/recompensa, digestiones existentes, capacidad llena, objetos no elegibles y fragmentos recuperables.

Cambio candidato, todavía no subido a TestFlight. La versión interna vigente sigue siendo 0.11.2 (1).
