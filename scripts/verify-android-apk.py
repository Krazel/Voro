import hashlib, json, pathlib, sys, zipfile

apk = pathlib.Path(sys.argv[1])
web = pathlib.Path(sys.argv[2])
checked = 0
with zipfile.ZipFile(apk) as archive:
    for source in web.rglob('*'):
        if not source.is_file():
            continue
        entry = 'assets/public/' + source.relative_to(web).as_posix()
        actual = archive.read(entry)
        assert hashlib.sha256(actual).digest() == hashlib.sha256(source.read_bytes()).digest(), entry
        checked += 1
    config = json.loads(archive.read('assets/capacitor.config.json'))
    assert config['appId'] == 'com.dmkr.voro'
    assert not config.get('server', {}).get('url'), 'APK must use bundled offline game assets'
    assert not any('release.p12' in name or '.password' in name for name in archive.namelist())
print(json.dumps({'webFilesVerified': checked, 'webAssetsMatchBuild': True,
                  'localBundledGame': True, 'bytes': apk.stat().st_size,
                  'sha256': hashlib.sha256(apk.read_bytes()).hexdigest()}, indent=2))
