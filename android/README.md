# VORO Android — entrega de prueba 0.14 (1)

Port autorizado el 3 de octubre de 2026. Fuente de juego actual `Voro-camera`,
incluidos Ciudad a ~8 minutos, huida urbana y señuelo más visible. Es el mismo
renderizador 2D, assets, controles y guardados; no se conecta a una web remota.
La interfaz de desarrollo permanece disponible según la petición vigente.

Capacitor Android 8.5.1, Java 21, Gradle 8.14.3, SDK de compilación/objetivo 36,
mínimo 24. Icono aprobado de iOS convertido a las densidades Android y pantalla
de arranque oscura. Música y efectos conservan el backend Web Audio/HTMLMedia de
Android; `VoroAudioDiagnostics` conecta su puerta de audio a pausa/reanudación
nativa. La implementación AVAudioPlayer de iOS no cambia.

## Construcción y firma

`pwsh -NoProfile -File scripts/build-android.ps1`

Herramientas comunes de Studio en `../tools/`. Las variables `JAVA_HOME`,
`ANDROID_HOME`, `VORO_ANDROID_KEYSTORE` y `VORO_ANDROID_PASSWORD_FILE` permiten
usar ubicaciones diferentes. Firma persistente fuera del repositorio:
`../.studio/signing/voro-android/release.p12` y archivo de contraseña asociado.
Conservar ambos para actualizar la app instalada. No se incluyen en el APK,
Git ni el manifiesto público. El script falla si faltan, no genera otra firma.

Salida: `app/build/outputs/apk/release/app-release.apk`. La versión Android debe
coincidir con `app/release.mjs`; incrementar `versionCode` en futuras entregas.
La clave es específica de VORO, no una clave debug ni de otro producto.

## QA

La prueba instrumentada `ReleaseSmokeTest` se instala junto al APK release,
con el mismo certificado. Sus helpers están exclusivamente en el APK de pruebas,
que no se entrega al usuario. Comprueba idioma del dispositivo, arranque,
partida, pausa, configuración y vuelta desde segundo plano; captura evidencia
en el almacenamiento externo privado del emulador.

`scripts/verify-android-apk.py APK mobile-dist` compara todos los archivos web
empaquetados con la compilación exacta y verifica funcionamiento con assets
locales. Las evidencias finales se guardan en `design/android-apk-2026-10-03/`.
Separar QA del emulador de FPS, sensores y escucha acústica en Android físico.
Esta entrega no publica Google Play, Sites, itch ni una build de TestFlight.
