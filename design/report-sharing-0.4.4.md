# Transiciones, adaptación e informes compartibles — 0.4.4 (1)

Encargo 2026-09-07: reducir el alejamiento al entrar en un bioma, sustituir la
mejora de biomasa por velocidad de adaptación y bajar ligeramente el ritmo base.
El usuario añade compartir siguientes informes como archivo mediante WhatsApp.
Se mantiene la exclusión del dibujo del protagonista.

## Cambios

- La imagen de salida de transiciones no costeras conserva al menos el 70 %
  de su tamaño (antes 15 %); el movimiento costero pasa de +10 % a +3,5 %.
  El objetivo de cámara evita alejarse más del 4 % adicional durante esa fase,
  frente al 20 % anterior. Encuadre inicial normal y zoom por crecimiento intactos.
- Núcleo eficiente (`yield`, ID conservado para partidas) pasa a Adaptación
  acelerada: +10 % aditivo de XP por compra, máximo ocho. Sin bonus de biomasa.
  Las compras existentes cambian al nuevo efecto; XP ya ganado, masa y niveles
  no se recalculan. Ilustración del núcleo original conservada.
- Nueva XP: valor del alimento × 0,85 × (1 + 0,10 × compras). Ritmo base −15 %,
  sin modificar los umbrales, evitando migrar o perder el progreso guardado.
  Los fragmentos reciclados y proyectiles siguen sin otorgar XP.
- Última captura de 30 s congelada, incluidos sus metadatos; alternar Mostrar
  rendimiento no la borra. Nueva medición sí la reemplaza. Conservación durante
  la sesión, no persistencia entre reinicios de la app. No se comparten informes vacíos.
- Copiar resumen produce texto corto. Compartir informe crea `Voro-rendimiento.txt`
  con JSON compacto, estadísticas completas y los cinco peores fotogramas con
  sus anteriores. Eventos agrupados por tipo; se omiten muestras crudas.
- iOS usa un único archivo reemplazable en Cache y el selector nativo de compartir.
  El usuario elige WhatsApp y destinatario. No hay envíos automáticos, servidores,
  permisos de contactos ni lectura de conversaciones. Cancelar conserva el informe.
  Web: Web Share de archivos desde el clic o descarga del archivo como alternativa.
- Plugins oficiales @capacitor/share 8.0.1 y @capacitor/filesystem 8.1.3. Incluidos
  por cap sync en SPM. Manifiesto de privacidad FileTimestamp/C617.1 añadido como
  recurso del target App según [Filesystem](https://capacitorjs.com/docs/apis/filesystem).
  Compartir file:// según [Share](https://capacitorjs.com/docs/apis/share); el flujo web
  preserva activación de usuario según [Web Share](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share).

## Informe físico recibido

El archivo del usuario queda truncado a 68.724 caracteres a mitad de muestras.
Resumen, sesión, peores cuadros y eventos están completos y pueden analizarse;
no se inventa ni reconstruye el resto. Copia fuente y extracción en artifact,
fuera de Git. Su resumen reducido ocupa 5.287 bytes.

0.4.3 (1), iPhone/iOS 16.7.16: 1.370 cuadros, 30 s activos; 45,7 FPS, P50 21 ms,
P95 28 ms, P99 32 ms; pico 68 ms, nueve intervalos >33,34 ms. CPU media 2,4 ms:
simulación 0,54, preparación 0,01, fondo 0,03, habitantes 0,38, protagonista 0,63;
render 1,8 ms (secciones anidadas). Una carga tarda 119 ms de tiempo transcurrido,
no CPU; siete hojas, 17,45 MiB de buffers y cero fallos/expulsiones/poses generadas.
Guardados medidos de 0–1 ms (precisión limitada del reloj de ese WebKit).

No son 60 FPS estables. La baja CPU instrumentada no mide GPU, composición,
scheduling ni trabajo de React/WebKit. No atribuir causalidad a GPU o Capacitor
con este informe. No se aplica una reducción de calidad del protagonista.
Próximo diagnóstico si persiste: comparar cadencia y carga gráfica en el mismo
dispositivo/bioma; conservar los nuevos informes pequeños para reproducir.

## Verificación

104 tests pasan, incluidos cinco nuevos sobre copia/archivo/cancelación, límite
compacto, captura congelada, compras guardadas, efecto XP y límites de transición.
TypeScript, lint modificado y builds web/móvil correctos; cap sync integra los dos
plugins. `drawCell` idéntico a 0.4.3 por comparación de fuente. Pruebas de adaptadores
no sustituyen abrir WhatsApp en un iPhone/iPad físico. Pendiente esa confirmación.

## Distribución

Entrega verificada 2026-09-07: 0.4.4 (1), web y TestFlight interno existente.
App Store sigue sin publicación pública; no hay beta externa ni cambios en anuncios.

- Fuente compilada: `853990cf4eb7abd23877af21b644c3727e45c9d7`.
- Web privada v30: `appgdep_6a9ebbb15c10819188ff00b8f0d03724`, succeeded
  2026-09-07T13:27:29.106117Z, https://voro-abisal.krazel.chatgpt.site/.
- CI: https://github.com/Krazel/Voro/actions/runs/34127310059, success.
- Apple build `f48260f4-cf04-40ee-ab17-8953ef92f47e`: VALID e IN_BETA_TESTING,
  asignada a VORO Interno con un tester; notas españolas y asignación releídas
  por API 2026-09-07T13:37:48.466Z. No se ha enviado a beta externa.
- IPA: 113.460.650 bytes; SHA256
  `34a088f2f5d755293c5832bf889ab4990c0d180117f58d515d3234330dd8517c`.
  Checksum de CI cotejado. ZIP incluye PrivacyInfo.xcprivacy y plugins Share y
  Filesystem, sin server.url remoto.
- Biblioteca D1: misma ficha PR-009, revisión 19, versión 0.4.4 (1) guardada
  y releída; tracking anterior conservado. Siguiente paso: prueba física de
  compartir/cancelar en WhatsApp, transición y ritmo de adaptación.

La disponibilidad en TestFlight no sustituye esa prueba física. No se afirma
una mejora de FPS de 0.4.4 sin una captura del mismo dispositivo y escenario.
