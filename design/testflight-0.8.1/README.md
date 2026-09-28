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
CI and Apple's processed build verification will be recorded after completion.
