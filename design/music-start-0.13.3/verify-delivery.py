import hashlib, json, pathlib, plistlib, sys, zipfile
root = pathlib.Path(sys.argv[1])
manifest_path, = root.rglob('build-manifest.json')
root = manifest_path.parent
manifest = json.loads(manifest_path.read_text())
simulator = json.loads((pathlib.Path(__file__).parent / 'native-music-simulator.json').read_text())
assert manifest['commit'] == simulator['commit'], 'Uploaded source must match native QA'
apple = json.loads((root / 'app-store-connect.json').read_text())
assert manifest['version'] == apple['version'] == '0.13.3'
assert str(manifest['build']) == str(apple['build']) == '1'
assert apple['processingState'] == 'VALID' and apple['internalBuildState'] == 'IN_BETA_TESTING'
assert apple['group']['internal'] and apple['group']['id'] == '05db8744-bcf3-4c2d-a465-2635012bfeeb'
ipa, = root.glob('*.ipa')
with ipa.open('rb') as f:
    digest = hashlib.file_digest(f, 'sha256').hexdigest()
assert (root / 'SHA256SUMS.txt').read_text().split()[0] == digest
with zipfile.ZipFile(ipa) as z:
    info, = [p for p in z.namelist() if p.startswith('Payload/') and p.count('/') == 2 and p.endswith('/Info.plist')]
    bundle = info.removesuffix('Info.plist')
    p = plistlib.loads(z.read(info))
    assert p['CFBundleIdentifier'] == 'com.dmkr.voro'
    assert p['CFBundleShortVersionString'] == '0.13.3' and p['CFBundleVersion'] == '1'
    binary = z.read(bundle + p['CFBundleExecutable'])
    assert b'VoroMusicPlugin' in binary and b'AVAudioPlayer' in binary
    assert not any(n.endswith('solace-comparison.mp3') or n.endswith('native-music-probe.js') for n in z.namelist())
    songs = list(pathlib.Path('public/music').glob('*.mp3'))
    assert len(songs) == 12
    for song in songs:
        assert z.read(bundle + 'public/music/' + song.name) == song.read_bytes(), song.name
    js = '\n'.join(z.read(n).decode() for n in z.namelist() if n.startswith(bundle + 'public/assets/') and n.endswith('.js'))
    assert 'VoroMusic' in js and 'AVAudioPlayer' in js and 'data-voro-action' in js
    assert 'stabilizePlayback' not in js and 'solace-comparison' not in js
receipt = dict(commit=manifest['commit'],version='0.13.3',build=1,appleBuildId=apple['buildId'],
    internalBuildState=apple['internalBuildState'],ipaBytes=ipa.stat().st_size,sha256=digest,
    nativePlayerInBinary=True,approvedSongsPreserved=12,comparisonRemoved=True,simulatorProbeNotShipped=True,
    physicalAcousticQualityVerified=False)
(root / 'native-music-delivery-verification.json').write_text(json.dumps(receipt,indent=2))
print(json.dumps(receipt))
