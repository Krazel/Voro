# Correcciones del informe físico — candidata 0.6.2 (1)

**Entregada: 0.6.2 (1) disponible en TestFlight interno.** Apple VALID / IN_BETA_TESTING, grupo VORO Interno, verificado por API14:47:58UTC del22/09. Build118537c4-7428-4664-a1da-1b96cb35e240. CI35741879635 correcto. IPA descargada y SHA256 contrastado; `build-manifest.json`, `app-store-connect.json`, `SHA256SUMS.txt`. Biblioteca PR-009 actualizada y releída en revisión135, versión0.6.2/build1, tracking y marketing preservados. Los estados pendientes inferiores son historial. Falta la medición física del usuario para certificar FPS y audibilidad en su iPhone.

Entrada: análisis `../automatic-benchmark-2026-09-22/device-report-analysis.md` de 0.6.1: Galaxias54.4/51 FPS, 4260 pasos de preparación y80 expulsiones de poses; sonido0/108 reproducciones y66 errores de carga. No se publica el informe original.

## Corrección

- Se exportan los seis ciclos de galaxias con los recortes completos ya aprobados (brazos superiores incluidos). El manifiesto registra cropRevision, y el cargador rechaza recortes incompatibles. Se elimina la exclusión temporal de los sprites que obligaba a generar poses en vivo. Misma resolución192,64 poses/ciclo, movimientos y transparencias. Las cuadrículas exactas eliminan casillas vacías y permiten mantener todos los sprites de Galaxias, con ambas intensidades, dentro de64MiB. Se retiran seis exportaciones obsoletas sin referencias.
- Audio: Capacitor8.5.1 iOS sirve WAV con URLResponse para medios (`node_modules/@capacitor/ios/Capacitor/Capacitor/WebViewAssetHandler.swift`, líneas98–103), que no aporta estado HTTP. Se permite status0 solo para recursos del mismo host con esquema local capacitor; los HTTP fallidos, respuestas opacas y cuerpos vacíos siguen rechazados. La decodificación sigue siendo obligatoria. Se añaden readErrors/decodeErrors/lastLoadError al informe. Sin nuevos sonidos ni cambios de volumen.
- Cámara, protagonista, biomasa, zoom y duración de la prueba se mantienen intactos.

## Verificación

- 204tests y TypeScript correctos. Pruebas de contrato nativo status0, errores de red/cuerpos/decodificación; comprobación de hash/cropRevision de sprites y carga simultánea bajo64MiB.
- 3072 dibujos de las seis galaxias a4 radios y2 intensidades usan los sprites; cero caché procedural. Rechazo de revisión de recorte obsoleta.
- 36 comparaciones de píxeles frente a los rigs originales: error medio máximo de color0.836/255 y alpha0. Captura `galaxy-comparison.png` revisada: misma silueta y brazos, fuente arriba y exportación abajo.
- WebKit escritorio, prueba automática completa20/20, cero errores JS y cero pasos de generación de poses en ambos tamaños de Galaxias; vuelta a campaña y exportación209754bytes. Reloj acelerado solo en test: NO son FPS físicos. Primer intento leyó el paquete anterior durante el build; repetido tras completar build. Se añade comprobación de versión para detectar previews antiguas.
- Audio: WebKit de escritorio disponible en Windows no expone AudioContext. Se verifica con Chromium/Edge: los tres WAV reales decodifican;6/6 arranques,0errores, tanto porHTTP como emulando el contrato local status0. No sustituye la comprobación del altavoz ni WKWebView de iPhone.
- Build móvil y todos sus assets verificados. Pendientes entrega TestFlight y nuevo informe físico para confirmar mejora real en Galaxias y sonido audible.

Código candidato `aa06953`, CI https://github.com/Krazel/Voro/actions/runs/35741879635 . Build PC correcto. Memoria de todos los sprites/variantes de Galaxias:63.3438MiB/64MiB. Repetición del tour con aserción de versión0.6.2:20/20, pasos de poses0/0, exportación214491bytes. No se han cambiado cámara, engine, progresión ni simulación frente a836d6bf (diff vacío).

14:46UTC: archive firmado y subida correctos. API de Apple confirma upload `118537c4-7428-4664-a1da-1b96cb35e240`, 0.6.2(1), PROCESSING sin errores/advertencias. Consulta https://github.com/Krazel/Voro/actions/runs/35742604375 , `apple-processing.json`. Última build disponible en esta consulta:0.6.1(1). CI de entrega espera VALID/grupo VORO Interno.
