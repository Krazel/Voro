import hashlib, json, pathlib, plistlib, zipfile

manifests = list(pathlib.Path('artifact/testflight-0.12.1-build-1').rglob('build-manifest.json'))
assert len(manifests) == 1
root = manifests[0].parent
manifest = json.loads(manifests[0].read_text())
apple = json.loads((root / 'app-store-connect.json').read_text())
assert manifest['commit'] == '127123390dfcfc8589e8a7ec67ede6f14f4f7c33'
assert manifest['version'] == apple['version'] == '0.12.1'
assert str(manifest['build']) == str(apple['build']) == '1'
assert apple['processingState'] == 'VALID' and apple['internalBuildState'] == 'IN_BETA_TESTING'
assert apple['group']['internal'] is True
assert apple['group']['id'] == '05db8744-bcf3-4c2d-a465-2635012bfeeb'
ipa, = root.glob('*.ipa')
with ipa.open('rb') as f:
    digest = hashlib.file_digest(f, 'sha256').hexdigest()
assert (root / 'SHA256SUMS.txt').read_text().split()[0] == digest
with zipfile.ZipFile(ipa) as z:
    info, = [p for p in z.namelist() if p.startswith('Payload/') and p.count('/') == 2 and p.endswith('/Info.plist')]
    bundle = info.removesuffix('Info.plist')
    p = plistlib.loads(z.read(info))
    assert p['CFBundleIdentifier'] == 'com.dmkr.voro'
    assert p['CFBundleShortVersionString'] == '0.12.1' and p['CFBundleVersion'] == '1'
    assert set(p['UIDeviceFamily']) == {1, 2}
    executable = z.read(bundle + p['CFBundleExecutable'])
    assert b'VoroAudioDiagnostics' in executable
    assert b'setAllMediaPlaybackSuspended:completionHandler:' in executable
    assert b'native-media-ready' in executable
    scripts = [f for f in z.namelist() if f.startswith(bundle+'public/assets/') and f.endswith('.js')]
    controller = [f for f in scripts if b'native-playback-gate' in z.read(f) and b'native-activity-unavailable' in z.read(f)]
    assert controller, 'Native activity gate missing from packaged JS'
result = dict(manifest=manifest, apple=apple, ipa=ipa.name, bytes=ipa.stat().st_size,
              sha256=digest, packagedNativeMediaSuspension=True, packagedController=controller,
              physicalDeviceTest=False)
(root / 'verification.json').write_text(json.dumps(result, indent=2)+'\n')
pathlib.Path('design/audio-journal-0.12.1/verification.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps(result, indent=2))
