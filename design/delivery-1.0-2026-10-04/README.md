# Entrega final VORO 1.0 — 2026-10-04

Código de juego: b1285d832684ef203dad1906db767e0d8f7d57d2. Auditoría de campaña e interfaz: ../final-review-1.0-2026-10-04/. Se conserva el balance aprobado y se retiran las herramientas de desarrollo del jugador.

## Windows

Paquete portable x64 1.0, paquete 2. Ejecutable entregado en `C:/Users/dmkra/Downloads/VORO-1.0-Windows-x64/VORO.exe`, con todos sus archivos acompañantes. ZIP entregado en `C:/Users/dmkra/Downloads/VORO-1.0-Windows-x64-paquete2.zip`.

545386244 bytes de ZIP; SHA-256 `3ce18faf4b3c5f072265d31c2f0370ddecb57f2fea10686c3a48e0516431dc8f`. CRC e integridad de las copias de entrega verificados. No firmado y sin publicación en itch.io/Steam.

`windows-native-check.json` corresponde al ejecutable final sin modificaciones: arranque, movimiento/impulso, menús, pantalla completa, 363 assets locales, audio WAV y guardado tras reiniciar correctos; sin errores JavaScript, recursos fallidos ni solicitudes remotas del juego. Canvas, composición y rasterización acelerados por GPU. La ejecución inicial restringida por el sandbox no permitía esta comprobación; la comprobación autorizada fuera del sandbox la completó. No certifica FPS mínimos ni ausencia de petardeo en dispositivos físicos.

## iPhone / iPad

Build autorizada 1.0 (1), workflow https://github.com/Krazel/Voro/actions/runs/37163507385 completado correctamente. Apple confirma por API `VALID`, grupo VORO Interno asignado y `IN_BETA_TESTING`; build ID `29c99cb9-ef4f-4a41-997c-3c88fb3e49e9`. Disponible en TestFlight interno, sin envío a revisión ni publicación de App Store.

Archivo firmado con soporte iPhone/iPad y las cuatro orientaciones de iPad comprobados en la IPA. Artifact `Voro-TestFlight-75`; SHA-256 de `App.ipa` descargada: `3563e41e451e2a7fe4ba79f9a4fe35717e3b05687c2d330518ce0cd3da075780`, coincide con CI. Evidencias: `app-store-connect.json`, `ios-build-manifest.json`, `ios-SHA256SUMS.txt`. Las 346 pruebas del código aprobaron en CI antes de compilar.

Prueba nativa de simulador iPhone 17 Pro / iOS 26.5 correcta para este commit: música AVAudioPlayer de menú y Microscopio, mute/desmute, segundo plano y reanudación. Efectos existentes Web Audio con contexto `playback`, cinco sonidos decodificados y reloj avanzando. No se migra el backend de efectos aprobado de este producto. Evidencia: `ios-simulator-audio.json`. No equivale a escuchar en iPhone/iPad físico ni verifica FPS reales.

## Registro

Ficha D1 PR-009 actualizada mediante API autorizada y verificada, revisión 348: versión 1.0, entrega interna de TestFlight y Windows. Los demás campos, tracking, enlaces y encargos de marketing se conservaron. El pendiente de la auditoría previa queda conciliado. No se generó APK nuevo en esta entrega.
