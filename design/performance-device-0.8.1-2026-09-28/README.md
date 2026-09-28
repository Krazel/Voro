# Physical-device report — 0.8.1 (1)

User supplied `C:/Users/dmkra/Downloads/Voro-rendimiento (2).txt`.
Report timestamp 2026-09-28T15:44:02.232Z. iPhone user agent, iOS 18.7;
exact hardware model is not identified. This is not evidence for the older
iPhone X / iOS 16 device previously discussed.

All 20 cases completed: 10 environments, entry and grown sizes, 5 seconds each.
100 measured seconds, 5977 accepted frames, 59.8 FPS aggregate. Every case is
59.4–60 FPS. P95 is 17 ms in every case. 10 frames exceed 33 ms (0.167%);
28 exceed 20 ms; maximum observed interval 49 ms (pond entry).

Mean measured engine CPU is 0.7–1.2 ms per frame, not total WebKit/GPU work.
Some spatial cases correlate with expensive inhabitants drawing in the preceding
frame: orbit grown 21 ms, planets grown 21 ms, galaxies entry 31 ms,
universe grown 25 ms. These indicate a narrow rendering optimization target,
not sustained overload or proof of image decoding/GPU/GC as the cause.
Several entry outliers occur around three seconds without a measured CPU spike;
their precise cause remains undetermined.

Reported animation-sheet snapshots peak at 57.32 MiB under the 64 MiB budget.
This is not total app memory or a continuously measured memory peak.
All background snapshots loaded without errors; animation image errors zero.
Audio context running; ingest load/decode/play errors zero. 126 requests,
64 played and 62 deliberately throttled. Audio quality is not established by
these counters. No damage sounds requested because the tour is invulnerable.

Scope: one-second warmup and base loading excluded; no upgrades, adaptation
menus, normal evolution transitions, final universe animation or long sessions.
No direct GPU timing. Conclude very good stable 60-FPS-target performance in
this measured run, with rare small hitches. Keep visual quality; investigate
isolated first-draw costs before broad rendering changes. No code/balance change.
