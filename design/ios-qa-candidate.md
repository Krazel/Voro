# iPhone QA candidate — 2026-09-06

User requested a current IPA first, then more ChatGPT Images variants of Membrana.

Candidate: iOS 0.3 build 1, com.dmkr.voro, iOS 15+. This version groups gameplay, environments, animations and balance added since delivered 0.2.0 build 2. Web release remains v24; package.json belongs to web tooling and is unchanged.

Fixed the standalone mobile build: next/link now resolves to a mobile hash-link adapter, and game, animation gallery and UI comparator are bundled as local routes. Lazy gallery loading preserves the initial game entry. No live site deployment.

Verified: mobile build and Capacitor sync passed; TypeScript passed; lint passed for modified TypeScript files. Not yet compiled with Xcode or tested on an iPhone.

The existing GitHub workflow generates an unsigned device IPA. No repository secrets or environments for signing were found. Artifact will explicitly say Local-QA-unsigned and include version/build/commit/run and SHA-256. It requires subsequent signing for installation; it is not a TestFlight release.

GitHub access works through the machine session. Krazel/Voro is PRIVATE; last successful run 33937227904, source a94c6a33ca8ff9faaa13b2585d1db7a5c4c80796. Source is behind current local game. No workflow was dispatched and no source pushed this turn. Pending explicit authorization of private Actions quota/billing, required by ios-app-launch/references/github-actions-ipa.md. Keep repository private. Then push candidate to existing repo, build, download and verify IPA, deliver it before generating requested Membrana image variants.
