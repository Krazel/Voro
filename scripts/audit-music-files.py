"""Decode the shipped music, inspect clipping/discontinuities, retain listening excerpts."""
from pathlib import Path
import sys,json,subprocess,hashlib
sys.path.insert(0,str(Path('work/audio-audit-libs').resolve()))
import numpy as np
import soundfile as sf
import imageio_ffmpeg
ff=imageio_ffmpeg.get_ffmpeg_exe()
out=Path('design/pond-camera-audio-2026-09-23');out.mkdir(parents=True,exist_ok=True)
rows=[]
for file in sorted(Path('public/music').glob('*.mp3')):
 p=subprocess.run([ff,'-v','error','-i',str(file),'-f','f32le','-ac','2','-ar','48000','-'],capture_output=True,check=True)
 a=np.frombuffer(p.stdout,dtype='<f4').reshape(-1,2)
 delta=np.max(np.abs(np.diff(a,axis=0)),axis=1)
 idx=int(np.argmax(delta))
 row=dict(file=file.name,sha256=hashlib.sha256(file.read_bytes()).hexdigest(),seconds=len(a)/48000,
  peak=float(np.max(np.abs(a))),rms=float(np.sqrt(np.mean(a*a))),clippedSamples=int(np.sum(np.abs(a)>=1)),
  maxAdjacentDelta=float(delta[idx]),maxDeltaAt=idx/48000,deltaP999=float(np.percentile(delta,99.9)),decoderErrors=p.stderr.decode(errors='replace'))
 rows.append(row)
 if file.stem in ['reverie','ephemera']:
  sf.write(out/f'{file.stem}-source-15s.wav',a[48000*20:48000*35],48000,subtype='PCM_16')
  at=max(0,idx-48000*2);sf.write(out/f'{file.stem}-strongest-transient.wav',a[at:at+48000*5],48000,subtype='PCM_16')
(out/'music-files.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
print(json.dumps(rows))
