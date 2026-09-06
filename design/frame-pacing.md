# Tirones puntuales — candidata 0.4.1 (1)

El usuario confirma que 0.4 (1) resulta jugable pero va lento ocasionalmente.
Se mantiene Capacitor. Se corrige la concentración de preparación de poses en
un solo fotograma, sin cambiar simulación, controles, zoom ni tamaños.

## Cambio

La caché anterior generaba todas las poses faltantes dentro del dibujo de los
animales. Cada una puede requerir cientos o más de mil triángulos con texturas.
La caché mejoraba el promedio, pero una aparición nueva podía bloquear un frame.

Ahora el juego encola las poses que faltan y genera como máximo dos por frame,
con un presupuesto orientativo de 2 ms: una pose iniciada se termina aunque lo
supere. No se ejecuta una cola ilimitada; admite 64 solicitudes únicas. Mientras
se prepara una pose se usa la fase más cercana ya disponible del mismo grupo;
si no hay ninguna, la última pose disponible del asset o su imagen original.
El organismo nunca desaparece durante la espera. No se alteran rigs ni dibujos.

Las 24 fases, tres intensidades y tamaños de caché se conservan. La memoria de
poses sigue limitada a 24 MiB; los índices auxiliares se limpian al expulsarlas.
No hay tareas asíncronas ni workers que sigan trabajando al pausar o cerrar.
El estudio de animación detallado conserva su cálculo continuo. Las poses
intermedias pueden aproximarse durante el calentamiento de la caché; no se
promete un límite duro de 2 ms ni 60 FPS en todo dispositivo.

## Evidencia

83 pruebas pasan, incluido ensayo de cola fría, visibilidad, límite de trabajo,
vaciado, memoria, pausa, cámara, alimentación y recorrido completo. TypeScript
y lint de archivos modificados pasan; builds web y móvil verificadas.

`frame-pacing-benchmark.json` compara 360 frames por escenario con seed 834,
misma simulación y resolución, Skia CPU en Windows. No incluye compositor del
navegador ni React y no acredita rendimiento en iPhone. En mar grande el peor
frame medido pasa de 254.5 a 27.8 ms y el percentil 95 de 37.0 a 21.8 ms.
En micro inicial el peor pasa de 107.7 a 18.0 ms. Los resultados varían con el
equipo; el usuario debe confirmar los tirones en la actualización de TestFlight.

Versión de corrección 0.4.1, build 1. Se conserva 0.4 (1) para comparación.

## Entrega verificada — 6 septiembre 2026

- Fuente: `66204e69932a417715dbfcc582748317066168d4`.
- Web privada Sites v27, despliegue `appgdep_6a9dc8455a908191ad2aef7f18051f50`
  succeeded en https://voro-abisal.krazel.chatgpt.site/.
- Build iPhone firmada 0.4.1 (1):
  https://github.com/Krazel/Voro/actions/runs/34057003296 — success.
- Apple build `d5facd10-a844-4e7d-8b14-671c9c0ef19a`: VALID y
  IN_BETA_TESTING, comprobado a las 20:14 UTC.
- Asignada al grupo VORO Interno `05db8744-bcf3-4c2d-a465-2635012bfeeb`,
  que conserva un único tester. Sin cambios de audiencia ni beta externa.
- IPA de 39 190 619 bytes; SHA-256
  `2b2f7d532b653f7abb57c913195d00e0ad67c958f16c2ca7683cc9209e5de5ed`.
  Manifest, IPA y comprobación de Apple en `artifact/testflight-0.4.1-build-1/`,
  excluidos de Git. No se guardan credenciales en la entrega.
- Pendiente: confirmación del usuario tras actualizar en su iPhone.
