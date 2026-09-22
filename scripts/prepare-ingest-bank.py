"""Build distinct ingest gestures from the retained CC0 Kenney masters.

Usage: python scripts/prepare-ingest-bank.py [source-directory] [python-libraries]
No pitch is baked in: SfxPlayer varies that independently during playback.
"""
from pathlib import Path
import sys, json, hashlib
if len(sys.argv) > 2:
    sys.path.insert(0, sys.argv[2])
import numpy as np
import soundfile as sf

root = Path(__file__).resolve().parent.parent
evidence = root / 'design/ingest-pause-2026-09-23'
source = Path(sys.argv[1]) if len(sys.argv) > 1 else evidence / 'sources'
output = root / 'public/sfx'
output.mkdir(parents=True, exist_ok=True)
evidence.mkdir(parents=True, exist_ok=True)
masters = {name: sf.read(source / name) for name in ['slime_000.ogg', 'slime_001.ogg']}
# Different source passages have different suction/bubble envelopes and transients.
gestures = [
    ('slime_000.ogg', 0, .5),
    ('slime_001.ogg', .03, .55),
    ('slime_001.ogg', 1.03, 1.57),
    ('slime_001.ogg', 2.18, 2.66),
    ('slime_001.ogg', 3.72, 4.30),
]
records = []
samples = []
for index, (name, start, end) in enumerate(gestures, 1):
    master, rate = masters[name]
    x = master[round(start * rate):round(end * rate)].copy()
    if x.ndim > 1:
        x = x.mean(axis=1)
    x -= x.mean()
    attack, release = round(.008 * rate), round(.035 * rate)
    x[:attack] *= np.sin(np.linspace(0, np.pi / 2, attack)) ** 2
    x[-release:] *= np.cos(np.linspace(0, np.pi / 2, release)) ** 2
    # Match the existing bite's RMS; no abrupt volume differences between gestures.
    x *= .045 / np.sqrt(np.mean(x * x))
    assert np.isfinite(x).all() and np.max(np.abs(x)) < .95
    target = output / f'ingest-{index}.wav'
    sf.write(target, x, rate, subtype='PCM_16')
    decoded, _ = sf.read(target)
    assert abs(decoded[0]) < 1e-4 and abs(decoded[-1]) < 1e-4
    samples.append(decoded)
    records.append({'file': target.name, 'source': name, 'start': start, 'end': end,
                    'duration': len(x) / rate, 'sampleRate': rate,
                    'rms': float(np.sqrt(np.mean(decoded ** 2))),
                    'peak': float(np.max(np.abs(decoded))),
                    'sha256': hashlib.sha256(target.read_bytes()).hexdigest()})
correlations = []
for i, a in enumerate(samples):
    for j, b in enumerate(samples[:i]):
        # Resample both to equal length to catch mere pitch/speed copies.
        a1 = np.interp(np.linspace(0, len(a) - 1, 12000), np.arange(len(a)), a)
        b1 = np.interp(np.linspace(0, len(b) - 1, 12000), np.arange(len(b)), b)
        correlation = float(np.corrcoef(a1, b1)[0, 1])
        assert abs(correlation) < .25, 'Gestures must differ beyond speed'
        correlations.append({'a': i + 1, 'b': j + 1, 'correlation': correlation})
(evidence / 'audio-manifest.json').write_text(json.dumps({
    'source': 'Kenney Sci-Fi Sounds', 'license': 'CC0 1.0',
    'sourceUrl': 'https://kenney.nl/assets/sci-fi-sounds',
    'processing': 'Distinct passages, DC removal, edge fades and RMS matching. No baked pitch.',
    'files': records, 'durationNormalizedCorrelations': correlations,
}, indent=2) + '\n', encoding='utf-8')
print(json.dumps(records, indent=2))
