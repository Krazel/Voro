# VORO 1.0 — preparación de tiendas, 4 octubre 2026

El usuario autorizó preparar la venta de Windows y la revisión de App Store. Precio final aclarado: **5,99 USD en itch.io**, conservando el sistema de cobro actual; **5,99 EUR como base de España en App Store**. Esta entrega prepara las fichas y archivos; no publica itch.io ni envía la app a revisión.

## Corrección del usuario — estado vigente

El usuario rechazó la renovación de capturas y textos. Se restauraron por API las ocho capturas originales con idénticos archivos, checksums y orden; las dos previews siguen intactas. Ver `apple-restored.json` y run 37202373721. Las 20 imágenes nuevas descritas más abajo son historia de un cambio revertido, no el estado vigente. La descripción original de itch.io se repuso desde el HTML aprobado guardado en `.studio/marketing/voro/itchio/controls-20260929/description-after.html`; se guardó, pero la relectura quedó pendiente al desconectarse Chrome. No ampliar el encargo más allá del ejecutable y precios.

## Binarios y pruebas

Código final del juego: `b1285d832684ef203dad1906db767e0d8f7d57d2`, versión 1.0, build 1. No se cambia el balance ni el juego durante la preparación comercial.

- 346 pruebas, 12 escenarios de UI Chromium/WebKit y 99/99 campañas completas. Evidencia en `../final-review-1.0-2026-10-04/`.
- Media de campaña 79 minutos; Ciudad 8:05. Órbita puede alargarse: 5/90 casos superaron 15 minutos, máximo 43:44 con 167 golpes. No se observó bloqueo permanente; se conserva el balance aprobado.
- Windows: QA del ejecutable sin errores JavaScript, assets fallidos ni solicitudes remotas. Movimiento/impulso, sonido WAV, menús, guardado tras reiniciar y pantalla completa verificados. `../delivery-1.0-2026-10-04/windows-native-check.json`.
- iOS: IPA final SHA-256 `3563e41e451e2a7fe4ba79f9a4fe35717e3b05687c2d330518ce0cd3da075780`, iOS mínimo 15.0, iPhone/iPad y cuatro orientaciones iPad. Sin permisos de cámara, micrófono o tracking; sin excepciones ATS. `binary-audit.json`.
- Audio iOS: prueba de simulador en `../delivery-1.0-2026-10-04/ios-simulator-audio.json`. Se conserva la excepción del producto: música AVAudioPlayer, efectos Web Audio existentes. No equivale a escucha ni FPS en dispositivos físicos. El usuario ha probado el juego; esta auditoría no certifica hardware mínimo ni garantiza ausencia de petardeo físico.

## itch.io

Ficha existente: https://krazelgames.itch.io/voro-abyssal ; producto 5004054. Sigue **Draft**.

- Mínimo 5,99 USD, modalidad Paid. No se cambian moneda de la cuenta, payout, impuestos ni cuentas de cobro.
- Descarga comercial: `VORO-1.0-Windows-x64.zip`, nombre visible «VORO 1.0 — Windows (64-bit)», upload 19555858, Windows seleccionado, sin marca de demo/preventa/oculto. Los dos paquetes anteriores quedan ocultos, conservados.
- 545386593 bytes, 74 archivos, SHA-256 `d3ccfc466dd94d0cb57e1dad33d8f51e07736a5f2ee044904c4f0c6f25d57210`. La copia descargada desde itch.io tiene la misma huella. CRC correcto.
- Respecto al paquete 2 ya probado, solo cambia `VORO/LEEME.txt`: instrucciones finales EN/ES, sin «versión de prueba». Ejecutable, ASAR y demás archivos idénticos. Detalles en `windows-store-package.json`.
- ZIP local de entrega: `C:/Users/dmkra/Downloads/VORO-1.0-Windows-x64.zip`. Ejecutable previamente entregado: `C:/Users/dmkra/Downloads/VORO-1.0-Windows-x64/VORO.exe`.
- Descripción guardada y reabierta sin número de entornos ni zoom. Instrucciones de extraer todo el ZIP y abrir VORO.exe añadidas. Arte/trailer aprobado conservado. Disclosure existente de IA en gráficos/texto/código conservado; música licenciada.
- Verificación guardada: `itch-prepared.json`, `itch-final-download.jpg`. No se realizó una compra para comprobar el checkout: se descargó la copia de propietario desde el editor.

## App Store Connect

App 6809193565 / `com.dmkr.voro`. Versión 1.0: `86951539-3189-4abd-b333-c400588c1e9d`.

- Se corrigió la selección obsoleta 0.6.2 (1): está seleccionada la build final **1.0 (1)**, ID `29c99cb9-ef4f-4a41-997c-3c88fb3e49e9`, VALID y APP_STORE_ELIGIBLE. Disponible en TestFlight **interno**, grupo VORO Interno; no se abrió distribución externa.
- Precio base España **5,99 EUR**, sin programaciones futuras ni alteración de precios manuales de otros territorios. ReleaseType **MANUAL**. Estado **PREPARE_FOR_SUBMISSION**.
- Preparación y lectura posterior por API protegida: https://github.com/Krazel/Voro/actions/runs/37199296693 . `apple-prepared.json`.
- Localizaciones en-US/es-ES, principal en-US, nombres/subtítulos/descripciones/promos/keywords dentro de sus límites, sin precio en los textos ni menciones a diez entornos/zoom. Copy existente aprobado conservado. `whatsNew` no es editable en este estado de primera publicación y no es requisito pendiente para este estreno.
- Categoría Games / Action / Adventure; copyright 2026 Krazel Games. Derechos de contenido de terceros declarados; música Scott Buckley CC BY 4.0 y Tierra NASA acreditadas en el juego. Cuestionario de edad conserva fantasía/armas frecuentes y ninguna violencia realista. Clasificación territorial verificada; no se inventan restricciones nuevas.
- Sin anuncios, analytics, tracking, IAP, suscripciones, cuenta o login. Política y soporte EN/ES responden HTTP 200 en https://krazel.github.io/voro-abisal/privacy/ y https://krazel.github.io/voro-abisal/support/ . Los manifiestos de privacidad de la IPA declaran no recopilar datos/no tracking; ficha de privacidad publicada «No se recopilan datos».
- Contacto de revisión completo, sin cuenta de demo; notas corregidas para retirar las referencias a informes/herramientas de desarrollo que no existen en 1.0. Datos privados no incluidos en este documento ni en el repositorio.
- Consulta web excepcional de Privacidad y Negocio: acuerdo de apps de pago, banco, formularios fiscales y declaración DSA activos. Lectura únicamente; no se aceptaron acuerdos ni se alteraron datos financieros. Las demás operaciones se hacen por API.
- Distribución previa conservada. China continental y Vietnam excluidos mientras falten las licencias locales de juegos; no es un bloqueo para los países activos.

## Capturas

20 capturas reales: 5 para cada combinación iPhone/iPad y EN/ES. Proceden de XCTest nativo con el código final fijado, mediante https://github.com/Krazel/Voro/actions/runs/37199978760 . No son mockups.

El arnés modifica solo el SceneDelegate de la compilación de simulador para cargar partidas guardadas normales, sin añadir controles ni cambiar el render. **Los 365 archivos públicos empaquetados coinciden byte por byte con la IPA firmada seleccionada.** Este arnés no se ejecuta en TestFlight ni se incluye en la build subida.

iPhone 1320×2868; iPad horizontal 2752×2064. El iPad conserva los píxeles originales mediante normalización sin pérdidas de su orientación EXIF 8; sin reescalado, barras ni composición adicional. Ver `native-capture-verification.json`, planchas de revisión y `../../store/native-screenshots.json` con huellas por archivo.

Los previews promocionales previamente aprobados se conservan sin cambios; no se presentan como nuevas grabaciones de 1.0. Su procedencia sigue en `../../store/app-previews.json`. Ambas entregas de vídeo ya figuraban COMPLETE por API.

La carga y orden se verificaron por API mediante https://github.com/Krazel/Voro/actions/runs/37201490754 : 20 imágenes COMPLETE, cinco por combinación idioma/dispositivo. Se retiraron las ocho capturas anteriores después de aceptar las nuevas; las fuentes antiguas siguen conservadas en el repositorio. Lectura final en `apple-final-readback.json`: 1.0(1) seleccionada, PREPARE_FOR_SUBMISSION y release MANUAL. No se envió revisión.

## Biblioteca

La actualización mantiene PR-009 y su revisión vigente, concilia la nota concurrente de coordinación y conserva los demás campos y tracking. El resultado y la revisión quedan en `library-receipt.json`. No se modifica ni publica el repositorio de la biblioteca para actualizar su registro.

## Referencias actuales

- Apple: https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app/
- Apple: https://developer.apple.com/app-store/review/guidelines/
- itch.io: https://itch.io/docs/creators/pricing y https://itch.io/docs/creators/payments
- Música y atribución comercial: https://www.scottbuckley.com.au/library/solace/
- Tierra: https://svs.gsfc.nasa.gov/30002/

No se compran servicios, no se modifican contratos ni se activa Android/Steam en este encargo. La publicación y el envío a revisión son pasos separados de esta preparación; no se ha ejecutado ninguno.
