# Tráiler VORO — pausado por orden del usuario

Objetivo: tráiler vertical corto con escenas reales, 720x1280 a 60 fps, música y cierre de marca.
Preparados: index.html, capture.mjs y vite.config.mjs. No se ha generado aún el vídeo.
Bloqueo localizado antes de la pausa: el middleware /capture intercepta también /capture.mjs y responde 405; cambiar endpoint a una ruta única y continuar desde ahí.
Después: generar secuencias, revisar visualmente, montar audio y créditos de música, verificar fps/duración y entregar MP4.
FFmpeg disponible en C:/Users/dmkra/AppData/Local/Temp/codex-voicerecorder-video-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe.
Servidor de captura detenido. No reanudar sin nueva orden del usuario.

Reanudado por orden explícita del usuario transmitida por el cerebro. Se conserva arriba el historial de pausa.
