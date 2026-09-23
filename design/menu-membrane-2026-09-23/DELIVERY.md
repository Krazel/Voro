# C Membrana ligera — entrega 0.6.6 (1)

Fuente de la candidata: `befb2c4f9e2535721abb0646a7b889fb63f3f6e0`.
Autorización y referencia aprobada: README.md y approved.png en esta carpeta.

## Verificación

- QA web en cinco tamaños, ES/EN, controles, navegación, idioma, confirmación y regreso: web-qa.json.
- Compilación móvil y TypeScript correctos. Movimiento con blancos táctiles estables y movimiento reducido: motion-qa.json (beed634; la siguiente revisión cambia el icono externo y el test nativo).
- CI nativa 35903359242: éxito, dos pruebas de XCTest en iPhone y dos en iPad, cero fallos. https://github.com/Krazel/Voro/actions/runs/35903359242
- Simuladores iPhone 17 Pro Max e iPad Pro 13-inch (M5). Capturas de la app compilada, ES/EN, ajustes, confirmación y paisaje del iPad en native/.
- Verificados apertura/cierre, modo zurdo, sonido, recorrido, créditos, cancelación de reinicio y controles tras rotación. La fixture de pruebas solo omite el nacimiento inicial; no se ejecuta en la build de distribución.
- El primer run 35901396410 falló por selectores de XCTest (interruptores expuestos fuera de Button) y una carrera con el nacimiento. Se corrigió la prueba y el segundo run pasó. No se presenta el primer run como aprobado.
- No equivale a prueba de rendimiento ni a validación en dispositivo físico.

## Distribución

Compilación, firma y subida terminadas correctamente: https://github.com/Krazel/Voro/actions/runs/35904898763
227 pruebas pasaron en el código de distribución. Assets móviles verificados dentro del archive firmado.
API releyó a las 18:56 UTC del 23-09-2026: versión 0.6.6 (1), VALID / IN_BETA_TESTING, grupo interno existente VORO Interno asignado.
Build Apple: aa4e1ebd-3dd1-4d16-ae22-ff225c3f0b6a; app 6809193565; grupo 05db8744-bcf3-4c2d-a465-2635012bfeeb.
Evidencias: app-store-connect.json, build-manifest.json y SHA256SUMS.txt.
IPA local: artifact/testflight-0.6.6-build-1/App.ipa. SHA256 calculado y coincidente: 8ff42e031aa79e8c68a5df4ede7396b083adbd10645a6e2d25865d19f23e2021.
Biblioteca PR-009 actualizada y releída; library-delivery.json conserva la revisión y el tracking.
El taller de diseño revisó las capturas nativas y confirmó que no había objeciones visuales para esta entrega.
No hay envío a revisión de App Store ni ampliación de testers.

Incluye Tierra +45%, satélites de tamaño variado, aviso orbital temporal y final continuo de 31 segundos, además de los cambios anteriores D3 y Película viva. Pausa Respira conservada.
