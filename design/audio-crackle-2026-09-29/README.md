# Petardeo de audio — candidato del 29 de septiembre

Usuario: chasquidos intermitentes, al menos en Microscopio. No se ha reproducido el fallo exacto en un iPhone físico; la causa sigue pendiente de confirmar.

## Evidencia

- `source-audit.json`: decodificación de Solace y los cinco WAV originales sin errores ni muestras saturadas. Esto no descarta cortes durante su reproducción ni otras pistas.
- `mixed-signal.json`: motor Web Audio real, render offline estéreo a 48 kHz, 24 segundos de Solace + 69 comidas con pitch variable + golpes cada 0,5 s. Pico 0,638, cero muestras saturadas. No es una prueba de tiempo real ni del hardware iOS.
- Script reproducible: `scripts/check-audio-crackle.mjs`, con `VORO_PLAYWRIGHT_RUNTIME` apuntando al package.json del runtime con Playwright. No modifica archivos de audio.

## Mitigaciones y diagnóstico

- Solicitar `latencyHint: balanced`, en vez del mínimo interactivo. Es una preferencia: el navegador puede ignorarla. No se fuerza la frecuencia de muestreo.
- Comidas, impactos y tonos se programan 12 ms por delante del reloj de audio. La fuente y su envolvente empiezan exactamente juntas; se conservan volumen, pitch, duración y fades.
- Informe: frecuencia y latencias reales disponibles; underruns solo cuando el navegador los expone. Ausencia de API se registra como desconocido, nunca como cero fallos.
- Registro acotado de 24 eventos de música/contexto: waiting, stalled, error, playing, pause y cambios de estado, con instante de audio y posición de pista. Se retiran los listeners al destruir el reproductor.
- Sin trabajo adicional por fotograma, captura de audio, cambios del protagonista ni nuevos assets.

## Límite de la entrega

Verificación: 275 pruebas automáticas correctas (incluidas tres nuevas de reloj/diagnóstico), TypeScript sin errores y builds móvil/PC correctas. Estas pruebas no sustituyen la reproducción física del fallo.

Candidato local: no es una nueva build de TestFlight. La última distribuida sigue siendo 0.10.1 (1). Para confirmar el problema faltará probar esta mitigación en el dispositivo afectado y correlacionar un informe con el instante del chasquido. En iOS 16 puede no estar disponible el contador de underruns.
