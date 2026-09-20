$ErrorActionPreference='Stop'
$ffmpeg='C:/Users/dmkra/AppData/Local/Temp/codex-voicerecorder-video-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
& $ffmpeg -hide_banner -loglevel error -i "$PSScriptRoot/VORO-trailer-v2-26s-60fps.mp4" -i "$PSScriptRoot/../../public/music/solace.mp3" -map 0:v:0 -map 1:a:0 -t 26 -c:v copy -af 'afade=t=in:d=1.2,afade=t=out:st=23.5:d=2.5,loudnorm=I=-18:TP=-1.5:LRA=9' -c:a aac -ar 48000 -b:a 192k -movflags +faststart -y "$PSScriptRoot/VORO-trailer-v3-Solace-26s-60fps.mp4"
if($LASTEXITCODE -ne 0){throw 'Error exportando vídeo'}
