# Impulso a la izquierda — 0.4.4 (2)

Encargo 2026-09-07: opción en Configuración para mover el impulso a la izquierda
y aclarar si el informe de rendimiento identifica la causa de los tirones.

## Resultado

- Botón «Impulso a la izquierda», estado accesible activado/desactivado.
- Invierte la fila de controles: impulso a la izquierda, indicación de movimiento
  a la derecha. Conserva área táctil, márgenes, manejadores de entrada y recarga.
- Preferencia local `voro-dash-side`, independiente de la partida. Predeterminado:
  derecha. Se carga al abrir; sincroniza cambios entre pestañas. Sin acceso al
  almacenamiento, funciona durante la sesión y avisa si no consigue guardar.
- Lectura de almacenamiento solo al cargar o cambiar en otra pestaña; sin trabajo
  adicional en el bucle del juego. No hay modificaciones del protagonista.
- Informe sin cambios: correlaciona cadencia, CPU instrumentada, cargas y eventos;
  no mide GPU ni demuestra por sí solo causalidad. Versión del informe 0.4.4 (2).

## Verificación

104 pruebas existentes correctas, TypeScript y lint correctos, build web correcto.
Comprobación directa de preferencias: persistencia, alternancia, fallo de escritura
con lectura todavía disponible, notificación y limpieza de suscripción correctos.
Respuesta HTTP local 200. No se ha validado interacción física en iPhone/iPad.

## Entrega

Fuente: `048811ee92a8d7c6e503f86f1a4b21a23b6d02cb`.
Web privada v31, despliegue `appgdep_6a9ec0d8e0688191924c1d95c382c9b8`
succeeded 2026-09-07T13:49:27.808785Z.
CI: https://github.com/Krazel/Voro/actions/runs/34129274365, success.
Apple build `47bbbe77-0df8-46ec-bc08-9ed3088b84e8`, VALID e IN_BETA_TESTING,
asignada a VORO Interno con un tester; notas y asignación verificadas por API
2026-09-07T13:53:43.028Z. Sin envío a beta externa ni publicación App Store.
IPA firmada: 113.460.990 bytes, SHA256
`5aa5c960e1c9b484010ca4fecba055ae2241d797d72d4d3715577d92d01f7ee0`.
Checksum y manifiesto de CI cotejados; código del ajuste presente en la IPA.
Biblioteca D1: PR-009 revisión 20 guardada y releída, seguimiento conservado.
