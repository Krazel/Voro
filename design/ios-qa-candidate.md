# iPhone QA candidate — 2026-09-06

User requested a current IPA first, then more ChatGPT Images variants of Membrana.

Candidate: iOS 0.3 build 1, com.dmkr.voro, iOS 15+. This version groups gameplay, environments, animations and balance added since delivered 0.2.0 build 2. Web release remains v24; package.json belongs to web tooling and is unchanged.

Fixed the standalone mobile build: next/link now resolves to a mobile hash-link adapter, and game, animation gallery and UI comparator are bundled as local routes. Lazy gallery loading preserves the initial game entry. No live site deployment.

Verified: mobile build and Capacitor sync passed; TypeScript passed; lint passed for modified TypeScript files. Not yet compiled with Xcode or tested on an iPhone.

The existing GitHub workflow generates an unsigned device IPA. No repository secrets or environments for signing were found. Artifact will explicitly say Local-QA-unsigned and include version/build/commit/run and SHA-256. It requires subsequent signing for installation; it is not a TestFlight release.

GitHub access works through the machine session. Krazel/Voro is PRIVATE; last successful run 33937227904, source a94c6a33ca8ff9faaa13b2585d1db7a5c4c80796. Source is behind current local game. No workflow was dispatched and no source pushed this turn. Pending explicit authorization of private Actions quota/billing, required by ios-app-launch/references/github-actions-ipa.md. Keep repository private. Then push candidate to existing repo, build, download and verify IPA, deliver it before generating requested Membrana image variants.

## Public build authorized

User explicitly authorized making Krazel/Voro public to compile the IPA on 2026-09-06. Visibility changed and verified PUBLIC. Scanned 503 non-image Git history objects for common credential patterns; no potential secrets found. Pushed candidate c4c2da5de091a3e51d93cbf77af4983dd16a738c. Public Actions gate passed. CI run: https://github.com/Krazel/Voro/actions/runs/33998076340. The website access policy was not changed.

## Delivered IPA

Build succeeded: https://github.com/Krazel/Voro/actions/runs/33998076340.

- Version 0.3, build 1; com.dmkr.voro; minimum iOS 15.0.
- Source: c4c2da5de091a3e51d93cbf77af4983dd16a738c.
- Artifact: artifact/ios-0.3-build-1/Voro-iPhone-v0.3-build-1-c4c2da5d-Local-QA-unsigned.ipa.
- Size: 38,234,243 bytes.
- SHA-256: a26268040a3de8f2d680caf11a798feae391d44634edd8931cd09e51ab216de8.
- SHA matched CI; ZIP integrity, Mach-O executable, bundle/version/build and representative current assets checked.
- Unsigned, needs subsequent signing for device installation; no iPhone device validation, no TestFlight or App Store upload.
- Delivered link in conversation before beginning new Membrana image generation, as requested.

The earlier pending-authorization paragraph is historical and resolved by the explicit public-repository authorization above.
