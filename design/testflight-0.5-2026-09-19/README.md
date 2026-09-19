# VORO 0.5 (1) · TestFlight interno

Entrega autorizada el 19-09-2026 a partir de la candidata completa probada en `Voro-camera`. El binario corresponde al commit `689a23c2407028a85e4c6fe0c4526d85c03c78b1`; los cambios posteriores de `main` (`41042f7`) corrigen únicamente la automatización de asignación/verificación y no generan otro binario.

- Versión/build: 0.5 (1)
- Bundle ID: `com.dmkr.voro`
- App Store Connect app ID: `6809193565`
- Apple build ID: `2e344dc7-137d-45b4-b14e-98ef31321045`
- Estado API: `VALID`, `IN_BETA_TESTING`
- Grupo: `VORO Interno`, ID `05db8744-bcf3-4c2d-a465-2635012bfeeb`, confirmado interno
- CI de firma/subida: https://github.com/Krazel/Voro/actions/runs/35452298172
- Verificación/asignación API: https://github.com/Krazel/Voro/actions/runs/35452718970
- Delivery UUID: `2e344dc7-137d-45b4-b14e-98ef31321045`
- Artifact GitHub: `Voro-TestFlight-23`, ID `10587760514`, retención 14 días
- IPA: 106092832 bytes
- SHA-256: `39a9b9383297f9f1ea72bcea1636fe5887959556aa12de9db41f31ff51e84389`

El flujo ejecutó 164 tests, sincronizó la build móvil con Capacitor, compiló con Xcode 26.6, firmó con distribución App Store, verificó firma/bundle/versión, subió mediante la API key protegida y esperó a que Apple completara el procesamiento. La API oficial confirmó después el grupo interno y su estado de prueba.

El primer flujo mostró éxito porque el comando estaba conectado a `tee`, aunque la lectura de una relación no admitida devolvió 403 después de que Apple ya hubiera procesado la build. No se reconstruyó ni se repitió la subida. El segundo flujo usó la operación admitida de alta de la relación y releyó la build con `include=betaGroups,buildBetaDetail`. La automatización principal quedó corregida con `pipefail` para que un fallo futuro no pueda quedar oculto.

La IPA descargada está en `artifact/testflight-0.5-build-1/` (ignorada por Git). No se activó beta externa, no se envió App Review y no se publicó la versión de App Store. La prueba física en iPhone/iPad, incluidos gestos, recorrido, rendimiento y StoreKit sandbox, sigue pendiente.

Biblioteca PR-009: revisión 64 guardada sobre 63 y releída. Versión/build actualizados a 0.5 (1); TestFlight conserva `Interno`; distribución, versión pública, releases, source y demás tracking preservados.
