# Configuración, Recorrido y Créditos — mismo menú

Corrección del usuario: conservar el fondo oscuro DENTRO del marco; quitar únicamente el rectángulo exterior. Las tres pantallas ahora comparten el fondo submarino y un panel recortado con alfa exterior real. Recorrido sigue ocultando los entornos no visitados; los créditos conservan sus licencias. El recorrido final D3 y la pausa Respira no cambian.

Arte con herramienta integrada ChatGPT Images, editando settings-art-master.png aprobado. Prompt final: extraer solo el panel grande, conservar borde gelatinoso y fondo oscuro interior, eliminar únicamente el exterior con transparencia alfa real; sin textos, otros paneles, rocas ni rediseño. Master: panel-master.png. Producción: public/ui/membrane/panel-cutout.webp, WebP de 900px conservando alfa. Verificación del master: centro alfa253; esquina alfa0. La extracción anterior vacía por dentro fue descartada tras la aclaración del usuario.

Implementación: un único MembraneFrame para todas las pantallas; no quedan LivingMenuArt/LandscapeMenuArt ni approved-art en las subpáginas de configuración. Marcos animados con controles quietos, sin WebGL adicional.

Verificaciones: TypeScript, build móvil con comprobación de asset exacto, cinco vistas web ES/EN (iPhone pequeño, iPhone, iPad vertical/horizontal y PC), navegación, interruptores, idiomas, recorrido descubierto, licencias y cancelación de reinicio. Evidencia web-qa.json y capturas de esta carpeta. La prueba inicial falló por esperar la traducción literal «View licenses»; se corrigió el selector al botón de licencias y pasaron todas las vistas.

Estado: cambio local para revisar; no se ha subido una nueva build. TestFlight sigue en0.6.6(1). Estas pruebas web no equivalen a prueba física de iPhone/iPad.
