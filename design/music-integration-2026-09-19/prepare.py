from pathlib import Path
import json, subprocess, hashlib, concurrent.futures, shutil
root=Path('C:/Users/dmkra/Documents/Codex Apps/Voro-camera')
source=root.parent/'.studio/audio-selection/voro/music'
ffmpeg=next((source/'.inspection-tools').rglob('ffmpeg*.exe'))
out=root/'public/music'; evidence=root/'design/music-integration-2026-09-19'
out.mkdir(parents=True,exist_ok=True);evidence.mkdir(parents=True,exist_ok=True)
tracks=json.loads((source/'inspection.json').read_text(encoding='utf-8'))
def run(args):
 p=subprocess.run([str(ffmpeg),'-hide_banner','-nostdin',*args],capture_output=True,text=True,encoding='utf-8',errors='replace')
 if p.returncode:raise RuntimeError(p.stderr[-2000:])
 return p.stderr
def stats(text):return json.loads(text[text.rfind('{'):text.rfind('}')+1])
def prepare(track):
 slug=track['slug']
 if (evidence/f'{slug}.json').exists():return json.loads((evidence/f'{slug}.json').read_text(encoding='utf-8'))
 original=source/'tracks'/f'{slug}.mp3'
 assert hashlib.sha256(original.read_bytes()).hexdigest()==track['sha256']
 first=stats(run(['-i',str(original),'-af','loudnorm=I=-23:TP=-2:LRA=11:print_format=json','-f','null','-']))
 filt='loudnorm=I=-23:TP=-2:LRA=11:measured_I={input_i}:measured_TP={input_tp}:measured_LRA={input_lra}:measured_thresh={input_thresh}:offset={target_offset}:linear=true'.format(**first)
 duration=track['duration_seconds']; filt+=f',afade=t=in:d=0.15,afade=t=out:st={duration-.2}:d=0.2'
 dest=out/f'{slug}.mp3'
 run(['-y','-i',str(original),'-af',filt,'-ar','44100','-ac','2','-c:a','libmp3lame','-b:a','160k','-map_metadata','-1','-metadata','artist=Scott Buckley','-metadata','copyright=CC BY 4.0; see CREDITS.md',str(dest)])
 measured=stats(run(['-i',str(dest),'-af','loudnorm=I=-23:TP=-2:LRA=11:print_format=json','-f','null','-']))
 assert abs(float(measured['input_i'])+23)<1, (slug,measured)
 assert float(measured['input_tp'])<=-1, (slug,measured)
 result={**{k:track[k] for k in ['slug','source','author','license','duration_seconds','sha256']},'original_sha256':track['sha256'],'runtime_sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'runtime_bytes':dest.stat().st_size,'original_loudness':first,'runtime_loudness':measured,'processing':'Full composition; two-pass loudness -23 LUFS / -2 dBTP / LRA11; MP3 stereo44.1kHz160kbps; edge fades150/200ms; runtime crossfades4s.'}
 (evidence/f'{slug}.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
 print(slug,measured['input_i'],measured['input_tp'],flush=True)
 return result
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool: results=list(pool.map(prepare,tracks))
(evidence/'tracks.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
shutil.copyfile(source/'manifest.json',evidence/'approved-selection.json')
shutil.copytree(source/'evidence',evidence/'license-evidence',dirs_exist_ok=True)
