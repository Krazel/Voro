"""Package only the distributable folder; verify ZIP CRC and record hashes."""
import hashlib
import json
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parent.parent
release = json.loads((root / 'desktop/release.json').read_text(encoding='utf-8'))
version, preview = release['gameVersion'], release['preview']
output = root / f'artifact/windows/{version}-preview.{preview}'
app = output / 'VORO-win32-x64'
archive = output / f'VORO-{version}-Windows-x64-prueba{preview}.zip'
if archive.exists():
    raise SystemExit('Archive already exists; do not overwrite an existing delivery.')
with zipfile.ZipFile(archive, 'x', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for file in sorted(app.rglob('*')):
        if file.is_file():
            z.write(file, Path('VORO') / file.relative_to(app))
with zipfile.ZipFile(archive) as z:
    bad = z.testzip()
    if bad:
        raise SystemExit(f'ZIP CRC failed: {bad}')
    files = len(z.infolist())
    expanded = sum(f.file_size for f in z.infolist())
def sha(file):
    with file.open('rb') as f:
        return hashlib.file_digest(f, 'sha256').hexdigest()
manifest = {
    'gameVersion': version, 'windowsPreview': preview, 'platform': 'Windows x64',
    'signed': False, 'published': False, 'archive': archive.name,
    'bytes': archive.stat().st_size, 'expandedBytes': expanded, 'files': files,
    'sha256': sha(archive), 'exeSha256': sha(app / 'VORO.exe'),
    'appAsarSha256': sha(app / 'resources/app.asar'), 'zipCrcVerified': True,
}
(output / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(json.dumps(manifest))
