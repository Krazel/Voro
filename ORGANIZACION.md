# Carpetas locales de VORO

Entrada única: `C:\Users\dmkra\Documents\Codex Apps\Juegos\Voro`.

- `Codigo`: enlace a este worktree, `Voro-camera`; desarrollo actual.
- `Entregas/PC/0.6.2`: ZIP HTML5 preparado para itch.io, todavía sin subir.
- `Entregas/iOS/0.6.2`: artefactos firmados de TestFlight interno 0.6.2 (1).
- `Recursos`: originales de arte agrupados por contenido.
- `Pruebas`: worktree PC, revisiones de animaciones, evidencias (`design`) y temporales (`work`).
- `Archivo`: conceptos y paquetes antiguos; acceso al repositorio original y al historial local de compilaciones.

Los tres directorios Git permanecen en su ubicación física original: `Voro`, `Voro-camera` y `Voro-pc-demo`. El primero contiene el `.git` común; no eliminarlo ni confundir su rama local antigua con el código actual. Los accesos de la entrada organizada no duplican datos.

Se movieron 17 carpetas de recursos/pruebas/archivo, conservando enlaces ocultos en sus rutas anteriores. Se verificaron 209 archivos mediante SHA-256 antes y después, el HEAD y el estado de los archivos versionados en los tres worktrees, el ZIP de PC y los servidores 5206/5207.

El contenido del juego continúa en las carpetas existentes de código y `public`. El material fuente de Recursos puede incluir versiones antiguas. No se ha cambiado el juego, compilado una nueva versión ni publicado una entrega por esta reorganización.

Evidencia local: `design/organization-2026-09-22/manifest.json`. Guía de uso en `Juegos/Voro/README.md`.

## Traslado general de Studio

El traslado global a `Documents/Krazel Studio` sigue pendiente y no se ha ejecutado. El aplicador de septiembre 5 debe conciliar primero este esquema: su destino antiguo `Juegos/Voro` ya es la entrada organizada, y los enlaces de compatibilidad `Voro-*` ahora apuntan a subcarpetas. Está documentado en `.studio/voro-organization-2026-09-22.md`; no ejecutar el antiguo plan sin revisar sus destinos. Sus comprobaciones rechazan estos enlaces en lugar de sobrescribir datos.
