# Pausa: contraste de la referencia aportada

Referencia del usuario: codex-clipboard-a6af1f4b-d4cd-411d-9ff1-aeafa42cb50b.png,
coincidente con design/pause-a-2026-09-22/pc-restored.png (5c95f1d).

Los bloques CSS .membrane-control y .pause-panel de app/cristal.css y el PNG
public/ui/cristal/membrane-frame.png son idénticos en candidata actual y5c95f1d.
`check.mjs` ejecuta el Windows0.6.4 prueba5 real, abre pausa y Configuración:
Respira visible, ningún ApprovedPause, captura y estilos en verified.json.
No fue necesario cambiar la pausa de la candidata ni crear otro asset.

TestFlight0.6.4(1), fuente9381ebc, aún usa ApprovedPause con finalUI. Esa diferencia
de versión explica la discrepancia reportada en iPhone/iPad; no se ha subido
una build por este encargo. Windows prueba5 no contiene enlace de privacidad;
su incorporación posterior en fuente está documentada en journey-spiral-2026-09-23.
