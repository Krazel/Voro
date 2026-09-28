# Señuelo difuso — variante B aprobada

2026-09-28. Usuario: «me gusta algo parecido a la segunda». Referencia de ChatGPT Imágenes preservada en approved-B.png, SHA-256 c0aa55bb5fbe315ed239ce1a81007a73d29b2196f5440e984ee079a41f62655c. Es una propuesta de aspecto, no un nuevo sprite estático del protagonista.

La copia real conserva la forma capturada al impulsar. Núcleo al45% en la captura, suavizado mediante reducción a64px y nueve desplazamientos ponderados al reconstruir512px, opacidad final26% (antes70%). Preparación una vez por impulso; cada frame sigue usando un único drawImage, sin filtros dinámicos ni lecturas de píxeles. Compatible con Canvas sin soporte de filter. Se conserva respiración lenta y desvanecimiento final, duración2s, rareza, recarga compartida y comportamiento de los perseguidores.

Comparación: approved-B.png es el concepto; separation.png es captura del juego web real a780×844, español. Revisados bordes suaves, interior apagado y núcleo tenue; protagonista nítido. departure/fade/gone documentan el ciclo; mobile-offer.png comprueba tarjeta móvil390×844. No es una captura de iOS ni una medición de FPS físicos.

Verificación:5 tests de señuelo correctos, TypeScript sin errores, builds móvil/PC correctos, navegador sin errores; sigue separándose del protagonista y desaparece a2s. browser-check.json registra estados. No subida TestFlight ni nuevo ejecutable. Ajuste fijo de XP−20% intacto.
