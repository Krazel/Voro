# Verificación del paquete y correcciones nativas

- d833e0c: candidata inicial 0.6.5(1),225 pruebas correctas y QA de desarrollo.
- 2b63bb8: reserva de área segura sobre título de iPhone.
- CI35872009767 cancelada; API35872616554 acreditó sesión1 AWAITING_UPLOAD,
  sin build procesada. No se asignó al grupo interno.
- ba8974a / CI35873068247: 0.6.5(2) subió a Apple, pero se canceló antes de
  entrega al detectar fallo nativo. API35874696140 verifica VALID, groups=[],
  READY_FOR_BETA_TESTING. No disponible en grupo;0.6.4(1) sigue IN_BETA_TESTING.
- QA nativa35872431785: iPad falló y capturas mostraron panel desplazado en ambas
  plataformas. iPhone había pasado interacciones: ese PASS no acreditaba fidelidad.
- Causa: el optimizador target Safari15 baja translate:none a transform:translate(0,0),
  pero la traslación individual de utilidades Tailwind seguía activa. Posición -50%.
- 96086e0: translate/transform inline explícitos en el popup, sin alterar otros diálogos;
  quedan preservados en bundle.0.6.5(3). Se añaden aserciones de título en pantalla.
- compiled-checks.json comprueba bundle minificado en390×844,1032×1376,1376×1032:
  geometría exacta de viewport, imágenes cargadas, apertura manual, cancelar/silencio.
  Fixture aislado de partida terminada; app/page.tsx restaurado byte a byte y bundle
  normal reconstruido al terminar. La distribución nunca ejecuta ese fixture.
- Prueba nativa corregida35874692182 pendiente al escribir esta nota.

Capturas/logs nativos originales conservados localmente en artifact/d3-native-ipad/
y artifact/d3-native-iphone/. Apple consultas en artifact/testflight-0.6.5-*-query/.
No se ha enviado ninguna versión a revisión ni publicado App Store.

Verificación final:17c1d5e / CI35876996054, cuatro pruebas EN/ES pasadas en iPhone e iPad. Capturas revisadas, incluida rotación con10franjas visibles. native-qa.json conserva procedencia/hashes; PNG normalizados únicamente por orientación EXIF.0.6.5(3) enviada a CI35878619305 tras esa comprobación. No prueba física.
