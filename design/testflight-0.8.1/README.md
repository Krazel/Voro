# VORO 0.8.1 (1) — TestFlight

Candidate authorized by the user on 2026-09-28 for physical iPhone/iPad clarity
and performance testing. Corrective release from 0.8 (1); build resets to 1.

Content baseline: `449e8c9629fe7c2e7b2e33d00d14a6eced603741`.
Includes the 48 approved clear asset improvements and the preceding orbit,
Earth ingestion, pulsar, adaptation overflow and recovery fixes.

Validation already completed on this content: 255 tests, TypeScript, mobile and
PC builds, all 48 before/after comparisons, and ten environment entries in
desktop browser mobile emulation. These do not establish physical iOS FPS.
The protected TestFlight workflow repeats tests and verifies the signed
archive's bundled assets before upload. Mobile animation sheets retain a
64 MiB budget with adaptive detail and basic animated fallbacks.

Distribution target: existing internal TestFlight group only. Public website,
itch.io and App Store review/publication are outside this delivery.
## Delivery verified

- Source commit: `fdf85297ea621a021ad7ccc4ea6090a04fe2744a`.
- CI: https://github.com/Krazel/Voro/actions/runs/36439032706 — success.
- Apple API reread: 2026-09-28 15:01:45 UTC.
- App: `6809193565`; build: `5e13d426-a9eb-4c9e-b892-f136eb62a4fa`.
- Version/build: **0.8.1 (1)**; `VALID`, `IN_BETA_TESTING`.
- Existing internal group `05db8744-bcf3-4c2d-a465-2635012bfeeb` verified
  after assignment (VORO Interno).
- CI artifact: `Voro-TestFlight-46`, ID `10976709621`.
- Studio library PR-009 updated and reread at revision 237; public and marketing
  state preserved. No App Store review or public release performed.

Next: install this exact version on iPhone/iPad, run the existing automatic
performance tour and share its report as a file. Physical FPS remains unverified.
