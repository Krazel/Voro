$ErrorActionPreference='Stop'
$ffmpeg='C:/Users/dmkra/AppData/Local/Temp/codex-voicerecorder-video-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
& $ffmpeg -hide_banner -loglevel error -r 60 -i "$PSScriptRoot/gameplay.h264" -ss 40 -i "$PSScriptRoot/../../public/music/hymn-to-the-dawn.mp3" -t 26 -af 'afade=t=in:d=1.2,afade=t=out:st=23.5:d=2.5,loudnorm=I=-18:TP=-1.5:LRA=9' -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -r 60 -c:a aac -ar 48000 -b:a 192k -movflags +faststart -y "$PSScriptRoot/VORO-trailer-v2-26s-60fps.mp4"
if($LASTEXITCODE -ne 0){throw 'Error exportando vídeo'}
