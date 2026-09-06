# VORO — TestFlight interno 0.4 (1)

Verificado el 6 de septiembre de 2026. Primera entrega firmada en TestFlight.

- App: VORO: Abisal, Apple ID 6809193565, bundle com.dmkr.voro.
- Versión 0.4, build 1; iOS 15 mínimo.
- Fuente: 8c8cccda7fc41d92b04e2180e338c35936589452.
- Compilación: https://github.com/Krazel/Voro/actions/runs/34043889362 — success.
- Firma y exportación verificadas en macOS; Apple aceptó la subida sin errores.
- Apple build: e573821f-4ed3-4ef2-8a3a-10bbc4e37665.
- Procesamiento VALID; estado interno IN_BETA_TESTING.
- Grupo VORO Interno: 05db8744-bcf3-4c2d-a465-2635012bfeeb.
- Grupo comprobado en App Store Connect: 1 tester, 1 compilación.
- Único tester: cuenta propietaria, estado **Invitado** comprobado en la interfaz.
  El atributo global del tester por API aún devolvía NOT_INVITED; la interfaz del
  grupo confirma la invitación específica de VORO. No se ha repetido el envío.
- No hay beta externa ni publicación visible en App Store.
- Caducidad de la build: 5 de diciembre de 2026, según Apple.

La IPA firmada pesa 39 190 207 bytes. SHA-256:
`603b7cfe7bcdceed34996388748423db700003aa3ff02fa41309bf7351d30511`.
Conservada localmente en artifact/testflight-0.4-build-1/App.ipa (fuera de Git).
Manifest y estado Apple están en esa misma carpeta privada de evidencias.

## Acceso y autorización

El usuario confirmó expresamente en esta tarea el uso de las credenciales
compartidas de Krazel, su almacenamiento como secretos protegidos de Krazel/Voro
y la creación del perfil de distribución del bundle. Esto resolvió el bloqueo
de revisión automática que no había aceptado la autorización entre tareas.

Environment app-store-production restringido a main; workflow manual separado
de PRs. Se reutilizó el certificado vigente del equipo B2X6D3A9J9, se comprobó
la correspondencia con su clave privada y se creó el perfil propio de VORO.
No se revocaron claves ni certificados compartidos. Los valores de secretos no
se guardan en código, logs ni artefactos. El llavero y archivos temporales de
firma se eliminaron al terminar la compilación.

## Qué probar

Interfaz Cristal, movimiento, impulso, ingestión, pérdida de biomasa, adaptaciones
y fluidez de cada entorno, especialmente mar y tamaños grandes. La build contiene
las optimizaciones de v26. Las 82 pruebas pasaron en la compilación de macOS.
El rendimiento real y la instalación en el iPhone del usuario siguen pendientes
de prueba; el benchmark de escritorio no acredita esa validación física.

Panel verificado:
https://appstoreconnect.apple.com/teams/7f069118-9712-49c8-a1f0-fda00b62a281/apps/6809193565/testflight/groups/05db8744-bcf3-4c2d-a465-2635012bfeeb
