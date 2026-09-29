import hashlib, json, pathlib, plistlib, zipfile

root = pathlib.Path('artifact/testflight-0.12-build-1/Voro-TestFlight-56')
manifest = json.loads((root / 'build-manifest.json').read_text())
apple = json.loads((root / 'app-store-connect.json').read_text())
assert manifest['commit'] == '2096be58e268914607ba83fdb74dc8158c904ea2'
assert manifest['version'] == apple['version'] == '0.12'
assert str(manifest['build']) == str(apple['build']) == '1'
assert apple['processingState'] == 'VALID'
assert apple['internalBuildState'] == 'IN_BETA_TESTING'
assert apple['group']['internal'] is True
assert apple['group']['id'] == '05db8744-bcf3-4c2d-a465-2635012bfeeb'
ipa, = root.glob('*.ipa')
digest = hashlib.file_digest(ipa.open('rb'), 'sha256').hexdigest()
assert (root / 'SHA256SUMS.txt').read_text().split()[0] == digest
with zipfile.ZipFile(ipa) as z:
    info, = [p for p in z.namelist() if p.startswith('Payload/') and p.count('/') == 2 and p.endswith('/Info.plist')]
    bundle = info.removesuffix('Info.plist')
    p = plistlib.loads(z.read(info))
    assert p['CFBundleIdentifier'] == 'com.dmkr.voro'
    assert p['CFBundleShortVersionString'] == '0.12' and p['CFBundleVersion'] == '1'
    assert set(p['UIDeviceFamily']) == {1, 2}
    assert b'VoroAudioDiagnostics' in z.read(bundle + p['CFBundleExecutable'])
    scripts = [f for f in z.namelist() if f.startswith(bundle+'public/assets/') and f.endswith('.js')]
    journal = [f for f in scripts if b'voro-audio-journal-v1' in z.read(f)]
    assert journal, 'Automatic journal missing from packaged application'
    assert any(b'Compartir diagn' in z.read(f) for f in scripts), 'Export UI missing'
result = dict(manifest=manifest, apple=apple, ipa=ipa.name, bytes=ipa.stat().st_size,
              sha256=digest, packagedNativeObserver=True, packagedJournal=journal,
              physicalDeviceTest=False)
(root / 'verification.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps(result, indent=2))
