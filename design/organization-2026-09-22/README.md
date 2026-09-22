# VORO

Esta es la entrada de trabajo de VORO. Actualizada el 22/09/2026.

| Carpeta | Qué contiene |
| --- | --- |
| **Codigo** | Proyecto actual: juego, iOS, PC, scripts y assets que utiliza realmente el juego. |
| **Entregas** | Paquetes preparados por plataforma y versión. |
| **Recursos** | Originales de arte: fondos, habitantes, materia, mejoras y música original. |
| **Pruebas** | Copia de trabajo PC, revisiones de animaciones, evidencias y temporales. |
| **Archivo** | Diseños iniciales, variantes y paquetes antiguos; repositorio original conservado. |

## Entregas actuales

- **PC para itch.io:** [VORO-0.6.2-PC-HTML5.zip](Entregas/PC/0.6.2/VORO-0.6.2-PC-HTML5.zip). HTML5 para navegador, no un ejecutable Windows. Preparado y probado; este ZIP aún no se ha subido a itch.io.
- **iOS / TestFlight:** [0.6.2, compilación 1](Entregas/iOS/0.6.2). Build disponible en pruebas internas. La publicación en App Store es independiente.

## Dónde trabajar

Usar **Codigo** como entrada al desarrollo principal. **Pruebas/PC** es un worktree del mismo repositorio, no otro juego. **Archivo/Repositorio-original** conserva el repositorio que contiene el directorio Git compartido; no borrarlo aunque su código sea antiguo.

Los archivos que realmente carga el juego están en **Codigo/public**, junto con las demás carpetas de código del proyecto. **Recursos** conserva material fuente y versiones de arte; estar aquí no significa estar aprobado ni integrado. **Musica-original** contiene originales antiguos, no identifica la selección musical actual.

Las rutas antiguas siguen funcionando mediante enlaces. Las tres carpetas Git mantienen su ubicación física porque comparten historial y hay servidores abiertos. Los accesos **Codigo**, **Pruebas/PC**, **Pruebas/Evidencias**, **Pruebas/Temporales**, las entregas y dos accesos del archivo no duplican los archivos.

Para nuevas entregas, usar una carpeta por plataforma y versión. Guardar pruebas reproducibles en **Codigo/design** (accesible también desde **Pruebas/Evidencias**) y temporales en **Codigo/work**. Evitar crear nuevas carpetas sueltas `Voro-*` en la raíz de Studio.

Registro de la organización y comprobación de integridad: **Pruebas/Evidencias/organization-2026-09-22**.
