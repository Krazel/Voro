# PC and landscape iPad — shared normal game

User approved the horizontal demo, then requested the normal game exactly, with
only a wider playing field, and the same treatment for landscape iPad.

Base: released mobile 0.5.1(1), source 8477e76, delivery fd38eaa. Its approved
settings, route, credits, pause, adaptations, animation, music, SFX and gameplay
are shared directly. The separate PC menu implementation has been removed.
No gameplay data, upgrade values, species or animation assets changed here.

PC entry: `npm run dev:pc`, http://127.0.0.1:5205/?ui=final.
Builds separately with `npm run build:pc` into ignored pc-dist. Saves have their
own namespace. Mobile continues to use its existing entry, build and saved game.

Landscape iPad (including the MacIntel/touch browser identity) gets the wider
field automatically. Portrait iPad and iPhone keep their original viewport.
Rotation resizes the existing canvas without resetting life, progress or zoom.
iOS already enables both iPad orientations; no Info.plist change is required.
Wider fields use the real width for drawing, input, culling, ground caching,
streaming and orbital/finale rendering. Raster budgets remain bounded.

Validation: TypeScript, PC and mobile builds pass; mobile assets verified.
Full automated tests: 191 pass (tests.txt). New tests exercise tablet detection,
isotropic scaling, raster budget, live rotation preserving campaign state,
pointer coordinates and all environment background caches after width changes.
Browser QA: PC 1280x720, settings, discovered route, resume and Esc pause;
1194x834 layout resize. Evidence: settings-shared.png, gameplay-shared.png,
pause-shared.png. These are desktop browser screenshots, not native iPad QA.
Physical iPad rotation/touch/performance and a future signed build remain to test.

No TestFlight upload, website publication or Windows/Steam package in this change.
